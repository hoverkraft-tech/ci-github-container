<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItYXdhcmQiIGNvbG9yPSJibHVlIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjciPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjguMjEgMTMuODkgNyAyMyAxMiAyMCAxNyAyMyAxNS43OSAxMy44OCI+PC9wb2x5bGluZT48L3N2Zz4=) GitHub Action: Docker - Sign images

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Docker - Sign images" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-docker------sign--images-blue?logo=github-actions)](https://github.com/marketplace/actions/docker---sign-images)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Action to sign OCI images.
It is based on [cosign](https://github.com/sigstore/cosign).
It signs the images with the GitHub Actions OIDC token.
If the provided image does not have a digest, it will retrieve the digest using `docker buildx imagetools inspect`.

<!-- overview:end -->

## Permissions

If default GitHub token is used, the following permissions are required:

```yml
permissions:
  id-token: write
```

<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/sign-images@4f29319e02dd65152386c436e8c3136f380a0e71 # 0.28.0
  with:
    # Images to sign.
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
    # If the image does not have a digest, it will retrieve the digest using `docker buildx imagetools inspect`.
    #
    # This input is required.
    images: ""

    # GitHub Token to sign the image.
    # Permissions:
    # - `id-token`: `write`
    #
    # Default: `${{ github.token }}`
    github-token: ${{ github.token }}
````

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**          | **Description**                                                                                                                                                                                                                                                                                                                          | **Required** | **Default**             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------- |
| **`images`**       | Images to sign.                                                                                                                                                                                                                                                                                                                          | **true**     | -                       |
|                    | Can be a single image or a list of images separated by commas or newlines or spaces.                                                                                                                                                                                                                                                     |              |                         |
|                    | The images should be in the format `registry/name:tag@digest`.                                                                                                                                                                                                                                                                           |              |                         |
|                    | It can also be a list of images in JSON format.                                                                                                                                                                                                                                                                                          |              |                         |
|                    | Example:                                                                                                                                                                                                                                                                                                                                 |              |                         |
|                    |                                                                                                                                                                                                                                                                                                                                          |              |                         |
|                    | <!-- textlint-disable --><pre lang="json">[&#13; "ghcr.io/my-org/my-repo/application:pr-63-5222075@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d",&#13; "ghcr.io/my-org/my-repo/application:pr-63@sha256:0f5aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f402"&#13;]</pre><!-- textlint-enable --> |              |                         |
|                    | If the image does not have a digest, it will retrieve the digest using `docker buildx imagetools inspect`.                                                                                                                                                                                                                               |              |                         |
| **`github-token`** | GitHub Token to sign the image.                                                                                                                                                                                                                                                                                                          | **false**    | `$\{\{ github.token }}` |
|                    | Permissions:                                                                                                                                                                                                                                                                                                                             |              |                         |
|                    | - `id-token`: `write`                                                                                                                                                                                                                                                                                                                    |              |                         |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- outputs:start -->
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
