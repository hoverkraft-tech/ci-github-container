<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Docker - Build image

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Docker - Build image" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-docker------build--image-blue?logo=github-actions)](https://github.com/marketplace/actions/docker---build-image)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Action to build and push a "raw" image with Docker for a specific platform.
This action uses the Docker Buildx plugin to build the image.
It supports caching.
It returns the image digest URI, tags, and annotations, but does not handle it itself.

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

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/build-image@67e5563d6681bb610c1c961eecb6dfcd5b3cc62f # 0.30.5
  with:
    # OCI registry where to pull and push images
    # This input is required.
    # Default: `ghcr.io`
    oci-registry: ghcr.io

    # Username used to log against the OCI registry.
    # See https://github.com/docker/login-action#usage.
    #
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

    # Repository name.
    # Example: `my-org/my-repo`.
    # See [Docker get-image-metadata action](../get-image-metadata/README.md).
    #
    # Default: `${{ github.repository }}`
    repository: ${{ github.repository }}

    # Additional image name.
    # Example: `application`.
    # See [Docker get-image-metadata action](../get-image-metadata/README.md).
    image: ""

    # Force image tag to publish
    tag: ""

    # Platform to build for. Example: `linux/amd64`.
    # See https://github.com/docker/build-push-action#inputs.
    #
    # This input is required.
    platform: ""

    # Build's context is the set of files located in the specified PATH or URL.
    # See https://github.com/docker/build-push-action#inputs.
    #
    # Default: `.`
    context: .

    # Location of Dockerfile (defaults to Dockerfile).
    # See https://github.com/docker/build-push-action#inputs.
    #
    # Default: `Dockerfile`
    dockerfile: Dockerfile

    # List of build-time variables.
    # See https://github.com/docker/build-push-action#inputs.
    build-args: ""

    # Sets the target stage to build.
    # See https://github.com/docker/build-push-action#inputs.
    target: ""

    # List of secrets to expose to the build.
    # See https://docs.docker.com/build/ci/github-actions/secrets/.
    secrets: ""

    # List of secret environment variables to expose to the build (e.g., `key=envname, MY_SECRET=MY_ENV_VAR`).
    # See https://docs.docker.com/build/ci/github-actions/secrets/.
    secret-envs: ""

    # Cache type.
    # See https://docs.docker.com/build/cache/backends.
    #
    # Default: `gha`
    cache-type: gha

    # Whether this build participates in a multi-platform image publication.
    # When true, the image is pushed by digest only so manifests can be assembled later.
    # When false, the image is pushed with its tags directly.
    multi-platform: ""
```

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**                   | **Description**                                                                                          | **Required** | **Default**                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------- |
| **`oci-registry`**          | OCI registry where to pull and push images                                                               | **true**     | `ghcr.io`                        |
| **`oci-registry-username`** | Username used to log against the OCI registry.                                                           | **true**     | `${{ github.repository_owner }}` |
|                             | See <https://github.com/docker/login-action#usage>.                                                      |              |                                  |
| **`oci-registry-password`** | Password or personal access token used to log against the OCI registry.                                  | **true**     | `${{ github.token }}`            |
|                             | Can be passed in using `secrets.GITHUB_TOKEN`.                                                           |              |                                  |
|                             | See <https://github.com/docker/login-action#usage>.                                                      |              |                                  |
| **`repository`**            | Repository name.                                                                                         | **false**    | `${{ github.repository }}`       |
|                             | Example: `my-org/my-repo`.                                                                               |              |                                  |
|                             | See [Docker get-image-metadata action](../get-image-metadata/README.md).                                 |              |                                  |
| **`image`**                 | Additional image name.                                                                                   | **false**    | -                                |
|                             | Example: `application`.                                                                                  |              |                                  |
|                             | See [Docker get-image-metadata action](../get-image-metadata/README.md).                                 |              |                                  |
| **`tag`**                   | Force image tag to publish                                                                               | **false**    | -                                |
| **`platform`**              | Platform to build for. Example: `linux/amd64`.                                                           | **true**     | -                                |
|                             | See <https://github.com/docker/build-push-action#inputs>.                                                |              |                                  |
| **`context`**               | Build's context is the set of files located in the specified PATH or URL.                                | **false**    | `.`                              |
|                             | See <https://github.com/docker/build-push-action#inputs>.                                                |              |                                  |
| **`dockerfile`**            | Location of Dockerfile (defaults to Dockerfile).                                                         | **false**    | `Dockerfile`                     |
|                             | See <https://github.com/docker/build-push-action#inputs>.                                                |              |                                  |
| **`build-args`**            | List of build-time variables.                                                                            | **false**    | -                                |
|                             | See <https://github.com/docker/build-push-action#inputs>.                                                |              |                                  |
| **`target`**                | Sets the target stage to build.                                                                          | **false**    | -                                |
|                             | See <https://github.com/docker/build-push-action#inputs>.                                                |              |                                  |
| **`secrets`**               | List of secrets to expose to the build.                                                                  | **false**    | -                                |
|                             | See <https://docs.docker.com/build/ci/github-actions/secrets/>.                                          |              |                                  |
| **`secret-envs`**           | List of secret environment variables to expose to the build (e.g., `key=envname, MY_SECRET=MY_ENV_VAR`). | **false**    | -                                |
|                             | See <https://docs.docker.com/build/ci/github-actions/secrets/>.                                          |              |                                  |
| **`cache-type`**            | Cache type.                                                                                              | **false**    | `gha`                            |
|                             | See <https://docs.docker.com/build/cache/backends>.                                                      |              |                                  |
| **`multi-platform`**        | Whether this build participates in a multi-platform image publication.                                   | **false**    | `false`                          |
|                             | When true, the image is pushed by digest only so manifests can be assembled later.                       |              |                                  |
|                             | When false, the image is pushed with its tags directly.                                                  |              |                                  |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- markdownlint-disable MD013 -->

<!-- outputs:start -->

## Outputs

| **Output**        | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`built-image`** | Built image data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|                   | Example:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|                   | <!-- textlint-disable --><pre lang="json">{&#13; "name": "application",&#13; "registry": "ghcr.io",&#13; "repository": "my-org/my-repo/application",&#13; "digest": "sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d",&#13; "image": "ghcr.io/my-org/my-repo/application@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d",&#13; "tags": [&#13; "pr-63-5222075",&#13; "pr-63"&#13; ],&#13; "annotations": {&#13; "org.opencontainers.image.created": "2021-09-30T14:00:00Z",&#13; "org.opencontainers.image.description": "Application image"&#13; },&#13; "platform": "linux/amd64",&#13; "multi-platform": false&#13;}</pre><!-- textlint-enable --> |

<!-- outputs:end -->

<!-- markdownlint-enable MD013 -->

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
