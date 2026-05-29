<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItZWRpdCIgY29sb3I9ImJsdWUiPjxwYXRoIGQ9Ik0xMSA0SDRhMiAyIDAgMCAwLTIgMnYxNGEyIDIgMCAwIDAgMiAyaDE0YTIgMiAwIDAgMCAyLTJ2LTciPjwvcGF0aD48cGF0aCBkPSJNMTguNSAyLjVhMi4xMjEgMi4xMjEgMCAwIDEgMyAzTDEyIDE1bC00IDEgMS00IDkuNS05LjV6Ij48L3BhdGg+PC9zdmc+) GitHub Action: Update chart values

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Update chart values" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-update--chart--values-blue?logo=github-actions)](https://github.com/marketplace/actions/update-chart-values)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
[![codecov](https://codecov.io/gh/hoverkraft-tech/compose-action/graph/badge.svg?token=90JXB7EIMA)](https://codecov.io/gh/hoverkraft-tech/compose-action)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Updates Helm chart values files before release.

<!-- overview:end -->

<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-container/actions/helm/update-chart-values@6931f4886bf8af8570acbace09db06a639cbae6f # 0.36.0
  with:
    # Path to the chart to update
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
````

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**    | **Description**                                                                                                                                                                                            | **Required** | **Default** |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- |
| **`path`**   | Path to the chart to update                                                                                                                                                                                | **true**     | -           |
| **`values`** | Define charts values to be filled.                                                                                                                                                                         | **false**    | -           |
|              | See <https://mikefarah.gitbook.io/yq/>.                                                                                                                                                                    |              |             |
|              | Format: `[{ file, path, value }]`.                                                                                                                                                                         |              |             |
|              |                                                                                                                                                                                                            |              |             |
|              | Example:                                                                                                                                                                                                   |              |             |
|              |                                                                                                                                                                                                            |              |             |
|              | <!-- textlint-disable --><pre lang="json">[&#13; {&#13; "file": "charts/application/charts/api/values.yaml",&#13; "path": ".image.registry", "value": "ghcr.io"&#13; }&#13;]</pre><!-- textlint-enable --> |              |             |

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
