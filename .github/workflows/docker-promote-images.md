<!-- header:start -->

# GitHub Reusable Workflow: Docker promote images

<div align="center">
  <img src="../logo.svg" width="60px" align="center" alt="Docker promote images" />
</div>

---

<!-- header:end -->
<!-- overview:start -->

## Overview

Promote candidate digests after successful validation, without rebuilding images.

## Validation contract

Pass `job-results: ${{ toJSON(needs) }}` and list every required check and candidate
producer in the calling job's `needs`. Producers return `built-images`; validation
jobs return `validated-images` containing exactly the entries they tested by digest.
All dependency results must be `success`. Missing, conflicting or stale evidence
fails promotion. Callers own the required check inventory and must not replace
actual `needs` results with manually constructed success values.

```yaml
validate:
  needs: candidates
  runs-on: ubuntu-latest
  outputs:
    validated-images: ${{ needs.candidates.outputs.built-images }}
  steps:
    - name: Test candidate images by digest
      env:
        IMAGES: ${{ needs.candidates.outputs.built-images }}
      run: ./test-candidate-images "$IMAGES"
promote:
  if: always()
  needs: [candidates, validate, lint]
  uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-promote-images.yml@main
  permissions:
    actions: read
    attestations: read
    contents: read
    deployments: write
    packages: write
    pull-requests: read
  with:
    job-results: ${{ toJSON(needs) }}
  secrets:
    oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
```

Pin the reusable workflow to a reviewed release SHA. The example assumes a
`candidate: true` build and an existing application-specific validation script.
Signatures and provenance from Docker build images are required. Promotion checks
the candidate tag/digest, exact manifest bytes, source ref and current run/attempt.
Only same-repository tag updates within the configured registry/prefix are allowed.

The trusted builder is the reusable workflow that built the images, not the
calling application repository. Calls from other organizations use the default
unchanged when building with the published Docker build images workflow. For a
fork, set `build-workflow: my-org/ci-github-container/.github/workflows/docker-build-images.yml`.
This one input selects both the signature identity and provenance signer. The
builder must preserve the candidate metadata and current-run provenance contract.

## Publication and recovery

The workflow serializes promotions per calling repository and records validated
claims through GitHub deployments in `ci-image-promotion`. No app credentials or
external database are required. All writers of the destinations must use this
workflow. Retain these journal records while destinations may be reused; deleting
them removes supersession protection. A newer claim blocks older runs even when
its publication fails or is interrupted.

Tags become visible individually. A partial failure returns no successful output
and preserves the claim; it does not roll back published tags. Identical calls in
one attempt are idempotent. A rerun must rebuild and revalidate candidates in the
new attempt; rerunning only promotion with old outputs fails. Cancellation checks
cannot revoke a registry request already in flight.

No candidate, digest, signature or attestation is deleted. Use registry-specific
retention that preserves consumer-tagged content. See [ADR 0006](../../docs/adr/0006-promote-validated-image-digests.md).

### Permissions

- **`actions`**: `read`
- **`attestations`**: `read`
- **`contents`**: `read`
- **`deployments`**: `write`
- **`packages`**: `write`
- **`pull-requests`**: `read`

<!-- overview:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**                   | **Description**                                                                                                                                             | **Required** | **Type**   | **Default**                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------- | ------------------------------------------------------------------------------- |
| **`job-results`**           | Direct dependency results from toJSON(needs), including candidate and validation outputs.                                                                   | **true**     | **string** | -                                                                               |
| **`build-workflow`**        | Trusted builder as owner/repository/.github/workflows/file.yml, without a ref. Used for both signatures and provenance; override when building with a fork. | **false**    | **string** | `hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml` |
| **`oci-registry`**          | Authorized publication registry hostname.                                                                                                                   | **false**    | **string** | `ghcr.io`                                                                       |
| **`repository`**            | Authorized image repository prefix; defaults to the calling repository.                                                                                     | **false**    | **string** | -                                                                               |
| **`oci-registry-username`** | Registry username; defaults to the calling repository owner.                                                                                                | **false**    | **string** | -                                                                               |
| **`runs-on`**               | JSON array of runner labels. Requires Docker and GitHub CLI.                                                                                                | **false**    | **string** | `["ubuntu-latest"]`                                                             |

<!-- inputs:end -->
<!-- outputs:start -->

## Outputs

| **Output**         | **Description**                                                                     |
| ------------------ | ----------------------------------------------------------------------------------- |
| **`built-images`** | Image metadata with verified consumer tags and unchanged digests; empty on failure. |

<!-- outputs:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
