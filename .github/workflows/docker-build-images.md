<!-- start branding -->
<!-- end branding -->
<!-- start title -->

# GitHub Reusable Workflow: Docker build images

<!-- end title -->
<!-- start badges -->
<!-- end badges -->
<!-- start description -->

Workflow to build multiple docker images.
Build images using [Docker build-image action](../../actions/docker/build-image/README.md)
This includes [multi-platform](https://docs.docker.com/build/building/multi-platform/) build

Needs the following permissions:

- `contents`: `read`
- `issues`: `read`
- `packages`: `write`
- `pull-requests`: `read`
- `id-token`: `write` <!-- FIXME: This is a workaround for having workflow actions. See https://github.com/orgs/community/discussions/38659 -->

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

permissions:
  contents: read
  issues: read
  packages: write
  pull-requests: read
  # FIXME: This is a workaround for having workflow actions. See https://github.com/orgs/community/discussions/38659
  id-token: write

jobs:
  docker-build-images:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@0.17.5
    secrets:
      # Password or GitHub token (packages:read and packages:write scopes) used to log against the OCI registry.
      # See https://github.com/docker/login-action#usage.
      oci-registry-password: ${{ secrets.GITHUB_TOKEN }}

    # Optional customizations.
    with:
      # Json array of runner(s) to use.
      # See https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job
      # Default: '["ubuntu-latest"]'
      runs-on: '["ubuntu-latest"]'

      # OCI registry where to pull and push images.
      oci-registry: ""

      # Username used to log against the OCI registry. See https://github.com/docker/login-action#usage
      # Default: "${{ github.repository_owner }}"
      oci-registry-username: ""

      # Images to build parameters. Json array of objects.
      # Example: [{
      #    "name": "application",
      #    "dockerfile": "./docker/application/Dockerfile",
      #    "build-args": { "APP_PATH": "./application/", "PROD_MODE": "true" },
      #    "target": "prod",
      #    "platforms": [
      #        "linux/amd64",
      #        {
      #           "name": "darwin/amd64",
      #           "runs-on": "macos-latest"
      #        }
      #    ]
      # }]
      images: ""
```

<!-- end usage -->
<!-- start secrets -->

## Secrets

| **Secret**                             | **Description**                                                                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **<code>oci-registry-password</code>** | Password or GitHub token (packages:read and packages:write scopes) used to log against the OCI registry. See <https://github.com/docker/login-action#usage>. |

<!-- end secrets -->
<!-- start inputs -->

## Inputs

| **Input**                              | **Description**                                                                                                                                                                                                                                                                     | **Default**                                 | **Required** |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------ |
| **<code>runs-on</code>**               | Json array of runner(s) to use. See <https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job>                                                                                                                                                                   | <code>["ubuntu-latest"]</code>              | **false**    |
| **<code>oci-registry</code>**          | OCI registry where to pull and push images                                                                                                                                                                                                                                          | <code>ghcr.io</code>                        | **false**    |
| **<code>oci-registry-username</code>** | Username used to log against the OCI registry. See <https://github.com/docker/login-action#usage>                                                                                                                                                                                   | <code>${{ github.repository_owner }}</code> | **false**    |
| **<code>images</code>**                | Images to build parameters.                                                                                                                                                                                                                                                         |                                             | **true**     |
|                                        | Example: <code>[{"name": "application","context": ".","dockerfile": "./docker/application/Dockerfile","build-args": { "APP_PATH": "./application/", "PROD_MODE": "true" },"target": "prod","platforms": ["linux/amd64",{"name": "darwin/amd64","runs-on": "macos-latest"}]}]</code> |                                             |              |
| **<code>lfs</code>**                   | Enable Git LFS. See <https://github.com/actions/checkout?tab=readme-ov-file#usage>.                                                                                                                                                                                                 | <code>true</code>                           | **false**    |

<!-- end inputs -->

### Images entry parameters

| **Parameter**               | **Description**                                                                                                                                                                                                                                            | **Default**             | **Required** |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------ |
| **<code>name</code>**       | Image name. Must be unique. It is used as `image` in [Docker build-image action](../../actions/docker/build-image/README.md)                                                                                                                               |                         | **true**     |
| **<code>repository</code>** | Repository name. See [Docker build-image action](../../actions/docker/build-image/README.md)                                                                                                                                                               |                         | **false**    |
| **<code>context</code>**    | Build context. See [Docker build-image action](../../actions/docker/build-image/README.md)                                                                                                                                                                 | <code>.</code>          | **false**    |
| **<code>dockerfile</code>** | Location of Dockerfile. See [Docker build-image action](../../actions/docker/build-image/README.md)                                                                                                                                                        | <code>Dockerfile</code> | **false**    |
| **<code>build-args</code>** | List of build-time variables. See [Docker build-image action](../../actions/docker/build-image/README.md)                                                                                                                                                  |                         | **false**    |
| **<code>target</code>**     | Sets the target stage to build. See [Docker build-image action](../../actions/docker/build-image/README.md)                                                                                                                                                |                         | **true**     |
| **<code>platforms</code>**  | List of platforms to build for. It is used as `platform` in [Docker build-image action](../../actions/docker/build-image/README.md). Can be a string (Example: `linux/amd64`) or an object (Example: `{"name": "darwin/amd64","runs-on": "macos-latest"}`) |                         | **true**     |

#### Platforms entry parameters

| **Parameter**            | **Description**                                                                                                   | **Default** | **Required** |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------- | ------------ |
| **<code>name</code>**    | Platform name. Example: `linux/amd64`                                                                             |             | **true**     |
| **<code>runs-on</code>** | Json array of runner(s) to use. See <https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job> |             | **false**    |

##### Default `runs-on` strategy

If a platform entry omits the <code>runs-on</code> field, the following default strategy applies:

- When the main <code>docker-build-images</code> job uses a standard hosted runner, that runner is automatically matched to each platform.
- If the main <code>docker-build-images</code> job uses a custom or self-hosted runner, all platforms use the same runner.

<!-- start outputs -->

## Outputs

| **Output**                    | **Description**                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------- |
| **<code>built-images</code>** | Built images data. Example: <code>{ "application": { build-image-data } }</code> |

### Built image data

| **Parameter**                | **Description**                    | **Example**                                                                                                                |
| ---------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **<code>name</code>**        | Image name                         | `application`                                                                                                              |
| **<code>registry</code>**    | Registry where the image is stored | `ghcr.io`                                                                                                                  |
| **<code>repository</code>**  | Repository name                    | `my-org/my-repo/application`                                                                                               |
| **<code>tags</code>**        | List of tags                       | `["pr-63-5222075","pr-63"]`                                                                                                |
| **<code>images</code>**      | List of images                     | `["ghcr.io/my-org/my-repo/application:pr-63-5222075","ghcr.io/my-org/my-repo/application:pr-63"]`                          |
| **<code>digests</code>**     | List of digests                    | `["ghcr.io/my-org/my-repo/application@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d"]`           |
| **<code>annotations</code>** | List of annotations                | `{"org.opencontainers.image.created": "2021-09-30T14:00:00Z","org.opencontainers.image.description": "Application image"}` |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
