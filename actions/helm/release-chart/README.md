<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItdXBsb2FkLWNsb3VkIiBjb2xvcj0iYmx1ZSI+PHBvbHlsaW5lIHBvaW50cz0iMTYgMTYgMTIgMTIgOCAxNiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMjEiPjwvbGluZT48cGF0aCBkPSJNMjAuMzkgMTguMzlBNSA1IDAgMCAwIDE4IDloLTEuMjZBOCA4IDAgMSAwIDMgMTYuMyI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE2IDE2IDEyIDEyIDggMTYiPjwvcG9seWxpbmU+PC9zdmc+) GitHub Action: Release Helm Chart

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Release Helm Chart" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-release--helm--chart-blue?logo=github-actions)](https://github.com/marketplace/actions/release-helm-chart)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Action to release a Helm chart to OCI registry.
Supports umbrella charts: if a chart has local dependencies having version `0.0.0`,
the action will update those dependencies version with the given tag, then update the Chart.lock accordingly.

<!-- overview:end -->

## Permissions

This action requires the following permissions on the repository:

- `contents: read`: to read the chart files
- `packages: write`: to publish the chart to the OCI registry (required for GitHub Package registry only)

<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-container/actions/helm/release-chart@c9088e8447c5a8be45157e17701023fc50ccb1c0 # 0.37.2
  with:
    # OCI registry where to push chart.
    # See https://github.com/appany/helm-oci-chart-releaser#usage.
    #
    # This input is required.
    # Default: `ghcr.io`
    oci-registry: ghcr.io

    # OCI registry username.
    # See https://github.com/appany/helm-oci-chart-releaser#usage.
    #
    # This input is required.
    # Default: `${{ github.repository_owner }}`
    oci-registry-username: ${{ github.repository_owner }}

    # OCI registry password.
    # See https://github.com/appany/helm-oci-chart-releaser#usage.
    #
    # This input is required.
    # Default: `${{ github.token }}`
    oci-registry-password: ${{ github.token }}

    # Chart name to release
    # This input is required.
    chart: ""

    # Path to the chart to release
    # This input is required.
    path: ""

    # Define charts values to be filled.
    # See https://mikefarah.gitbook.io/yq/.
    # Format: `[{ file, path, value }]`.
    #
    # Example:
    #
    # ```json
    # [
    # {
    # "file": "charts/application/charts/api/values.yaml",
    # "path": ".image.registry", "value": "ghcr.io"
    # }
    # ]
    # ```
    values: ""

    # List of Helm repositories to add before release charts.
    # See https://helm.sh/docs/helm/helm_repo_add/.
    helm-repositories: ""

    # The release tag to set to chart
    # This input is required.
    tag: ""

    # List of YAML paths to update with the tag.
    # Comma separated list of paths.
    #
    # Default: `.version,.appVersion`
    update-tag-paths: .version,.appVersion

    # The Git ref to checkout before releasing the chart.
    # Can be a branch, tag or commit SHA.
    ref: ""
````

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**                   | **Description**                                                                                                                                                                                            | **Required** | **Default**                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------- |
| **`oci-registry`**          | OCI registry where to push chart.                                                                                                                                                                          | **true**     | `ghcr.io`                        |
|                             | See <https://github.com/appany/helm-oci-chart-releaser#usage>.                                                                                                                                             |              |                                  |
| **`oci-registry-username`** | OCI registry username.                                                                                                                                                                                     | **true**     | `${{ github.repository_owner }}` |
|                             | See <https://github.com/appany/helm-oci-chart-releaser#usage>.                                                                                                                                             |              |                                  |
| **`oci-registry-password`** | OCI registry password.                                                                                                                                                                                     | **true**     | `${{ github.token }}`            |
|                             | See <https://github.com/appany/helm-oci-chart-releaser#usage>.                                                                                                                                             |              |                                  |
| **`chart`**                 | Chart name to release                                                                                                                                                                                      | **true**     | -                                |
| **`path`**                  | Path to the chart to release                                                                                                                                                                               | **true**     | -                                |
| **`values`**                | Define charts values to be filled.                                                                                                                                                                         | **false**    | -                                |
|                             | See <https://mikefarah.gitbook.io/yq/>.                                                                                                                                                                    |              |                                  |
|                             | Format: `[{ file, path, value }]`.                                                                                                                                                                         |              |                                  |
|                             |                                                                                                                                                                                                            |              |                                  |
|                             | Example:                                                                                                                                                                                                   |              |                                  |
|                             |                                                                                                                                                                                                            |              |                                  |
|                             | <!-- textlint-disable --><pre lang="json">[&#13; {&#13; "file": "charts/application/charts/api/values.yaml",&#13; "path": ".image.registry", "value": "ghcr.io"&#13; }&#13;]</pre><!-- textlint-enable --> |              |                                  |
| **`helm-repositories`**     | List of Helm repositories to add before release charts.                                                                                                                                                    | **false**    | -                                |
|                             | See <https://helm.sh/docs/helm/helm_repo_add/>.                                                                                                                                                            |              |                                  |
| **`tag`**                   | The release tag to set to chart                                                                                                                                                                            | **true**     | -                                |
| **`update-tag-paths`**      | List of YAML paths to update with the tag.                                                                                                                                                                 | **false**    | `.version,.appVersion`           |
|                             | Comma separated list of paths.                                                                                                                                                                             |              |                                  |
| **`ref`**                   | The Git ref to checkout before releasing the chart.                                                                                                                                                        | **false**    | -                                |
|                             | Can be a branch, tag or commit SHA.                                                                                                                                                                        |              |                                  |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- outputs:start -->

## Outputs

| **Output**  | **Description**                                                |
| ----------- | -------------------------------------------------------------- |
| **`image`** | Chart image (Format: `{registry}/{repository}/{image}:{tag}`). |
|             | See <https://github.com/appany/helm-oci-chart-releaser>.       |

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
// jscpd:ignore-start
-->
