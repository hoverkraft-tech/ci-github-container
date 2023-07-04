<!-- start title -->

# GitHub Action: Get image name

<!-- end title -->
<!-- start description -->

Action to forge the name of a given image including registry, repository and given input image name

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/get-image-name@v0.9.2
  with:
    # OCI registry to prefix the image full name
    oci-registry: ""

    # Additional Image name
    image: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                     | **Description**                            | **Default** | **Required** |
| ----------------------------- | ------------------------------------------ | ----------- | ------------ |
| **<code>oci-registry</code>** | OCI registry to prefix the image full name |             | **false**    |
| **<code>image</code>**        | Additional Image name                      |             | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| \***\*Output\*\***                    | \***\*Description\*\***                                                              | \***\*Default\*\*** | \***\*Required\*\*** |
| ------------------------------------- | ------------------------------------------------------------------------------------ | ------------------- | -------------------- |
| <code>image-name</code>               | Forged image name. Example: "my-org/my-repo/application"                             | undefined           | undefined            |
| <code>image-name-with-registry</code> | Forged image name containing registry. Example: "ghcr.io/my-org/my-repo/application" | undefined           | undefined            |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
