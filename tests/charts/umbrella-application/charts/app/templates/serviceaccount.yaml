{{- if .Values.serviceAccount.create -}}
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "app.serviceAccountName" . }}
  namespace: {{ .Values.namespace | default "app-system" }}
  labels:
    {{- include "app.labels" . | nindent 4 }}
  {{- with .Values.serviceAccount.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}
