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

Install one prepared Helm chart in a fresh kind cluster and run its Helm tests.
Verify its expected SHA-256 before cluster creation and keep the archive unchanged.
Uses chart-testing for packaged ci/*-values.yaml scenarios, readiness, Helm tests,
diagnostics and release cleanup. Test-only values and registry credentials are overlays.
Ensures Helm and chart-testing are available, reusing existing installations.
Checkout belongs to the caller. Source selection and dependency builds belong before Prepare.
The action owns its unique kind cluster and isolated chart extraction. Temporary
inputs are removed on success, failure or cancellation; kind's post-job hook removes
the cluster. The caller retains the original archive.
Run [Lint Helm Chart](../lint-chart/README.md) first with the same archive/checksum
and values-files. Release and reusable-workflow composition are separate phases.

<!-- overview:end -->
<!-- inputs:start -->

## Inputs

| **Input**                   | **Description**                                                                                     | **Required** | **Default**                      |
| --------------------------- | --------------------------------------------------------------------------------------------------- | ------------ | -------------------------------- |
| **`archive`**               | Path to the prepared .tgz archive. Relative paths use working-directory.                            | **true**     | -                                |
| **`checksum`**              | Expected SHA-256 of the archive bytes, as 64 lowercase hexadecimal characters.                      | **true**     | -                                |
| **`config`**                | Chart-testing configuration path relative to working-directory; defaults to ct.yaml when present.   | **false**    | -                                |
|                             | Retains installation timeouts, release settings and diagnostic policies. This action controls       |              |                                  |
|                             | chart selection, dependency setup, fresh installation, cleanup and debug/configuration output.      |              |                                  |
| **`values-files`**          | Validation-only values files, one path per line relative to working-directory.                      | **false**    | -                                |
|                             | Applied in order after each packaged ci/*-values.yaml scenario or chart defaults.                   |              |                                  |
|                             | Later files take precedence. Use the same files with Lint; publication defaults stay unchanged.     |              |                                  |
| **`working-directory`**     | Writable repository directory for configuration and temporary validation files.                     | **false**    | `${{ github.workspace }}`        |
| **`namespace`**             | Namespace used to install test releases.                                                            | **false**    | -                                |
|                             | Defaults to a random namespace created for the current workflow run.                                |              |                                  |
| **`helm-set`**              | Installation-only values, applied after values-files. Never written to the archive.                 | **false**    | -                                |
|                             | Multiple values can be set using multiline string.                                                  |              |                                  |
|                             | Example:                                                                                            |              |                                  |
|                             | <!-- textlint-disable --><pre lang="text">key1=value1&#13;key2=value2</pre><!-- textlint-enable --> |              |                                  |
| **`oci-registry`**          | OCI registry used by the test cluster to pull images                                                | **false**    | `ghcr.io`                        |
| **`oci-registry-username`** | Username used to log against the OCI registry.                                                      | **false**    | `${{ github.repository_owner }}` |
|                             | See <https://github.com/docker/login-action#usage>.                                                 |              |                                  |
| **`oci-registry-password`** | Password or personal access token used to log against the OCI registry.                             | **false**    | `${{ github.token }}`            |
|                             | Can be passed in using `secrets.GITHUB_TOKEN`.                                                      |              |                                  |
|                             | See <https://github.com/docker/login-action#usage>.                                                 |              |                                  |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->
<!-- outputs:end -->
<!-- examples:start -->
<!-- examples:end -->
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
<!-- usage:start -->

## Usage

````yaml
- uses: hoverkraft-tech/ci-github-container/actions/helm/test-chart@3feb56e45f82273a7eded46ac3b9364c08337cee # 3.0.0
  with:
    # Path to the prepared .tgz archive. Relative paths use working-directory.
    # This input is required.
    archive: ""

    # Expected SHA-256 of the archive bytes, as 64 lowercase hexadecimal characters.
    # This input is required.
    checksum: ""

    # Chart-testing configuration path relative to working-directory; defaults to ct.yaml when present.
    # Retains installation timeouts, release settings and diagnostic policies. This action controls
    # chart selection, dependency setup, fresh installation, cleanup and debug/configuration output.
    config: ""

    # Validation-only values files, one path per line relative to working-directory.
    # Applied in order after each packaged ci/*-values.yaml scenario or chart defaults.
    # Later files take precedence. Use the same files with Lint; publication defaults stay unchanged.
    values-files: ""

    # Writable repository directory for configuration and temporary validation files.
    # Default: `${{ github.workspace }}`
    working-directory: ${{ github.workspace }}

    # Namespace used to install test releases.
    # Defaults to a random namespace created for the current workflow run.
    namespace: ""

    # Installation-only values, applied after values-files. Never written to the archive.
    # Multiple values can be set using multiline string.
    # Example:
    # ```
    # key1=value1
    # key2=value2
    # ```
    helm-set: ""

    # OCI registry used by the test cluster to pull images
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
````

<!-- usage:end -->
