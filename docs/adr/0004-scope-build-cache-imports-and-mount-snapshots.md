# Scope build-cache imports and mount snapshots

Date: 2026-11-11

Status: Proposed

## Context

Builds import only their own image cache and always export `mode=max`. A production
target cannot explicitly import a completed CI target's intermediate layers.
Mount snapshots use the Dockerfile hash and image/platform/target, but their
fallback drops that identity. Dependency changes do not change the immutable
snapshot key, so an exact hit prevents saving newly downloaded packages.

Pleey's historical unchanged-input compilation misses remain unexplained. Its
latest five baseline/candidate pairs retained dependency and compilation layers.
Neither mount-key corrections nor additional imports establish the cause of those
historical layer misses. Layer caches and download mounts are separate mechanisms.

## Decision

Expose `cache-from`, `cache-mode` and `cache-mount-key-files` through the build
action and reusable workflow, with per-image overrides. Additional imports accept
explicit GHA scopes or registry references; retain the existing inferred imports
and exporter destinations. Validate `min`/`max`, retaining `max` by default.
Keep CI's complete intermediate graph. Consumers select a production export mode
only after comparing import/build/export cost and retained layers.

Version mount keys. Their invariant prefix includes image, context, target,
platform, Dockerfile contents and build arguments. Dockerfile pins and toolchain
build arguments therefore remain part of every restore prefix. An optional
workspace-relative file-pattern input fingerprints dependency manifests/locks.
Reject configured patterns that match no files. Callers must declare their own
dependency files; the action does not guess a package manager or scan all source.
When dependencies change, restore a compatible older snapshot, run the invalidated
install layer and save the refreshed downloads under the new key. Exact hits need
no extraction or duplicate save. Give each invariant scope its own mount directory.

Preserve the existing cache writer policy. Read-only GHA triggers restore mounts
without registering a save or extraction; layer exports remain disabled. Cache
bypass removes all imports, exports and mount persistence and forces execution.
Keep extraction before builder teardown and successful-job-only snapshot saves.
Cache data never authorizes skipping validation or freezing installed dependencies.

## Consequences and alternatives

Old mount snapshots become cold once because their fallback cannot establish the
new identity. Dependency-file configuration is opt-in for existing consumers;
Pleey adoption will supply each application's lockfile explicitly. Toolchain
changes belong in pinned Dockerfiles/build arguments, not mutable undeclared
environment state. Compatible dependency changes can reuse downloaded packages;
Dockerfile/toolchain changes deliberately cannot reuse that fallback.

Do not replace the existing branch/PR resolver, introduce registry caching, widen
writer access, delete shared caches, or change publication/DAG ordering. Additional
imports do not add exporters. Missing/evicted caches remain valid cold inputs.
Rollback restores the released pin or disables caching for the affected caller.

## Validation requirements

Exercise input validation, inferred/additional imports, both export modes,
exact/partial/missing mount hits, dependency/Dockerfile/toolchain/platform changes,
read-only triggers, bypass and failed builds. Use independent builders to prove
cross-image layer reuse and mount extraction before teardown. Compare `min` and
`max` on a multi-stage fixture and retain all attempts; record actual results here.
Regenerate action/workflow readmes with the existing generator.

## References

- [Pleey P2.4 plan](https://github.com/cloud-native-aixmarseille/pleey/blob/ci/475-p1-local-reductions/docs/technical/plans/0023-optimize-ci-execution-and-caching.md#p24-improve-cache-reuse-and-invalidation)
- [BuildKit cache backends](https://docs.docker.com/build/cache/backends/)
- [GHA cache scope and access](https://docs.docker.com/build/cache/backends/gha/)
- [Cache mounts in GitHub Actions](https://docs.docker.com/build/ci/github-actions/cache/#cache-mounts)
