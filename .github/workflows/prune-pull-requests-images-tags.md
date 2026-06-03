<!-- header:start -->

# GitHub Reusable Workflow: Prune pull requests images tags

<div align="center">
  <img src="../logo.svg" width="60px" align="center" alt="Prune pull requests images tags" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Workflow to performs a clean of closed pull requests images tags.
See [prune-pull-requests-image-tags](../../actions/docker/prune-pull-requests-image-tags/README.md) for more information.

### Permissions

- **`contents`**: `read`
- **`packages`**: `write`
- **`pull-requests`**: `read`

<!-- overview:end -->

<!-- usage:start -->

## Usage

````yaml
name: Prune pull requests images tags
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  prune-pull-requests-images-tags:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/prune-pull-requests-images-tags.yml@77f98ab8773b824eca7ed3f94e3e9c8b8af5875c # 0.36.1
    permissions:
      contents: read
      packages: write
      pull-requests: read
    with:
      # JSON array of runner(s) to use.
      # See https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job.
      #
      # Default: `["ubuntu-latest"]`
      runs-on: '["ubuntu-latest"]'

      # Images to clean.
      # Example:
      # ```json
      # ["application-1","application-2"]
      # ```
      #
      # This input is required.
      images: ""

      # Prune cache image tags (like `application-1/cache`).
      # Useful when building image with "registry" cache backend.
      prune-cache-images: false

      # The regular expression to match pull request tags.
      # Must have a capture group for the pull request number.
      #
      # Default: `^pr-([0-9]+)(?:-|$)`
      pull-request-tag-filter: ^pr-([0-9]+)(?:-|$)

      # Optional regular expression to match tags that should be preserved (not deleted).
      # Tags matching this pattern will never be deleted, even if they are on a package version with PR tags.
      # Example: `^v.*` to preserve version tags like v1.0.0, v2.1.3, etc.
      preserve-tags-filter: ""
````

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**                     | **Description**                                                                                            | **Required** | **Type**    | **Default**            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------ | ----------- | ---------------------- |
| **`runs-on`**                 | JSON array of runner(s) to use.                                                                            | **false**    | **string**  | `["ubuntu-latest"]`    |
|                               | See <https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job>.                         |              |             |                        |
| **`images`**                  | Images to clean.                                                                                           | **true**     | **string**  | -                      |
|                               | Example:                                                                                                   |              |             |                        |
|                               | <!-- textlint-disable --><pre lang="json"> ["application-1","application-2"]</pre><!-- textlint-enable --> |              |             |                        |
| **`prune-cache-images`**      | Prune cache image tags (like `application-1/cache`).                                                       | **false**    | **boolean** | `false`                |
|                               | Useful when building image with "registry" cache backend.                                                  |              |             |                        |
| **`pull-request-tag-filter`** | The regular expression to match pull request tags.                                                         | **false**    | **string**  | `^pr-([0-9]+)(?:-\|$)` |
|                               | Must have a capture group for the pull request number.                                                     |              |             |                        |
| **`preserve-tags-filter`**    | Optional regular expression to match tags that should be preserved (not deleted).                          | **false**    | **string**  | -                      |
|                               | Tags matching this pattern will never be deleted, even if they are on a package version with PR tags.      |              |             |                        |
|                               | Example: `^v.*` to preserve version tags like v1.0.0, v2.1.3, etc.                                         |              |             |                        |

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

Copyright © 2026 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->

<!--
// jscpd:ignore-end
-->
