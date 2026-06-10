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
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

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
- uses: hoverkraft-tech/ci-github-container/actions/docker/create-images-manifests@c9088e8447c5a8be45157e17701023fc50ccb1c0 # 0.37.2
  with:
    # OCI registry configuration used to pull, push and cache images.
    # Accepts either a registry hostname string (default format) or a JSON object.
    # JSON example: `{"pull":"docker.io","pull:private":"ghcr.io","push":"ghcr.io"}`
    # JSON object keys:
    # - `pull`: registry used to pull public or default base images
    # - `pull:<name>`: additional pull registry
    # - `push`: registry used for published images
    # - `cache`: registry used when `cache-type` is `registry`
    #
    # This input is required.
    # Default: `ghcr.io`
    oci-registry: ghcr.io

    # Username configuration used to log against OCI registries.
    # Accepts either a single username string (default format) or a JSON object using the same keys as `oci-registry`.
    # JSON example: `{"pull:private":"$\{{ github.repository_owner }}","push":"$\{{ github.repository_owner }}"}`
    # See https://github.com/docker/login-action#usage.
    #
    # This input is required.
    # Default: `${{ github.repository_owner }}`
    oci-registry-username: ${{ github.repository_owner }}

    # Password or personal access token configuration used to log against OCI registries.
    # Accepts either a single password/token string (default format) or a JSON object using the same keys as `oci-registry`.
    # JSON example: `{"pull:private":"$\{{ github.token }}","push":"$\{{ github.token }}"}`
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
| **`oci-registry`**          | OCI registry configuration used to pull, push and cache images.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | **true**     | `ghcr.io`                        |
|                             | Accepts either a registry hostname string (default format) or a JSON object.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |              |                                  |
|                             | JSON example: `{"pull":"docker.io","pull:private":"ghcr.io","push":"ghcr.io"}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |              |                                  |
|                             | JSON object keys:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |              |                                  |
|                             | - `pull`: registry used to pull public or default base images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |              |                                  |
|                             | - `pull:<name>`: additional pull registry                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |              |                                  |
|                             | - `push`: registry used for published images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |              |                                  |
|                             | - `cache`: registry used when `cache-type` is `registry`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |              |                                  |
| **`oci-registry-username`** | Username configuration used to log against OCI registries.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | **true**     | `${{ github.repository_owner }}` |
|                             | Accepts either a single username string (default format) or a JSON object using the same keys as `oci-registry`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |              |                                  |
|                             | JSON example: `{"pull:private":"$\{{ github.repository_owner }}","push":"$\{{ github.repository_owner }}"}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |              |                                  |
|                             | See <https://github.com/docker/login-action#usage>.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |              |                                  |
| **`oci-registry-password`** | Password or personal access token configuration used to log against OCI registries.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | **true**     | `${{ github.token }}`            |
|                             | Accepts either a single password/token string (default format) or a JSON object using the same keys as `oci-registry`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |              |                                  |
|                             | JSON example: `{"pull:private":"$\{{ github.token }}","push":"$\{{ github.token }}"}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |              |                                  |
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

## Multiple registries

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

<!-- secrets:start -->
<!-- secrets:end -->
<!-- examples:start -->

## Examples

### Clone an existing tag to a new tag

This example first builds and publishes an original tag (`1.0.0-rc.0`) with the reusable workflow `.github/workflows/docker-build-images.yml`, then copies that tag to `1.0.0` using this action.

```yaml
jobs:
  build-original-tag:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@<sha> # x.y.z
    permissions:
      contents: read
      id-token: write
      packages: write
    secrets:
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
    with:
      sign: false
      images: |
        [
          {
            "name": "application",
            "context": ".",
            "dockerfile": "./tests/application/Dockerfile",
            "target": "prod",
            "platforms": ["linux/amd64"],
            "tag": "1.0.0-rc.0"
          }
        ]

  clone-image-tag:
    needs: build-original-tag
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@<sha> # vx.y.z
        with:
          persist-credentials: false

      - uses: hoverkraft-tech/ci-github-container/actions/docker/setup@<sha> # x.y.z
        with:
          oci-registry: ghcr.io
          oci-registry-username: ${{ github.repository_owner }}
          oci-registry-password: ${{ secrets.GITHUB_TOKEN }}

      - id: create-images-manifests-input
        uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3 # v9.0.0
        env:
          BUILT_IMAGES_OUTPUT: ${{ needs.build-original-tag.outputs.built-images }}
        with:
          script: |
            const builtImages = JSON.parse(process.env.BUILT_IMAGES_OUTPUT);

            const imageName = "application";
            const originalImage = builtImages[imageName];
            if (!originalImage) {
              throw new Error(`Missing "${imageName}" entry in "built-images" output`);
            }

            // Build manifest-clone input: source = existing 1.0.0-rc.0 tag, destination = 1.0.0 tag.
            const cloneInput = {
              [imageName]: {
                ...originalImage,
                tags: ["1.0.0"],
                images: [`${originalImage.registry}/${originalImage.repository}:1.0.0-rc.0`],
                "multi-platform": true, // Force multi-platform to force create tag
              },
            };

            core.setOutput("built-images", JSON.stringify(cloneInput));

      - id: clone-tag
        uses: hoverkraft-tech/ci-github-container/actions/docker/create-images-manifests@c9088e8447c5a8be45157e17701023fc50ccb1c0 # 0.37.2
        with:
          oci-registry: ghcr.io
          oci-registry-username: ${{ github.repository_owner }}
          oci-registry-password: ${{ secrets.GITHUB_TOKEN }}
          built-images: ${{ steps.create-images-manifests-input.outputs.built-images }}
```

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
