<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItYm9vay1vcGVuIiBjb2xvcj0iYmx1ZSI+PHBhdGggZD0iTTIgM2g2YTQgNCAwIDAgMSA0IDR2MTRhMyAzIDAgMCAwLTMtM0gyeiI+PC9wYXRoPjxwYXRoIGQ9Ik0yMiAzaC02YTQgNCAwIDAgMC00IDR2MTRhMyAzIDAgMCAxIDMtM2g3eiI+PC9wYXRoPjwvc3ZnPg==) GitHub Action: Helm - Generate Chart Documentation

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Helm - Generate Chart Documentation" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-helm------generate--chart--documentation-blue?logo=github-actions)](https://github.com/marketplace/actions/helm---generate-chart-documentation)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Action to generate documentation for a Helm chart.
It will generate the documentation in the `docs/` directory of the chart.
Mainly using [losisin/helm-docs-github-action](https://github.com/losisin/helm-docs-github-action).

<!-- overview:end -->

<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/helm/generate-docs@3256ec78f48fdaa4c9691c87dc7136fa561c456e # 0.30.3
  with:
    # Working directory
    # Default: `${{ github.workspace }}`
    working-directory: ${{ github.workspace }}

    # Path to the values file to use for generating the documentation.
    # See https://github.com/losisin/helm-values-schema-json-action.
    values-file: ""

    # GitHub Token to create and merge pull request.
    # Permissions:
    # - contents: write
    # - pull-requests: write
    #
    # Default: `${{ github.token }}`
    github-token: ${{ github.token }}

    # GitHub App ID to generate GitHub token in place of github-token.
    # See https://github.com/actions/create-github-app-token.
    github-app-id: ""

    # GitHub App private key to generate GitHub token in place of github-token.
    # See https://github.com/actions/create-github-app-token.
    github-app-key: ""
```

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                           | **Required** | **Default**                 |
| ----------------------- | ------------------------------------------------------------------------- | ------------ | --------------------------- |
| **`working-directory`** | Working directory                                                         | **false**    | `$\{\{ github.workspace }}` |
| **`values-file`**       | Path to the values file to use for generating the documentation.          | **false**    | -                           |
|                         | See <https://github.com/losisin/helm-values-schema-json-action>.          |              |                             |
| **`github-token`**      | GitHub Token to create and merge pull request.                            | **false**    | `$\{\{ github.token }}`     |
|                         | Permissions:                                                              |              |                             |
|                         | - contents: write                                                         |              |                             |
|                         | - pull-requests: write                                                    |              |                             |
| **`github-app-id`**     | GitHub App ID to generate GitHub token in place of github-token.          | **false**    | -                           |
|                         | See <https://github.com/actions/create-github-app-token>.                 |              |                             |
| **`github-app-key`**    | GitHub App private key to generate GitHub token in place of github-token. | **false**    | -                           |
|                         | See <https://github.com/actions/create-github-app-token>.                 |              |                             |

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
