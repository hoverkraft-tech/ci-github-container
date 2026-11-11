# Isolate build-cache mount snapshots

Date: 2026-11-11

Status: Proposed

## Context

Mount snapshots use the Dockerfile hash and image/platform/target, but their
fallback drops the image/platform/target identity. The shared local snapshot
directory also lets separate builds in one job use the same files. GHA layer
exports respect read-only triggers, while mount snapshots still register a save.

Pleey's historical unchanged-input compilation misses remain unexplained. Its
latest five baseline/candidate pairs retained dependency and compilation layers.
Layer caches and download mounts are separate mechanisms; these internal fixes
do not establish the cause of those misses or an application speedup.

## Decision

Keep the public build action and reusable workflow inputs unchanged. Use an exact,
versioned mount key containing image, context, target, platform, Dockerfile
contents and build arguments. Remove the broad fallback entirely. Give each
identity its own snapshot directory under the runner's temporary directory.
Pin toolchains in Dockerfiles or build arguments so they affect this identity.

Use restore-only cache access when the existing GHA event policy disables writes.
Skip extraction for read-only builds and exact hits. Preserve extraction before
builder teardown, successful-job-only snapshot saves and the existing cache
bypass. Keep inferred layer imports/export destinations and their `max` mode.
No caller needs to construct cache scopes or maintain additional configuration.

## Consequences and deferred work

Old snapshots start cold once because their keys cannot establish the new identity.
Missing or bypassed caches remain valid build inputs. Dependency installers still
execute whenever BuildKit invalidates their layer. A dependency-only change does
not refresh an existing immutable download snapshot; automatic refresh remains
unresolved and is explicitly outside this PR. This preserves existing freshness
behavior without adding lockfile configuration or package-manager detection.

Cross-image imports also remain deferred. A future design should hide branch,
registry and platform bookkeeping, exposing at most the source image relationship.
Do not add an automatic Dockerfile parser or change exporter scopes without a
concrete need. Export-mode tuning has no demonstrated benefit in the fixture.
Rollback uses the released pin or the existing cache bypass.

## Review revision, 2026-11-11

The first proposal exposed `cache-from`, `cache-mode` and `cache-mount-key-files`,
with workflow defaults and per-image overrides. Review rejected the caller burden
of raw BuildKit scopes and dependency patterns. The revised scope removes all
three inputs and their implementation/tests. The earlier measurements below are
historical evidence for that proposal, not validation of the revised implementation.
They do not justify retaining the extra public API.

## Validation requirements

Check stable exact keys, isolation across image/context/target/platform/Dockerfile/
build-argument changes, separate local paths, read-only event policy and bypass.
Use independent hosted runners to verify cold snapshot saving, mount restoration
when an install layer changes, isolation and failed-build propagation. Confirm
saving precedes builder teardown and exact hits skip extraction. Retain existing
registry/GHA and single/multi-platform tests. Regenerate metadata documentation
through CI Dokumentor. Record the revised candidate's actual results separately.

## Revised scope: local validation, 2026-11-11

The actual configuration scripts passed local identity and cache-policy contracts.
Stable builds retained their exact key; changed image, context, target, platform,
Dockerfile or build arguments changed both key and local directory. Controlled
read-only event contexts retained imports and disabled exports; bypass removed
both. This does not claim live read-only-trigger permission testing.

The public action inputs/outputs and complete reusable workflow match release
0.41.0. Repository lint/security checks and changed Markdown file links passed.
CI Dokumentor regenerated all three affected action/workflow readmes. Independent
hosted lifecycle validation remains required for this revised candidate.

## Earlier proposal: local validation, 2026-11-11

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

## Earlier proposal: hosted validation, 2026-11-11

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
