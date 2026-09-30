# ADR 0001: Sign OCI Helm Charts With Keyless Cosign

- Status: Accepted
- Date: 2026-09-30
- Deciders: Maintainers of this repository
- Implemented in: [actions/helm/release-chart/action.yml](../../actions/helm/release-chart/action.yml) and [.github/workflows/\_\_test-action-helm-release-chart.yml](../../.github/workflows/__test-action-helm-release-chart.yml)

## Context

This repository publishes Helm charts as OCI artifacts and already exposes an optional signing flow in the release action.

The signing strategy needs to satisfy these constraints:

- Work with OCI-native Helm chart publication.
- Avoid long-lived private signing keys in GitHub secrets.
- Bind signatures to immutable artifacts instead of mutable tags.
- Fit GitHub Actions and reusable workflows.
- Reuse the same trust model already used for OCI images in this repository.
- Keep verification explicit for downstream consumers.

There are two adjacent but distinct signing models in the Helm ecosystem:

- Helm provenance uses `helm package --sign`, `.prov` files, and `helm verify`.
- OCI artifact signing uses registry-attached signatures over the pushed artifact digest.

Those models solve related problems, but they are not the same workflow. Helm's native verification path is provenance-file based, while Cosign signs and verifies OCI artifacts directly.

## Decision

This repository should standardize on keyless Sigstore Cosign signing for OCI Helm charts.

The signing flow is:

1. Package and push the chart with Helm.
2. Capture the exact OCI chart reference and manifest digest returned by the push.
3. When signing is enabled, sign the immutable `image@digest` reference with Cosign using GitHub Actions OIDC.
4. Publish the digest-based reference as the primary output for downstream verification and installation.
5. Verify signatures with `cosign verify` constrained to the expected GitHub Actions identity and OIDC issuer.

`helm verify` and PGP `.prov` files are not the primary trust mechanism for OCI chart releases in this repository.

## Rationale

### Why this is the default

- It matches how OCI registries distribute Helm charts.
- It signs the immutable manifest digest instead of trusting a mutable tag.
- It removes the need to manage long-lived private keys.
- It uses workload identity from GitHub Actions, which is a better operational fit for CI-driven releases.
- It aligns chart signing with the repository's existing container image signing model.
- It lets consumers verify both artifact integrity and publisher identity from the Sigstore certificate.

### Why Helm provenance is not the primary mechanism

- Helm's built-in verification path is centered on provenance files, not OCI-native registry signatures.
- PGP key lifecycle management is operationally heavier than keyless OIDC signing.
- Using a separate signing model for charts and images would fragment verification guidance in this repository.

### Why immutable digest outputs matter

- Tag references can be moved or republished.
- The digest returned by `helm push` is the exact object that was stored.
- Signing and installing the same digest closes the gap between publication, verification, and consumption.

## Consequences

### Positive

- No long-lived signing key secrets are required.
- Consumers can verify publisher identity against a specific workflow, repository, and issuer.
- The same supply-chain pattern can be reused across images and charts.
- The release action can expose stable `digest` and `image-digest` outputs for downstream jobs.

### Trade-offs

- Consumers must use Cosign for verification instead of Helm's `--verify` flag.
- Signing metadata is public in Sigstore transparency services even when the chart itself is private.
- The workflow must grant `id-token: write` when signing is enabled.
- Registry support for OCI 1.1 referrers is not universal yet; some registries may still require Cosign fallback attachment behavior.

## Rejected Alternatives

### 1. Do not sign OCI charts

Rejected because it does not provide artifact authenticity or publisher identity.

### 2. Use Helm provenance only

Rejected as the primary mechanism because it is not the OCI-native verification path and requires managing PGP keys.

### 3. Use Cosign with a static key pair stored in secrets

Rejected as the default because it introduces long-lived secret management and rotation overhead without a clear advantage over GitHub OIDC for CI-driven releases.

### 4. Require dual signing for every release

Rejected for now because it increases maintenance cost and user guidance complexity.

Dual signing can be reconsidered if a concrete consumer requirement emerges for Helm-native provenance verification.

### 5. Standardize on `appany/helm-oci-chart-releaser`

Rejected because it is centered on GPG and Helm provenance rather than keyless OCI digest signing, and depending on a third-party action with unclear maintenance status would add avoidable supply-chain and support risk.

## Verification Guidance

Downstream consumers should verify the immutable digest reference, then install that same digest.

Example:

```sh
chart_ref='ghcr.io/your-org/your-repo/charts/application/your-repo@sha256:<digest>'

cosign verify "$chart_ref" \
  --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' \
  --certificate-identity 'https://github.com/your-org/your-repo/.github/workflows/release-chart.yml@refs/heads/main' \
  --certificate-github-workflow-repository 'your-org/your-repo'

helm pull "oci://$chart_ref"
helm install application "oci://$chart_ref"
```

For reusable workflows, verification must trust the called workflow identity and also constrain the expected caller repository when appropriate.

## Follow-up

- Keep the release action documentation centered on Cosign verification and digest-based installation.
- Only add Helm provenance generation if downstream users explicitly need `helm verify` compatibility.
- Prefer registry capabilities that support OCI 1.1 referrers as they become broadly available.
