<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItc2hpZWxkIiBjb2xvcj0iYmx1ZSI+PHBhdGggZD0iTTEyIDIyczgtNCA4LTEwVjVsLTgtMy04IDN2N2MwIDYgOCAxMCA4IDEweiI+PC9wYXRoPjwvc3ZnPg==) GitHub Action: Docker - Attest image

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Docker - Attest image" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-docker------attest--image-blue?logo=github-actions)](https://github.com/marketplace/actions/docker---attest-image)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Action to generate build provenance attestations for OCI images.
It uses [actions/attest](https://github.com/actions/attest) to create SLSA provenance attestations.
Attestations are published to the GitHub Attestations API and optionally pushed to the image registry.
This action attests a single image subject per invocation.

Note: this action complements, and does not replace, image signing with cosign.
See [sign-images](../sign-images/README.md) for registry-native image signing.

<!-- overview:end -->

### Signing vs. Attestation

This action is **complementary** to, and not a replacement for, image signing with `cosign`:

| Control                    | Action                                    | What it proves                                                  |
| -------------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| **Signature**              | [`sign-images`](../sign-images/README.md) | The image was signed by a trusted identity (registry-native)    |
| **Provenance attestation** | `attest-image` (this action)              | The image was built by a specific workflow on a specific commit |

A secure container pipeline should use **both**:

1. Build image
2. Push image
3. Resolve immutable digest
4. **Sign image** with `sign-images` (cosign)
5. **Attest provenance** with `attest-image` (this action)

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
  packages: write # for ghcr.io
```

<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/attest-image@bec1099232ec106be8adeac05b1c9b906b44332c # copilot/update-container-supply-chain-workflow
  with:
    # Image to attest.
    # It must be identified by an immutable digest reference in the format `registry/name:tag@digest`.
    # Example: `ghcr.io/my-org/my-repo/application:main@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d`
    #
    # This input is required.
    image: ""

    # Whether to push the attestation to the image registry.
    # When enabled, the attestation is stored as an OCI artifact alongside the image.
    # Requires the registry to support OCI artifact storage.
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
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**              | **Description**                                                                                                            | **Required** | **Default**           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------- |
| **`image`**            | Image to attest.                                                                                                           | **true**     | -                     |
|                        | It must be identified by an immutable digest reference in the format `registry/name:tag@digest`.                           |              |                       |
|                        | Example: `ghcr.io/my-org/my-repo/application:main@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d` |              |                       |
| **`push-to-registry`** | Whether to push the attestation to the image registry.                                                                     | **false**    | `true`                |
|                        | When enabled, the attestation is stored as an OCI artifact alongside the image.                                            |              |                       |
|                        | Requires the registry to support OCI artifact storage.                                                                     |              |                       |
| **`github-token`**     | GitHub Token used to create attestations.                                                                                  | **false**    | `${{ github.token }}` |
|                        | Permissions:                                                                                                               |              |                       |
|                        | - `id-token`: `write`                                                                                                      |              |                       |
|                        | - `attestations`: `write`                                                                                                  |              |                       |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->
<!-- outputs:end -->
<!-- examples:start -->

## Examples

### Full supply-chain pipeline

```yaml
name: Build, sign, and attest
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
    env:
      REGISTRY: ghcr.io
      IMAGE_NAME: ${{ github.repository }}/application
    steps:
      - uses: actions/checkout@v4

      # 1. Build and push image
      - id: build
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main

      # 2. Sign image with cosign (registry-native signature)
      - uses: hoverkraft-tech/ci-github-container/actions/docker/sign-images@main
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main@${{ steps.build.outputs.digest }}

      # 3. Attest build provenance (GitHub-native attestation)
      - uses: hoverkraft-tech/ci-github-container/actions/docker/attest-image@main
        with:
          image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main@${{ steps.build.outputs.digest }}
```

<!-- examples:end -->

### Verifying attestations

Attestations created by this action can be verified with the `gh` CLI:

```bash
gh attestation verify oci://ghcr.io/my-org/my-repo/application:main \
  --owner my-org
```

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
