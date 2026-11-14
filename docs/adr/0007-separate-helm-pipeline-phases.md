# Separate Helm prepare, lint, test and release phases

Date: 2026-11-13

Status: Accepted on 2026-11-13. Prepare released in 1.0.0; Lint implementation in review; remaining phases pending.

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

- [x] Review this ADR and the artifact/input contracts before implementation.
- [x] Implement Prepare: move final mutations and packaging; verify locked external dependencies, current nested local charts and changed-input invalidation.
- [x] Review the Prepare implementation and its CI before starting Lint. PR #966 merged and released in 1.0.0.
- [x] Lint: extract existing static checks; verify invalid metadata, schema or templates fail against the prepared artifact.
- [ ] Review Lint and its CI before starting Test.
- [ ] Test: consume that artifact; preserve fresh-cluster readiness, migrations, chart tests, diagnostics and failure/cancellation cleanup.
- [ ] Release: accept the prepared archive; preserve retries, immutable outputs and signing; reject missing or mismatched artifacts before push.
- [ ] Compose the reusable workflow; verify failed/skipped/cancelled validation blocks publication and reruns select the correct artifact.
- [ ] Migrate in-repository callers, fixtures and generated action/workflow docs together, then review and release the complete public contract.
- [ ] Adopt the released workflow in Pleey and validate final chart/image metadata, installation and publication identity.

Changing the current mixed-purpose action contracts requires an explicit breaking
release and coordinated caller migration. Keep consumers on their supported
released version until the replacement is ready. Do not preserve the old mixed
responsibilities through additional mode flags. Review each subsequent phase in
its own pull request. Consumers adopt the complete artifact pipeline after its
remaining contracts and callers are ready.

Reuse existing tests when they already cover the contract. Add focused coverage
only for new artifact/mutation/gate failure cases, and use existing integration
fixtures for the Helm and registry boundaries. Do not publish a production release
just to validate the redesign.

### Prepare increment: 2026-11-13

The design was approved before implementation. `prepare-chart` now takes one
selected root chart, applies metadata and published values through the existing
values action, validates dependency locks, builds local children before parents,
and packages once. It returns an absolute archive path and a hexadecimal SHA-256.
The caller owns the successful artifact; failed packaging removes partial output.
No cache is introduced, so each invocation rebuilds current source and locked
inputs rather than accepting stale packaged children.

The prior release lock helper and its bundle move to Prepare. During extraction,
`release-chart` delegates preparation and pushes the returned archive, retaining
its existing release-facing inputs, retries and signing. Its public artifact-input
contract remains a later increment. The initial Test adapter imported Prepare's
private JavaScript bundle. Review rejected that coupling: actions must use another
action's declared inputs/outputs, never its source or distribution files.

For this increment, `test-chart` retains its source-based repository registration
and dependency builds through Helm's CLI, contained within its own action. Nested
source directories are built before their parents. This preserves the existing
Test API while its prepared-artifact contract is pending. Preparation's metadata,
lock-rewrite and packaging implementation remains private to Prepare. No shared
JavaScript API or temporary action is introduced for the rollout. The Test phase
will replace this source setup with consumption of the archive and checksum.
Release remains free of lint/test checks.

The changed public Prepare contract requires one chart directory and matching
locks for charts with dependencies; repository-wide discovery moves to callers.
Optional name/tag inputs retain source metadata when omitted. Existing tag-path
and published-values configuration remains available. Local dependency versions
may change together with their source charts; external declarations and locked
versions remain unchanged. Source is prepared in place, so generated chart files
must be ready before the call.

Focused tests cover lock errors, final metadata plans, package outputs/cleanup and
publication integrity. The existing umbrella fixture supplies a real Helm test
for stale nested packages, changed source/values/versions and locked external
content. The existing Test integration executes an isolated copy of that action,
without sibling action files, to catch accidental runtime coupling. It reuses the
same cluster and fixture, adding no separate installation scenario. Existing
publication tests retain retry and signing coverage. Hosted CI
must pass before this increment is accepted; no performance gain is claimed.

