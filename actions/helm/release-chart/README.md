<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItdXBsb2FkLWNsb3VkIiBjb2xvcj0iYmx1ZSI+PHBvbHlsaW5lIHBvaW50cz0iMTYgMTYgMTIgMTIgOCAxNiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMjEiPjwvbGluZT48cGF0aCBkPSJNMjAuMzkgMTguMzlBNSA1IDAgMCAwIDE4IDloLTEuMjZBOCA4IDAgMSAwIDMgMTYuMyI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE2IDE2IDEyIDEyIDggMTYiPjwvcG9seWxpbmU+PC9zdmc+) GitHub Action: Release Helm Chart

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Release Helm Chart" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-release--helm--chart-blue?logo=github-actions)](https://github.com/marketplace/actions/release-helm-chart)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Publish one prepared Helm chart archive to an OCI registry.
Supply either a local archive or an immutable artifact-id and archive-name from
this workflow run, plus the archive's expected SHA-256 checksum. Lint and test
those same bytes before calling this action. Artifact input downloads only that
ID, fails on artifact digest mismatch, and verifies the archive checksum before
registry access. The caller retains local archives; downloaded archives,
temporary publication files and credentials are removed on success or failure.
Gate publication on successful validation. Publication-only retries reuse its
artifact ID and checksum; missing or expired artifacts require validation again.
Signs the published chart digest with Cosign and GitHub Actions OIDC by default.
Set `sign` to `false` to opt out and still consume the immutable digest output.
Does not check out source, mutate values/metadata, rebuild dependencies or package.
Push retries reuse a verified snapshot of the supplied archive. Ensures Helm is available.

<!-- overview:end -->
<!-- inputs:start -->

## Inputs

| **Input**                   | **Description**                                                                                                                                       | **Required** | **Default**                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------- |
| **`oci-registry`**          | OCI registry where to push chart.                                                                                                                     | **true**     | `ghcr.io`                         |
| **`oci-registry-username`** | OCI registry username.                                                                                                                                | **true**     | `${{ github.repository_owner }}`  |
| **`oci-registry-password`** | OCI registry password.                                                                                                                                | **true**     | `${{ github.token }}`             |
| **`oci-repository`**        | OCI namespace without the registry or final chart name.                                                                                               | **false**    | `${{ github.repository }}/charts` |
|                             | Defaults to {owner}/{repository}/charts. The archive supplies its chart name/version.                                                                 |              |                                   |
|                             | Set this explicitly to preserve a different publication namespace.                                                                                    |              |                                   |
| **`archive`**               | Path to the prepared .tgz archive. Relative paths use the current working directory. Mutually exclusive with artifact-id and archive-name.            | **false**    | -                                 |
| **`artifact-id`**           | One immutable artifact ID from this workflow run, such as helm-chart-ci's artifact-id output. Requires archive-name; mutually exclusive with archive. | **false**    | -                                 |
| **`archive-name`**          | Prepared .tgz basename inside the artifact, such as helm-chart-ci's archive-name output. Required only with artifact-id.                              | **false**    | -                                 |
| **`checksum`**              | Expected SHA-256 of the archive bytes, as 64 lowercase hexadecimal characters.                                                                        | **true**     | -                                 |
| **`sign`**                  | Sign the published OCI chart using Cosign and GitHub Actions OIDC.                                                                                    | **false**    | `true`                            |
|                             | Enabled by default. Set to `false` to opt out.                                                                                                        |              |                                   |
|                             | Requires `id-token: write` and write access to the OCI registry.                                                                                      |              |                                   |
|                             | Does not generate a Helm PGP provenance (.prov) file.                                                                                                 |              |                                   |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**         | **Description**                                                                   |
| ------------------ | --------------------------------------------------------------------------------- |
| **`image`**        | Chart image (Format: `{registry}/{repository}/{image}:{tag}`).                    |
| **`digest`**       | Published chart OCI manifest digest (Format: `sha256:...`).                       |
| **`image-digest`** | Immutable chart reference (Format: `{registry}/{repository}/{image}@sha256:...`). |

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

Copyright © 2026 hoverkraft

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/helm/release-chart@733a81feaab09ff9918cacc4f22f30c254e10527 # feat/helm-release-artifact-input
  with:
    # OCI registry where to push chart.
    #
    # This input is required.
    # Default: `ghcr.io`
    oci-registry: ghcr.io

    # OCI registry username.
    #
    # This input is required.
    # Default: `${{ github.repository_owner }}`
    oci-registry-username: ${{ github.repository_owner }}

    # OCI registry password.
    #
    # This input is required.
    # Default: `${{ github.token }}`
    oci-registry-password: ${{ github.token }}

    # OCI namespace without the registry or final chart name.
    # Defaults to {owner}/{repository}/charts. The archive supplies its chart name/version.
    # Set this explicitly to preserve a different publication namespace.
    #
    # Default: `${{ github.repository }}/charts`
    oci-repository: ${{ github.repository }}/charts

    # Path to the prepared .tgz archive. Relative paths use the current working directory. Mutually exclusive with artifact-id and archive-name.
    archive: ""

    # One immutable artifact ID from this workflow run, such as helm-chart-ci's artifact-id output. Requires archive-name; mutually exclusive with archive.
    artifact-id: ""

    # Prepared .tgz basename inside the artifact, such as helm-chart-ci's archive-name output. Required only with artifact-id.
    archive-name: ""

    # Expected SHA-256 of the archive bytes, as 64 lowercase hexadecimal characters.
    # This input is required.
    checksum: ""

    # Sign the published OCI chart using Cosign and GitHub Actions OIDC.
    # Enabled by default. Set to `false` to opt out.
    # Requires `id-token: write` and write access to the OCI registry.
    # Does not generate a Helm PGP provenance (.prov) file.
    #
    # Default: `true`
    sign: "true"
```

<!-- usage:end -->
