<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItY2hlY2stY2lyY2xlIiBjb2xvcj0iYmx1ZSI+PHBhdGggZD0iTTIyIDExLjA4VjEyYTEwIDEwIDAgMSAxLTUuOTMtOS4xNCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjIyIDQgMTIgMTQuMDEgOSAxMS4wMSI+PC9wb2x5bGluZT48L3N2Zz4=) GitHub Action: Docker - Test Image

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-docker------test--image-blue?logo=github-actions)](https://github.com/marketplace/actions/docker---test-image)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)

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

Native JUnit reports and diagnostics are retained for seven days, including after
failures. Missing, stale, invalid, empty or all-skipped results fail validation.
Use the common `ci-reports` workflow with producer jobs in `needs`, `if: always()`
and `job-results` set to the JSON representation of `needs`. Set `report-group` to the outer job ID.
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
- uses: hoverkraft-tech/ci-github-container/actions/docker/test-image@f1b31a0321f935e6030a05ca1be7e036dcc59626 # docs/container-image-testing-adr
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

    # Requested Linux image platform (amd64 or arm64, optionally with variant). Defaults to the daemon's native platform. Configure compatible runners or emulation explicitly.
    platform: ""

    # Overall engine execution timeout in seconds, from 1 to 3600. Defaults to 300. Tool acquisition is separately bounded; Goss readiness is limited to 30 seconds or this timeout, whichever is shorter.
    # Default: `300`
    timeout: "300"

    # Optional native JUnit paths or globs, relative to working-directory or absolute, separated by newlines, commas or semicolons. Every explicit entry must match a new or changed report from this invocation. Defaults to the adapter's own JUnit report, which is always required for validation.
    report-file: ""

    # Report path mappings forwarded to the common parser. Defaults to mapping the Node runner suite path into working-directory. An explicit value replaces that mapping.
    path-mapping: ""

    # Outer calling job ID for consolidated ci-reports. Defaults to the current job ID. Use the job ID appearing in the reporting workflow's needs.
    report-group: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                                                                                                                                                                                                                                                  | **Required** | **Default** |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | ----------- |
| **`image`**             | Fully qualified registry reference containing @sha256, or an exact local Docker sha256 image ID. Tag-only references are rejected.                                                                                                                                                               | **true**     | -           |
| **`working-directory`** | Suite directory, absolute or relative to the repository root.                                                                                                                                                                                                                                    | **false**    | `.`         |
| **`engine`**            | Test engine, auto, testcontainers-node or goss. Auto requires exactly one suite kind.                                                                                                                                                                                                            | **false**    | `auto`      |
| **`platform`**          | Requested Linux image platform (amd64 or arm64, optionally with variant). Defaults to the daemon's native platform. Configure compatible runners or emulation explicitly.                                                                                                                        | **false**    | -           |
| **`timeout`**           | Overall engine execution timeout in seconds, from 1 to 3600. Defaults to 300. Tool acquisition is separately bounded; Goss readiness is limited to 30 seconds or this timeout, whichever is shorter.                                                                                             | **false**    | `300`       |
| **`report-file`**       | Optional native JUnit paths or globs, relative to working-directory or absolute, separated by newlines, commas or semicolons. Every explicit entry must match a new or changed report from this invocation. Defaults to the adapter's own JUnit report, which is always required for validation. | **false**    | -           |
| **`path-mapping`**      | Report path mappings forwarded to the common parser. Defaults to mapping the Node runner suite path into working-directory. An explicit value replaces that mapping.                                                                                                                             | **false**    | -           |
| **`report-group`**      | Outer calling job ID for consolidated ci-reports. Defaults to the current job ID. Use the job ID appearing in the reporting workflow's needs.                                                                                                                                                    | **false**    | -           |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**                   | **Description**                                                                                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`report-artifact-id`**     | Native JUnit report artifact ID, including after failed tests. Empty when no valid report artifact is available.                                                                                                            |
| **`diagnostic-artifact-id`** | Engine and available container log artifact ID, including after failures and timeouts.                                                                                                                                      |
| **`validation`**             | Successful image validation JSON with image identity, resolved engine, suite, observed platform, run/attempt, executed test counts and report/log paths. Empty on failure; a diagnostic artifact never establishes success. |

<!-- outputs:end -->
<!-- examples:start -->
<!-- examples:end -->
<!-- contributing:start -->
<!-- contributing:end -->
<!-- security:start -->
<!-- security:end -->
<!-- license:start -->
<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
