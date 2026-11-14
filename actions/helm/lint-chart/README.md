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
