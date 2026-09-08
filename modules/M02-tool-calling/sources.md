# Quellen und Geltungsbereich

Stand der technischen Referenzprüfung: 2026-09-08. Die Lehrtexte sind eigene
Engineering-Erklärungen. Die folgenden Primärquellen definieren die verwendeten
Standards; das lokale Permission- und Envelope-Modell ist eine Laborentscheidung.

- [JSON Schema: Objektmodell](https://json-schema.org/understanding-json-schema/reference/object)
  — properties, required und zusätzliche Felder.
- [JSON Schema: Kombinationen](https://json-schema.org/understanding-json-schema/reference/combining)
  — anyOf und oneOf.
- [python-jsonschema: Validierung](https://python-jsonschema.readthedocs.io/en/stable/validate/)
  — Draft202012Validator, Schema- und Formatprüfung.
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods)
  — HTTP-Idempotenz; kein Beweis für Exactly once.

Kein Beispiel behauptet ein aktuelles Provider-Wireformat. Für eine reale
Integration sind SDK-Version, unterstütztes Schema-Subset, Refusal-/Streaming-
Format und Toolresultat-Korrelation anhand der jeweiligen Providerdokumentation
zu verifizieren. Dieses Modul benötigt dafür keine Modellabfrage.
