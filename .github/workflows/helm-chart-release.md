<!-- header:start -->

# GitHub Reusable Workflow: Helm chart release

<div align="center">
  <img src="../logo.svg" width="60px" align="center" alt="Helm chart release" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Validate and publish the same prepared Helm chart archive.

This workflow reuses Helm chart CI, then passes its immutable artifact ID
to the release action in a separate publication job. The original checksum is checked before registry
login; no source checkout, packaging or dependency rebuild occurs in publication.
Validation uses read permissions and separate read-only image credentials.
Only publication receives packages write and OIDC. A failed/skipped/cancelled
validator blocks publication. Environment protection, when configured, applies
to the publication job. Do not call this workflow from untrusted PR triggers.

Grant contents read, packages write and id-token write at the calling job.
Use a trusted immutable source ref, final name/tag/values and declared dependency
repositories. See Helm chart CI for validation and candidate-image configuration.
Pin this workflow to a reviewed release SHA.

A publication-only rerun downloads the producer's exact artifact from the same
run; a full rerun prepares a new artifact ID. Deleted/expired artifacts fail.
Publication retries reuse the same archive; the immutable OCI digest comes from
the push result. A partial push/sign failure returns no successful outputs and
may leave content in the registry. Rerun to complete signing; no content is deleted.
Use non-cancelling concurrency for release callers. Cancellation cannot revoke
an in-flight registry request. Do not republish different content under one version.
See [ADR 0009](../../docs/adr/0009-compose-helm-validation-and-release-workflows.md).

### Permissions

- **`contents`**: `read`
- **`id-token`**: `write`
- **`packages`**: `write`

<!-- overview:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**                        | **Description**                                                                             | **Required** | **Type**    | **Default**            |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ------------ | ----------- | ---------------------- |
| **`path`**                       | Repository-relative path to one root chart containing Chart.yaml.                           | **true**     | **string**  | -                      |
| **`ref`**                        | Git ref to validate; defaults to the caller's current ref.                                  | **false**    | **string**  | -                      |
| **`name`**                       | Final root chart name; empty keeps Chart.yaml metadata.                                     | **false**    | **string**  | -                      |
| **`tag`**                        | Final chart version; empty keeps existing metadata.                                         | **false**    | **string**  | -                      |
| **`update-tag-paths`**           | Comma-separated local Chart.yaml paths updated with tag.                                    | **false**    | **string**  | `.version,.appVersion` |
| **`values`**                     | Published values in prepare-chart's JSON format; never include test credentials.            | **false**    | **string**  | -                      |
| **`helm-repositories`**          | Dependency repositories, one name and URL per line; existing locks remain required.         | **false**    | **string**  | -                      |
| **`working-directory`**          | Repository-relative directory for chart-testing configuration and validation files.         | **false**    | **string**  | `.`                    |
| **`config`**                     | Chart-testing configuration relative to working-directory; defaults to its ct.yaml.         | **false**    | **string**  | -                      |
| **`values-files`**               | Ordered validation-only values files, one per line, relative to working-directory.          | **false**    | **string**  | -                      |
| **`namespace`**                  | Optional test namespace; otherwise a unique namespace is created.                           | **false**    | **string**  | -                      |
| **`helm-set`**                   | Installation-only key=value overrides, one per line; map candidate images by digest here.   | **false**    | **string**  | -                      |
| **`images`**                     | Optional built-images JSON metadata for images mapped into the chart by helm-set.           | **false**    | **string**  | -                      |
| **`test-oci-registry`**          | Registry from which tests pull private images.                                              | **false**    | **string**  | `ghcr.io`              |
| **`test-oci-registry-username`** | Image registry username; defaults to the calling repository owner.                          | **false**    | **string**  | -                      |
| **`runs-on`**                    | JSON array of Linux runner labels; Docker is required for kind.                             | **false**    | **string**  | `["ubuntu-latest"]`    |
| **`timeout-minutes`**            | Maximum validation job duration, including setup and cluster tests.                         | **false**    | **number**  | `30`                   |
| **`oci-registry`**               | Registry receiving the validated chart and its signature.                                   | **false**    | **string**  | `ghcr.io`              |
| **`oci-registry-username`**      | Publication username; defaults to the calling repository owner.                             | **false**    | **string**  | -                      |
| **`oci-repository`**             | Publication namespace; defaults to owner/repository/charts, excluding the final chart name. | **false**    | **string**  | -                      |
| **`sign`**                       | Sign the published digest with GitHub OIDC and Cosign.                                      | **false**    | **boolean** | `true`                 |
| **`environment`**                | Optional GitHub environment protecting publication and supplying its secrets.               | **false**    | **string**  | -                      |

