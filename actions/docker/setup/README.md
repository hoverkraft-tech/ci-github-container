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
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Shared action to configure Docker tooling and OCI registry authentication.

<!-- overview:end -->
<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/setup@c9088e8447c5a8be45157e17701023fc50ccb1c0 # 0.37.2
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

    # Whether the Buildx builder should be removed during post-job cleanup.
    #
    # Default: `true`
    buildx-cleanup: true

    # Buildx version used by docker/setup-buildx-action.
    #
    # Default: `v0.34.1`
    buildx-version: v0.34.1

    # BuildKit image used by docker/setup-buildx-action.
    #
    # Default: `moby/buildkit:v0.30.0`
    buildkit-image: moby/buildkit:v0.30.0
````

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**                     | **Description**                                                                                                                                  | **Required** | **Default**             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | ----------------------- |
| **`oci-registry`**            | OCI registry configuration used to pull, push and cache images.                                                                                  | **true**     | `ghcr.io`               |
|                               | Accepts either a registry hostname string (default format) or a JSON object.                                                                     |              |                         |
|                               | JSON example: `{"pull":"docker.io","pull:private":"ghcr.io","push":"ghcr.io"}`                                                                   |              |                         |
| **`oci-registry-username`**   | Username configuration used to log against OCI registries.                                                                                       | **false**    | -                       |
|                               | Accepts either a single username string (default format) or a JSON object using the same keys as `oci-registry`.                                 |              |                         |
| **`oci-registry-password`**   | Password or personal access token configuration used to log against OCI registries.                                                              | **false**    | -                       |
|                               | Accepts either a single password/token string (default format) or a JSON object using the same keys as `oci-registry`.                           |              |                         |
| **`buildkitd-config-inline`** | Inline BuildKit daemon configuration.                                                                                                            | **false**    | -                       |
|                               | See <https://github.com/docker/setup-buildx-action#inputs>.                                                                                      |              |                         |
|                               | Example for insecure registry:                                                                                                                   |              |                         |
|                               | <!-- textlint-disable --><pre lang="ini">[registry."my-registry.local:5000"]&#13; http = true&#13; insecure = true</pre><!-- textlint-enable --> |              |                         |
| **`built-images`**            | Optional built images payload used to resolve manifest publication registries.                                                                   | **false**    | -                       |
|                               | When provided, registry authentication targets are inferred from the built image data.                                                           |              |                         |
| **`setup-buildx`**            | Whether to install and configure Docker Buildx.                                                                                                  | **false**    | `true`                  |
| **`buildx-cleanup`**          | Whether the Buildx builder should be removed during post-job cleanup.                                                                            | **false**    | `true`                  |
| **`buildx-version`**          | Buildx version used by docker/setup-buildx-action.                                                                                               | **false**    | `v0.34.1`               |
| **`buildkit-image`**          | BuildKit image used by docker/setup-buildx-action.                                                                                               | **false**    | `moby/buildkit:v0.30.0` |

<!-- inputs:end -->

### Multiple registries

The default single-registry format still works:

```yaml
oci-registry: ghcr.io
oci-registry-username: ${{ github.repository_owner }}
oci-registry-password: ${{ github.token }}
```

To configure distinct pull, push and cache registries, pass JSON objects:

```yaml
oci-registry: |
  {"pull":"docker.io","pull:private":"ghcr.io","push":"ghcr.io"}
oci-registry-username: |
  {"pull:private":"${{ github.repository_owner }}","push":"${{ github.repository_owner }}"}
oci-registry-password: |
  {"pull:private":"${{ github.token }}","push":"${{ github.token }}"}
```

Registry credentials are resolved by role using the same keys as `oci-registry`.
`pull` is the default pull registry, while `pull:<name>` can be repeated for additional pull registries.
When no pull registry is provided, the push registry is also used for pulls.
Optional pull registries without credentials are skipped, which is useful for public registries such as Docker Hub.

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
