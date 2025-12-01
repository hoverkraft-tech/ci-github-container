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

<!-- badges:end -->

<!-- overview:start -->

## Overview

Workflow to performs a clean of closed pull requests images tags.
See [prune-pull-requests-image-tags](../../actions/docker/prune-pull-requests-image-tags/README.md) for more information.

### Permissions

- **`contents`**: `read`
- **`id-token`**: `write`
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
    uses: hoverkraft-tech/ci-github-container/.github/workflows/prune-pull-requests-images-tags.yml@0d92511a38c93e30ae0f8b82346116946987a9ca # 0.30.0
    permissions: {}
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

Copyright © 2025 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->

<!--
// jscpd:ignore-end
-->
