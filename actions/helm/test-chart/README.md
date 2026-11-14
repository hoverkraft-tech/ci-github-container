<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItY2hlY2stY2lyY2xlIiBjb2xvcj0iYmx1ZSI+PHBhdGggZD0iTTIyIDExLjA4VjEyYTEwIDEwIDAgMSAxLTUuOTMtOS4xNCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjIyIDQgMTIgMTQuMDEgOSAxMS4wMSI+PC9wb2x5bGluZT48L3N2Zz4=) GitHub Action: Test Helm Chart

<!-- header:end -->
<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-test--helm--chart-blue?logo=github-actions)](https://github.com/marketplace/actions/test-helm-chart)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container)](https://github.com/hoverkraft-tech/ci-github-container/releases)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-container?style=social)

<!-- badges:end -->
<!-- overview:start -->

## Overview

Install selected source Helm charts in a fresh kind cluster and run their Helm tests
using [helm/chart-testing-action](https://github.com/helm/chart-testing-action).
Run static validation separately with [Lint Helm Chart](../lint-chart/README.md)
before calling this action.

<!-- overview:end -->
<!-- inputs:start -->

## Inputs

| **Input**                   | **Description**                                                                                     | **Required** | **Default**                      |
| --------------------------- | --------------------------------------------------------------------------------------------------- | ------------ | -------------------------------- |
| **`working-directory`**     | Working directory                                                                                   | **false**    | `${{ github.workspace }}`        |
| **`namespace`**             | Namespace used to install test releases.                                                            | **false**    | -                                |
|                             | Defaults to a random namespace created for the current workflow run.                                |              |                                  |
| **`helm-set`**              | Set values for Helm chart.                                                                          | **false**    | -                                |
|                             | Multiple values can be set using multiline string.                                                  |              |                                  |
|                             | Example:                                                                                            |              |                                  |
|                             | <!-- textlint-disable --><pre lang="text">key1=value1&#13;key2=value2</pre><!-- textlint-enable --> |              |                                  |
| **`helm-repositories`**     | List of Helm repositories to add before testing charts.                                             | **false**    | -                                |
|                             | See <https://helm.sh/docs/helm/helm_repo_add/>.                                                     |              |                                  |
| **`oci-registry`**          | OCI registry where to pull and push images                                                          | **false**    | `ghcr.io`                        |
| **`oci-registry-username`** | Username used to log against the OCI registry.                                                      | **false**    | `${{ github.repository_owner }}` |
|                             | See <https://github.com/docker/login-action#usage>.                                                 |              |                                  |
| **`oci-registry-password`** | Password or personal access token used to log against the OCI registry.                             | **false**    | `${{ github.token }}`            |
|                             | Can be passed in using `secrets.GITHUB_TOKEN`.                                                      |              |                                  |
|                             | See <https://github.com/docker/login-action#usage>.                                                 |              |                                  |
| **`check-diff-only`**       | Only run installation tests on changed charts.                                                      | **false**    | `true`                           |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->
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
