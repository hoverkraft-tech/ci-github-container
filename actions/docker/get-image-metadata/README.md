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

    # Additional Image name
    image: ""

    # Force image tag to publish
    tag: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                     | **Description**                            | **Default**          | **Required** |
| ----------------------------- | ------------------------------------------ | -------------------- | ------------ |
| **<code>oci-registry</code>** | OCI registry where to pull and push images | <code>ghcr.io</code> | **true**     |
| **<code>image</code>**        | Additional Image name                      |                      | **false**    |
| **<code>tag</code>**          | Force image tag to publish                 |                      | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| \***\*Output\*\***  | \***\*Description\*\***                                                              | \***\*Default\*\*** | \***\*Required\*\*** |
| ------------------- | ------------------------------------------------------------------------------------ | ------------------- | -------------------- |
| <code>image</code>  | Forged image name containing registry. Example: "ghcr.io/my-org/my-repo/application" | undefined           | undefined            |
| <code>labels</code> | The image labels.                                                                    | undefined           | undefined            |
| <code>tags</code>   | The image tags. Example: "pr-63-5222075\npr-63"                                      | undefined           | undefined            |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
