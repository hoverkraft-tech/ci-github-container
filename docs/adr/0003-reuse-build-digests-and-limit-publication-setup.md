# Reuse build digests and limit publication setup

Date: 2026-11-11

Status: Proposed

## Context

Single-platform builds already push their tags and return an immutable digest.
Manifest publication currently replaces those references with tags, initializes
Docker and Buildx, and inspects the tags again. Signing uses cosign and attestation
uses actions/attest; both need registry credentials, but neither needs a Docker
daemon. Attestation jobs still initialize one.

## Decision

Validate publication inputs before setup. Reuse the digest of an unambiguous
single-platform source from the expected registry/repository. Reject conflicting
digest metadata. Preserve image keys, metadata and tag ordering in the output.
Keep registry inspection for tag-only inputs, and manifest creation and inspection
for multi-platform inputs, including explicit tag cloning. Never reuse a platform
digest as the digest of an assembled index.

Add an opt-out for Docker installation to the existing setup action. Defaults
retain the build toolchain contract. Registry-only callers disable both Docker
and Buildx setup and use the runner's Docker CLI for login. Authentication and
logout continue through docker/login-action with the existing credential routing.
Multi-platform or tag-inspection batches retain the configured Docker/Buildx setup.

Keep signing and attestation in their existing jobs. Build jobs gain no OIDC or
attestation permissions. Publication needs OIDC for signing; only the attestation
job needs permission to write attestations.

## Alternatives and consequences

Extracting another authentication action would move the same resolver without
improving this change. Removing setup everywhere would depend on the runner's
Buildx version and weaken the multi-platform toolchain contract. Re-inspecting
single-platform tags adds registry requests and can observe a concurrent tag move;
using the build digest preserves the artifact that was actually built.

Registry-only callers require an existing Docker CLI and credential helpers.
They do not require a reachable daemon. Public single-platform inputs without an
immutable source retain their registry-inspection path. Cache behavior and build
ordering are unchanged. Reverting the action pin restores previous behavior.

## Validation requirements

Cover single-platform digest reuse, conflicting metadata, tag-only inputs, mixed
batches, multi-platform index digests, metadata ordering, registry visibility
retries and authentication failures. Exercise registry-only setup with an
unreachable daemon. Run the existing platform, signature and attestation
integration workflows and compare publication/setup timings. Record actual
measurements here after CI, without committing raw logs.

## Validation and timing observations, 2026-11-11

The local publication checks cover digest reuse with and without a separate
digest field, tagged immutable sources, mixed batches, tag-only inspection,
explicit cloning, conflicting digests and malformed inputs. Registry retry
checks retain their bounded backoff and immediate authentication-error failures.
Super-Linter passed, and the action readmes were regenerated with CI Dokumentor.
Existing inputs/outputs, job dependencies and build/attestation permissions were
compared with main; only the documented setup input and publication permission
reduction change those contracts.

The first candidate is
[`c2a3d6f`](https://github.com/hoverkraft-tech/ci-github-container/commit/c2a3d6fb2df1efa668d4e2347b5c41efccb45ddc),
[CI run 42932049090](https://github.com/hoverkraft-tech/ci-github-container/actions/runs/42932049090).
All 167 executed jobs passed; 10 jobs were intentionally skipped. The run verified
single/multi-platform manifests, signed images, mixed-platform attestations and
registry authentication with an unreachable daemon, including invalid credentials.
Compare its platform/signing matrix with the previous passing main run at
[`ec1cd96`](https://github.com/hoverkraft-tech/ci-github-container/commit/ec1cd960fb1a1908ac21680756eb49a4c8f018d5),
[CI run 42894339060](https://github.com/hoverkraft-tech/ci-github-container/actions/runs/42894339060).
The following values are medians with minimum–maximum ranges, in seconds.

| Operation                   | Previous action | Candidate action | Previous job | Candidate job |
| --------------------------- | --------------: | ---------------: | -----------: | ------------: |
| Single-platform publication |    19.5 (17–29) |          1 (1–1) | 34.5 (31–54) |   12.5 (8–16) |
| Multi-platform publication  |      23 (23–23) |     23.5 (19–25) |   44 (39–49) |    40 (38–48) |
| Attestation registry setup  |    12.5 (12–13) |          1 (1–2) | 27.5 (27–32) |  13.5 (12–16) |

Each publication row contains the four sign/attest combinations from one run.
The attestation row contains the four enabled attestation jobs. These are
different scenarios within a run, not repeated controlled workflow samples.
Action duration excludes its post step; whole-job duration includes setup,
signing/attestation and cleanup, but excludes runner queue time. Median publication
cleanup fell from 6 to 0 seconds for single-platform jobs and stayed at 6 seconds
for multi-platform jobs. Attestation setup cleanup fell from 5 to 0 seconds.
API timestamps have one-second resolution; zero does not mean no work.

The inspected single-platform logs used runner 2.338.2 and Ubuntu 26.04 image
20261101.186.1 in different Azure regions. The baseline is a main event and the
candidate is a PR event, with different tags and build identities. The mixed
attestation scenario also adds a platform build, so whole-run totals are not
comparable. These observations support removing setup overhead; they do not
establish a controlled end-to-end improvement for Pleey. Action downloads still
occur even when runtime setup is skipped.

The final revision adds rejection of malformed tags to the measured candidate.
Its local contract and lint checks passed separately. No build, cache or
publication operation was added for valid inputs. Downstream adoption and its
full-workflow comparison follow upstream review and release.

## References

- [Pleey CI optimization plan, P2.3](https://github.com/cloud-native-aixmarseille/pleey/blob/ci/475-p1-local-reductions/docs/technical/plans/0023-optimize-ci-execution-and-caching.md#p23-remove-redundant-publicationsecurity-setup)
- [Docker registry credentials](https://docs.docker.com/reference/cli/docker/login/)
- [Cosign container signing](https://docs.sigstore.dev/cosign/signing/signing_with_containers/)
- [GitHub artifact attestations](https://github.com/actions/attest)
