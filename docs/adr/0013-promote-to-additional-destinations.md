# ADR 0013: Promote validated image digests to additional destinations

- Status: Proposed
- Date: 2026-11-26
- Extends: [ADR 0006](0006-promote-validated-image-digests.md)

## Context

HTTP Header Authenticator validates candidates in GHCR and publishes its released
image to Docker Hub before publishing its chart. A separate mirror workflow would
introduce a second publication operation outside the existing promotion lock and
journal. The destination restriction in ADR 0006 protects candidate metadata from
selecting arbitrary publication targets, but prevents this explicit release use.

## Decision

Extend the existing Docker promote images workflow and action with optional
`additional-destinations`, keyed by validated image name. Candidate metadata remains
restricted to its original repository. Callers explicitly authorize any additional
fully qualified tagged destinations in the promotion call.

Every destination joins the same deployment claim and serialized publication.
Existing supersession, cancellation, partial failure and recovery rules apply to
all of them. Tags remain individually visible, with no rollback or atomicity across
registries. All writers must use the same calling repository's promotion journal.

Additional registry hosts require explicit credentials through the
`destination-credentials` secret. Docker setup handles every login using separate
credential maps; the source token is never a fallback for another host. Another
repository on the same host reuses the source login and its permissions.

For cross-repository copies, install pinned regctl and copy the immutable image,
its child manifests, OCI referrers and legacy digest tags. The installed Cosign
version's copy command only copies legacy tags, so it cannot preserve the OCI 1.1
signatures used by our builder. Verify the destination signature and provenance
against the original source repository, revision, builder and run attempt before
writing its consumer tag. Do not rebuild or re-sign the image.

Preserve `built-images` and expose additional immutable references through
`additional-images`. Withhold both outputs unless every destination and the final
journal status succeed. Calls without additional destinations keep their existing
behavior and do not install regctl.

## Consequences

There is one public publication workflow and action to maintain. The extra binary
is needed only for copies, and destination registries must support the copied
manifests and evidence. A failure can leave untagged copied content or some published
tags; the retained claim permits identical same-attempt recovery and blocks older
runs. Registry-specific retention remains the caller's responsibility.

Native tests cover destination validation, credential isolation, overlapping claims
and failure recovery. Existing signed single-platform and multi-platform fixtures
exercise copies and verification without another build matrix. Two local registries
cover cross-host transport and attachment preservation without external credentials.
