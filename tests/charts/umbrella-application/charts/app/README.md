# app

![Version: 0.0.0](https://img.shields.io/badge/Version-0.0.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.0.0](https://img.shields.io/badge/AppVersion-0.0.0-informational?style=flat-square)

An umbrella Helm chart for Kubernetes (app component)

## Values

| Key                                                              | Type   | Default                                                                     | Description |
| ---------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- | ----------- |
| affinity                                                         | object | `{}`                                                                        |             |
| app.dbConnection                                                 | string | `"valkey"`                                                                  |             |
| app.dbDatabase                                                   | string | `"test"`                                                                    |             |
| app.dbHost                                                       | string | `"database"`                                                                |             |
| app.dbPassword                                                   | string | `"test"`                                                                    |             |
| app.dbPort                                                       | int    | `6379`                                                                      |             |
| app.dbUsername                                                   | string | `"test"`                                                                    |             |
| app.healthCheckPath                                              | string | `"/"`                                                                       |             |
| autoscaling.enabled                                              | bool   | `false`                                                                     |             |
| autoscaling.maxReplicas                                          | int    | `100`                                                                       |             |
| autoscaling.minReplicas                                          | int    | `1`                                                                         |             |
| autoscaling.targetCPUUtilizationPercentage                       | int    | `80`                                                                        |             |
| autoscaling.targetMemoryUtilizationPercentage                    | int    | `80`                                                                        |             |
| fullnameOverride                                                 | string | `""`                                                                        |             |
| image.digest                                                     | string | `"sha256:da3b65f32ea75f8041079d220b72da4f605738996256a7dc32715424cc117271"` |             |
| image.pullPolicy                                                 | string | `"Always"`                                                                  |             |
| image.registry                                                   | string | `"ghcr.io"`                                                                 |             |
| image.repository                                                 | string | `"hoverkraft-tech/ci-github-container/application-test"`                    |             |
| image.tag                                                        | string | `""`                                                                        |             |
| imagePullSecrets                                                 | list   | `[]`                                                                        |             |
| ingress.annotations                                              | object | `{}`                                                                        |             |
| ingress.className                                                | string | `""`                                                                        |             |
| ingress.enabled                                                  | bool   | `false`                                                                     |             |
| ingress.hosts[0].host                                            | string | `"chart-example.local"`                                                     |             |
| ingress.hosts[0].paths[0].path                                   | string | `"/"`                                                                       |             |
| ingress.hosts[0].paths[0].pathType                               | string | `"ImplementationSpecific"`                                                  |             |
| ingress.tls                                                      | list   | `[]`                                                                        |             |
| nameOverride                                                     | string | `""`                                                                        |             |
| namespace                                                        | string | `"app-system"`                                                              |             |
| networkPolicy.egress                                             | list   | `[]`                                                                        |             |
| networkPolicy.enabled                                            | bool   | `true`                                                                      |             |
| networkPolicy.ingress                                            | list   | `[]`                                                                        |             |
| nodeSelector                                                     | object | `{}`                                                                        |             |
| podAnnotations                                                   | object | `{}`                                                                        |             |
| podSecurityContext.fsGroup                                       | int    | `10001`                                                                     |             |
| podSecurityContext.runAsGroup                                    | int    | `10001`                                                                     |             |
| podSecurityContext.runAsNonRoot                                  | bool   | `true`                                                                      |             |
| podSecurityContext.runAsUser                                     | int    | `10001`                                                                     |             |
| replicaCount                                                     | int    | `1`                                                                         |             |
| resources.limits.cpu                                             | string | `"100m"`                                                                    |             |
| resources.limits.memory                                          | string | `"128Mi"`                                                                   |             |
| resources.requests.cpu                                           | string | `"100m"`                                                                    |             |
| resources.requests.memory                                        | string | `"128Mi"`                                                                   |             |
| securityContext.allowPrivilegeEscalation                         | bool   | `false`                                                                     |             |
| securityContext.capabilities.drop[0]                             | string | `"ALL"`                                                                     |             |
| securityContext.readOnlyRootFilesystem                           | bool   | `true`                                                                      |             |
| securityContext.runAsGroup                                       | int    | `10001`                                                                     |             |
| securityContext.runAsNonRoot                                     | bool   | `true`                                                                      |             |
| securityContext.runAsUser                                        | int    | `10001`                                                                     |             |
| securityContext.seccompProfile.type                              | string | `"RuntimeDefault"`                                                          |             |
| service.port                                                     | int    | `8080`                                                                      |             |
| service.type                                                     | string | `"ClusterIP"`                                                               |             |
| serviceAccount.annotations                                       | object | `{}`                                                                        |             |
| serviceAccount.create                                            | bool   | `true`                                                                      |             |
| serviceAccount.name                                              | string | `""`                                                                        |             |
| tolerations                                                      | list   | `[]`                                                                        |             |
| valkey.architecture                                              | string | `"standalone"`                                                              |             |
| valkey.auth.enabled                                              | bool   | `false`                                                                     |             |
| valkey.enabled                                                   | bool   | `false`                                                                     |             |
| valkey.fullnameOverride                                          | string | `"valkey"`                                                                  |             |
| valkey.image.repository                                          | string | `"docker.io/valkey/valkey"`                                                 |             |
| valkey.primary.containerSecurityContext.allowPrivilegeEscalation | bool   | `false`                                                                     |             |
| valkey.primary.containerSecurityContext.capabilities.drop[0]     | string | `"ALL"`                                                                     |             |
| valkey.primary.containerSecurityContext.enabled                  | bool   | `true`                                                                      |             |
| valkey.primary.containerSecurityContext.readOnlyRootFilesystem   | bool   | `true`                                                                      |             |
| valkey.primary.containerSecurityContext.runAsGroup               | int    | `10001`                                                                     |             |
| valkey.primary.containerSecurityContext.runAsNonRoot             | bool   | `true`                                                                      |             |
| valkey.primary.containerSecurityContext.runAsUser                | int    | `10001`                                                                     |             |
| valkey.primary.containerSecurityContext.seccompProfile.type      | string | `"RuntimeDefault"`                                                          |             |
| valkey.primary.podSecurityContext.enabled                        | bool   | `true`                                                                      |             |
| valkey.primary.podSecurityContext.fsGroup                        | int    | `10001`                                                                     |             |
| valkey.primary.resources.limits.cpu                              | string | `"200m"`                                                                    |             |
| valkey.primary.resources.limits.memory                           | string | `"256Mi"`                                                                   |             |
| valkey.primary.resources.requests.cpu                            | string | `"100m"`                                                                    |             |
| valkey.primary.resources.requests.memory                         | string | `"128Mi"`                                                                   |             |

---

Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
