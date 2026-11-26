<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItY2hlY2stY2lyY2xlIiBjb2xvcj0iYmx1ZSI+PHBhdGggZD0iTTIyIDExLjA4VjEyYTEwIDEwIDAgMSAxLTUuOTMtOS4xNCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjIyIDQgMTIgMTQuMDEgOSAxMS4wMSI+PC9wb2x5bGluZT48L3N2Zz4=) GitHub Action: Docker - Test Image

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-docker------test--image-blue?logo=github-actions)](https://github.com/marketplace/actions/docker---test-image)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-container)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Test one immutable image with a native Testcontainers/Node or Goss suite.
Checkout and [Docker setup](../setup/README.md) belong to the caller. Use a Linux
amd64 or arm64 runner with a local Unix Docker socket and registry authentication.
Pass a fully qualified registry digest or a local `sha256:...` image ID.

Set `working-directory` to your suite directory. `engine: auto` selects root
`*.test.js` files or `goss.yaml`; missing or ambiguous suites fail. Select `engine`
explicitly for mixed directories. A failed run never switches engines.

- [Node example](../../../tests/container-image/testcontainers-node/image.test.js):
  use `node:test` and `new GenericContainer(process.env.TESTED_IMAGE_REF)`.
  The released runner supplies Testcontainers and runs trusted suites as root with
  Docker access. `TESTED_IMAGE_REF` is the resolved local image ID;
  `TESTED_IMAGE_SOURCE` and `TESTED_IMAGE_PLATFORM` identify the original input and platform.
- [Goss example](../../../tests/container-image/goss/goss.yaml): use `goss.yaml`
  and optional `goss_wait.yaml`. The image must stay running and provide `sh`;
  use Node for CLI or shell-less images. Goss keeps the image's user and entrypoint.

Native JUnit report bundles and diagnostics are retained for seven days, including after
failures. Missing, stale, invalid, empty or all-skipped results fail validation.
Use the common `ci-reports` workflow with producer jobs in `needs`, `if: always()`
and `job-results` set to the JSON representation of `needs`. Forward the action's `report-plan` output from the calling job.
The action posts no PR comments and cleans only its own resources; cancellation
cleanup is best effort. Keep native suite cleanup in place.

`validation` is available only after successful execution, reporting and cleanup.
For promotion, forward the original producer entry matching the tested registry
digest and require every suite/platform job. Local image IDs and single-platform
checks do not certify a later push or an entire multi-platform index.
See [ADR 0014](../../../docs/adr/0014-standardize-container-image-tests.md) for the contract.

Run the same suites locally from a checkout with Node.js 24+ and Docker. Set
`IMAGE_DIGEST_REFERENCE` to the candidate's digest reference; tool versions come
from [tooling.json](tooling.json). The CLI prints and retains results for inspection:

```sh
node actions/docker/test-image/bin/test-image.mjs \
  --image "$IMAGE_DIGEST_REFERENCE" \
  --working-directory /path/to/container-tests \
  --output-directory .cache/container-test-results
```

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/test-image@3515f6f4736151728e2e6e7d8b8c39bb3faf5753
  with:
    # Fully qualified registry reference containing @sha256, or an exact local Docker sha256 image ID. Tag-only references are rejected.
    # This input is required.
    image: ""

    # Suite directory, absolute or relative to the repository root.
    # Default: `.`
    working-directory: .

    # Test engine, auto, testcontainers-node or goss. Auto requires exactly one suite kind.
    # Default: `auto`
    engine: auto

    # Requested Linux image platform (amd64 or arm64, optionally with variant). Defaults to the daemon's native
    # platform. Configure compatible runners or emulation explicitly.
    platform: ""

    # Overall engine execution timeout in seconds, from 1 to 3600. Defaults to 300. Tool acquisition is
    # separately bounded; Goss readiness is limited to 30 seconds or this timeout, whichever is shorter.
    # Default: `300`
    timeout: "300"

    # Optional native JUnit paths or globs, relative to working-directory or absolute, separated by newlines,
    # commas or semicolons. Every explicit entry must match a new or changed report from this invocation.
    # Defaults to the adapter's own JUnit report, which is always required for validation.
    report-file: ""

    # Report path mappings forwarded to the common parser. Defaults to mapping the Node runner suite path into
    # working-directory. An explicit value replaces that mapping.
    path-mapping: ""

    # Expected producer metadata supplied by orchestration. Leave empty for standalone use.
    report-plan: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                                                                                    | **Required** | **Default** |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- |
| **`image`**             | Fully qualified registry reference containing @sha256, or an exact local Docker sha256 image ID. Tag-only references are rejected. | **true**     | -           |
| **`working-directory`** | Suite directory, absolute or relative to the repository root.                                                                      | **false**    | `.`         |
| **`engine`**            | Test engine, auto, testcontainers-node or goss. Auto requires exactly one suite kind.                                              | **false**    | `auto`      |
| **`platform`**          | Requested Linux image platform (amd64 or arm64, optionally with variant). Defaults to the daemon's native                          | **false**    | -           |
|                         | platform. Configure compatible runners or emulation explicitly.                                                                    |              |             |
| **`timeout`**           | Overall engine execution timeout in seconds, from 1 to 3600. Defaults to 300. Tool acquisition is                                  | **false**    | `300`       |
|                         | separately bounded; Goss readiness is limited to 30 seconds or this timeout, whichever is shorter.                                 |              |             |
| **`report-file`**       | Optional native JUnit paths or globs, relative to working-directory or absolute, separated by newlines,                            | **false**    | -           |
|                         | commas or semicolons. Every explicit entry must match a new or changed report from this invocation.                                |              |             |
|                         | Defaults to the adapter's own JUnit report, which is always required for validation.                                               |              |             |
| **`path-mapping`**      | Report path mappings forwarded to the common parser. Defaults to mapping the Node runner suite path into                           | **false**    | -           |
|                         | working-directory. An explicit value replaces that mapping.                                                                        |              |             |
| **`report-plan`**       | Expected producer metadata supplied by orchestration. Leave empty for standalone use.                                              | **false**    | -           |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**                   | **Description**                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| **`report-artifact-id`**     | Native report bundle, including diagnostic metadata and available test reports after failures.        |
| **`diagnostic-artifact-id`** | Engine and available container log artifact ID, including after failures and timeouts.                |
| **`validation`**             | Successful image validation JSON with image identity, resolved engine, suite, observed platform,      |
|                              | run/attempt, executed test counts and report/log paths. Empty on failure; a diagnostic artifact never |
|                              | establishes success.                                                                                  |
| **`report-plan`**            | Expected native report plan. Forward this from the calling job to ci-reports.                         |

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
