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

Use dependency-free Node tests beside the existing selector, invoked by its
existing integration workflow before registry setup. Cover concurrent duplicate
lookups across pages, distinct PR states and protected/ambiguous tags, isolation
between invocations/repositories and rejected lookups. Demonstrate the duplicate
request and stale-state regressions against the previous selector. Retain the
existing image-build/prune integration for the registry boundary.

The caller's local GitHub credential cannot read package versions, so production
request-volume and elapsed-time savings are not established by this change.
Synthetic request counts establish the avoided duplicate work. No live package
deletion is run solely to benchmark it. Keep workflow batching deferred until
measurements justify changing the execution topology.
