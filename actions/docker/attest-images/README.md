<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItc2hpZWxkIiBjb2xvcj0iYmx1ZSI+PHBhdGggZD0iTTEyIDIycy04LTQtOC0xMFY1bDgtMy04IDN2N2M4IDYgOCAxMCA4IDEwWiI+PC9wYXRoPjwvc3ZnPg==) GitHub Action: Docker - Attest images

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Docker - Attest images" />
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

Action to generate build provenance attestations for OCI images.
It uses [actions/attest](https://github.com/actions/attest) to create SLSA provenance attestations
that establish a verifiable record of how and where the image was built.

Attestations are published to the GitHub Attestations API and optionally pushed to the image registry.

### Signing vs. Attestation

This action is **complementary** to, and not a replacement for, image signing with `cosign`:

| Control | Action | What it proves |
|---|---|---|
| **Signature** | [`sign-images`](../sign-images/README.md) | The image was signed by a trusted identity (registry-native) |
| **Provenance attestation** | `attest-images` (this action) | The image was built by a specific workflow on a specific commit |

A secure container pipeline should use **both**:

1. Build image
2. Push image
3. Resolve immutable digest
4. **Sign image** with `sign-images` (cosign)
5. **Attest provenance** with `attest-images` (this action)

### Why `actions/attest` and not `actions/attest-build-provenance`?

GitHub explicitly states that new implementations should use
[`actions/attest`](https://github.com/actions/attest) instead of
[`actions/attest-build-provenance`](https://github.com/actions/attest-build-provenance),
which is now a thin wrapper over `actions/attest`.

### Deduplication

Images sharing the same registry/name and digest are deduplicated automatically —
only one attestation is created per unique subject. This means multiple image tags
that point to the same digest (e.g. `:main` and `:latest`) generate a single attestation.

This action supports up to **5** unique image subjects per call. For workflows with more
unique images, call the action once per image.

<!-- overview:end -->

## Permissions

If the default GitHub token is used, the following permissions are required:

```yml
permissions:
  id-token: write
  attestations: write
```

When `push-to-registry` is `true` (the default), the token also needs write access to the registry:

```yml
permissions:
  id-token: write
  attestations: write
  packages: write   # for ghcr.io
```

<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/attest-images@main
  with:
    # Images to attest.
    # Can be a single image or a list of images separated by commas or newlines or spaces.
    # The images should be in the format `registry/name:tag@digest`.
    # It can also be a list of images in JSON format.
    # Example:
    #
    # ```json
    # [
    # "ghcr.io/my-org/my-repo/application:pr-63-5222075@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d",
    # "ghcr.io/my-org/my-repo/application:pr-63@sha256:0f5aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f402"
    # ]
    # ```
    #
    # This input is required.
    images: ""

    # Whether to push the attestation to the image registry.
    # When enabled, the attestation is stored as an OCI artifact alongside the image.
    #
    # Default: `true`
    push-to-registry: "true"

    # GitHub Token used to create attestations.
    # Permissions:
    # - `id-token`: `write`
    # - `attestations`: `write`
    #
    # Default: `${{ github.token }}`
    github-token: ${{ github.token }}
````

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**              | **Description**                                                                                                                                                                                                                                                                                                             | **Required** | **Default**           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------- |
| **`images`**           | Images to attest.                                                                                                                                                                                                                                                                                                           | **true**     | -                     |
|                        | Can be a single image or a list of images separated by commas or newlines or spaces.                                                                                                                                                                                                                                        |              |                       |
|                        | The images should be in the format `registry/name:tag@digest`.                                                                                                                                                                                                                                                              |              |                       |
|                        | It can also be a list of images in JSON format.                                                                                                                                                                                                                                                                             |              |                       |
|                        | Example:                                                                                                                                                                                                                                                                                                                    |              |                       |
|                        |                                                                                                                                                                                                                                                                                                                             |              |                       |
|                        | <!-- textlint-disable --><pre lang="json">[&#13; "ghcr.io/my-org/my-repo/application:pr-63-5222075@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d",&#13; "ghcr.io/my-org/my-repo/application:pr-63@sha256:0f5aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f402"&#13;]</pre><!-- textlint-enable --> |              |                       |
|                        | Multiple images sharing the same `registry/name` and digest are deduplicated.                                                                                                                                                                                                                                               |              |                       |
| **`push-to-registry`** | Whether to push the attestation to the image registry.                                                                                                                                                                                                                                                                      | **false**    | `true`                |
|                        | When enabled, the attestation is stored as an OCI artifact alongside the image.                                                                                                                                                                                                                                             |              |                       |
| **`github-token`**     | GitHub Token used to create attestations.                                                                                                                                                                                                                                                                                   | **false**    | `${{ github.token }}` |
|                        | Permissions:                                                                                                                                                                                                                                                                                                                |              |                       |
|                        | - `id-token`: `write`                                                                                                                                                                                                                                                                                                       |              |                       |
|                        | - `attestations`: `write`                                                                                                                                                                                                                                                                                                   |              |                       |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- outputs:start -->
<!-- outputs:end -->

<!-- examples:start -->

## Examples

### Full supply-chain pipeline

```yaml
name: Build and attest
on:
  push:
    branches: [main]

permissions:
  contents: read
  id-token: write
  attestations: write
  packages: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 1. Build and push image (produces immutable digest refs)
      - id: build
        uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@main
        with:
          images: '[{"name":"application","platforms":["linux/amd64"]}]'
        secrets:
          oci-registry-password: ${{ secrets.GITHUB_TOKEN }}

      # 2. Sign image with cosign (registry-native signature)
      - uses: hoverkraft-tech/ci-github-container/actions/docker/sign-images@main
        with:
          images: ${{ steps.build.outputs.built-images }}

      # 3. Attest build provenance (GitHub-native attestation)
      - uses: hoverkraft-tech/ci-github-container/actions/docker/attest-images@main
        with:
          images: ${{ steps.build.outputs.built-images }}
```

### Verifying attestations

Attestations created by this action can be verified with the `gh` CLI:

```bash
gh attestation verify oci://ghcr.io/my-org/my-repo/application:main \
  --owner my-org
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
