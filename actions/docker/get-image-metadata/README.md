<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItaW5mbyIgY29sb3I9ImJsdWUiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIj48L2NpcmNsZT48bGluZSB4MT0iMTIiIHkxPSIxNiIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48bGluZSB4MT0iMTIiIHkxPSI4IiB4Mj0iMTIuMDEiIHkyPSI4Ij48L2xpbmU+PC9zdmc+) GitHub Action: Get image metadata

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Get image metadata" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-get--image--metadata-blue?logo=github-actions)](https://github.com/marketplace/actions/get-image-metadata)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Action to retrieve required metadata to build Docker image.
Generate Docker image metadata including tags, labels, and annotations for container builds.
It uses the [docker/metadata-action](https://github.com/docker/metadata-action) to generate the metadata based on the current GitHub context.

<!-- overview:end -->

<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/get-image-metadata@a0bab9151cc074af9f6c8204ab42a48d2d570379 # 0.30.6
  with:
    # OCI registry where to pull and push images
    # This input is required.
    # Default: `ghcr.io`
    oci-registry: ghcr.io

    # Repository name. Example: `my-org/my-repo`. See [Docker get-image-name action](../get-image-name/README.md)
    # Default: `${{ github.repository }}`
    repository: ${{ github.repository }}

    # Additional image name. Example: `application`. See [Docker get-image-name action](../get-image-name/README.md)
    image: ""

    # Force image tag to publish
    tag: ""
```

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**          | **Description**                                                                                                | **Required** | **Default**                |
| ------------------ | -------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------- |
| **`oci-registry`** | OCI registry where to pull and push images                                                                     | **true**     | `ghcr.io`                  |
| **`repository`**   | Repository name. Example: `my-org/my-repo`. See [Docker get-image-name action](../get-image-name/README.md)    | **false**    | `${{ github.repository }}` |
| **`image`**        | Additional image name. Example: `application`. See [Docker get-image-name action](../get-image-name/README.md) | **false**    | -                          |
| **`tag`**          | Force image tag to publish                                                                                     | **false**    | -                          |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- outputs:start -->

## Outputs

| **Output**        | **Description**                                 |
| ----------------- | ----------------------------------------------- |
| **`image`**       | Forged image name containing registry.          |
|                   | Example: `ghcr.io/my-org/my-repo/application`   |
| **`labels`**      | The image labels.                               |
| **`annotations`** | The image annotations.                          |
| **`tags`**        | The image tags. Example: `pr-63-5222075\npr-63` |

<!-- outputs:end -->

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

Copyright © 2026 hoverkraft

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->

<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->

<!--
// jscpd:ignore-end
-->
