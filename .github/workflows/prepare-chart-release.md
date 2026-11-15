<!-- header:start -->

# GitHub Reusable Workflow: Prepare Helm Chart Release

<div align="center">
  <img src="../logo.svg" width="60px" align="center" alt="Prepare Helm Chart Release" />
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

Prepare committed Helm versions for a manual or scheduled release.
Use this workflow before validation. Start the caller on the default branch;
preparation commits Chart.yaml, creates a tag and dispatches that caller at the tag.
Only status ready starts validation and publication in the dispatched run.
No-change runs finish without creating a commit, tag or release.

Supply path and the organization's GitHub App credentials explicitly. The App
needs contents/actions write and pull requests read, and repository rules must
permit its version commits and tags. GITHUB_TOKEN also works where repository
protections permit its writes. This workflow never modifies repository rules.
Set update-app-version only when the application and chart share one version.
Stable bare or v-prefixed tags are supported. Release configuration comes from
ci-github-publish's defaults and repository overrides.

The caller needs workflow_dispatch (with an optional boolean force input) and
schedule triggers. Forward force only for manual runs. Use non-cancelling release
concurrency; the initial branch run finishes after dispatching the tag run.

If dispatch fails after tag creation, dispatch the caller manually at that tag.
Tag recovery verifies source ancestry and committed versions and never moves a
tag. Already published releases return released. If the default branch moves
before the version commit, preparation fails instead of overwriting newer work.
Restart from the default branch after reviewing that change.

This workflow prepares source identity only. The caller still owns chart/image
validation and publication, and must finish those before publishing its GitHub release.

### Permissions

- **`actions`**: `write`
- **`contents`**: `write`
- **`pull-requests`**: `read`

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
name: Prepare Helm Chart Release
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  prepare-chart-release:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/prepare-chart-release.yml@0592b66c9ed74d8cb7b0c015881ca590fc5d550b # 2.0.0
    permissions:
      actions: write
      contents: write
      pull-requests: read
    secrets:
      # GitHub App private key for the supplied client ID
      github-app-key: ""
    with:
      # Repository-relative directory containing Chart.yaml
      # This input is required.
      path: ""

      # Version the application together with its chart
      update-app-version: false

      # Force a release on manual default-branch runs
      force: false

      # Optional GitHub App client ID paired with the github-app-key secret
      github-app-client-id: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**                  | **Description**                                                     | **Required** | **Type**    | **Default** |
| -------------------------- | ------------------------------------------------------------------- | ------------ | ----------- | ----------- |
| **`path`**                 | Repository-relative directory containing Chart.yaml                 | **true**     | **string**  | -           |
| **`update-app-version`**   | Version the application together with its chart                     | **false**    | **boolean** | `false`     |
| **`force`**                | Force a release on manual default-branch runs                       | **false**    | **boolean** | `false`     |
| **`github-app-client-id`** | Optional GitHub App client ID paired with the github-app-key secret | **false**    | **string**  | -           |

<!-- inputs:end -->
<!-- secrets:start -->

## Secrets

| **Secret**           | **Description**                                   | **Required** |
| -------------------- | ------------------------------------------------- | ------------ |
| **`github-app-key`** | GitHub App private key for the supplied client ID | **false**    |

<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**   | **Description**                                                                         |
| ------------ | --------------------------------------------------------------------------------------- |
| **`status`** | no-changes, dispatched, ready or released; only ready starts validation and publication |
| **`tag`**    | Prepared release tag                                                                    |

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

Copyright © 2026 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
