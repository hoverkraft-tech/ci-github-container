<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItY2hlY2stY2lyY2xlIiBjb2xvcj0iYmx1ZSI+PHBhdGggZD0iTTIyIDExLjA4VjEyYTEwIDEwIDAgMSAxLTUuOTMtOS4xNCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjIyIDQgMTIgMTQuMDEgOSAxMS4wMSI+PC9wb2x5bGluZT48L3N2Zz4=) GitHub Action: Test Helm Chart

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Test Helm Chart" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-test--helm--chart-blue?logo=github-actions)](https://github.com/marketplace/actions/test-helm-chart)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Action to lint and test installing some Helm chart(s).
Mainly using [helm/chart-testing-action](https://github.com/helm/chart-testing-action).

<!-- overview:end -->

<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-container/actions/helm/test-chart@77f98ab8773b824eca7ed3f94e3e9c8b8af5875c # 0.36.1
  with:
    # Working directory
    # Default: `${{ github.workspace }}`
    working-directory: ${{ github.workspace }}

    # Set values for Helm chart.
    # Multiple values can be set using multiline string.
    # Example:
    # ```
    # key1=value1
    # key2=value2
    # ```
    helm-set: ""

    # List of Helm repositories to add before testing charts.
    # See https://helm.sh/docs/helm/helm_repo_add/.
    helm-repositories: ""

    # OCI registry where to pull and push images
    # Default: `ghcr.io`
    oci-registry: ghcr.io

    # Username used to log against the OCI registry.
    # See https://github.com/docker/login-action#usage.
    #
    # Default: `${{ github.repository_owner }}`
    oci-registry-username: ${{ github.repository_owner }}

    # Password or personal access token used to log against the OCI registry.
    # Can be passed in using `secrets.GITHUB_TOKEN`.
    # See https://github.com/docker/login-action#usage.
    #
    # Default: `${{ github.token }}`
    oci-registry-password: ${{ github.token }}

    # Only run lint and tests on changed charts.
    #
    # Default: `true`
    check-diff-only: "true"

    # Enable linting of the Helm chart.
    # See https://github.com/helm/chart-testing/blob/main/doc/ct_lint.md.
    #
    # Default: `true`
    enable-lint: "true"

    # Enable installing the Helm chart.
    # See https://github.com/helm/chart-testing/blob/main/doc/ct_install.md.
    #
    # Default: `true`
    enable-install: "true"
````

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**                   | **Description**                                                                                     | **Required** | **Default**                      |
| --------------------------- | --------------------------------------------------------------------------------------------------- | ------------ | -------------------------------- |
| **`working-directory`**     | Working directory                                                                                   | **false**    | `${{ github.workspace }}`        |
| **`helm-set`**              | Set values for Helm chart.                                                                          | **false**    | -                                |
|                             | Multiple values can be set using multiline string.                                                  |              |                                  |
|                             | Example:                                                                                            |              |                                  |
|                             | <!-- textlint-disable --><pre lang="text">key1=value1&#13;key2=value2</pre><!-- textlint-enable --> |              |                                  |
| **`helm-repositories`**     | List of Helm repositories to add before testing charts.                                             | **false**    | -                                |
|                             | See <https://helm.sh/docs/helm/helm_repo_add/>.                                                     |              |                                  |
| **`oci-registry`**          | OCI registry where to pull and push images                                                          | **false**    | `ghcr.io`                        |
| **`oci-registry-username`** | Username used to log against the OCI registry.                                                      | **false**    | `${{ github.repository_owner }}` |
|                             | See <https://github.com/docker/login-action#usage>.                                                 |              |                                  |
| **`oci-registry-password`** | Password or personal access token used to log against the OCI registry.                             | **false**    | `${{ github.token }}`            |
|                             | Can be passed in using `secrets.GITHUB_TOKEN`.                                                      |              |                                  |
|                             | See <https://github.com/docker/login-action#usage>.                                                 |              |                                  |
| **`check-diff-only`**       | Only run lint and tests on changed charts.                                                          | **false**    | `true`                           |
| **`enable-lint`**           | Enable linting of the Helm chart.                                                                   | **false**    | `true`                           |
|                             | See <https://github.com/helm/chart-testing/blob/main/doc/ct_lint.md>.                               |              |                                  |
| **`enable-install`**        | Enable installing the Helm chart.                                                                   | **false**    | `true`                           |
|                             | See <https://github.com/helm/chart-testing/blob/main/doc/ct_install.md>.                            |              |                                  |

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
