<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Prepare Helm Chart

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Prepare Helm Chart" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-prepare--helm--chart-blue?logo=github-actions)](https://github.com/marketplace/actions/prepare-helm-chart)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Finalize and package one root Helm chart with its local dependencies.
Applies chart metadata and published values, builds locked dependencies from
children to parents, then returns one archive and its SHA-256 checksum.
Requires Helm on PATH and source already checked out. Does not lint, test,
publish or sign. Complete generated chart files before calling this action.
Reuse the archive within the job; upload it with its checksum for later jobs.
The caller owns successful archive cleanup. Failed packaging removes its output.

<!-- overview:end -->

<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/helm/prepare-chart@ed1e90302235365110f9b4b05df96840f715a14f # 0.43.0
  with:
    # Path to one root chart containing Chart.yaml, not a directory of charts.
    # This input is required.
    path: ""

    # Final root chart name. Omit to keep the name in Chart.yaml.
    name: ""

    # Final root archive version and tag for update-tag-paths in local charts.
    # The archive version takes precedence over a values override of Chart.yaml version.
    # Omit to retain existing metadata.
    tag: ""

    # Comma-separated YAML paths updated with tag in each local Chart.yaml.
    # Default: `.version,.appVersion`
    update-tag-paths: .version,.appVersion

    # Published defaults using the update-chart-values action format: `[{ file, path, value }]`.
    # Paths are relative to the root chart; file defaults to values.yaml.
    # Applied after generated metadata updates. Do not include validation-only values or credentials.
    # Dependency declarations must retain locked external versions and local chart identities.
    values: ""

    # List of Helm repositories to add before building locked dependencies.
    # See https://helm.sh/docs/helm/helm_repo_add/.
    # Charts with dependencies must have a matching Chart.lock; preparation does not resolve new versions.
    helm-repositories: ""
```

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                                                      | **Required** | **Default**            |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ------------ | ---------------------- |
| **`path`**              | Path to one root chart containing Chart.yaml, not a directory of charts.                             | **true**     | -                      |
| **`name`**              | Final root chart name. Omit to keep the name in Chart.yaml.                                          | **false**    | -                      |
| **`tag`**               | Final root archive version and tag for update-tag-paths in local charts.                             | **false**    | -                      |
|                         | The archive version takes precedence over a values override of Chart.yaml version.                   |              |                        |
|                         | Omit to retain existing metadata.                                                                    |              |                        |
| **`update-tag-paths`**  | Comma-separated YAML paths updated with tag in each local Chart.yaml.                                | **false**    | `.version,.appVersion` |
| **`values`**            | Published defaults using the update-chart-values action format: `[{ file, path, value }]`.           | **false**    | -                      |
|                         | Paths are relative to the root chart; file defaults to values.yaml.                                  |              |                        |
|                         | Applied after generated metadata updates. Do not include validation-only values or credentials.      |              |                        |
|                         | Dependency declarations must retain locked external versions and local chart identities.             |              |                        |
| **`helm-repositories`** | List of Helm repositories to add before building locked dependencies.                                | **false**    | -                      |
|                         | See <https://helm.sh/docs/helm/helm_repo_add/>.                                                      |              |                        |
|                         | Charts with dependencies must have a matching Chart.lock; preparation does not resolve new versions. |              |                        |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- outputs:start -->

## Outputs

| **Output**     | **Description**                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------ |
| **`archive`**  | Absolute path to the final chart .tgz in a unique runner temporary directory.                    |
| **`checksum`** | SHA-256 of the archive bytes (64 lowercase hexadecimal characters), not the OCI manifest digest. |

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
