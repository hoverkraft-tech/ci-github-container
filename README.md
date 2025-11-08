<!-- markdownlint-disable-next-line first-line-heading -->
<div align="center" width="100%">

# <img src=".github/logo.svg" width="60px" align="center" alt="logo" /> Continuous Integration - GitHub - Container

[![Continuous Integration](https://github.com/hoverkraft-tech/ci-github-container/actions/workflows/__main-ci.yml/badge.svg)](https://github.com/hoverkraft-tech/ci-github-container/actions/workflows/__main-ci.yml)
[![GitHub tag](https://img.shields.io/github/tag/hoverkraft-tech/ci-github-container?include_prereleases=&sort=semver&color=blue)](https://github.com/hoverkraft-tech/ci-github-container/releases/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## Overview

Opinionated GitHub Actions and reusable workflows to build, test, sign, and distribute container images and Helm charts. The goal is to offer a consistent supply-chain friendly pipeline for OCI assets managed within GitHub Actions.

## Actions

### Docker

_Actions that operate on OCI images across their build, metadata, and lifecycle management phases._

#### - [Build image](actions/docker/build-image/README.md)

#### - [Clean images](actions/docker/clean-images/README.md)

#### - [Create images manifests](actions/docker/create-images-manifests/README.md)

#### - [Get image metadata](actions/docker/get-image-metadata/README.md)

#### - [Get image name](actions/docker/get-image-name/README.md)

#### - [Prune pull requests image tags](actions/docker/prune-pull-requests-image-tags/README.md)

#### - [Sign images](actions/docker/sign-images/README.md)

### Helm

_Actions dedicated to packaging, validating, and publishing Helm charts for Kubernetes deployments._

#### - [Generate chart documentation](actions/helm/generate-docs/README.md)

#### - [Parse chart URI](actions/helm/parse-chart-uri/README.md)

#### - [Release chart](actions/helm/release-chart/README.md)

#### - [Test chart](actions/helm/test-chart/README.md)

## Reusable Workflows

_Orchestrated workflows you can plug directly into repositories to automate container-focused CI routines._

### - [Docker build images](.github/workflows/docker-build-images.md)

### - [Prune pull requests images tags](.github/workflows/prune-pull-requests-images-tags.md)

## Contributing

Contributions are welcome! Please review the [contributing guidelines](CONTRIBUTING.md) before opening a PR.

### Action Structure Pattern

All actions follow a consistent layout:

```text
actions/{category}/{action-name}/
├── action.yml          # Action definition with inputs/outputs
├── README.md           # Usage documentation and examples
└── index.js / scripts  # Optional Node.js helpers (when required)
```

### Development Standards

#### Action Definition Standards

1. **Consistent branding**: Use `author: hoverkraft` with `color: blue` and a meaningful `icon`.
2. **Pinned dependencies**: Reference third-party actions via exact SHAs to guarantee reproducibility.
3. **Input validation**: Validate critical inputs early within composite steps or supporting scripts.
4. **Idempotent steps**: Ensure actions can run multiple times without leaving residual state in the workspace.
5. **Multi-platform support**: Test actions in both `ubuntu-latest` and `windows-latest` runners when applicable.
6. **Cross-platform compatibility**: Uses `actions/github-script` steps for cross-platform compatibility. Avoid `run` steps.
7. **Logging**: Use structured logs with clear prefixes (`[build-image]`, `[helm-test-chart]`, …) to simplify debugging.
8. **Security**: Avoid shell interpolation with untrusted inputs; prefer parameterized commands or `set -euo pipefail` wrappers.

#### File Conventions

- **Dockerfile**: Provides the Super Linter environment with UID/GID passthrough for local dev parity.
- **Tests**: Located in `tests/` with fixtures for container builds and chart-testing scenarios.
- **Workflows**: Reusable definitions live in `.github/workflows/`; internal/private workflows are prefixed with `__`.

#### JavaScript Development Patterns

- Encapsulate reusable logic in modules under the action directory (for example, `actions/my-action/index.js`).
- Prefer async/await with explicit error handling when interacting with the GitHub API or filesystem.
- Centralize environment variable parsing and validation to keep composite YAML lean.

#### Container Delivery Patterns

- Prefer multi-architecture builds via `docker buildx build` with explicit `--platform` lists.
- Surface provenance metadata through outputs (`image-name`, `digest`, etc.) to unblock downstream jobs.
- Keep secrets and registry credentials in GitHub environments or organization secrets—never hardcode them.

#### Helm Testing Patterns

- Use the chart fixtures under `tests/charts/` to exercise Helm-focused actions.
- Maintain `Chart.lock` files alongside `Chart.yaml` to document dependency revisions.
- Commit `ci/empty-values.yaml` templates for creating scenario-specific overrides.

### Development Workflow

#### Linting & Testing

```bash
make lint                 # Run the dockerized Super Linter
make lint-fix             # Attempt auto-fixes for lint findings

# Container & Helm validation helpers
make test-build-application  # Build and push the sample test application image
make test-ct-install         # Validate Helm charts via chart-testing
```

#### CI Testing Strategy

The repository includes comprehensive end-to-end tests for all local GitHub Actions. These tests follow an **Arrange-Act-Assert** pattern:

1. **Arrange**: Set up test fixtures and inputs (e.g., checkout code, prepare test context)
2. **Act**: Execute the action being tested with specific inputs
3. **Assert**: Validate outputs match expected values using `actions/github-script`

Test workflows are located in `.github/workflows/__test-action-*.yml` and `.github/workflows/__test-workflow-*.yml`. They run on:

- Push to `main` branch
- Push to tags (e.g., `v1.0.0`)
- Pull request events
- Scheduled runs (weekly)

**Tag-specific behavior**: When tests run on tag pushes, assertions dynamically adapt to expect the tag name (e.g., `v1.0.0`) instead of branch names. This ensures tests pass in all trigger contexts without hardcoding expected values.

## Author

🏢 **Hoverkraft <contact@hoverkraft.cloud>**

- Site: [https://hoverkraft.cloud](https://hoverkraft.cloud)
- GitHub: [@hoverkraft-tech](https://github.com/hoverkraft-tech)

## License

This project is licensed under the MIT License.

SPDX-License-Identifier: MIT

Copyright © 2025 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).