### Prepare release and Lint increment: 2026-11-14

The original rollout kept the replacement in draft until all phases worked
together. After reviewing Prepare, the user merged PR #966 and published
[1.0.0](https://github.com/hoverkraft-tech/ci-github-container/releases/tag/1.0.0)
on 2026-11-13. Its [release CI](https://github.com/hoverkraft-tech/ci-github-container/actions/runs/43519248579)
passed. The remaining phases proceed as separate reviewable increments; Pleey
continues using its existing released contract until the full pipeline is ready.

`lint-chart` accepts the archive/checksum, a working directory, optional existing
chart-testing configuration and ordered validation-only values files. Tools and
checkout remain caller-owned. It verifies a snapshot of the supplied bytes,
extracts one root chart using the maintained `tar` package, and rejects links,
unsafe paths and duplicate entries. Its dependencies use the existing action
distribution checks and rebuild automation.

The action preserves chart-testing metadata/schema validation, YAML linter rules,
maintainer policy, custom commands and packaged `ci/*-values.yaml` scenarios.
It selects only the prepared chart, disables repository setup and dependency
builds, and prevents upgrade worktrees or a deprecated-chart skip from bypassing
that validation. Explicit selection follows `ct --charts`: chart-diff and version
increment policy belong to source selection before Prepare, not a synthetic Git
comparison against a temporary extraction.

Review identified that retaining the old `ct lint` step in Test left two owners
for static validation. This increment removes it: `lint-chart` is the single
implementation. Test always runs installation tests; the `enable-lint` and
`enable-install` inputs are removed. Callers run Prepare and Lint before Test,
with normal step success gating. This is a breaking change. Test still selects
source charts until its archive-input increment; that remaining work must bind
installation to the validated bytes before consumers adopt the complete pipeline.
The existing Prepare-to-Lint integration verifies static checks, and the isolated
Test integration retains installation coverage without sibling action files.

Helm's lint mode intentionally ignores some `required` and `fail` template
errors. Therefore Lint also runs client-side `helm template` for the same scenarios,
with the same values precedence and shared Helm flags. The three lint-only flags
(`strict`, `quiet`, `with-subcharts`) are omitted from rendering. Rendered manifests
stay out of logs; rendering errors retain stderr diagnostics with debug disabled.
Custom commands remain caller-owned and must apply their own logging policy.

Validation files are copied into a unique temporary directory inside the working
directory. Relative staging paths accommodate spaces in caller paths despite
chart-testing's whitespace-based extra-argument parser. Ordered overlays follow
each packaged CI scenario and never become published defaults. Fingerprints reject
custom commands that change extracted chart/overlay content; the original archive
checksum is checked again. Success and errors both remove only the temporary
directory created by the invocation.

Unit checks cover archive identity and extraction, policy/overlay handoff,
mutation rejection, private rendered output and failure cleanup. One real-tool
integration reuses the existing application fixture to reject invalid metadata,
duplicate YAML keys, invalid values schemas and template failures, and to verify
overlay precedence. No additional test image or cluster is introduced. Lint's CI
must pass and receive review before starting Test. The complete phase workflow
and performance acceptance remain pending.

## Consequences and limits

This separates validation from publication and avoids repeated preparation in the
target pipeline. It adds an artifact handoff to the isolated publication job.
Performance gains remain unmeasured; this is a responsibility and reuse decision,
not evidence of a speedup. Existing fresh-install tests, image verification and
signing remain required. Preparation is released and Lint is implemented for
review. The complete workflow and remaining phase contracts are not yet available.

## References

- [Helm packaged chart installation](https://helm.sh/docs/intro/using_helm/)
- [Helm tests run against an installed release](https://helm.sh/docs/helm/helm_test/)
- [Helm OCI publication consumes a prepared archive](https://helm.sh/docs/topics/registries/)
- [Pleey CI optimization plan](https://github.com/cloud-native-aixmarseille/pleey/pull/553)
