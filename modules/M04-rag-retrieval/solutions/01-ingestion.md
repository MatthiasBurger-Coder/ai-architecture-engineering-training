# Referenz: Parsing, Chunking, Identität

Stabile document_id + version, source, ACL und content hash. Überschriften als Metadaten, Codeblöcke möglichst atomar; Overlap mittels Golden Queries prüfen. Deletes als Tombstones behandeln und alte Versionen aus Suchindex entfernen. Parsingfehler nie stillschweigend ignorieren.

## Reviewfragen
Welche Messung belegt den Anspruch? Wo fehlt im lokalen Labor Produktionsfunktionalität? Welche Daten oder Rechte könnten unerlaubt offengelegt werden?
