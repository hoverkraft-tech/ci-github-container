<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:package color:gray-dark>" /> GitHub Action: Get image metadata

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

Action to retrieve required metadata to build Docker image

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container@0.19.0
  with:
    # Description: OCI registry where to pull and push images
    #
    # Default: ghcr.io
    oci-registry: ""

    # Description: Repository name. Example: 'my-org/my-repo'. See
    # [Docker get-image-name action](../get-image-name/README.md)
    #
    # Default: ${{ github.repository }}
    repository: ""

    # Description: Additional image name. Example: 'application'. See
    # [Docker get-image-name action](../get-image-name/README.md)
    #
    image: ""

    # Description: Force image tag to publish
    #
    tag: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                 | **Description**                                                                                                | **Default**                           | **Required** |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------ |
| <code>oci-registry</code> | OCI registry where to pull and push images                                                                     | <code>ghcr.io</code>                  | **true**     |
| <code>repository</code>   | Repository name. Example: 'my-org/my-repo'. See [Docker get-image-name action](../get-image-name/README.md)    | <code>${{ github.repository }}</code> | **false**    |
| <code>image</code>        | Additional image name. Example: 'application'. See [Docker get-image-name action](../get-image-name/README.md) |                                       | **false**    |
| <code>tag</code>          | Force image tag to publish                                                                                     |                                       | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| **Output**               | **Description**                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------ |
| <code>image</code>       | Forged image name containing registry. Example: "ghcr.io/my-org/my-repo/application" |
| <code>labels</code>      | The image labels.                                                                    |
| <code>annotations</code> | The image annotations.                                                               |
| <code>tags</code>        | The image tags. Example: "pr-63-5222075\npr-63"                                      |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
