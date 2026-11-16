# Deduplicate concurrent PR-state lookups during image cleanup

Date: 2026-11-16

Status: Proposed for implementation review.

## Context

Pleey's CI optimization plan profiles the four parallel image cleanup jobs before
considering batching. The latest inspected main run spends 49-71 seconds per
image; most time is registry selection and cleanup, rather than runner setup.
Batching would change orchestration without removing that work.

The selector evaluates a page of package versions concurrently. Its cache stores
PR state only after the API request resolves, so versions referencing the same PR
can all issue that request before any result is cached. The module-level cache
also survives another invocation in the same process and is keyed only by PR
number, which can reuse stale state or another repository's state.

## Decision

Keep the existing workflow matrix, inputs, pagination, retry behavior and deletion
policy. Cache the in-flight PR-state promise before awaiting it, with a new cache
for each selector invocation. Versions and pages in that invocation share one
lookup per PR. Different PRs remain concurrent. Later invocations fetch fresh
state, including when the caller changes repositories.

A rejected lookup still rejects selection and prevents cleanup from proceeding.
Do not turn API errors into a deletion decision. Keep open-PR, ambiguous-version
and preserved-tag handling unchanged. The cache is only an invocation-local
snapshot, not persistent evidence that a PR is still closed.

## Validation

Use dependency-free Node tests beside the selector under `src/`, following the
[JavaScript action package and CI pattern](../development/action-distributions.md).
The action imports its ES module directly, without a bundle. Its package owns the
lockfile and test scripts; the reusable Node CI workflow produces JUnit and LCOV
reports and retains CodeQL and dependency review. The repository's existing
report job consolidates results under this action's calling job ID. Keep source
tests separate from image-build/prune integration, which verifies the registry
boundary.

Cover concurrent duplicate lookups across pages, distinct PR states and
protected/ambiguous tags, isolation between invocations/repositories and rejected
lookups. Demonstrate the duplicate-request and stale-state regressions against
the previous selector. Reuse these five cases when changing the CI integration.

[Review 5924742514](https://github.com/hoverkraft-tech/ci-github-container/pull/981#pullrequestreview-5924742514)
replaces the initial custom test step in registry setup with the established
package workflow. This adds the missing reporting and security integration;
it does not change the selector's behavior or add runtime dependencies.

The caller's local GitHub credential cannot read package versions, so production
request-volume and elapsed-time savings are not established by this change.
Synthetic request counts establish the avoided duplicate work. No live package
deletion is run solely to benchmark it. Keep workflow batching deferred until
measurements justify changing the execution topology.
