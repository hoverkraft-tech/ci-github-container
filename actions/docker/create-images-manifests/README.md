<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Docker - Create images manifests

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Docker - Create images manifests" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-docker------create--images--manifests-blue?logo=github-actions)](https://github.com/marketplace/actions/docker---create-images-manifests)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Action to create built images manifests.
It uses the Docker Buildx plugin to create manifests for the built images.
It requires the Docker Buildx plugin to be installed and configured.
It supports creating manifests for multiple images and platforms at once.

<!-- overview:end -->

## Permissions

If default GitHub token is used, the following permissions are required:

```yml
permissions:
  contents: read
  packages: write
```

<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/create-images-manifests@67e5563d6681bb610c1c961eecb6dfcd5b3cc62f # 0.30.5
  with:
    # OCI registry where to pull and push images
    # This input is required.
    # Default: `ghcr.io`
    oci-registry: ghcr.io

    # Username used to log against the OCI registry. See https://github.com/docker/login-action#usage.
    # This input is required.
    # Default: `${{ github.repository_owner }}`
    oci-registry-username: ${{ github.repository_owner }}

    # Password or personal access token used to log against the OCI registry.
    # Can be passed in using `secrets.GITHUB_TOKEN`.
    # See https://github.com/docker/login-action#usage.
    #
    # This input is required.
    # Default: `${{ github.token }}`
    oci-registry-password: ${{ github.token }}

    # Built images data.
    # Example:
    # ```json
    # {
    # "application": {
    # "name": "application",
    # "registry": "ghcr.io",
    # "repository": "my-org/my-repo/application",
    # "tags": ["pr-63-5222075","pr-63"],
    # "images": [
    # "ghcr.io/my-org/my-repo/application@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d",
    # "ghcr.io/my-org/my-repo/application@sha256:0f5aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f402",
    # ],
    # "annotations": {
    # "org.opencontainers.image.created": "2021-09-30T14:00:00Z",
    # "org.opencontainers.image.description": "Application image"
    # },
    # "platforms": ["linux/amd64", "linux/arm64"],
    # "multi-platform": true
    # }
    # }
    # ```
    #
    # This input is required.
    built-images: ""
````

<!-- usage:end -->

<!-- markdownlint-disable MD013 -->

<!-- inputs:start -->

## Inputs

| **Input**                   | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | **Required** | **Default**                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------- |
| **`oci-registry`**          | OCI registry where to pull and push images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | **true**     | `ghcr.io`                        |
| **`oci-registry-username`** | Username used to log against the OCI registry. See <https://github.com/docker/login-action#usage>.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | **true**     | `${{ github.repository_owner }}` |
| **`oci-registry-password`** | Password or personal access token used to log against the OCI registry.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | **true**     | `${{ github.token }}`            |
|                             | Can be passed in using `secrets.GITHUB_TOKEN`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |              |                                  |
|                             | See <https://github.com/docker/login-action#usage>.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |              |                                  |
| **`built-images`**          | Built images data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | **true**     | -                                |
|                             | Example:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |              |                                  |
|                             | <!-- textlint-disable --><pre lang="json">{&#13; "application": {&#13; "name": "application",&#13; "registry": "ghcr.io",&#13; "repository": "my-org/my-repo/application",&#13; "tags": ["pr-63-5222075","pr-63"],&#13; "images": [&#13; "ghcr.io/my-org/my-repo/application@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d",&#13; "ghcr.io/my-org/my-repo/application@sha256:0f5aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f402",&#13; ],&#13; "annotations": {&#13; "org.opencontainers.image.created": "2021-09-30T14:00:00Z",&#13; "org.opencontainers.image.description": "Application image"&#13; },&#13; "platforms": ["linux/amd64", "linux/arm64"],&#13; "multi-platform": true&#13; }&#13;}</pre><!-- textlint-enable --> |              |                                  |

<!-- inputs:end -->
<!-- outputs:start -->

## Outputs

| **Output**         | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`built-images`** | Built images data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|                    | Example:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|                    | <!-- textlint-disable --><pre lang="json">{&#13; "application": {&#13; "name": "application",&#13; "registry": "ghcr.io",&#13; "repository": "my-org/my-repo/application",&#13; "tags": ["pr-63-5222075","pr-63"],&#13; "digest": "sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d",&#13; "images": [&#13; "ghcr.io/my-org/my-repo/application:pr-63-5222075@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d",&#13; "ghcr.io/my-org/my-repo/application:pr-63@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d"&#13; ],&#13; "annotations": {&#13; "org.opencontainers.image.created": "2021-09-30T14:00:00Z",&#13; "org.opencontainers.image.description": "Application image"&#13; },&#13; "platforms": ["linux/amd64", "linux/arm64"]&#13; }&#13;}</pre><!-- textlint-enable --> |

<!-- outputs:end -->

<!-- markdownlint-enable MD013 -->

<!-- secrets:start -->
<!-- secrets:end -->
<!-- examples:start -->
<!-- examples:end -->

<!--
// jscpd:ignore-start
-->

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

Copyright © 2025 hoverkraft

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->

<!--
// jscpd:ignore-end
-->
