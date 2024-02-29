<!-- start branding -->
<!-- end branding -->
<!-- start title -->

# GitHub Action: Get image name

<!-- end title -->
<!-- start badges -->
<!-- end badges -->
<!-- start description -->

Action to forge the name of a given image including registry, repository and given input image name

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/get-image-name@v0.11.2
  with:
    # OCI registry to prefix the image full name
    oci-registry: ""

    # Repository name
    # Default: ${{ github.repository }}
    repository: ""

    # Additional image name
    image: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                     | **Description**                            | **Default**                           | **Required** |
| ----------------------------- | ------------------------------------------ | ------------------------------------- | ------------ |
| **<code>oci-registry</code>** | OCI registry to prefix the image full name |                                       | **false**    |
| **<code>repository</code>**   | Repository name                            | <code>${{ github.repository }}</code> | **false**    |
| **<code>image</code>**        | Additional image name                      |                                       | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| **Output**                            | **Description**                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| <code>image-name</code>               | Forged image name. Example: "my-org/my-repo/application"                             |
| <code>image-name-with-registry</code> | Forged image name containing registry. Example: "ghcr.io/my-org/my-repo/application" |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
