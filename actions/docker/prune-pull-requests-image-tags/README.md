<!-- start title -->

# GitHub Action: Checkout

<!-- end title -->
<!-- start description -->

Action to checkout the repository compatible for PRs, issues and push events. Workaround for [https://github.com/actions/checkout/issues/331](https://github.com/actions/checkout/issues/331)

<!-- end description -->
<!-- start contents -->
<!-- end contents -->

Set permissions to read contents and pull-requests. This is required to get the PR branch.

```yaml
on: issue_comment
permissions:
  contents: read
  pull-requests: read
```

<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-common/actions/checkout@v0.4.2
  with:
    # Number of commits to fetch. 0 indicates all history for all branches and tags.
    # See [https://github.com/actions/checkout#usage](https://github.com/actions/checkout#usage)
    # Default: 1
    fetch-depth: ""

    # Whether to download Git-LFS files. See [https://github.com/actions/checkout#usage](https://github.com/actions/checkout#usage)
    # Default: false
    lfs: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                    | **Description**                                                                                                                                                           | **Default**    | **Required** |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------ |
| **<code>fetch-depth</code>** | Number of commits to fetch. 0 indicates all history for all branches and tags. See [https://github.com/actions/checkout#usage](https://github.com/actions/checkout#usage) | <code>1</code> | **false**    |
| **<code>lfs</code>**         | Whether to download Git-LFS files. See [https://github.com/actions/checkout#usage](https://github.com/actions/checkout#usage)                                             |                | **false**    |

<!-- end inputs -->
<!-- start outputs -->
<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
