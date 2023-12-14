<!-- start branding -->
<!-- end branding -->
<!-- start title -->

# GitHub Reusable Workflow: Docker build images

<!-- end title -->
<!-- start badges -->
<!-- end badges -->
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
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@0.14.3
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

      # Images to build parameters.
      # Example: [{
      #    "image": "application",
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

| **Secret**                             | **Description**                                                                                                                                                                                            |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **<code>oci-registry-password</code>** | Password or GitHub token (packages:read and packages:write scopes) used to log against the OCI registry. See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage). |

<!-- end secrets -->
<!-- start inputs -->

| **Input**                              | **Description**                                                                                                                                                                                                                                                                     | **Default**                                 | **Required** |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------ |
| **<code>runs-on</code>**               | Json array of runner(s) to use. See [https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job](https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job)                                                                                      | <code>["ubuntu-latest"]</code>              | **false**    |
| **<code>oci-registry</code>**          | OCI registry where to pull and push images                                                                                                                                                                                                                                          | <code>ghcr.io</code>                        | **false**    |
| **<code>oci-registry-username</code>** | Username used to log against the OCI registry. See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage)                                                                                                                                     | <code>${{ github.repository_owner }}</code> | **false**    |
| **<code>images</code>**                | Images to build parameters.                                                                                                                                                                                                                                                         |                                             | **true**     |
|                                        | Example: <code>[{"name": "application","context": ".","dockerfile": "./docker/application/Dockerfile","build-args": { "APP_PATH": "./application/", "PROD_MODE": "true" },"target": "prod","platforms": ["linux/amd64",{"name": "darwin/amd64","runs-on": "macos-latest"}]}]</code> |                                             |              |

<!-- end inputs -->

<!-- start outputs -->

| **Output**                    | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **<code>built-images</code>** | Built images data. Example: <code>{ "application": { "name": "application", "registry": "ghcr.io", "repository": "my-org/my-repo/application", "tags": ["pr-63-5222075","pr-63"], "images": [ "ghcr.io/my-org/my-repo/application:pr-63-5222075", "ghcr.io/my-org/my-repo/application:pr-63" ], "digests": [ "ghcr.io/my-org/my-repo/application@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d", "ghcr.io/my-org/my-repo/application@sha256:0f5aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f402" ], "annotations": { "org.opencontainers.image.created": "2021-09-30T14:00:00Z", "org.opencontainers.image.description": "Application image" } } }</code> |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
