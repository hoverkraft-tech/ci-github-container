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

## References

- [Pleey CI optimization plan, P2.3](https://github.com/cloud-native-aixmarseille/pleey/blob/ci/475-p1-local-reductions/docs/technical/plans/0023-optimize-ci-execution-and-caching.md#p23-remove-redundant-publicationsecurity-setup)
- [Docker registry credentials](https://docs.docker.com/reference/cli/docker/login/)
- [Cosign container signing](https://docs.sigstore.dev/cosign/signing/signing_with_containers/)
- [GitHub artifact attestations](https://github.com/actions/attest)
