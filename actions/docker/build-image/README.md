<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:package color:gray-dark>" /> GitHub Action: Build image

<!-- end title -->
<!--
// jscpd:ignore-start
-->
<!-- start badges -->

<a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Freleases%2Flatest"><img src="https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20tag" /></a><a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Freleases%2Flatest"><img src="https://img.shields.io/github/release-date/hoverkraft-tech/ci-github-container?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20date" /></a><img src="https://img.shields.io/github/last-commit/hoverkraft-tech/ci-github-container?logo=github&style=flat-square" alt="Commit" /><a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Fissues"><img src="https://img.shields.io/github/issues/hoverkraft-tech/ci-github-container?logo=github&style=flat-square" alt="Open%20Issues" /></a><img src="https://img.shields.io/github/downloads/hoverkraft-tech/ci-github-container/total?logo=github&style=flat-square" alt="Downloads" />

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
- uses: hoverkraft-tech/ci-github-container@0.17.5
  with:
    # Description: OCI registry where to pull and push images
    #
    # Default: ghcr.io
    oci-registry: ""

    # Description: Username used to log against the OCI registry. See
    # <https://github.com/docker/login-action#usage>.
    #
    # Default: ${{ github.repository_owner }}
    oci-registry-username: ""

    # Description: Password or personal access token used to log against the OCI
    # registry. Can be passed in using "secrets.GITHUB_TOKEN". See
    # <https://github.com/docker/login-action#usage>.
    #
    # Default: ${{ github.token }}
    oci-registry-password: ""

    # Description: Repository name. Example: 'my-org/my-repo'. See
    # [Docker get-image-metadata action](../get-image-metadata/README.md).
    #
    # Default: ${{ github.repository }}
    repository: ""

    # Description: Additional image name. Example: 'application'. See
    # [Docker get-image-metadata action](../get-image-metadata/README.md).
    #
    image: ""

    # Description: Force image tag to publish
    #
    tag: ""

    # Description: Platform to build for. See
    # <https://github.com/docker/build-push-action#inputs>.
    #
    platform: ""

    # Description: Build's context is the set of files located in the specified PATH
    # or URL. See <https://github.com/docker/build-push-action#inputs>.
    #
    # Default: .
    context: ""

    # Description: Location of Dockerfile (defaults to Dockerfile). See
    # <https://github.com/docker/build-push-action#inputs>.
    #
    # Default: Dockerfile
    dockerfile: ""

    # Description: List of build-time variables. See
    # <https://github.com/docker/build-push-action#inputs>.
    #
    build-args: ""

    # Description: Sets the target stage to build. See
    # <https://github.com/docker/build-push-action#inputs>.
    #
    target: ""

    # Description: List of secrets to expose to the build. See
    # <https://docs.docker.com/build/ci/github-actions/secrets/>.
    #
    secrets: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                          | **Description**                                                                                                                                                                      | **Default**                                 | **Required** |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ------------ |
| <code>oci-registry</code>          | OCI registry where to pull and push images                                                                                                                                           | <code>ghcr.io</code>                        | **true**     |
| <code>oci-registry-username</code> | Username used to log against the OCI registry.<br />See <https://github.com/docker/login-action#usage>.                                                                              | <code>${{ github.repository_owner }}</code> | **true**     |
| <code>oci-registry-password</code> | Password or personal access token used to log against the OCI registry.<br />Can be passed in using "secrets.GITHUB_TOKEN".<br />See <https://github.com/docker/login-action#usage>. | <code>${{ github.token }}</code>            | **true**     |
| <code>repository</code>            | Repository name.<br />Example: 'my-org/my-repo'.<br />See [Docker get-image-metadata action](../get-image-metadata/README.md).                                                       | <code>${{ github.repository }}</code>       | **false**    |
| <code>image</code>                 | Additional image name.<br />Example: 'application'.<br />See [Docker get-image-metadata action](../get-image-metadata/README.md).                                                    |                                             | **false**    |
| <code>tag</code>                   | Force image tag to publish                                                                                                                                                           |                                             | **false**    |
| <code>platform</code>              | Platform to build for.<br />See <https://github.com/docker/build-push-action#inputs>.                                                                                                |                                             | **true**     |
| <code>context</code>               | Build's context is the set of files located in the specified PATH or URL.<br />See <https://github.com/docker/build-push-action#inputs>.                                             | <code>.</code>                              | **false**    |
| <code>dockerfile</code>            | Location of Dockerfile (defaults to Dockerfile).<br />See <https://github.com/docker/build-push-action#inputs>.                                                                      | <code>Dockerfile</code>                     | **false**    |
| <code>build-args</code>            | List of build-time variables.<br />See <https://github.com/docker/build-push-action#inputs>.                                                                                         |                                             | **false**    |
| <code>target</code>                | Sets the target stage to build.<br />See <https://github.com/docker/build-push-action#inputs>.                                                                                       |                                             | **false**    |
| <code>secrets</code>               | List of secrets to expose to the build.<br />See <https://docs.docker.com/build/ci/github-actions/secrets/>.                                                                         |                                             | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| **Output**               | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <code>built-image</code> | Built image data.<br />Example: {<br /> "name": "application",<br /> "registry": "ghcr.io",<br /> "repository": "my-org/my-repo/application",<br /> "tags": [<br /> "pr-63-5222075",<br /> "pr-63"<br /> ],<br /> "images": [<br /> "ghcr.io/my-org/my-repo/application:pr-63-5222075",<br /> "ghcr.io/my-org/my-repo/application:pr-63"<br /> ],<br /> "digests": [<br /> "ghcr.io/my-org/my-repo/application@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d"<br /> ],<br /> "annotations": {<br /> "org.opencontainers.image.created": "2021-09-30T14:00:00Z",<br /> "org.opencontainers.image.description": "Application image"<br /> }<br />} |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
