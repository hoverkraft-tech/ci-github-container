<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:package color:gray-dark>" /> GitHub Action: Create images manifests

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

Action to create built images manifests

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
- uses: hoverkraft-tech/ci-github-container@0.17.2
  with:
    # Description: OCI registry where to pull and push images
    #
    # Default: ghcr.io
    oci-registry: ""

    # Description: Username used to log against the OCI registry. See
    # <https://github.com/docker/login-action#usage>
    #
    # Default: ${{ github.repository_owner }}
    oci-registry-username: ""

    # Description: Password or personal access token used to log against the OCI
    # registry. Can be passed in using "secrets.GITHUB_TOKEN". See
    # <https://github.com/docker/login-action#usage>.
    #
    # Default: ${{ github.token }}
    oci-registry-password: ""

    # Description: Built images data. Example: { "application": { "name":
    # "application", "registry": "ghcr.io", "repository":
    # "my-org/my-repo/application", "tags": ["pr-63-5222075","pr-63"], "images": [
    # "ghcr.io/my-org/my-repo/application:pr-63-5222075",
    # "ghcr.io/my-org/my-repo/application:pr-63" ], "digests": [
    # "ghcr.io/my-org/my-repo/application@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d",
    # "ghcr.io/my-org/my-repo/application@sha256:0f5aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f402"
    # ], "annotations": { "org.opencontainers.image.created": "2021-09-30T14:00:00Z",
    # "org.opencontainers.image.description": "Application image" } } }
    #
    built-images: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                          | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | **Default**                                 | **Required** |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------ |
| <code>oci-registry</code>          | OCI registry where to pull and push images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | <code>ghcr.io</code>                        | **true**     |
| <code>oci-registry-username</code> | Username used to log against the OCI registry. See <https://github.com/docker/login-action#usage>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | <code>${{ github.repository_owner }}</code> | **true**     |
| <code>oci-registry-password</code> | Password or personal access token used to log against the OCI registry.<br />Can be passed in using "secrets.GITHUB_TOKEN".<br />See <https://github.com/docker/login-action#usage>.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | <code>${{ github.token }}</code>            | **true**     |
| <code>built-images</code>          | Built images data. Example: { "application": { "name": "application", "registry": "ghcr.io", "repository": "my-org/my-repo/application", "tags": ["pr-63-5222075","pr-63"], "images": [ "ghcr.io/my-org/my-repo/application:pr-63-5222075", "ghcr.io/my-org/my-repo/application:pr-63" ], "digests": [ "ghcr.io/my-org/my-repo/application@sha256:d31aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f49d", "ghcr.io/my-org/my-repo/application@sha256:0f5aa93410434ac9dcfc9179cac2cb1fd4d7c27f11527addc40299c7c675f402" ], "annotations": { "org.opencontainers.image.created": "2021-09-30T14:00:00Z", "org.opencontainers.image.description": "Application image" } } } |                                             | **true**     |

<!-- end inputs -->
<!-- start outputs -->

| **Output**              | **Description**                                                                                                                                         | **Default** | **Required** |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------ |
| <code>images</code>     | The images tags built. Example: ["ghcr.io/my-org/my-repo/application:pr-63-linux-amd64","ghcr.io/my-org/my-repo/application:pr-63-5222075-linux-amd64"] | undefined   | undefined    |
| <code>tag-suffix</code> | The platform tag suffix. Example: "-linux-amd64"                                                                                                        | undefined   | undefined    |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
