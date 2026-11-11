# Build caches

The [build action](../../actions/docker/build-image/README.md) and
[build workflow](../../.github/workflows/docker-build-images.md) configure caches
from the existing image and build inputs. No additional cache configuration is
required. Layer imports and exports follow the image, branch and platform;
exports include intermediate stages using `max` mode.

With `cache-type: gha`, Dockerfile cache mounts persist downloaded packages between
runners. Snapshots match the image, context, target, platform, Dockerfile contents
and build arguments exactly. Different identities use separate snapshot keys and
local directories. Pin toolchains in Dockerfiles or build arguments to include
them in that identity. Missing snapshots start with empty mounts.

Read-only GHA triggers restore snapshots without extracting or saving them. Exact
hits skip redundant extraction and saving. New snapshots are extracted before
builder teardown and saved after a successful job. Dependency-file changes alone
do not refresh an existing snapshot; installers may download additional packages
again when their layer is invalidated. A restored mount never replaces validation
or authorizes skipping an installer.

## Recovery

Set the existing `cache-type` input to `false` or an empty string to bypass layer
imports, exports and mount persistence and force a cold build. This does not delete
shared caches. For a damaged snapshot, find its exact key in the build logs and
delete only that entry through GitHub's cache management UI or CLI, then rerun.
Keep credentials outside cache mounts. Changes to secret values and elapsed time
alone do not invalidate install layers.

The [decision record](../adr/0004-scope-build-cache-imports-and-mount-snapshots.md)
contains the design, deferred optimizations and dated validation evidence.
