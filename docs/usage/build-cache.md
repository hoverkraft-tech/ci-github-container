# Build caches

The [build action](../../actions/docker/build-image/README.md) and
[build workflow](../../.github/workflows/docker-build-images.md) retain inferred
image/branch/platform cache imports and exports. `cache-mode` defaults to `max`,
which includes intermediate stages. `min` exports only final-image layers; compare
the complete import/build/export time before selecting it for production images.
Keep `max` on CI images whose intermediate stages feed production builds.

## Additional layer imports

Set `cache-from` to newline-separated `type=gha,scope=...` or
`type=registry,ref=...` entries. These supplement inferred imports and never add
export destinations. Configure credentials for any additional private registry
through the existing OCI registry inputs. Registry cache references include the
cache image path and tag, not the application image digest.

For a single-platform PR build, an `images` entry can import the completed CI
image's cache:

```json
{
  "name": "backend",
  "context": ".",
  "dockerfile": "application/backend/Dockerfile",
  "target": "prod",
  "platforms": ["linux/amd64"],
  "cache-from": "type=gha,scope=ghcr.io/${{ github.repository }}/backend-ci:pr-${{ github.event.pull_request.number }}-linux-amd64",
  "cache-mode": "max",
  "cache-mount-key-files": "application/backend/package-lock.json"
}
```

The producer must finish exporting before the consumer starts. Use the scope
printed by the producer's cache configuration step; PR scopes use `pr-N` and
branch scopes use the branch name, with `/` replaced by `-`, followed by the
platform suffix. Select the corresponding branch/default-branch scope for push
or tag workflows. Match the producer's registry, image and platform. Each image
continues writing only its own inferred cache destination.

All three settings also exist as workflow-level defaults. An image's explicit
string overrides the default, including an empty `cache-from` or
`cache-mount-key-files`. GitHub's branch/cache access rules still apply; an
additional scope cannot grant access to another PR's cache.

## Download-mount snapshots

Use `cache-mount-key-files` with `cache-type: gha`. Supply newline-separated
workspace-relative manifest/lockfile patterns for that image. Configured patterns
must match at least one file. Keep credentials outside those files and cache
mounts. The snapshot contains Dockerfile cache-mount contents, not installed
dependencies or a reusable test result.

The versioned key prefix retains image, build context, target, platform,
Dockerfile contents and build arguments. Pin toolchains in the Dockerfile or
declare them through build arguments so changing them changes the prefix.
Dependency-file contents form the final fingerprint. An unchanged fingerprint
restores an exact snapshot; a changed fingerprint can restore an older snapshot
only within the same prefix, then save refreshed downloads after a successful
job. Dependency installers still execute whenever BuildKit invalidates their
layer. Dockerfile/toolchain/platform changes deliberately start a new scope.

Without dependency patterns, snapshots remain keyed by the invariant build
identity and cannot detect a changed lockfile. Set this input to enable refresh
for dependency updates. Source-only changes need not replace download snapshots.

Read-only GHA triggers retain imports and mount restoration, skip mount extraction
and saving, and disable layer exports. Exact hits also skip redundant extraction
and saving. Extraction runs before builder teardown. As with `actions/cache`,
snapshot saving follows job success; do not suppress build failures if the job
must remain unsuccessful.

## Recovery and measurement

Set `cache-type` to `false` or an empty string to bypass layer imports, layer
exports and mount persistence and force a cold build. Cache absence or eviction
must not affect correctness. This bypass does not delete existing shared caches.
For a damaged mount snapshot, identify its exact key in the build logs and delete
only that entry using GitHub's cache management UI or CLI, then rerun normally.
Changes to secret values and elapsed time alone do not invalidate install layers.

Compare representative cold, warm and changed-dependency runs. Include transfer
and export time, cache sizes and misses alongside execution time. Cache mode
savings on a small fixture do not establish savings for an application. The
[decision record](../adr/0004-scope-build-cache-imports-and-mount-snapshots.md)
contains the design and dated validation evidence.
