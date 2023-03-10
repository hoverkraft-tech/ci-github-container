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
  main:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@main
    secrets:
      # Password or personal access token used to log against the OCI registry.
      # Can be passed in using "secrets.GITHUB_TOKEN".
      # See https://github.com/docker/login-action#usage.
      password: ${{ secrets.GITHUB_TOKEN }}

    # Optional customizations.
    with:
      # OCI registry where to pull and push images.
      oci-registry: ""

      # Images to build parameters.
      # Example: [{
      #    "image": "application",
      #    "dockerfile": "./docker/application/Dockerfile",
      #    "build-args": { "APP_PATH": "./application/", "PROD_MODE": "true" },
      #    "target": "prod",
      #    "platforms": ["linux/amd64","linux/arm64","linux/arm/v7"]
      # }]
      images: ""

      # Username used to log against the OCI registry. See https://github.com/docker/login-action#usage
      # Default: "${{ github.repository_owner }}"
      username: ""
```

<!-- end usage -->
<!-- start secrets -->

| **Secret**                | **Description**                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **<code>password</code>** | Password or personal access token used to log against the OCI registry. Can be passed in using "secrets.GITHUB_TOKEN". See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage). |

<!-- end secrets -->
<!-- start inputs -->

| **Input**                      | **Description**                                 | **Default**                                                                   | **Required** |
| ------------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------- | ------------ |
| **<code>issue-message</code>** | Comment to post on an individual's first issue. | <code>Hi, thank for reporting an issue, we will check it out very soon</code> | **false**    |

<!-- end inputs -->

<!-- start outputs -->
<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
