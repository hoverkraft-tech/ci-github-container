# Separate Helm prepare, lint, test and release phases

Date: 2026-11-13

Status: Proposed; phase separation requested in review, implementation pending.

## Context

Current responsibilities overlap. `helm/prepare-chart` builds dependencies;
`helm/test-chart` also checks out source, installs tools, prepares dependencies,
lints and runs cluster tests. `helm/release-chart` changes chart metadata and
values, prepares dependencies again, packages, publishes and signs.

Testing a chart before those release mutations does not validate the final chart.
The initial [PR #966 implementation](https://github.com/hoverkraft-tech/ci-github-container/commit/e636bec523560db253a4d8d2df5e2853e34cdb56)
added `validation-values` and lint/render commands to the publication action.
Review rejected that responsibility boundary. This revision replaces that unmerged
proposal with separate prepare, lint, test and release phases; the prototype's
runtime changes and tests are removed from the PR.

## Decision

Each phase has one responsibility. The following contracts describe the target
API, not capabilities already available in the released actions.

| Phase   | Responsibility                                                                                                                                                                               | Result                                             |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Prepare | Apply final chart name/version/appVersion and published value changes, resolve dependencies from declared locks, rebuild current local subcharts from children to parents, and package once. | Final `.tgz` archive and its SHA-256 checksum.     |
| Lint    | Check chart metadata, schema, templates and rendering against the prepared chart with the declared validation values.                                                                        | Lint result for that archive.                      |
| Test    | Install the prepared chart in a fresh cluster, wait for readiness and jobs, run chart tests, collect diagnostics and clean up.                                                               | Installation/test result for that archive.         |
| Release | Check the supplied artifact identity and release inputs, push the unchanged archive, sign its OCI digest and return publication outputs.                                                     | Published chart reference and OCI manifest digest. |

Move existing mutation/lockfile/packaging code into preparation. Extract static
linting from `test-chart` into a focused `lint-chart` action. Reuse existing Helm,
chart-testing, signing and publication helpers rather than copying their logic
into consumer repositories. Release performs no linting, cluster tests, source
checkout, dependency rebuild or repackaging. Basic publication input validation
remains its responsibility.

### Artifact and configuration handoff

Apply the contract per selected root chart. The workflow selects charts once;
nested dependencies remain part of their root artifact unless selected separately.

All metadata changes and generated chart files must be finalized before
preparation produces the archive. Lint,
test and release consume that artifact and verify its expected checksum. The
archive checksum is distinct from the registry's OCI manifest digest.

Tools needing a chart directory may inspect an isolated extraction of the archive;
they must not refresh dependencies, apply publication mutations or replace its
contents. Preserve existing chart-testing checks and supported configuration when
extracting the phases; replacing them with fewer Helm commands is not equivalent.

Published defaults belong to preparation. Lint/test values files and test-only
credentials configure validation environments; they must not become published
defaults. Both validation phases use the same declared scenarios. Keep rendered
Secrets out of logs and preserve current failure diagnostics.

Within a job, reuse the local archive. Across jobs, upload it once and download
the explicit artifact produced by preparation. Propagate the expected checksum
through job outputs and fail on mismatches. Rerunning a failed consumer may reuse
that unchanged artifact; never select an unrelated artifact by a latest-run or
wildcard lookup. Direct action callers own ordering; the reusable workflow owns
the success gate and binds its results to the prepared artifact.

### Workflow and developer experience

Expose one reusable workflow for normal callers, with configuration through
workflow inputs, and keep the four actions composable. Checkout and common tool
setup happen once for the preparation and validation job. Do not require callers
to repeat repository setup or coordinate four independent workflows.

Start with prepare, lint and test as sequential steps in one job. Keep release
in a downstream job with publishing/OIDC permissions, dependent on successful
validation and the same artifact. Validation jobs receive no registry write or
signing permissions. PR validation can finish without enabling publication.

Four phases do not mandate four runners. Lint and test have no data dependency
on one another once preparation completes, so later parallel execution is possible.
The initial ordering fails cheaply on lint before provisioning a cluster. In the
[observed Pleey run](https://github.com/cloud-native-aixmarseille/pleey/actions/runs/43452501488/job/131980629625),
lint took 0.66s and kind creation 40.34s; another runner is not justified by that
lint duration. Measure setup, artifact transfer, elapsed and summed job time
before changing the scheduling policy.

### Implementation and rollout

Review and implement one phase at a time using existing fixtures and helpers:

- [ ] Review this ADR and the artifact/input contracts before implementation.
- [ ] Prepare: move final mutations and packaging; verify locked external dependencies, current nested local charts and changed-input invalidation.
- [ ] Lint: extract existing static checks; verify invalid metadata, schema or templates fail against the prepared artifact.
- [ ] Test: consume that artifact; preserve fresh-cluster readiness, migrations, chart tests, diagnostics and failure/cancellation cleanup.
- [ ] Release: accept the prepared archive; preserve retries, immutable outputs and signing; reject missing or mismatched artifacts before push.
- [ ] Compose the reusable workflow; verify failed/skipped/cancelled validation blocks publication and reruns select the correct artifact.
- [ ] Migrate in-repository callers, fixtures and generated action/workflow docs together, then review and release the complete public contract.
- [ ] Adopt the released workflow in Pleey and validate final chart/image metadata, installation and publication identity.

Changing the current mixed-purpose action contracts requires an explicit breaking
release and coordinated caller migration. Keep consumers on their supported
released version until the replacement is ready. Do not preserve the old mixed
responsibilities through additional mode flags. Keep the replacement in draft
until its phases and callers work together.

Reuse existing tests when they already cover the contract. Add focused coverage
only for new artifact/mutation/gate failure cases, and use existing integration
fixtures for the Helm and registry boundaries. Do not publish a production release
just to validate the redesign.

## Consequences and limits

This separates validation from publication and avoids repeated preparation in the
target pipeline. It adds an artifact handoff to the isolated publication job.
Performance gains remain unmeasured; this is a responsibility and reuse decision,
not evidence of a speedup. Existing fresh-install tests, image verification and
signing remain required. No part of this split is implemented by this ADR-only PR.

## References

- [Helm packaged chart installation](https://helm.sh/docs/intro/using_helm/)
- [Helm tests run against an installed release](https://helm.sh/docs/helm/helm_test/)
- [Helm OCI publication consumes a prepared archive](https://helm.sh/docs/topics/registries/)
- [Pleey CI optimization plan](https://github.com/cloud-native-aixmarseille/pleey/pull/553)
