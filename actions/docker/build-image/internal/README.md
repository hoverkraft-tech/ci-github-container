<!-- header:start -->

# GitHub Action: Docker - Run image build

<div align="center">
  <img src="../../../../.github/logo.svg" width="60px" align="center" alt="Docker - Run image build" />
</div>

---

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-docker------run--image--build-blue?logo=github-actions)](https://github.com/marketplace/actions/docker---run-image-build)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Internal build-image implementation that keeps Docker-dependent post steps together.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/build-image/internal@f8255a6a37eb141fa331527f5aed9b9e1d598c77 # 0.38.0
  with:
    # Docker Buildx builder name.
    # This input is required.
    builder: ""

    # Whether to inject and extract Docker cache mounts.
    cache-mounts-enabled: ""

    # Whether the Docker cache mounts were restored from an exact cache key.
    cache-hit: ""

    # Resolved Dockerfile path.
    # This input is required.
    dockerfile: ""

    # Resolved Docker build context path.
    # This input is required.
    context: ""

    # List of build-time variables.
    build-args: ""

    # Dockerfile target stage.
    target: ""

    # List of secrets exposed to the build.
    secrets: ""

    # List of secret environment variables exposed to the build.
    secret-envs: ""

    # Platform to build for.
    # This input is required.
    platform: ""

    # External cache sources for BuildKit.
    cache-from: ""

    # External cache destinations for BuildKit.
    cache-to: ""

    # Whether to disable the build cache.
    no-cache: ""

    # BuildKit image output configuration.
    # This input is required.
    image-outputs: ""

    # Image labels.
    labels: ""

    # Image annotations.
    annotations: ""

    # Image tags.
    # This input is required.
    tags: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**                  | **Description**                                                        | **Required** | **Default** |
| -------------------------- | ---------------------------------------------------------------------- | ------------ | ----------- |
| **`builder`**              | Docker Buildx builder name.                                            | **true**     | -           |
| **`cache-mounts-enabled`** | Whether to inject and extract Docker cache mounts.                     | **false**    | `false`     |
| **`cache-hit`**            | Whether the Docker cache mounts were restored from an exact cache key. | **false**    | `false`     |
| **`dockerfile`**           | Resolved Dockerfile path.                                              | **true**     | -           |
| **`context`**              | Resolved Docker build context path.                                    | **true**     | -           |
| **`build-args`**           | List of build-time variables.                                          | **false**    | -           |
| **`target`**               | Dockerfile target stage.                                               | **false**    | -           |
| **`secrets`**              | List of secrets exposed to the build.                                  | **false**    | -           |
| **`secret-envs`**          | List of secret environment variables exposed to the build.             | **false**    | -           |
| **`platform`**             | Platform to build for.                                                 | **true**     | -           |
| **`cache-from`**           | External cache sources for BuildKit.                                   | **false**    | -           |
| **`cache-to`**             | External cache destinations for BuildKit.                              | **false**    | -           |
| **`no-cache`**             | Whether to disable the build cache.                                    | **false**    | `false`     |
| **`image-outputs`**        | BuildKit image output configuration.                                   | **true**     | -           |
| **`labels`**               | Image labels.                                                          | **false**    | -           |
| **`annotations`**          | Image annotations.                                                     | **false**    | -           |
| **`tags`**                 | Image tags.                                                            | **true**     | -           |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**     | **Description**        |
| -------------- | ---------------------- |
| **`metadata`** | Build result metadata. |

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
