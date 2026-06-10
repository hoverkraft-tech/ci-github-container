{{- if .Values.database.enabled }}
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: database-custom-config
  namespace: {{ .Values.database.namespaceOverride | default .Release.Namespace | quote }}
  labels:
    app.kubernetes.io/name: database-custom-config
    app.kubernetes.io/instance: {{ .Release.Name | quote }}
data:
  README: "Custom Valkey config map placeholder."
{{- end }}
