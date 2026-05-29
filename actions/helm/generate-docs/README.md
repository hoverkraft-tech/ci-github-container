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
[![codecov](https://codecov.io/gh/hoverkraft-tech/compose-action/graph/badge.svg?token=90JXB7EIMA)](https://codecov.io/gh/hoverkraft-tech/compose-action)

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
- uses: hoverkraft-tech/ci-github-container/actions/helm/generate-docs@6931f4886bf8af8570acbace09db06a639cbae6f # 0.36.0
  with:
    # Working directory
    # Default: `${{ github.workspace }}`
    working-directory: ${{ github.workspace }}

    # The Git ref to checkout before generating documentation.
    # Can be a branch, tag or commit SHA.
    # Set to an empty string to skip checkout.
    #
    # Default: `${{ github.ref }}`
    checkout-ref: ${{ github.ref }}

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

    # GitHub App client ID to generate GitHub token in place of github-token.
    # See https://github.com/actions/create-github-app-token.
    github-app-client-id: ""

    # GitHub App private key to generate GitHub token in place of github-token.
    # See https://github.com/actions/create-github-app-token.
    github-app-key: ""
```

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**                  | **Description**                                                           | **Required** | **Default**               |
| -------------------------- | ------------------------------------------------------------------------- | ------------ | ------------------------- |
| **`working-directory`**    | Working directory                                                         | **false**    | `${{ github.workspace }}` |
| **`checkout-ref`**         | The Git ref to checkout before generating documentation.                  | **false**    | `${{ github.ref }}`       |
|                            | Can be a branch, tag or commit SHA.                                       |              |                           |
|                            | Set to an empty string to skip checkout.                                  |              |                           |
| **`values-file`**          | Path to the values file to use for generating the documentation.          | **false**    | -                         |
|                            | See <https://github.com/losisin/helm-values-schema-json-action>.          |              |                           |
| **`github-token`**         | GitHub Token to create and merge pull request.                            | **false**    | `${{ github.token }}`     |
|                            | Permissions:                                                              |              |                           |
|                            | - contents: write                                                         |              |                           |
|                            | - pull-requests: write                                                    |              |                           |
| **`github-app-client-id`** | GitHub App client ID to generate GitHub token in place of github-token.   | **false**    | -                         |
|                            | See <https://github.com/actions/create-github-app-token>.                 |              |                           |
| **`github-app-key`**       | GitHub App private key to generate GitHub token in place of github-token. | **false**    | -                         |
|                            | See <https://github.com/actions/create-github-app-token>.                 |              |                           |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- outputs:start -->

## Outputs

| **Output**       | **Description**                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| **`merged-sha`** | The SHA of the commit that was merged to the base branch. Will be empty if no pull request was created or merged. |

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
