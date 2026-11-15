# Compose Helm validation and release workflows

Date: 2026-11-15

Status: Proposed for implementation review.

## Context

The user reviewed Pleey's Container 3.0.0 adoption and requested the next Release
increment together with a reusable replacement for its `tests-charts` job.
[ADR 0007](0007-separate-helm-pipeline-phases.md) defines the four phase contracts.
Prepare, Lint and Test are released. Release still prepares its own archive, and
consumers duplicate validation orchestration and cleanup.

## Decision

Keep the phase contracts from ADR 0007. Supersede only its single workflow
entrypoint with two entrypoints sharing one validation implementation:

- `helm-chart-ci.yml` checks out the caller, prepares once, lints, installs/tests
  and cleans up on one runner. Its jobs request only contents/packages read.
- `helm-chart-release.yml` calls that workflow and publishes its exact artifact
  in a downstream job with packages write and OIDC permissions.

GitHub requires callers to delegate permissions needed by reusable workflows.
Separate entrypoints let PR validation remain read-only while release callers
explicitly grant publication permissions. Each caller still uses one workflow;
there is no duplicated phase orchestration or configuration file.

Inputs expose existing phase configuration and runner/time limits. Both validation
phases receive the same checksum, chart-testing configuration and ordered values
files. Installation-only image overrides remain separate from published defaults.
Optional image metadata is returned only after the entire validation job succeeds;
callers must map those images into their chart by digest, as required by the image
promotion contract. Metadata alone is not proof that arbitrary chart templates use
those images.

Validation uploads the archive only when requested. Each invocation uses a unique
artifact name, returns its immutable ID and original archive checksum, and removes
local preparation output. Publication downloads that exact ID from the same run,
checks the checksum and pushes the unchanged bytes. No wildcard/latest lookup or
source checkout occurs in publication. Rerunning a failed publication job reuses
the successful producer's artifact; rerunning preparation produces a new ID.
Expired/deleted artifacts fail closed and require a full rerun.

Release owns publication validation, bounded retries, signing and immutable
outputs. It takes archive/checksum and registry coordinates; source mutation,
checkout, packaging and their former inputs are removed. A verified local snapshot
keeps retries bound to the supplied bytes. Direct callers retain their archive.
Publishing remains gated by successful validation. Callers own trusted release
triggers, environment protection and non-cancelling release concurrency. An in-flight
registry request cannot be undone by cancelling a workflow.

## Validation and rollout

Extend existing release tests for the public artifact boundary and input mutation;
preserve retry, credential cleanup, digest and signing coverage. Reuse the existing
chart fixtures and application image for one workflow integration that covers
checkout, validation, artifact transfer and publication. This runner/cluster tests
a new workflow boundary that action unit tests cannot exercise; do not add image
fixtures or duplicate the action's negative-case matrix. Measure its hosted cost.

Migrate in-repository action callers and generate documentation using the existing
generator. Keep Pleey's released workflow pins until upstream review and release;
record its simplified caller in the adoption plan. Live production publication,
interrupted-run experiments and controlled performance acceptance remain separate
rollout checks, not claims based on a passing fixture run.
