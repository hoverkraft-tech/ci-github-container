---
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ include "app.fullname" . }}-test-connection"
  namespace: {{ .Values.namespace | default "app-system" }}
  labels:
    {{- include "app.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
spec:
  backoffLimit: 0
  template:
    metadata:
      labels:
        # Distinct labels so the chart's NetworkPolicy podSelector does not
        # match this hook pod (a dedicated NetworkPolicy is defined below).
        app.kubernetes.io/name: {{ include "app.name" . }}-test-connection
        app.kubernetes.io/instance: {{ .Release.Name }}
        app.kubernetes.io/component: test
        app.kubernetes.io/managed-by: {{ .Release.Service }}
        helm.sh/chart: {{ include "app.chart" . }}
    spec:
      automountServiceAccountToken: false
      securityContext:
        seccompProfile:
          type: RuntimeDefault
        runAsUser: 10001
        runAsNonRoot: true
      containers:
        - name: wget
          image: busybox@sha256:9ae97d36d26566ff84e8893c64a6dc4fe8ca6d1144bf5b87b2b85a32def253c7
          command: ['sh', '-ec']
          args:
            - |
              attempts=0
              until wget -T 5 -O /dev/null -q 'http://{{ include "app.fullname" . }}:{{ .Values.service.port }}/health/check/'; do
                attempts=$((attempts + 1))
                if [ "$attempts" -ge 30 ]; then
                  exit 1
                fi
                sleep 5
              done
          resources:
            limits:
              cpu: "100m"
              memory: "128Mi"
            requests:
              cpu: "100m"
              memory: "128Mi"
          securityContext:
            seccompProfile:
              type: RuntimeDefault
            readOnlyRootFilesystem: true
            runAsUser: 10001
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - NET_RAW
                - ALL
      restartPolicy: Never
{{- if .Values.networkPolicy.enabled }}
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: "{{ include "app.fullname" . }}-test-connection"
  namespace: {{ .Values.namespace | default "app-system" }}
  labels:
    {{- include "app.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: {{ include "app.name" . }}-test-connection
      app.kubernetes.io/instance: {{ .Release.Name }}
      app.kubernetes.io/component: test
  policyTypes:
    - Egress
  egress:
    - to: []
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
    - to:
        - podSelector:
            matchLabels:
              {{- include "app.selectorLabels" . | nindent 14 }}
      ports:
        - protocol: TCP
          port: {{ .Values.service.port }}
{{- end }}