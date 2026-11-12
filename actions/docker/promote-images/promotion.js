const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { promotionContract } = require("./contract");

const journal = {
	environment: "ci-image-promotion",
	task: "ci-image-promotion",
};
const builder =
	"hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml";

class ImagePromotion {
	constructor({ github, context, core, exec, runId, attempt, verifiedImages }) {
		Object.assign(this, {
			github,
			context,
			core,
			exec,
			runId,
			attempt,
			verifiedImages,
		});
	}

	async currentRun() {
		const { data: run } = await this.github.rest.actions.getWorkflowRun({
			...this.context.repo,
			run_id: Number(this.runId),
		});
		assert.equal(
			String(run.run_attempt),
			this.attempt,
			"The current run attempt has changed",
		);
		assert(
			["queued", "in_progress", "waiting", "pending", "requested"].includes(
				run.status,
			),
			"The workflow is no longer running",
		);
		assert.equal(run.conclusion, null, "The workflow has already concluded");
		assert(
			Number.isFinite(Date.parse(run.created_at)),
			"Missing server run creation time",
		);
		assert(
			[
				"pull_request",
				"push",
				"workflow_dispatch",
				"merge_group",
				"release",
				"schedule",
			].includes(this.context.eventName),
			"Unsupported promotion event",
		);
		const pullRequest = this.context.payload.pull_request;
		if (pullRequest) {
			assert.equal(
				pullRequest.head.repo.full_name,
				`${this.context.repo.owner}/${this.context.repo.repo}`,
				"Fork promotion is not supported",
			);
			const { data: current } = await this.github.rest.pulls.get({
				...this.context.repo,
				pull_number: pullRequest.number,
			});
			assert.equal(current.state, "open", "Pull request is no longer open");
			assert.equal(
				current.head.sha,
				pullRequest.head.sha,
				"Pull request source has changed",
			);
		}
		assert(
			/^refs\/(heads|tags|pull)\//.test(this.context.ref),
			"Unsupported source ref",
		);
		const { data: source } = await this.github.rest.repos.getCommit({
			...this.context.repo,
			ref: this.context.ref,
		});
		assert.equal(
			source.sha,
			this.context.sha,
			"Source ref has changed since validation",
		);
		return run;
	}

	async command(command, args) {
		const result = await this.exec.getExecOutput(command, args);
		return result.stdout;
	}

	async digest(reference) {
		const output = await this.command("docker", [
			"buildx",
			"imagetools",
			"inspect",
			reference,
		]);
		const digest = output.match(/^Digest:\s+(sha256:[a-f0-9]{64})$/m)?.[1];
		assert(digest, "Registry returned no manifest digest");
		return digest;
	}

	async verifyCandidate(image) {
		const reference = `${image.registry}/${image.repository}@${image.digest}`;
		assert.equal(
			await this.digest(
				`${image.registry}/${image.repository}:${image.tags[0]}`,
			),
			image.digest,
			"Candidate tag changed",
		);
		const manifest = await this.command("docker", [
			"buildx",
			"imagetools",
			"create",
			"--dry-run",
			"--prefer-index=false",
			reference,
		]);
		// Buildx prints the original bytes followed by exactly one newline.
		assert(manifest.endsWith("\n"), "Unexpected Buildx dry-run output");
		const digest = `sha256:${createHash("sha256").update(manifest.slice(0, -1)).digest("hex")}`;
		assert.equal(digest, image.digest, "Promotion would change manifest bytes");
		const output = await this.command("gh", [
			"attestation",
			"verify",
			`oci://${reference}`,
			"--repo",
			`${this.context.repo.owner}/${this.context.repo.repo}`,
			"--signer-workflow",
			builder,
			"--source-digest",
			this.context.sha,
			"--format",
			"json",
		]);
		const invocation = `${this.context.serverUrl}/${this.context.repo.owner}/${this.context.repo.repo}/actions/runs/${this.runId}/attempts/${this.attempt}`;
		const verified = JSON.parse(output);
		assert(
			verified.some((entry) => {
				const statement = entry.verificationResult?.statement;
				return (
					statement?.predicate?.runDetails?.metadata?.invocationId ===
						invocation &&
					statement.subject?.some(
						(subject) =>
							subject.name === `${image.registry}/${image.repository}` &&
							subject.digest?.sha256 === image.digest.slice(7),
					)
				);
			}),
			"No provenance for this candidate in the current run attempt",
		);
	}

	async recordClaim(images, run) {
		const claim = {
			schema: 1,
			runId: this.runId,
			attempt: this.attempt,
			createdAt: run.created_at,
			revision: this.context.sha,
			destinations: promotionContract.destinations(images),
		};
		const records = await this.github.paginate(
			this.github.rest.repos.listDeployments,
			{ ...this.context.repo, ...journal, per_page: 100 },
		);
		promotionContract.rejectSuperseded(claim, records);
		const { data: deployment, status } =
			await this.github.rest.repos.createDeployment({
				...this.context.repo,
				...journal,
				ref: this.context.sha,
				auto_merge: false,
				required_contexts: [],
				production_environment: false,
				description: "Validated container publication",
				payload: claim,
			});
		assert.equal(status, 201, "Publication journal was not created");
		return deployment.id;
	}

	async status(deploymentId, state) {
		await this.github.rest.repos.createDeploymentStatus({
			...this.context.repo,
			deployment_id: deploymentId,
			state,
			auto_inactive: false,
			environment: journal.environment,
			log_url: `${this.context.serverUrl}/${this.context.repo.owner}/${this.context.repo.repo}/actions/runs/${this.runId}/attempts/${this.attempt}`,
			description:
				state === "success"
					? "All image destinations verified"
					: "Publication incomplete; retain claim and candidate images",
		});
	}

	async promote(images) {
		assert(
			Array.isArray(this.verifiedImages),
			"Missing signature verification output",
		);
		assert.deepEqual(
			new Set(this.verifiedImages),
			new Set(
				Object.values(images).map(
					(image) => `${image.registry}/${image.repository}@${image.digest}`,
				),
			),
			"Signature verification must cover exactly the candidate digests",
		);
		await this.currentRun();
		// Preflight every image before recording a claim or publishing any consumer tag.
		for (const image of Object.values(images))
			await this.verifyCandidate(image);
		const run = await this.currentRun();
		const deploymentId = await this.recordClaim(images, run);
		try {
			await this.status(deploymentId, "in_progress");
			const promoted = {};
			for (const [name, image] of Object.entries(images)) {
				const reference = `${image.registry}/${image.repository}@${image.digest}`;
				for (const destination of image.candidate.destinations) {
					await this.currentRun();
					await this.command("docker", [
						"buildx",
						"imagetools",
						"create",
						"--prefer-index=false",
						"--tag",
						destination,
						reference,
					]);
					assert.equal(
						await this.digest(destination),
						image.digest,
						"Published digest differs from validated digest",
					);
					this.core.info(`Verified ${destination}@${image.digest}`);
				}
				const { candidate, ...metadata } = image;
				promoted[name] = {
					...metadata,
					tags: candidate.destinations.map((destination) =>
						destination.slice(`${image.registry}/${image.repository}:`.length),
					),
					images: candidate.destinations.map(
						(destination) => `${destination}@${image.digest}`,
					),
				};
			}
			await this.currentRun();
			await this.status(deploymentId, "success");
			return promoted;
		} catch (error) {
			await this.status(deploymentId, "failure").catch(() =>
				this.core.warning(
					"Could not record failure; retain the existing publication claim",
				),
			);
			throw error;
		}
	}
}

module.exports = { ImagePromotion };
