# ADR 0006: Promote validated image digests

Status: Proposed

Date: 2026-11-12

## Context

[ADR 0005](0005-publish-candidates-with-final-image-metadata.md) separates candidate
builds from consumer tags. Its output identifies the build, but does not certify
validation. Promotion must join successful checks with the exact tested images,
retain their manifests and security evidence, and reject stale publication.

A concurrency group serializes writers but does not order them by source age.
An older run can reach promotion after a newer one. Registry tag writes are not
an atomic transaction across destinations. Both constraints need explicit recovery
semantics before Pleey overlaps production builds with validation.

## Decision

Expose `docker-promote-images.yml`. Its `job-results` input uses the existing
`${{ toJSON(needs) }}` convention. The caller declares all required validation
jobs and candidate producers as direct dependencies. Every supplied result must
be `success`; an empty set, failure, cancellation or skip fails promotion.
Candidate producers expose `built-images`. Successful validation jobs expose
`validated-images`, forwarding exactly the candidate entries they actually tested.
Every candidate must have matching validation, including its digest, destinations,
source and run identity. Conflicting, missing or extra evidence fails closed.

The caller owns the required check inventory and must test the digest references
it forwards. Workflow configuration is trusted, just as it is for normal image
publication. A caller-provided success value is not an independent security proof.
This interface cannot detect omitted checks or dishonest caller code. It prevents
accidental mismatches and retains explicit dependency results for review.

The workflow verifies the current run/attempt and live source ref through GitHub.
Candidates must belong to that repository, revision and attempt. It authorizes
only the configured registry and repository prefix (default: GHCR and the calling
repository); destinations must remain in each candidate's image repository.
Before any publication, verify every candidate's cosign signature and GitHub build
provenance, including the build workflow, source revision and run/attempt. Unsigned
or unattested candidates are not supported by this promotion workflow.

Serialize all promotion jobs in a calling repository with one internal concurrency
group and `cancel-in-progress: false`. Use GitHub deployment records with task
`ci-image-promotion` and environment `ci-image-promotion` as a durable publication
journal. This requires `deployments: write`, but no app token, external storage or
caller-managed environment. Records are not application deployments and do not
run deployment code. Their payload contains authorized destinations, digests,
source and server-reported run creation time/ID/attempt.

Before registry writes, reject overlapping claims from a newer run or attempt.
Order different runs by creation time, using run ID to break equal timestamps;
order attempts of the same run numerically. Record the validated claim before
writing the first tag, so interruption and partial failure still block older
writers. Retain journal records, including failed or cancelled publication, for
as long as their destinations may be reused. All writers of these destinations
must use this workflow; concurrent external writers are outside its contract.

Use one digest source with `docker buildx imagetools create --prefer-index=false`.
Before writing, hash its dry-run manifest bytes and require the candidate digest.
Copy within the same repository without annotations, rebuilding or re-signing.
Verify every destination digest after writing; return normal `built-images` only
when all destinations succeed. Existing digest-addressed signatures and provenance
remain reachable in the same repository.

## Recovery and cleanup

- Tag writes are individually visible, not atomic as a group. Failure returns no
  successful output and retains the journal claim and a failure status; logs identify completed tags. It does
  not roll back tags or pretend that published tags were invisible.
- Repeating an identical claim in the same attempt is idempotent. Conflicting
  claims for the same destination in one attempt fail. A new attempt must rebuild
  and revalidate candidates; rerunning promotion alone with stale outputs fails.
- Cancellation retains the claim. A later complete build/validation attempt can
  replace it; an older run cannot. Check current run/ref state before each write.
- Do not delete candidates or registry versions automatically. A promoted digest
  shares its content and security evidence with its candidate. Registry-specific
  retention must preserve consumer-tagged content; journal retention is separate.
- GitHub API, provenance or registry verification errors fail closed. Publication
  success is reported only after verification and journal status succeed.

## Validation

Use focused unit contracts for gates, evidence, authorization, source freshness,
supersession, conflicting claims, idempotency, partial failure and cancellation.
Extend the existing signed single/multi-platform candidate fixture for hosted
promotion, unchanged bytes/OCI metadata, security verification and repeat calls.
No additional Dockerfile or sample application is needed. Controlled contexts
cover PR, branch and release tags; hosted PR tests do not claim a real release run.

## References

- [Buildx exact-source copy](https://docs.docker.com/reference/cli/docker/buildx/imagetools/create/)
- [GitHub concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [GitHub deployments API](https://docs.github.com/en/rest/deployments/deployments)
- [Attestation verification policy](https://cli.github.com/manual/gh_attestation_verify)
