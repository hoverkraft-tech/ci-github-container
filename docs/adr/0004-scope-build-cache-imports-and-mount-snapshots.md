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

## Local validation, 2026-11-11

Input and identity contracts passed locally, including per-image overrides,
duplicate imports, both export modes, invalid inputs, changed dependency hashes,
different image/target/platform/toolchain/Dockerfile identities, read-only GHA
events and bypass. Repository lint/security checks and documentation links passed.
The three changed action/workflow readmes were regenerated with CI Dokumentor.

Five pairs used independent BuildKit containers for each producer, production
import and subsequent production-only warm build. Alternate `min`/`max` execution
order between pairs. Every production result retained its producer's unique
install marker, including all ten warm imports from the production-only cache.
Cold bypass succeeded with no restored mount data; the deliberate missing-download
fixture failed as expected. No final-series sample was replaced.

The final fixture's Dockerfile SHA-256 was
`26116ffeec3c6eadef89b89430b3c860597d70b96129ec1e4004af9a101771ee`.
Docker 29.9.3, Buildx 0.38.1 and BuildKit 0.34.2 remained fixed. Build invocations
include local cache import/build/export and filesystem result export; builder
bootstrap/teardown is excluded. Values are medians with minimum–maximum ranges.

| Measurement                        | `min`                           | `max`                           |
| ---------------------------------- | ------------------------------- | ------------------------------- |
| Production importing CI cache      | 1.830s (1.774–1.893s)           | 1.906s (1.830–3.275s)           |
| Production importing its own cache | 1.591s (1.545–2.415s)           | 1.634s (1.613–1.872s)           |
| Exported cache bytes               | 3,857,213 (3,857,193–3,857,215) | 3,857,213 (3,857,192–3,857,215) |

Both modes exported four layers and six cache records for this fixture. The
timings overlap, and the cache-size difference is negligible. Retain `max`;
these local filesystem exports do not establish GHA transfer, quota/eviction or
Pleey application performance. An earlier smoke series used the fixture before
its final USER/HEALTHCHECK metadata; it also passed but is excluded above. Raw
archives/logs stay outside the repository. Hosted GHA mount lifecycle and existing
integration suites are validated separately in
[PR #957](https://github.com/hoverkraft-tech/ci-github-container/pull/957).

## Hosted validation, 2026-11-11

Candidate `ccda7aa3ac62f02b00f083d951ef2bff601b2c27` passed
[CI run 43018820554](https://github.com/hoverkraft-tech/ci-github-container/actions/runs/43018820554):
174 successful jobs and 10 intentional skips. Existing registry/GHA,
single/multi-platform, signing, attestation and chart tests remain enabled.
All six new lifecycle jobs and the input/identity contract job passed.

The seed started without a mount snapshot and saved its download marker. Both
production export modes then imported the CI scope on independent runners and
retained the seed's unique install marker. A changed dependency file restored the
seed's previous snapshot using the invariant prefix, executed the invalidated
install and saved a new exact key. The next runner restored that new exact key,
skipped extraction and duplicate snapshot saving, and retained the refreshed
install marker. Seed and refresh logs place snapshot saving before builder
removal. Bypass registered no mount-cache restore/save and invoked both the
successful and deliberate failing builds with `--no-cache`; the latter returned
failure with no image output.

Read-only event policy and malformed-input behavior were exercised by executing
the actual configuration scripts with controlled contexts. This does not claim a
live issue-comment/PR-target cache-permission test. The fixture models download
persistence; application installers and GHA transfer/eviction measurements remain
part of consumer adoption. No historical compilation-miss fix or application
speedup is established by this upstream validation.

## References

- [Pleey P2.4 plan](https://github.com/cloud-native-aixmarseille/pleey/blob/ci/475-p1-local-reductions/docs/technical/plans/0023-optimize-ci-execution-and-caching.md#p24-improve-cache-reuse-and-invalidation)
- [BuildKit cache backends](https://docs.docker.com/build/cache/backends/)
- [GHA cache scope and access](https://docs.docker.com/build/cache/backends/gha/)
- [Cache mounts in GitHub Actions](https://docs.docker.com/build/ci/github-actions/cache/#cache-mounts)
