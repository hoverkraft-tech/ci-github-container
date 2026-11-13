# Validate packaged Helm charts before publication

Date: 2026-11-13

Status: Proposed

## Context

The release action updates chart metadata, local dependency versions and caller
values before packaging. Earlier application or chart tests do not validate that
final artifact. Pleey's [CI optimization plan](https://github.com/cloud-native-aixmarseille/pleey/pull/553)
reuses tested application images but still requires validation after release-file
changes. Rebuilding those images or installing another cluster would repeat work
without checking the archive at its publication boundary.

## Decision

Add one optional `validation-values` input to `helm/release-chart`. Each nonempty
line names a values file relative to the workspace. Supplying files enables
`helm lint --strict` and `helm template` against the packaged `.tgz`, after every
release mutation and before the first push. Apply files in their declared order.
Use an existing chart `values.yaml` when no additional environment values are
needed. Keep validation opt-in because charts may require caller-specific values.

Push the same archive that passed both commands. Validation values affect only
these commands; they are not merged into the published defaults. Suppress rendered
manifest output because it can contain Secrets. Any validation failure prevents
push and successful publication outputs, and retains existing temporary-file and
credential cleanup. Preserve retries, immutable digest outputs and signing.

Document the input in action metadata and regenerate its action documentation through
the existing documentation generator. No new validation workflow, image, package
or dependency is needed.

## Validation

Extend the existing push tests to cover archive identity and values ordering,
both validation commands failing before publication, and cleanup. Existing tests
retain the unset-input and publication retry contracts. Enable validation in the
existing signed simple/umbrella integration cases rather than adding a matrix.
Use real Helm locally to validate the final chart archive and reject malformed
values or rendering. This exercises Helm without publishing a release.

## Consequences

Opted-in releases add two local Helm commands. This checks schema, lint and
rendering; it does not prove live installation, image identity or application
health. Callers retain those existing checks. No end-to-end speedup is claimed.
Pleey can adopt the input after this change is reviewed and released, using its
existing chart CI values file and previously validated image digests.
