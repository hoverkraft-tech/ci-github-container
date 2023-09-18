<!-- start title -->

# GitHub Action: Delete GitHub registry image tags

<!-- end title -->
<!-- start description -->

Action to delete docker image tags from GitHub OCI registry

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/delete-image-tags@v0.10.0
  with:
    # Image name
    image: ""

    # Tag prefix to delete
    tag-prefix: ""

    # GitHub token with the packages:read and packages:delete scopes. See
    # [https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries)
    # Default: ${{ github.token }}
    github-token: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                     | **Description**                                                                                                                                                                                                                                                                                                                                                                | **Default**                      | **Required** |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | ------------ |
| **<code>image</code>**        | Image name                                                                                                                                                                                                                                                                                                                                                                     |                                  | **false**    |
| **<code>tag-prefix</code>**   | Tag prefix to delete                                                                                                                                                                                                                                                                                                                                                           |                                  | **false**    |
| **<code>github-token</code>** | GitHub token with the packages:read and packages:delete scopes. See [https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries) | <code>${{ github.token }}</code> | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| \***\*Output\*\***              | \***\*Description\*\***                                               | \***\*Default\*\*** | \***\*Required\*\*** |
| ------------------------------- | --------------------------------------------------------------------- | ------------------- | -------------------- |
| <code>deleted-image-tags</code> | The list of deleted tags for given image. Example: ["1.0.0", "1.0.1"] | undefined           | undefined            |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
