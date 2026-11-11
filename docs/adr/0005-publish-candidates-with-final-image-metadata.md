# ADR 0005: Publish candidates with final image metadata

Status: Proposed

Date: 2026-11-12

## Context

Pleey's next CI optimization overlaps production builds with application checks.
Those builds must not move branch, PR, release or `latest` tags before validation.
The existing `tag` override suppresses default tags, but also determines the OCI
version in labels and annotations. Using a temporary tag there would embed the
wrong version in the image that a later promotion must preserve byte for byte.

Callers should not generate temporary identities or duplicate the workflow's tag
policy. Separate publication from promotion in two reviewable increments. This
record covers candidate publication only; Pleey retains its gated production
ordering until promotion has its own validated contract.

## Decision

Add an opt-in `candidate: true` input to the build workflow and its build/metadata
actions. The default retains normal publication. Existing image settings,
including `images[].tag`, describe the intended final metadata and destinations.
Run Docker metadata generation normally, then replace only the publication tags.
Labels and annotations retain the intended version, revision and source.

Temporary tags contain the calling repository ID, run ID, attempt and a random
UUID. This isolates reruns and repeated invocations without another caller input.
Each platform build generates an identity; a multi-platform build publishes one
candidate tag with the assembled index through the existing manifest action.
Intermediate platform digests remain untagged as they are today. Consumers use
the returned digest-qualified references, never reconstruct a temporary tag.

The existing `built-images` output keeps its shape. Candidate entries additionally
carry `candidate.destinations` (the normal full tagged references),
`candidate.source` (calling repository and metadata revision), and `candidate.run`
(run ID and attempt as strings). The existing digest identifies the built image
or assembled index. This data describes a build; it is not proof that validation
passed or permission to promote it. Signing and attestation settings retain their
existing behavior and permissions.

This refines Pleey ADR 0023's proposal to supply temporary tags through
`images[].tag`: that field keeps its final-version meaning, while the opt-in mode
owns temporary naming. No raw metadata or destination configuration is added.

## Consequences and boundaries

- Candidate mode performs registry writes, including configured signatures and
  attestations. It changes no normal image tags. It is not a local-only build.
- The random suffix avoids collisions across independent calls in the same run.
  Reruns create new candidates; old outputs remain tied to their original attempt.
- Images retain final OCI metadata, so later same-repository digest promotion can
  avoid rebuilding or rewriting manifests. This increment does not implement it.
- No automatic candidate deletion is added. Deleting a registry version by digest
  could delete subsequently promoted content and its evidence. Retention needs a
  registry-specific policy that preserves referenced content.
- The promotion increment must bind successful validation to these digests,
  authorize destinations, reject stale/superseded runs, serialize conflicting
  writers, preserve signatures/provenance and define partial-write recovery.
  Workflow concurrency alone does not establish atomic multi-tag publication.
- Pleey must not relax production dependencies or adopt candidate mode before
  that promotion contract and its validation gate are reviewed and tested.

## Validation

Required checks: unchanged default metadata; candidate PR/default-branch/release
destinations; forced final tags; isolated run/attempt/call identities; malformed
identity rejection; single- and multi-platform publication using the existing
test Dockerfile; preserved OCI version and digest outputs; absent final tags;
signatures and provenance; failed build without a successful candidate output.
Validation results will be recorded with the implementation PR.

## References

- [Pleey optimization plan](https://github.com/cloud-native-aixmarseille/pleey/blob/ci/475-p1-local-reductions/docs/technical/plans/0023-optimize-ci-execution-and-caching.md#p25-candidate-publication-and-exact-digest-promotion)
- [Docker metadata tag priority and image version](https://github.com/docker/metadata-action#priority-attribute)
- [GitHub run and attempt variables](https://docs.github.com/en/actions/reference/workflows-and-actions/variables)
