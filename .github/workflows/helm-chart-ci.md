<!-- header:start -->

# GitHub Reusable Workflow: Helm chart CI

<div align="center">
  <img src="../logo.svg" width="60px" align="center" alt="Helm chart CI" />
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

Prepare, lint and install one root Helm chart on a single runner.

The caller grants contents/packages read. Checkout uses the caller's ref by
default; phase actions install missing tools and reuse existing installations.
Static validation finishes before kind starts. Both validation phases receive
one archive/checksum, the same ct configuration and ordered validation overlays.
Local preparation files and the test cluster are cleaned after success/failure.

Supply path, helm-repositories and optional config/values-files/helm-set inputs.
Published metadata/default changes belong to name/tag/values; helm-set is for
installation-only overrides, including candidate image digests and pull secrets.
Private image credentials must be read-only. They are never uploaded in the chart.

Optional images metadata follows docker-build-images' built-images object. Map
every entry into the chart by digest using helm-set. The successful job returns
that metadata as validated-images for docker-promote-images. This is a trusted
caller contract: the workflow cannot infer arbitrary chart value semantics.
Include this workflow and all other required checks in the promotion job's needs.

Set upload-artifact for a later publication job. The immutable artifact-id and
checksum identify this invocation's archive in this run (retained seven days); never select by a
wildcard or latest run. Failed/cancelled validation returns no successful outputs.
The release entrypoint composes this handoff without repeating validation.
Pin callers to a reviewed release SHA. See [ADR 0009](../../docs/adr/0009-compose-helm-validation-and-release-workflows.md).

### Permissions

- **`contents`**: `read`
- **`packages`**: `read`

<!-- overview:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**                   | **Description**                                                                           | **Required** | **Type**    | **Default**            |
| --------------------------- | ----------------------------------------------------------------------------------------- | ------------ | ----------- | ---------------------- |
| **`path`**                  | Repository-relative path to one root chart containing Chart.yaml.                         | **true**     | **string**  | -                      |
| **`ref`**                   | Git ref to validate; defaults to the caller's current ref.                                | **false**    | **string**  | -                      |
| **`name`**                  | Final root chart name; empty keeps Chart.yaml metadata.                                   | **false**    | **string**  | -                      |
| **`tag`**                   | Final chart version; empty keeps existing metadata.                                       | **false**    | **string**  | -                      |
| **`update-tag-paths`**      | Comma-separated local Chart.yaml paths updated with tag.                                  | **false**    | **string**  | `.version,.appVersion` |
| **`values`**                | Published values in prepare-chart's JSON format; never include test credentials.          | **false**    | **string**  | -                      |
| **`helm-repositories`**     | Dependency repositories, one name and URL per line; existing locks remain required.       | **false**    | **string**  | -                      |
| **`working-directory`**     | Repository-relative directory for chart-testing configuration and validation files.       | **false**    | **string**  | `.`                    |
| **`config`**                | Chart-testing configuration relative to working-directory; defaults to its ct.yaml.       | **false**    | **string**  | -                      |
| **`values-files`**          | Ordered validation-only values files, one per line, relative to working-directory.        | **false**    | **string**  | -                      |
| **`namespace`**             | Optional test namespace; otherwise a unique namespace is created.                         | **false**    | **string**  | -                      |
| **`helm-set`**              | Installation-only key=value overrides, one per line; map candidate images by digest here. | **false**    | **string**  | -                      |
| **`images`**                | Optional built-images JSON metadata for images mapped into the chart by helm-set.         | **false**    | **string**  | -                      |
| **`oci-registry`**          | Registry from which tests pull private images.                                            | **false**    | **string**  | `ghcr.io`              |
| **`oci-registry-username`** | Image registry username; defaults to the calling repository owner.                        | **false**    | **string**  | -                      |
| **`upload-artifact`**       | Upload the validated archive for publication in a downstream job.                         | **false**    | **boolean** | `false`                |
| **`runs-on`**               | JSON array of Linux runner labels; Docker is required for kind.                           | **false**    | **string**  | `["ubuntu-latest"]`    |
| **`timeout-minutes`**       | Maximum validation job duration, including setup and cluster tests.                       | **false**    | **number**  | `30`                   |

<!-- inputs:end -->
<!-- secrets:start -->

## Secrets

| **Secret**                  | **Description**                                                          | **Required** |
| --------------------------- | ------------------------------------------------------------------------ | ------------ |
| **`oci-registry-password`** | Read-only image registry credential; defaults to the job's GITHUB_TOKEN. | **false**    |

<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**             | **Description**                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **`validated-images`** | Supplied image metadata after successful validation and cleanup; empty on failure.  |
| **`artifact-id`**      | Immutable archive artifact ID in this run, only when upload-artifact is enabled.    |
| **`archive-name`**     | Archive basename inside the uploaded artifact.                                      |
| **`checksum`**         | SHA-256 of the validated chart archive bytes, not the artifact ZIP or OCI manifest. |

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
