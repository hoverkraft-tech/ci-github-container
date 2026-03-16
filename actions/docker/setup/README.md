<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Docker - Setup

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Docker - Setup" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-docker------setup-blue?logo=github-actions)](https://github.com/marketplace/actions/docker---setup)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Shared action to configure Docker tooling and OCI registry authentication.

<!-- overview:end -->
<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/setup@a0bab9151cc074af9f6c8204ab42a48d2d570379 # 0.30.6
  with:
    # OCI registry configuration used to pull, push and cache images.
    # Accepts either a registry hostname string (default format) or a JSON object.
    # JSON example: `{"pull":"docker.io","pull:private":"ghcr.io","push":"ghcr.io"}`
    #
    # This input is required.
    # Default: `ghcr.io`
    oci-registry: ghcr.io

    # Username configuration used to log against OCI registries.
    # Accepts either a single username string (default format) or a JSON object using the same keys as `oci-registry`.
    oci-registry-username: ""

    # Password or personal access token configuration used to log against OCI registries.
    # Accepts either a single password/token string (default format) or a JSON object using the same keys as `oci-registry`.
    oci-registry-password: ""

    # Inline BuildKit daemon configuration.
    # See https://github.com/docker/setup-buildx-action#inputs.
    # Example for insecure registry:
    # ```ini
    # [registry."my-registry.local:5000"]
    # http = true
    # insecure = true
    # ```
    buildkitd-config-inline: ""

    # Optional built images payload used to resolve manifest publication registries.
    # When provided, registry authentication targets are inferred from the built image data.
    built-images: ""

    # Whether to install and configure Docker Buildx.
    #
    # Default: `true`
    setup-buildx: true
````

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**                     | **Description**                                                                                                        | **Required** | **Default** |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- |
| **`oci-registry`**            | OCI registry configuration used to pull, push and cache images.                                                        | **true**     | `ghcr.io`   |
|                               | Accepts either a registry hostname string (default format) or a JSON object.                                           |              |             |
|                               | JSON example: `{"pull":"docker.io","pull:private":"ghcr.io","push":"ghcr.io"}`                                         |              |             |
| **`oci-registry-username`**   | Username configuration used to log against OCI registries.                                                             | **false**    | -           |
|                               | Accepts either a single username string (default format) or a JSON object using the same keys as `oci-registry`.       |              |             |
| **`oci-registry-password`**   | Password or personal access token configuration used to log against OCI registries.                                    | **false**    | -           |
|                               | Accepts either a single password/token string (default format) or a JSON object using the same keys as `oci-registry`. |              |             |
| **`buildkitd-config-inline`** | Inline BuildKit daemon configuration.                                                                                  | **false**    | -           |
|                               | See <https://github.com/docker/setup-buildx-action#inputs>.                                                            |              |             |
|                               | Example for insecure registry:                                                                                         |              |             |
|                               | ```ini
  [registry."my-registry.local:5000"]
    http = true
    insecure = true
  ```                                 |              |             |
| **`built-images`**            | Optional built images payload used to resolve manifest publication registries.                                         | **false**    | -           |
|                               | When provided, registry authentication targets are inferred from the built image data.                                 |              |             |
| **`setup-buildx`**            | Whether to install and configure Docker Buildx.                                                                        | **false**    | `true`      |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**            | **Description**                                    |
| --------------------- | -------------------------------------------------- |
| **`push-registry`**   | Registry used for published images/manifests.      |
| **`cache-registry`**  | Registry used for registry-backed build cache.     |
| **`pull-registries`** | JSON array of registries used to pull base images. |
| **`buildx-name`**     | Docker Buildx builder name.                        |

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
