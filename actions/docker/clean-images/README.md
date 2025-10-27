<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItdHJhc2gtMiIgY29sb3I9ImJsdWUiPjxwb2x5bGluZSBwb2ludHM9IjMgNiA1IDYgMjEgNiI+PC9wb2x5bGluZT48cGF0aCBkPSJNMTkgNnYxNGEyIDIgMCAwIDEtMiAySDdhMiAyIDAgMCAxLTItMlY2bTMgMFY0YTIgMiAwIDAgMSAyLTJoNGEyIDIgMCAwIDEgMiAydjIiPjwvcGF0aD48bGluZSB4MT0iMTAiIHkxPSIxMSIgeDI9IjEwIiB5Mj0iMTciPjwvbGluZT48bGluZSB4MT0iMTQiIHkxPSIxMSIgeDI9IjE0IiB5Mj0iMTciPjwvbGluZT48L3N2Zz4=) GitHub Action: Docker - Clean images

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Docker - Clean images" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-docker------clean--images-blue?logo=github-actions)](https://github.com/marketplace/actions/docker---clean-images)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)

<!-- badges:end -->

<!-- overview:start -->

## Overview

Action to clean up container images from GitHub Container Registry (ghcr.io).
This is a wrapper around the ghcr-cleanup-action that provides a consistent interface
for image cleanup operations including deleting untagged images, pruning old tags,
and managing image lifecycle.

<!-- overview:end -->

## Permissions

Set permissions to write packages. This is required to delete images.

```yaml
permissions:
  packages: write
```

<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/clean-images@c5d2c29ccdc9d357ea7b0e8e2567fa4643c05758 # copilot/refactor-cleanup-action-architecture
  with:
    # Comma-separated list of packages to cleanup.
    # Example: "application-1,application-2"
    #
    # This input is required.
    package: ""

    # Comma-separated list of tags to delete (supports wildcard syntax).
    # Example: `pr-*,dev`
    #
    # This input is required.
    tags: ""

    # GitHub token with the packages:write and packages:delete scopes.
    # See https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries.
    #
    # Default: `${{ github.token }}`
    github-token: ${{ github.token }}
```

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**          | **Description**                                                                                                                                            | **Required** | **Default**             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------- |
| **`package`**      | Comma-separated list of packages to cleanup.                                                                                                               | **true**     | -                       |
|                    | Example: "application-1,application-2"                                                                                                                     |              |                         |
| **`tags`**         | Comma-separated list of tags to delete (supports wildcard syntax).                                                                                         | **true**     | -                       |
|                    | Example: `pr-*,dev`                                                                                                                                        |              |                         |
| **`github-token`** | GitHub token with the packages:write and packages:delete scopes.                                                                                           | **false**    | `$\{\{ github.token }}` |
|                    | See <https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries>. |              |                         |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- outputs:start -->

## Outputs

| **Output**                     | **Description**                         |
| ------------------------------ | --------------------------------------- |
| **`deleted-package-ids`**      | The package IDs that were deleted.      |
| **`deleted-package-versions`** | The package versions that were deleted. |

<!-- outputs:end -->

<!-- examples:start -->

## Examples

### Clean up pull request images

Delete images tagged with a pull request pattern after the PR is closed:

```yaml
name: Clean PR Images
on:
  pull_request:
    types: [closed]

jobs:
  cleanup:
    runs-on: ubuntu-latest
    permissions:
      packages: write
    steps:
      - uses: hoverkraft-tech/ci-github-container/actions/docker/clean-images@c5d2c29ccdc9d357ea7b0e8e2567fa4643c05758 # copilot/refactor-cleanup-action-architecture
        with:
          package: my-app
          delete-tags: pr-${{ github.event.pull_request.number }}-*
```

### Clean up untagged images

Remove all untagged images to save storage:

```yaml
name: Clean Untagged Images
on:
  schedule:
    - cron: "0 3 * * *" # Daily at 3 AM

jobs:
  cleanup:
    runs-on: ubuntu-latest
    permissions:
      packages: write
    steps:
      - uses: hoverkraft-tech/ci-github-container/actions/docker/clean-images@c5d2c29ccdc9d357ea7b0e8e2567fa4643c05758 # copilot/refactor-cleanup-action-architecture
        with:
          package: my-app
          delete-untagged: true
```

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
