<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:award color:blue>" /> GitHub Action: Docker - Sign images

<!-- end title -->
<!--
// jscpd:ignore-start
-->
<!-- markdownlint-disable MD013 -->
<!-- start badges -->

<a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Freleases%2Flatest"><img src="https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20tag" /></a><a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Freleases%2Flatest"><img src="https://img.shields.io/github/release-date/hoverkraft-tech/ci-github-container?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20date" /></a><img src="https://img.shields.io/github/last-commit/hoverkraft-tech/ci-github-container?logo=github&style=flat-square" alt="Commit" /><a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Fissues"><img src="https://img.shields.io/github/issues/hoverkraft-tech/ci-github-container?logo=github&style=flat-square" alt="Open%20Issues" /></a><img src="https://img.shields.io/github/downloads/hoverkraft-tech/ci-github-container/total?logo=github&style=flat-square" alt="Downloads" />

<!-- end badges -->
<!-- markdownlint-enable MD013 -->
<!--
// jscpd:ignore-end
-->
<!-- start description -->

Action to sign OCI images.
It is based on [cosign](https://github.com/sigstore/cosign).
It signs the images with the GitHub Actions OIDC token.
If the provided image does not have a digest, it will retrieve the digest using `docker buildx imagetools inspect`.

<!-- end description -->
<!-- start contents -->
<!-- end contents -->

If default GitHub token is used, the following permissions are required:

```yml
permissions:
  id-token: write
```

<!-- start usage -->

````yaml
- uses: hoverkraft-tech/ci-github-container@0.26.0
  with:
    # Description: Images to sign. Can be a single image or a list of images separated
    # by commas or newlines or spaces. The images should be in the format
    # `ghcr.io/my-org/my-repo/application:pr-63-5222075`. It can also be a list of
    # images in JSON format. Example:
    #
    # ```
    #   [
    #     "ghcr.io/my-org/my-repo/application:pr-63-5222075",
    #     "ghcr.io/my-org/my-repo/application:pr-63"
    #   ]
    # ```
    #
    images: ""

    # Description: GitHub Token to sign the image. Permissions:
    #
    # - id-token: write
    #
    # Default: ${{ github.token }}
    github-token: ""
````

<!-- end usage -->
<!-- start inputs -->

| **Input**                 | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Default**                      | **Required** |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------ |
| <code>images</code>       | Images to sign.<br />Can be a single image or a list of images separated by commas or newlines or spaces.<br />The images should be in the format <code>ghcr.io/my-org/my-repo/application:pr-63-5222075</code>.<br />It can also be a list of images in JSON format.<br />Example:<br /><code></code><code><br /> [<br /> "ghcr.io/my-org/my-repo/application:pr-63-5222075",<br /> "ghcr.io/my-org/my-repo/application:pr-63"<br /> ]<br /></code><code></code> |                                  | **true**     |
| <code>github-token</code> | GitHub Token to sign the image.<br />Permissions:<br /> - id-token: write                                                                                                                                                                                                                                                                                                                                                                                         | <code>${{ github.token }}</code> | **false**    |

<!-- end inputs -->
<!-- markdownlint-disable MD013 -->
<!-- start outputs -->
<!-- end outputs -->
<!-- markdownlint-enable MD013 -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
