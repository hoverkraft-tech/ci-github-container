# Continuous Integration - GitHub - Container

[![Continuous Integration](https://github.com/hoverkraft-tech/ci-github-container/actions/workflows/__main-ci.yml/badge.svg)](https://github.com/hoverkraft-tech/ci-github-container/actions/workflows/__main-ci.yml)
[![GitHub tag](https://img.shields.io/github/tag/hoverkraft-tech/ci-github-container?include_prereleases=&sort=semver&color=blue)](https://github.com/hoverkraft-tech/ci-github-container/releases/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Opinionated GitHub Actions and workflows for continuous integration in container (OCI) context

---

## Actions

### Docker

#### - [Build image](actions/docker/build-image/README.md)

#### - [Create images manifests](actions/docker/create-images-manifests/README.md)

#### - [Get image metadata](actions/docker/get-image-metadata/README.md)

#### - [Get image name](actions/docker/get-image-name/README.md)

#### - [Prune pull requests image tags](actions/docker/prune-pull-requests-image-tags/README.md)

### Helm

#### - [Generate chart documentation](actions/helm/generate-docs/README.md)

#### - [Parse chart URI](actions/helm/parse-chart-uri/README.md)

#### - [Release chart](actions/helm/release-chart/README.md)

#### - [Test chart](actions/helm/test-chart/README.md)

## Reusable Workflows

### - [Docker build images](.github/workflows/docker-build-images.md)

### - [Prune pull requests images tags](.github/workflows/prune-pull-requests-images-tags.md)

## Contributing

👍 If you wish to contribute to this project, please read the [CONTRIBUTING.md](CONTRIBUTING.md) file, PRs are Welcome !

## Author

🏢 **Hoverkraft <contact@hoverkraft.cloud>**

- Site: [https://hoverkraft.cloud](https://hoverkraft.cloud)
- GitHub: [@hoverkraft-tech](https://github.com/hoverkraft-tech)

## License

📝 Copyright © 2023 [Hoverkraft <contact@hoverkraft.cloud>](https://hoverkraft.cloud).<br />
This project is [MIT](LICENSE) licensed.
