# Übung 01 — End-to-End-Systemmodell

## Aufgabe

Erstelle ein Diagramm vom Textinput bis zum nächsten ausgegebenen Token. Markiere mindestens:

- Tokenizer und Token-IDs;
- Embedding Lookup und Positionsinformation;
- Q/K/V und Attention;
- Logits, Softmax und Decoding;
- was beim Training verändert wird und was bei der Inference nur berechnet wird.

Erkläre anschließend in 250–400 Wörtern den Unterschied zwischen Training und Inference. Nenne zwei Dinge, die durch einen Prompt nicht automatisch dauerhaft gelernt werden.

## Akzeptanz

- alle zehn Stationen sind korrekt benannt;
- Parameter/Gewichte sind von Aktivierungen und Input getrennt;
- der Datenfluss ist gerichtet und verständlich;
- die Erklärung enthält keine Aussage, dass das Modell den Prompt automatisch als neues Wissen speichert.
