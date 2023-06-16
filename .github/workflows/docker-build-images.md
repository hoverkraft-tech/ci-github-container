<!-- start title -->

# GitHub Reusable Workflow: Docker build images

<!-- end title -->
<!-- start description -->

Workflow to build multiple docker images.
Build images using [Docker build image](https://github.com/hoverkraft-tech/ci-github-container/blob/main/actions/docker/build-image/README.md)
This includes [multi-platform](https://docs.docker.com/build/building/multi-platform/) build

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
name: Docker build images

on:
  merge_group:
  pull_request:
    branches: [main]

jobs:
  docker-build-images:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@0.8.1
    secrets:
      # Password or GitHub token (packages:read and packages:write scopes) used to log against the OCI registry.
      # See https://github.com/docker/login-action#usage.
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}

    # Optional customizations.
    with:
      # OCI registry where to pull and push images.
      oci-registry: ""

      # Username used to log against the OCI registry. See https://github.com/docker/login-action#usage
      # Default: "${{ github.repository_owner }}"
      oci-registry-username: ""

      # Images to build parameters.
      # Example: [{
      #    "image": "application",
      #    "dockerfile": "./docker/application/Dockerfile",
      #    "build-args": { "APP_PATH": "./application/", "PROD_MODE": "true" },
      #    "target": "prod",
      #    "platforms": ["linux/amd64","linux/arm64","linux/arm/v7"]
      # }]
      images: ""
```

<!-- end usage -->
<!-- start secrets -->

| **Secret**                             | **Description**                                                                                                                                                                                            |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **<code>oci-registry-password</code>** | Password or GitHub token (packages:read and packages:write scopes) used to log against the OCI registry. See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage). |

<!-- end secrets -->
<!-- start inputs -->

| **Input**                              | **Description**                                                                                                                                                                                                                                                                           | **Default**                                 | **Required** |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------ |
| **<code>oci-registry</code>**          | OCI registry where to pull and push images                                                                                                                                                                                                                                                | <code>ghcr.io</code>                        | **false**    |
| **<code>oci-registry-username</code>** | Username used to log against the OCI registry. See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage)                                                                                                                                           | <code>${{ github.repository_owner }}</code> | **false**    |
| **<code>images</code>**                | Images to build parameters. Example: <code>[{"name": "application","context": ".","dockerfile": "./docker/application/Dockerfile","build-args": { "APP_PATH": "./application/", "PROD_MODE": "true" },"target": "prod","platforms": ["linux/amd64","linux/arm64","linux/arm/v7"]}]</code> |                                             | **true**     |

<!-- end inputs -->

<!-- start outputs -->
<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
