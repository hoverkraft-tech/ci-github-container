<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:tag color:gray-dark>" /> GitHub Action: Get image name

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

Action to forge the name of a given image including registry, repository and given input image name

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container@0.17.3
  with:
    # Description: OCI registry to prefix the image full name
    #
    oci-registry: ""

    # Description: Repository name
    #
    # Default: ${{ github.repository }}
    repository: ""

    # Description: Additional image name
    #
    image: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                 | **Description**                            | **Default**                           | **Required** |
| ------------------------- | ------------------------------------------ | ------------------------------------- | ------------ |
| <code>oci-registry</code> | OCI registry to prefix the image full name |                                       | **false**    |
| <code>repository</code>   | Repository name                            | <code>${{ github.repository }}</code> | **false**    |
| <code>image</code>        | Additional image name                      |                                       | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| **Output**                            | **Description**                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| <code>image-name</code>               | Forged image name. Example: "my-org/my-repo/application"                             |
| <code>image-name-with-registry</code> | Forged image name containing registry. Example: "ghcr.io/my-org/my-repo/application" |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
