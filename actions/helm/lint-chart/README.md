<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItY2hlY2stY2lyY2xlIiBjb2xvcj0iYmx1ZSI+PHBhdGggZD0iTTIyIDExLjA4VjEyYTEwIDEwIDAgMSAxLTUuOTMtOS4xNCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjIyIDQgMTIgMTQuMDEgOSAxMS4wMSI+PC9wb2x5bGluZT48L3N2Zz4=) GitHub Action: Lint Helm Chart

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Lint Helm Chart" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-lint--helm--chart-blue?logo=github-actions)](https://github.com/marketplace/actions/lint-helm-chart)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Validate one prepared Helm chart archive and its expected SHA-256 checksum.
Runs chart-testing metadata/schema, YAML, maintainer, custom-command and Helm
lint checks on an isolated extraction, including packaged ci/*-values.yaml scenarios.
Also renders each scenario with Helm to reject required/fail errors that lint mode
permits. Rendering uses the same values and shared Helm options; rendered manifests
are kept out of logs. ct namespace/release-name settings apply to rendering when set.
Requires Helm, chart-testing, yamale and yamllint on PATH. Checkout and tool setup
belong to the caller. Dependencies come from the archive and are never rebuilt.
Temporary extraction and validation overlays are removed after success or failure;
the caller retains the original archive. Custom commands must leave validation inputs unchanged.
This explicitly selected chart follows ct --charts semantics: source change detection
and version-increment policy belong to source selection before preparation.

<!-- overview:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                                               | **Required** | **Default**               |
| ----------------------- | --------------------------------------------------------------------------------------------- | ------------ | ------------------------- |
| **`archive`**           | Path to the prepared .tgz archive. Relative paths use working-directory.                      | **true**     | -                         |
| **`checksum`**          | Expected SHA-256 of the archive bytes, as 64 lowercase hexadecimal characters.                | **true**     | -                         |
| **`working-directory`** | Repository directory for chart-testing configuration and custom commands.                     | **false**    | `${{ github.workspace }}` |
|                         | Must be writable for temporary validation files, removed when lint finishes.                  |              |                           |
| **`config`**            | Chart-testing YAML/JSON configuration path, relative to working-directory.                    | **false**    | -                         |
|                         | Defaults to ct.yaml in that directory when present.                                           |              |                           |
|                         | Lint policies and custom commands are retained. Chart selection, repository setup,            |              |                           |
|                         | dependency rebuilding, upgrades, debug and configuration dumps are controlled by this action. |              |                           |
| **`values-files`**      | Optional validation-only values files, one path per line, relative to working-directory.      | **false**    | -                         |
|                         | Applied in order after each packaged ci/*-values.yaml scenario (or chart defaults).           |              |                           |
|                         | Later files take precedence. These overlays never become published chart defaults.            |              |                           |
|                         | Use the same files when testing the archive.                                                  |              |                           |

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

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/helm/lint-chart@d6569ca423f29f68152ee561f51f7de0c08db709 # 1.0.0
  with:
    # Path to the prepared .tgz archive. Relative paths use working-directory.
    # This input is required.
    archive: ""

    # Expected SHA-256 of the archive bytes, as 64 lowercase hexadecimal characters.
    # This input is required.
    checksum: ""

    # Repository directory for chart-testing configuration and custom commands.
    # Must be writable for temporary validation files, removed when lint finishes.
    #
    # Default: `${{ github.workspace }}`
    working-directory: ${{ github.workspace }}

    # Chart-testing YAML/JSON configuration path, relative to working-directory.
    # Defaults to ct.yaml in that directory when present.
    # Lint policies and custom commands are retained. Chart selection, repository setup,
    # dependency rebuilding, upgrades, debug and configuration dumps are controlled by this action.
    config: ""

    # Optional validation-only values files, one path per line, relative to working-directory.
    # Applied in order after each packaged ci/*-values.yaml scenario (or chart defaults).
    # Later files take precedence. These overlays never become published chart defaults.
    # Use the same files when testing the archive.
    values-files: ""
```

<!-- usage:end -->
