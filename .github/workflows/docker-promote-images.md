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

The trusted builder defaults to `docker-build-images.yml` in the promotion action's
repository, resolved through `github.action_repository`. Forks therefore use their
own build workflow automatically. When the builder lives in another repository,
set `build-workflow: my-org/builders/.github/workflows/docker-build-images.yml`.
The resolved value selects both the signature identity and provenance signer.
The builder must preserve the candidate metadata and current-run provenance contract.

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

| **Input**                   | **Description**                                                                                                                                                                                                                              | **Required** | **Type**   | **Default**         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------- | ------------------- |
| **`job-results`**           | Direct dependency results from toJSON(needs), including candidate and validation outputs.                                                                                                                                                    | **true**     | **string** | -                   |
| **`build-workflow`**        | Trusted builder as owner/repository/.github/workflows/file.yml, without a ref. Defaults to docker-build-images.yml in the promotion action's repository. Used for both signatures and provenance; override when the builder lives elsewhere. | **false**    | **string** | -                   |
| **`oci-registry`**          | Authorized publication registry hostname.                                                                                                                                                                                                    | **false**    | **string** | `ghcr.io`           |
| **`repository`**            | Authorized image repository prefix; defaults to the calling repository.                                                                                                                                                                      | **false**    | **string** | -                   |
| **`oci-registry-username`** | Registry username; defaults to the calling repository owner.                                                                                                                                                                                 | **false**    | **string** | -                   |
| **`runs-on`**               | JSON array of runner labels. Requires Docker and GitHub CLI.                                                                                                                                                                                 | **false**    | **string** | `["ubuntu-latest"]` |

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
<!-- badges:start -->

[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- usage:start -->

## Usage

```yaml
name: Docker promote images
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  docker-promote-images:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-promote-images.yml@ca71afa42c37bdd67ec2ca685fd2ff73d76190e8 # 0.42.0
    permissions:
      actions: read
      attestations: read
      contents: read
      deployments: write
      packages: write
      pull-requests: read
    secrets:
      # Registry password or token with write access to the authorized image repositories.
      # This input is required.
      oci-registry-password: ""
    with:
      # Direct dependency results from toJSON(needs), including candidate and validation outputs.
      # This input is required.
      job-results: ""

      # Trusted builder as owner/repository/.github/workflows/file.yml, without a ref. Defaults to docker-build-images.yml in the promotion action's repository. Used for both signatures and provenance; override when the builder lives elsewhere.
      build-workflow: ""

      # Authorized publication registry hostname.
      # Default: `ghcr.io`
      oci-registry: ghcr.io

      # Authorized image repository prefix; defaults to the calling repository.
      repository: ""

      # Registry username; defaults to the calling repository owner.
      oci-registry-username: ""

      # JSON array of runner labels. Requires Docker and GitHub CLI.
      # Default: `["ubuntu-latest"]`
      runs-on: '["ubuntu-latest"]'
```

<!-- usage:end -->
<!-- secrets:start -->

## Secrets

| **Secret**                  | **Description**                                                                    | **Required** |
| --------------------------- | ---------------------------------------------------------------------------------- | ------------ |
| **`oci-registry-password`** | Registry password or token with write access to the authorized image repositories. | **true**     |

<!-- secrets:end -->
<!-- examples:start -->
<!-- examples:end -->
<!-- contributing:start -->

## Contributing

Contributions are welcome! Please see the [contributing guidelines](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md) for more details.

<!-- contributing:end -->
<!-- security:start -->
<!-- security:end -->
<!-- license:start -->

## License

This project is licensed under the MIT License.

SPDX-License-Identifier: MIT

Copyright © 2026 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
