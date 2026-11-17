# Let the release action own validated artifact downloads

Date: 2026-11-17

Status: Proposed for implementation review.

## Context

[Pleey PR #553](https://github.com/cloud-native-aixmarseille/pleey/pull/553)
separates chart validation from publication. Its review requests moving artifact
identity checks, download and cleanup into `helm/release-chart`. The composed
Helm release workflow duplicates the same steps.

## Decision

Extend the publication phase from [ADR 0009](0009-compose-helm-validation-and-release-workflows.md).
Accept exactly one archive source: a local `archive`, or one immutable
`artifact-id` with its `archive-name`. Both require the original archive
`checksum`. Reject missing, mixed or malformed inputs before download or registry
access. Local archive callers retain their files.

For artifact input, the action downloads the exact ID from the current workflow
run into a fresh private runner directory using `actions/download-artifact`.
Artifact digest mismatch is fatal. The existing publication code verifies the
selected archive checksum before registry login, snapshots those bytes and
preserves its retry, digest and signing contracts. Downloaded files are removed
by an always-running final step, including after download, push or signing failure.
Hard runner termination can still prevent cleanup, as with other Actions steps.

No artifact name search, latest-run lookup, cross-run credential API, source
checkout, packaging or chart validation is added. Callers retain responsibility
for successful validation, trusted release triggers, environment protection and
non-cancelling publication concurrency. An expired or deleted artifact fails;
rerun validation to produce a new artifact. Publication-only retries reuse the
original successful validation's ID and checksum.

The composed release workflow and Pleey pass validation outputs directly to the
action. Test/lint configuration stays in their separate validation jobs.

## Validation and rollout

Reuse existing publication tests for local archive integrity, bounded retries,
registry cleanup, digest outputs and signing configuration. Add focused input
and temporary-file ownership coverage, and exercise artifact transfer through
the existing composed-workflow integration using its existing chart and image.
Use the existing action integration's checksum rejection to exercise cleanup
after a downloaded archive fails validation; do not add another cluster fixture.

Regenerate action and workflow documentation through CI Dokumentor. Preview the
upstream change in Pleey #553 with an immutable commit; replace that preview with
a reviewed release before merging Pleey. Native test publication uses existing
isolated fixture tags and does not publish a Pleey release.
