<!-- start title -->

# GitHub Action: Build image

<!-- end title -->
<!--
// jscpd:ignore-start
-->
<!-- start badges -->
<!-- end badges -->
<!--
// jscpd:ignore-end
-->
<!-- start description -->

Action to build an image with Docker for a specific platform

<!-- end description -->
<!-- start contents -->
<!-- end contents -->

If default GitHub token is used, the following permissions are required:

```yml
permissions:
  contents: read
  packages: write
```

<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/build-image@v0.11.2
  with:
    # OCI registry where to pull and push images
    # Default: ghcr.io
    oci-registry: ""

    # Username used to log against the OCI registry. See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage)
    # Default: ${{ github.repository_owner }}
    oci-registry-username: ""

    # Password or personal access token used to log against the OCI registry. Can be
    # passed in using "secrets.GITHUB_TOKEN". See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage)
    # Default: ${{ github.token }}
    oci-registry-password: ""

    # Additional image name. Example: 'application'.
    # See [Docker get-image-metadata action](../get-image-metadata/README.md)
    image: ""

    # Repository name. Example: 'my-org/my-repo'.
    # See [Docker get-image-metadata action](../get-image-metadata/README.md)
    # Default: "${{ github.repository }}"
    repository: ""

    # Platform to build for. See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)
    platform: ""

    # Build's context is the set of files located in the specified PATH or URL. See
    # [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)
    # Default: .
    context: ""

    # Location of Dockerfile (defaults to Dockerfile). See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)
    # Default: Dockerfile
    dockerfile: ""

    # List of build-time variables. See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)
    build-args: ""

    # Sets the target stage to build. See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)
    target: ""

    # Labels to apply to the built image. See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)
    labels: ""

    # Annotations to apply to the built image. See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)
    annotations: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                              | **Description**                                                                                                                                                                                                         | **Default**                                 | **Required** |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------ |
| **<code>oci-registry</code>**          | OCI registry where to pull and push images                                                                                                                                                                              | <code>ghcr.io</code>                        | **true**     |
| **<code>oci-registry-username</code>** | Username used to log against the OCI registry. See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage)                                                                         | <code>${{ github.repository_owner }}</code> | **true**     |
| **<code>oci-registry-password</code>** | Password or personal access token used to log against the OCI registry. Can be passed in using "secrets.GITHUB_TOKEN". See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage) | <code>${{ github.token }}</code>            | **true**     |
| **<code>repository</code>**            | Repository name. Example: 'my-org/my-repo'. See [Docker get-image-metadata action](../get-image-metadata/README.md)                                                                                                     | <code>${{ github.repository }}</code>       | **true**     |
| **<code>image</code>**                 | Additional image name. Example: 'application'. See [Docker get-image-metadata action](../get-image-metadata/README.md)                                                                                                  |                                             | **true**     |
| **<code>platform</code>**              | Platform to build for. See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)                                                                                     |                                             | **true**     |
| **<code>context</code>**               | Build's context is the set of files located in the specified PATH or URL. See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)                                  | <code>.</code>                              | **false**    |
| **<code>dockerfile</code>**            | Location of Dockerfile (defaults to Dockerfile). See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)                                                           | <code>Dockerfile</code>                     | **false**    |
| **<code>build-args</code>**            | List of build-time variables. See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)                                                                              |                                             | **false**    |
| **<code>target</code>**                | Sets the target stage to build. See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)                                                                            |                                             | **false**    |
| **<code>labels</code>**                | Labels to apply to the built image. See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)                                                                        |                                             | **false**    |
| **<code>annotations</code>**           | Annotations to apply to the built image. See [https://github.com/docker/build-push-action#inputs](https://github.com/docker/build-push-action#inputs)                                                                   |                                             | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| \***\*Output\*\***  | \***\*Description\*\***                                                                                       | \***\*Default\*\*** | \***\*Required\*\*** |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------- |
| <code>image</code>  | Name of the built image. Example: "ghcr.io/my-org/my-repo/application"                                        | undefined           | undefined            |
| <code>digest</code> | Digest of the built image. Example: "sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" | undefined           | undefined            |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
