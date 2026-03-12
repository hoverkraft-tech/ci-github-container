# Docker setup

Shared action used by the repository Docker actions to:

- resolve OCI registry inputs
- configure Docker when needed
- configure Docker Buildx
- authenticate to one or more OCI registries with `docker/login-action`

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/setup@main
  with:
    oci-registry: ghcr.io
    oci-registry-username: ${{ github.repository_owner }}
    oci-registry-password: ${{ github.token }}
    setup-docker: true
```

## Inputs

- `oci-registry`: OCI registry configuration used to pull, push and cache images.
- `oci-registry-username`: Username configuration used to log against OCI registries.
- `oci-registry-password`: Password or personal access token configuration used to log against OCI registries.
- `cache-type`: Cache type used to determine whether cache registry authentication is required.
- `built-images`: Optional built images payload used to resolve manifest publication registries.
- `setup-docker`: Whether to ensure the Docker CLI/engine is available on the runner.
- `setup-buildx`: Whether to install and configure Docker Buildx.

## Outputs

- `push-registry`: Registry used for published images/manifests.
- `cache-registry`: Registry used for registry-backed build cache.
- `pull-registries`: JSON array of registries used to pull base images.
- `registry-auth`: JSON object suitable for Docker login registry auth.
- `buildx-name`: Docker Buildx builder name.
