<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItZGVsZXRlIiBjb2xvcj0iYmx1ZSI+PHBhdGggZD0iTTIxIDRIOGwtNyA4IDcgOGgxM2EyIDIgMCAwIDAgMi0yVjZhMiAyIDAgMCAwLTItMnoiPjwvcGF0aD48bGluZSB4MT0iMTgiIHkxPSI5IiB4Mj0iMTIiIHkyPSIxNSI+PC9saW5lPjxsaW5lIHgxPSIxMiIgeTE9IjkiIHgyPSIxOCIgeTI9IjE1Ij48L2xpbmU+PC9zdmc+) GitHub Action: Prune pull requests image tags from GitHub Packages

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Prune pull requests image tags from GitHub Packages" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-prune--pull--requests--image--tags--from--github--packages-blue?logo=github-actions)](https://github.com/marketplace/actions/prune-pull-requests-image-tags-from-github-packages)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Action to prune existing package versions related to closed pull requests

<!-- overview:end -->

## Permissions

Set permissions to read contents and pull-requests. This is required to get the PR branch.

```yaml
on: issue_comment
permissions:
  contents: read
  pull-requests: read
```

<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/prune-pull-requests-image-tags@77f7324c534748f90cc191746164e0099e19e69a # 0.37.0
  with:
    # Image name
    image: ""

    # The regular expression to match pull request tags. Must have a capture group for the pull request number.
    # Default: `^pr-([0-9]+)(?:-|$)`
    pull-request-tag-filter: ^pr-([0-9]+)(?:-|$)

    # Optional regular expression to match tags that should be preserved (not deleted).
    # Tags matching this pattern will never be deleted, even if they are on a package version with PR tags.
    # Example: `^v.*` to preserve version tags like v1.0.0, v2.1.3, etc.
    preserve-tags-filter: ""

    # GitHub token with the following scopes: `pull-requests:read`, `packages:read` and `packages:delete`.
    # See https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries.
    #
    # Default: `${{ github.token }}`
    github-token: ${{ github.token }}
```

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**                     | **Description**                                                                                                                                            | **Required** | **Default**            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------- |
| **`image`**                   | Image name                                                                                                                                                 | **false**    | -                      |
| **`pull-request-tag-filter`** | The regular expression to match pull request tags. Must have a capture group for the pull request number.                                                  | **false**    | `^pr-([0-9]+)(?:-\|$)` |
| **`preserve-tags-filter`**    | Optional regular expression to match tags that should be preserved (not deleted).                                                                          | **false**    | -                      |
|                               | Tags matching this pattern will never be deleted, even if they are on a package version with PR tags.                                                      |              |                        |
|                               | Example: `^v.*` to preserve version tags like v1.0.0, v2.1.3, etc.                                                                                         |              |                        |
| **`github-token`**            | GitHub token with the following scopes: `pull-requests:read`, `packages:read` and `packages:delete`.                                                       | **false**    | `${{ github.token }}`  |
|                               | See <https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries>. |              |                        |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- outputs:start -->

## Outputs

| **Output**               | **Description**                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| **`deleted-image-tags`** | The list of deleted tags for given image.                                                  |
|                          | Example:                                                                                   |
|                          | <!-- textlint-disable --><pre lang="json">["1.0.0", "1.0.1"]</pre><!-- textlint-enable --> |

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

### Lint index.js

```bash
npx standard --fix actions/docker/prune-pull-requests-image-tags/index.js
```

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
