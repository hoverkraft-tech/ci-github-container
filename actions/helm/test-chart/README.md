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
- uses: hoverkraft-tech/ci-github-container/actions/helm/test-chart@0.17.0
  with:
    # Set values for Helm chart.
    #  Multiple values can be set using multiline string.
    #  Example:
    #    key1=value1
    #    key2=value2
    helm-set: |
      key1=value1
      key2=value2
```

<!-- end usage -->
<!-- start inputs -->

| **Input** | **Description**                                                                                                              | **Default** | **Required** |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------ |
| helm-set  | Set values for Helm chart. Multiple values can be set using multiline string. Example: <code>key1=value1\nkey2=value2</code> | null        |  false       |

<!-- end inputs -->
<!-- start outputs -->

| **Output** | **Description** | **Default** | **Required** |
| ---------- | --------------- | ----------- | ------------ |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
