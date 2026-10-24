# Referenz: Event-Replays und Tombstones

Upsert rev1 akzeptiert; identischer Replay ignoriert; Delete rev2 setzt Tombstone; verspätetes Upsert rev1 wird verworfen; erneutes Upsert rev3 akzeptiert. Für Produktion durable Ledger, konsistente Schreibreihenfolge, Recovery, Dead-Letter-Handling und Index-Watermark vorsehen. Batch ist valide, wenn Frischeanforderung nicht unter Updateintervall fällt.

## Reviewfragen
Welche Messung belegt den Anspruch? Wo fehlt im lokalen Labor Produktionsfunktionalität? Welche Daten oder Rechte könnten unerlaubt offengelegt werden?
