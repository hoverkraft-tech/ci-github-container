<!-- start branding -->
<!-- end branding -->
<!-- start title -->

# GitHub Action: Get image metadata

<!-- end title -->
<!-- start badges -->
<!-- end badges -->
<!-- start description -->

Action to retrieve required metadata to build Docker image

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/get-image-metadata@v0.11.2
  with:
    # OCI registry where to pull and push images
    # Default: ghcr.io
    oci-registry: ""

    # Repository name. Example: 'my-org/my-repo'.
    # See [Docker get-image-name action](../get-image-name/README.md)
    # Default: ${{ github.repository }}
    repository:

    # Additional image name. Example: 'application'.
    # See [Docker get-image-name action](../get-image-name/README.md)
    # Default: ${{ github.repository }}
    image: ""

    # Force image tag to publish
    tag: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                     | **Description**                                                                                                | **Default**                           | **Required** |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------ |
| **<code>oci-registry</code>** | OCI registry where to pull and push images                                                                     | <code>ghcr.io</code>                  | **true**     |
| **<code>repository</code>**   | Repository name. Example: 'my-org/my-repo'. See [Docker get-image-name action](../get-image-name/README.md)    | <code>${{ github.repository }}</code> | **false**    |
| **<code>image</code>**        | Additional image name. Example: 'application'. See [Docker get-image-name action](../get-image-name/README.md) |                                       | **false**    |
| **<code>tag</code>**          | Force image tag to publish                                                                                     |                                       | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| **Output**          | **Description**                                                                      |
| ------------------- | ------------------------------------------------------------------------------------ |
| <code>image</code>  | Forged image name containing registry. Example: "ghcr.io/my-org/my-repo/application" |
| <code>labels</code> | The image labels.                                                                    |
| <code>tags</code>   | The image tags. Example: "pr-63-5222075\npr-63"                                      |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
