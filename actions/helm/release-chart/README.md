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
- uses: hoverkraft-tech/ci-github-container/actions/helm/release-chart@0d92511a38c93e30ae0f8b82346116946987a9ca # 0.30.0
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
````

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**                   | **Description**                                                                                                                                                                                            | **Required** | **Default**                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------- |
| **`oci-registry`**          | OCI registry where to push chart.                                                                                                                                                                          | **true**     | `ghcr.io`                          |
|                             | See <https://github.com/appany/helm-oci-chart-releaser#usage>.                                                                                                                                             |              |                                    |
| **`oci-registry-username`** | OCI registry username.                                                                                                                                                                                     | **true**     | `$\{\{ github.repository_owner }}` |
|                             | See <https://github.com/appany/helm-oci-chart-releaser#usage>.                                                                                                                                             |              |                                    |
| **`oci-registry-password`** | OCI registry password.                                                                                                                                                                                     | **true**     | `$\{\{ github.token }}`            |
|                             | See <https://github.com/appany/helm-oci-chart-releaser#usage>.                                                                                                                                             |              |                                    |
| **`chart`**                 | Chart name to release                                                                                                                                                                                      | **true**     | -                                  |
| **`path`**                  | Path to the chart to release                                                                                                                                                                               | **true**     | -                                  |
| **`values`**                | Define charts values to be filled.                                                                                                                                                                         | **false**    | -                                  |
|                             | See <https://mikefarah.gitbook.io/yq/>.                                                                                                                                                                    |              |                                    |
|                             | Format: `[{ file, path, value }]`.                                                                                                                                                                         |              |                                    |
|                             |                                                                                                                                                                                                            |              |                                    |
|                             | Example:                                                                                                                                                                                                   |              |                                    |
|                             |                                                                                                                                                                                                            |              |                                    |
|                             | <!-- textlint-disable --><pre lang="json">[&#13; {&#13; "file": "charts/application/charts/api/values.yaml",&#13; "path": ".image.registry", "value": "ghcr.io"&#13; }&#13;]</pre><!-- textlint-enable --> |              |                                    |
| **`helm-repositories`**     | List of Helm repositories to add before release charts.                                                                                                                                                    | **false**    | -                                  |
|                             | See <https://helm.sh/docs/helm/helm_repo_add/>.                                                                                                                                                            |              |                                    |
| **`tag`**                   | The release tag to set to chart                                                                                                                                                                            | **true**     | -                                  |
| **`update-tag-paths`**      | List of YAML paths to update with the tag.                                                                                                                                                                 | **false**    | `.version,.appVersion`             |
|                             | Comma separated list of paths.                                                                                                                                                                             |              |                                    |

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

Copyright © 2025 hoverkraft

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->

<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->

<!--
// jscpd:ignore-start
-->
