# Lösung 02 — Self-Attention

Die Dot Products sind `1`, `0`, `1`. Mit `dk=2` werden sie durch `√2` geteilt: ungefähr `0.7071`, `0`, `0.7071`. Die Softmax-Gewichte sind ungefähr:

```text
[0.4011, 0.1978, 0.4011]
```

Der Output ist damit ungefähr:

```text
0.4011*[10,0] + 0.1978*[0,10] + 0.4011*[5,5]
= [6.0165, 3.9945]
```

Ersetzt man `k2` durch `[1,0]`, erhalten `k1` und `k2` denselben Score. Die Attention verteilt dann fast gleich stark auf beide passende Keys; der Output verschiebt sich in Richtung einer Mischung aus `v1` und `v2`. Attention kopiert also nicht einfach das nächste Wort, sondern bildet einen gewichteten Kontext.
