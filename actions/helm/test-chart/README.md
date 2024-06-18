<!-- start branding -->
<!-- end branding -->
<!-- start title -->

# GitHub Action: Test Helm Chart

<!-- end title -->
<!-- start badges -->
<!-- end badges -->
<!-- start description -->

Action to test a Helm chart. Mainly using [helm/chart-testing-action](https://github.com/helm/chart-testing-action)

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/helm/test-chart@v0.11.2
  with:
    # The extra parameter image.tag to pass to the helm release
    # defaults to null
    image-tag: "1.0.0"
```

<!-- end usage -->
<!-- start inputs -->

| **Input** | **Description**                                           | **Default** | **Required** |
| --------- | --------------------------------------------------------- | ----------- | ------------ |
| image-tag | The extra parameter image.tag to pass to the helm release | null        |  false       |

<!-- end inputs -->
<!-- start outputs -->

| **Output** | **Description** | **Default** | **Required** |
| ---------- | --------------- | ----------- | ------------ |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
