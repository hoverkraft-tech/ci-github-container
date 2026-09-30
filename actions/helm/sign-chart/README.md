<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItYXdhcmQiIGNvbG9yPSJibHVlIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjciPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjguMjEgMTMuODkgNyAyMyAxMiAyMCAxNyAyMyAxNS43OSAxMy44OCI+PC9wb2x5bGluZT48L3N2Zz4=) GitHub Action: Sign Helm Chart

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Sign Helm Chart" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-sign--helm--chart-blue?logo=github-actions)](https://github.com/marketplace/actions/sign-helm-chart)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Action to sign OCI Helm charts.
It signs chart references with Cosign and the GitHub Actions OIDC token.
It reuses the Docker sign-images action under the hood.

<!-- overview:end -->

## Permissions

If default GitHub credentials are used, the following permissions are required:

- `id-token: write`: to obtain the GitHub Actions OIDC identity token
- `packages: write`: to publish signatures to GitHub Container Registry

For other OCI registries, provide credentials with write access using the registry inputs.

<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-container/actions/helm/sign-chart@5ffc3c81daacc57700a14bb91d67edbc67eedc1d # 0.39.0
  with:
    # Charts to sign.
    # Can be a single chart or a list of charts separated by commas or newlines or spaces.
    # The charts must be in the format `registry/name:tag@digest`.
    # It can also be a list of charts in JSON format.
    # Example:
    #
    # ```json
    # [
    # "ghcr.io/my-org/my-repo/charts/application/my-repo:1.2.3@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d"
    # ]
    # ```
    #
    # This input is required.
    charts: ""

    # OCI registry where the charts are stored.
    # All provided chart references must use this registry.
    #
    # Default: `ghcr.io`
    oci-registry: ghcr.io

    # Username used to log against the OCI registry before signing.
    # See https://github.com/docker/login-action#usage.
    #
    # Default: `${{ github.repository_owner }}`
    oci-registry-username: ${{ github.repository_owner }}

    # Password or GitHub token used to log against the OCI registry before signing.
    # Requires write access to publish signatures.
    #
    # Default: `${{ github.token }}`
    oci-registry-password: ${{ github.token }}

    # GitHub Token used by Cosign to obtain the GitHub Actions OIDC identity token.
    # Permissions:
    # - `id-token`: `write`
    #
    # Default: `${{ github.token }}`
    github-token: ${{ github.token }}
````

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**                   | **Description**                                                                                                                                                                                                        | **Required** | **Default**                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------- |
| **`charts`**                | Charts to sign.                                                                                                                                                                                                        | **true**     | -                                |
|                             | Can be a single chart or a list of charts separated by commas or newlines or spaces.                                                                                                                                   |              |                                  |
|                             | The charts must be in the format `registry/name:tag@digest`.                                                                                                                                                           |              |                                  |
|                             | It can also be a list of charts in JSON format.                                                                                                                                                                        |              |                                  |
|                             | Example:                                                                                                                                                                                                               |              |                                  |
|                             |                                                                                                                                                                                                                        |              |                                  |
|                             | <!-- textlint-disable --><pre lang="json">[&#13; "ghcr.io/my-org/my-repo/charts/application/my-repo:1.2.3@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d"&#13;]</pre><!-- textlint-enable --> |              |                                  |
| **`oci-registry`**          | OCI registry where the charts are stored.                                                                                                                                                                              | **false**    | `ghcr.io`                        |
|                             | All provided chart references must use this registry.                                                                                                                                                                  |              |                                  |
| **`oci-registry-username`** | Username used to log against the OCI registry before signing.                                                                                                                                                          | **false**    | `${{ github.repository_owner }}` |
|                             | See <https://github.com/docker/login-action#usage>.                                                                                                                                                                    |              |                                  |
| **`oci-registry-password`** | Password or GitHub token used to log against the OCI registry before signing.                                                                                                                                          | **false**    | `${{ github.token }}`            |
|                             | Requires write access to publish signatures.                                                                                                                                                                           |              |                                  |
| **`github-token`**          | GitHub Token used by Cosign to obtain the GitHub Actions OIDC identity token.                                                                                                                                          | **false**    | `${{ github.token }}`            |
|                             | Permissions:                                                                                                                                                                                                           |              |                                  |
|                             | - `id-token`: `write`                                                                                                                                                                                                  |              |                                  |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- outputs:start -->
<!-- outputs:end -->

<!-- examples:start -->
<!-- examples:end -->

## Example with `release-chart`

If you need to publish first and sign in a later step, disable signing during release and pass the tagged immutable reference to this action:

```yaml
- id: release-chart
  uses: hoverkraft-tech/ci-github-container/actions/helm/release-chart@f8255a6a37eb141fa331527f5aed9b9e1d598c77 # 0.38.0
  with:
    chart: application
    path: charts/application
    tag: 1.2.3
    sign: "false"

- uses: hoverkraft-tech/ci-github-container/actions/helm/sign-chart@f8255a6a37eb141fa331527f5aed9b9e1d598c77 # 0.38.0
  with:
    charts: ${{ steps.release-chart.outputs.image }}@${{ steps.release-chart.outputs.digest }}
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