<!-- inputs:end -->
<!-- secrets:start -->

## Secrets

| **Secret**                       | **Description**                                                                         | **Required** |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------ |
| **`test-oci-registry-password`** | Read-only image pull credential for validation; defaults to its read-only GITHUB_TOKEN. | **false**    |
| **`oci-registry-password`**      | Chart publication credential; defaults to the publication job's GITHUB_TOKEN.           | **false**    |

<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**         | **Description**                                                                         |
| ------------------ | --------------------------------------------------------------------------------------- |
| **`image`**        | Published chart tag reference, available only after successful publication and signing. |
| **`digest`**       | Published OCI manifest digest, distinct from the archive checksum.                      |
| **`image-digest`** | Immutable published chart reference.                                                    |
| **`checksum`**     | SHA-256 of the unchanged validated and published chart archive.                         |

<!-- outputs:end -->
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
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
<!-- usage:start -->

## Usage

```yaml
name: Helm chart release
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  helm-chart-release:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/helm-chart-release.yml@988ccc2b85dec5822e801d7bc0622cad7cc94870 # 4.1.0
    permissions:
      contents: read
      id-token: write
      packages: write
    secrets:
      # Read-only image pull credential for validation; defaults to its read-only GITHUB_TOKEN.
      test-oci-registry-password: ""

      # Chart publication credential; defaults to the publication job's GITHUB_TOKEN.
      oci-registry-password: ""
    with:
      # Repository-relative path to one root chart containing Chart.yaml.
      # This input is required.
      path: ""

      # Git ref to validate; defaults to the caller's current ref.
      ref: ""

      # Final root chart name; empty keeps Chart.yaml metadata.
      name: ""

      # Final chart version; empty keeps existing metadata.
      tag: ""

      # Comma-separated local Chart.yaml paths updated with tag.
      # Default: `.version,.appVersion`
      update-tag-paths: .version,.appVersion

      # Published values in prepare-chart's JSON format; never include test credentials.
      values: ""

      # Dependency repositories, one name and URL per line; existing locks remain required.
      helm-repositories: ""

      # Repository-relative directory for chart-testing configuration and validation files.
      # Default: `.`
      working-directory: .

      # Chart-testing configuration relative to working-directory; defaults to its ct.yaml.
      config: ""

      # Ordered validation-only values files, one per line, relative to working-directory.
      values-files: ""

      # Optional test namespace; otherwise a unique namespace is created.
      namespace: ""

      # Installation-only key=value overrides, one per line; map candidate images by digest here.
      helm-set: ""

      # Optional built-images JSON metadata for images mapped into the chart by helm-set.
      images: ""

      # Registry from which tests pull private images.
      # Default: `ghcr.io`
      test-oci-registry: ghcr.io

      # Image registry username; defaults to the calling repository owner.
      test-oci-registry-username: ""

      # JSON array of Linux runner labels; Docker is required for kind.
      # Default: `["ubuntu-latest"]`
      runs-on: '["ubuntu-latest"]'

      # Maximum validation job duration, including setup and cluster tests.
      # Default: `30`
      timeout-minutes: 30

      # Registry receiving the validated chart and its signature.
      # Default: `ghcr.io`
      oci-registry: ghcr.io

      # Publication username; defaults to the calling repository owner.
      oci-registry-username: ""

      # Publication namespace; defaults to owner/repository/charts, excluding the final chart name.
      oci-repository: ""

      # Sign the published digest with GitHub OIDC and Cosign.
      # Default: `true`
      sign: true

      # Optional GitHub environment protecting publication and supplying its secrets.
      environment: ""
```

<!-- usage:end -->
