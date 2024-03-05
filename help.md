---
layout: default
---

# Sudoku-Trainer
- [Sudoku-Trainer Installation](#sudoku-trainer-installation)
- [Einführung in die App](#einführung-in-die-app)
    - [Ein Trainer für klassisches Sudoku](#ein-trainer-für-klassisches-sudoku)
    - [Sudoku-Puzzle](#sudoku-puzzle)
    - [Die möglichen Inhalte einer Sudoku-Zelle](#die-möglichen-inhalte-einer-sudoku-zelle)
    - [Zwei Spielphasen](#zwei-spielphasen)
    - [Jeder Lösungsschritt mit zwei Subschritten](#jeder-lösungsschritt-mit-zwei-subschritten)
    - [Trainer-Operationen](#trainer-operationen)
        - [Initialisieren](initialisieren)            
        - [Zurücksetzen](#zurücksetzen)
        - [Undo/Redo](#undoredo)
        - [Puzzle prüfen](#puzzle-prüfen)
        - [Puzzle speichern](#puzzle-speichern)
        - [Neues Puzzle generieren](#neues-puzzle-generieren)
        - [Puzzle drucken](#puzzle-drucken)
    - [Trainer-Einstellungen](#trainer-einstellungen)
        - [Einstellung Kandidatenauswertung](#einstellung-kandidatenauswertung)
        - [Einstellung Spielmodus](#einstellung-spielmodus)
        - [Einstellung Technik](#einstellung-technik)
    - [Die Lösungssuche des Solvers](#die-lösungssuche-des-solvers)
        - [Wie wählt der Solver die nächste Zelle und die in ihr zu setzende Nummer?](#wie-wählt-der-solver-die-nächste-zelle-und-die-in-ihr-zu-setzende-nummer)
        - [Wie prüft der Solver die neu gesetzte Nummer?](#wie-prüft-der-solver-die-neu-gesetzte-nummer)
        - [Vorwärts und Rückwärts (Backtracking)](#vorwärts-und-rückwärts-backtracking)
- [Nutzungsformen des Sudoku-Trainers](#nutzungsformen-des-sudoku-trainers)
    - [Rein manuelles Lösen](#rein-manuelles-lösen)
    - [Training (Automatische Schrittausführung nur im Bedarfsfall)](#training-automatische-schrittausführung-nur-im-bedarfsfall)
    - [Training (Ausschließlich automatische Schrittausführung)](#training-ausschließlich-automatische-schrittausführung)
    - [Vollautomatisches Lösen](#vollautomatisches-lösen)
- [Puzzle-Datenbank](#puzzle-datenbank)
    - [Operationen der Datenbank](#operationen-der-datenbank)
    - [Import/Export und Teilen von Puzzles](#importexport-und-teilen-von-puzzles)
        - [Teilen der Sudoku-Trainer-App URL](#teilen-der-sudoku-trainer-app-url)
        - [Puzzle von SmartPhone zu SmartPhone](#puzzle-von-smartphone-zu-smartphone)
        - [Puzzle Datenbank vom PC auf das Smartphone übertragen](#puzzle-datenbank-vom-pc-auf-das-smartphone-übertragen)
    - [Die initiale Datenbank ist nicht leer](#die-initiale-datenbank-ist-nicht-leer)
- [Sudoku-Theorie](#sudoku-theorie)
    - [Unzulässige Nummern und Kandidaten](#unzulässige-nummern-und-kandidaten)
    - [Notwendige Nummern](#notwendige-nummern)
    - [Unzulässige Kandidaten](#unzulässige-kandidaten)
        - [Kriterien für die Erkennung unzulässiger Kandidaten](#kriterien-für-die-erkennung-unzulässiger-kandidaten)
        - [Methoden der Kandidatenauswertung](#methoden-der-kandidatenauswertung)
        - [Vergleich der Auswertungsmodi Lazy und Strikt](#vergleich-der-auswertungsmodi-lazy-und-strikt)
    - [Widerspruchsvolle Puzzles](#widerspruchsvolle-puzzles)
        - [Widerspruchsvolle Zellen](#widerspruchsvolle-zellen)
        - [Widerspruchsvolle Gruppen](#widerspruchsvolle-gruppen)
    - [Schwierigkeitsgrade](#schwierigkeitsgrade)
    - [Faire Puzzles](#faire-puzzles)
- [Sudoku im Internet](#sudoku-im-internet)

# Sudoku-Trainer Installation

Technisch gesehen ist die App Sudoku-Trainer eine progressive Web-App (PWA) . Als solche besitzt sie eine URL. Für die Installation benötigt man lediglich diese URL. Moderne Browser erkennen an der Manifest-Datei im Startverzeichnis, dass es sich um eine Web-App handelt, und zeigen die Möglichkeit der Installation an. Die Installation einer Web-App in einem Browser ist sehr einfach, siehe etwa [Installation-Web-App](https://support.google.com/chrome/answer/9658361?hl=de&co=GENIE.Platform%3DAndroid&oco=1). Nachfolgend ein Beisiel für Chrome und Edge auf einem Android-Gerät. Führe folgende Schritte durch:

1. Öffne auf deinem Android-Gerät den Browser Chrome.
1. Rufe die Website (https://hubertbertling.github.io/sudokuSolver/) auf.
![Installation Chrome](./images/install.png){: style="margin:10px" width="500px"}
1. Tippe auf Installieren.
1. Folge der Anleitung auf dem Bildschirm.

Beim Browser Edge sieht es so aus:

{: style="text-align:center"}
![Installation Edge](./images/installEdge.png){: width="500px"}

# Einführung in die App

## Ein Trainer für klassisches Sudoku

Diese App ist ein Trainer für klassisches Sudoku. Der [Sudoku-Trainer](https://hubertbertling.github.io/sudokuSolver/) kann manuell oder automatisch genutzt werden. Seine Besonderheit: man kann ihm bei der automatischen Suche nach der Lösung zuschauen und damit seine eigene Lösungskompetenz trainieren. Bei jeder automatischen Setzung einer Nummer zeigt der Solver den logischen Grund für die Setzung. Der Anwender kann ein Puzzle manuell lösen, oder Schritt für Schritt automatisch oder vollautomatisch. In der Schritt für Schritt zeigt der Solver den Grund für seine Nummernsetzung an. Vollautomatisch löst der Solver jedes Puzzle in wenigen Sekunden oder erkennt es als nicht lösbar (weil es widersprüchlich ist).
  
{: style="text-align:center"}
![Architektur](./images/Architektur.png){: width="300px"}

Der Sudoku-Trainer besteht aus drei Komponenten, dem Solver, dem Generator und der Puzzle-Datenbank. Mit Hilfe des Solvers kann man beliebige Sudoku-Puzzles manuell oder automatisch lösen.

Der Generator generiert faire Puzzles mit den Schwierigkeitsgraden 'Sehr leicht', 'Leicht', 'Mittel' und 'Schwer'. Im Gegensatz zu 'Sehr schweren' oder 'Extrem schweren' Puzzles können faire Puzzles allein durch logisches Schließen gelöst werden. Sie benötigen kein "Backtracking", kein Raten und Probieren.

Der Spielstand von Sudoku-Puzzles kann im lokalen Speicher des Browsers gespeichert werden. Die Tabelle (Datenbank) der gespeicherten Puzzles kann nach ihren Spalten sortiert werden.

## Sudoku-Puzzle

Die nachfolgend verwendeten Bezeichnungen sind im Laufe der Entwicklung dieses Trainers entstanden. Sie unterstützen primär das Verständnis dieses Trainers. Dennoch haben wir uns bemüht, Standardbegriffe zu verwenden, wie man sie im Internet findet, beispielsweise in [Wikipedia](https://en.wikipedia.org/wiki/Glossary_of_Sudoku). Eine herausragende Seite für Sudoku-Interessierte ist die Seite von [Andrew Stuart](https://www.sudokuwiki.org/Main_Page).

![Anwendungsansicht](./images/AppView.png)

Ein **Sudoku-Puzzle** ist eine partiell gefüllte Tabelle. Die Tabelle hat 9 **Reihen**, 9 **Spalten** und 9 **Blöcke**. Die initial gesetzten Nummern heißen **Givens**. Sie werden blau unterlegt angezeigt. Grün unterlegte Zellen enthalten Lösungsnummern, die vom Spieler oder dem Solver gesetzt wurden. Die Tabelle besitzt Reihen, Spalten und Blöcke. Eine Reihe, eine Spalte oder ein Block wird auch als Gruppe bezeichnet.

Der Spieler kann sich bei der Lösungssuche unterstützen lassen, indem er in den noch nicht gesetzten Zellen [Kandidatennummern](#unzulässige-nummern-und-kandidaten) anzeigen lässt. Damit die Kandidatennummern angezeigt werden, muss in der [Werkzeugseinstellung](#einstellung-kandidatenauswertung) der entsprechende Parameter gesetzt sein.

![Anwendungsansicht](./images/AppView2.png)


## Die möglichen Inhalte einer Sudoku-Zelle

|Zelle  |Bedeutung  |
|---------|---------|
|![Given](./images/definedCell.png){:width="100px"}|**Eine gegebene Nummer (Given):** In der Definitionsphase gesetzte Nummer.|
|![Solved](./images/playedCell.png){:width="100px"}|**Eine Lösungsnummer:** In der Lösungsphase gesetzte Nummer. In dieser Zelle wurde in der Lösungsphase manuell oder automatisch die Nummer 1 gesetzt.|
|![Candiates](./images/optionCell.png){:width="100px"}|**Kandidaten:** Für diese Zelle wurde noch keine Nummer gesetzt. Nur noch eine der Nummern 1, 2, 4 und 5 kann gewählt werden. Das sind die Kandidaten der Zelle. Die nicht aufgeführten Nummern sind unzulässig, weil sie bereits in einer anderen Zelle des Blocks, der Reihe oder Spalte gesetzt sind.|
|![Necessary](./images/neccessary.png){:width="100px}|**Notwendige Nummer:** Für die nebenstehende Zelle wurde noch keine Nummer gesetzt. Kandidatnummern sind die Nummern 2, 5, 6 und 7. Jedoch hat der Solver ermittelt, dass die Nummer 5 notwendig ist, damit das Sudoku lösbar bleibt. 5 ist eine notwendige Nummer für diese Zelle. Eine Nummer in einer Zelle ist notwendig, wenn die Nummer in ihrem Block, in ihrer Reihe oder Spalte einzig ist. D.h. sie kann nur noch hier gesetzt werden. Hinweis: Im Wikipedia-Artikel [Wikipedia](https://en.wikipedia.org/wiki/Glossary_of_Sudoku) werden notwendige Nummern als "Hidden Singles" bezeichnet. Wir wollen diese Bezeichnung hier nicht übernehmen, weil wir diese Bezeichnung schon anderweitig benutzen: siehe nachfolgende Definition 'Hidden Single'.|
|![Inadmissible candidates](./images/indirect.png){:width="100px}|**Unzulässige Kandidatnummer:** Für die nebenstehende Zelle wurde noch keine Nummer gesetzt. Kandidaten dieser Zelle sind die drei Nummern 1, 3 und 6. Jedoch hat der Solver ermittelt, dass die Kandidatnummer 3 [unzulässig](#unzulässige-nummern-und-kandidaten) ist. Wenn man sie setzen würde, würde der Solver sofort oder einige Schritte später die Widersprüchlichkeit des Puzzles feststellen.|
|![Single](./images/direkterSingle.png){:width="100px"}| **Single:** Eine Single-Nummer ist der Kandidat in einer Zelle, wenn es keine weiteren Kandidaten in der Zelle gibt. Im nebenstehendem Beispiel ist 1 ein Single.|
|![Hidden single](./images/indirekterSingle.png){:width="100px"}|**Hidden Single:** im nebenstehenden Beispiel ist die 9 ein Hidden Single. Die 9 ist in dieser Zelle ein Hidden Single, weil die anderen Kandidaten, die rote 5 und 6, unzulässige Kandidaten sind.|
|![No selectable candidates](./images/nochoice.png){: width="100px"} ![No candidates at all](./images/nochoice2.png){:width="100px"}|**Widerspruch - Überhaupt kein zulässiger Kandidat:** Für diese Zelle wurde noch keine Nummer gesetzt. Allerdings gibt es keine Kandidatennummer mehr, die noch gesetzt werden könnte. Die Kandidaten 4 und 8 sind unzulässig. In der zweiten dargestellten Zelle gibt es nicht mal mehr Kandidatnummern. D.h. das Puzzle ist widersprüchlich. Wenn das Puzzle noch erfolgreich gelöst werden soll, müssen ein oder mehrere der bisherigen Nummernsetzungen zurückgenommen werden. Tritt während der automatischen Ausführung eine solche Zelle auf, schaltet der Solver in den Rückwärts-Modus um.|
|![MoreThanOneNecessary](./images/twoNeccessary.png){:width="100px"}|**Widerspruch - Gleichzeitig verschiedene notwendige Nummern:** Für diese Zelle wurde noch keine Nummer gesetzt. Kandidatnummern sind 1, 2 und 4. Jedoch hat der Solver zwei verschiedene notwendige Nummern für diese Zelle ermittelt: 1 und 2. Das geht natürlich nicht. Es können in einer Zelle nicht zwei Nummern gleichzeitig gesetzt werden. D.h. das Puzzle ist widersprüchlich. Wenn das Puzzle noch erfolgreich gelöst werden soll, müssen ein oder mehrere der bisherigen Nummernsetzungen zurückgenommen werden. Tritt während der automatischen Ausführung eine solche Zelle auf, schaltet der Solver in den Rückwärts-Modus um.|
|![NumberConflict](./images/conflct.png){:width="100px"}|**Widerspruch - Die Nummer 5 ist bereits einmal gesetzt:** Für diese Zelle wurde die Nummer 5 gesetzt. Diese Nummer ist direkt unzulässig, weil in der Spalte, Reihe oder dem Block dieser Zelle bereits eine 5 gesetzt ist. Das zweite oder dritte Auftreten der Nummer wird ebenfalls mit rotem Rand angezeigt.|
|![Automatische Selektion](./images/autoSelectted.png){:width="100px"}|**Automatisch selektierte Zelle:** mit einem Hidden Single. Etwas hellerer Hintergrund.|
|![Manuelle Selektion](./images/manualSelected.png){:width="100px"}|**Manuell selektierte Zelle:** mit zwei Kandidaten. Etwas dunklerer Hintergrund.|


## Zwei Spielphasen

|Phase  |Bedeutung  |
|---------|---------|
|![Eingeben](./images/define.png){:width="100px"}|Die Taste **Puzzle eingeben**. Das Drücken dieser Taste versetzt den Solver in die Definitionsphase. In dieser Phase überträgt man das zu lösende Puzzle, sprich die Givens des Puzzles, in den Solver. Nach der Initialisierung ist diese Taste automatisch gesetzt.|
|![Lösen](./images/play.png){:width="100px"}|Die Taste **Puzzles lösen**. Das Drücken dieser Taste versetzt den Solver in die Lösungsphase. Gleichzeitig ermittelt der Solver den Schwierigkeitsgrad des eingegebenen Puzzles. Die Lösungsphase kann manuell oder automatisch durchgeführt werden. Wird die automatische Ausführung gestartet, wird diese Taste automatisch gesetzt.|

Hinweis: Gegebene Nummern, die Givens - dies sind blaue Nummern - können in der Lösungsphase nicht gelöscht werden. Falls Givens gelöscht werden sollen, muss man zuvor die Puzzle-Eingeben-Taste drücken.

## Jeder Lösungsschritt mit zwei Subschritten

Beim Eingeben wie auch beim Lösen besteht ein **Lösungsschritt** aus zwei Subschritten:

1. **Sudoku-Zelle selektieren**.
1. **Nummer setzen**: D.h. eine Nummer im rechten Tastenblock wählen. Es kann auch einfach nur eine Nummerntaste auf der Tastatur für die Eingabe einer Nummer benutzt werden.

Soll eine Nummern-Setzung zurückgenommen werden, muss die betroffene Zelle selektiert werden und dann die rote Lösch-Taste gedrückt werden.

## Trainer-Operationen

Die Operationen des Sudoku-Trainers werden über die Tasten und die seitliche Navigationsbar angeboten.

|Navigationsbar | Tastenfeld |
|---------------|------------|
|![Initialisieren](./images/initialsieren.png){:width="150px"}| ![ButtonsManual](./images/TastenauswahlManuell.png){:width="300px"}|

### Initialisieren

**Menü-Option: Initialisieren.** Jederzeit kann der Trainer initialisiert werden. Dabei wird das aktuell gespielte Puzzle gelöscht und der automatische Solver initialisert. Die bereits gespeicherten Puzzles bleiben unverändert erhalten.

### Zurücksetzen

**Menü-Option: Zurücksetzen.** Das aktuelle Puzzle wird zurückgesetzt auf die Aufgabenstellung, nachdem der Spieler diesen Wunsch bestätigt hat. D.h. alle in der Lösungsphase gesetzten Zellen, die grünen Zellen, werden gelöscht. Die Givens bleiben erhalten.

### Undo/Redo

**Taste: Undo.** Durch das Drücken dieser Taste wird die letzte Zellenoperation zurückgenommen.

**Taste: Redo.** Rücknahme des Undo.

### Puzzle prüfen

**Taste: Prüfen.** Die gesetzten Lösungsnummern werden geprüft. Wenn sie falsch gesetzt sind, werden sie als fehlerhaft gekennzeichnet. Diese Funktion ist dann nützlich, wenn man das Puzzle manuell lösen will und man vermutet, dass man bereits einen Fehler gemacht hat.

### Puzzle speichern

**Taste: Puzzle speichern.** Der Spielstand des aktuellen Puzzles wird in der Datenbank gespeichert. Gegebenenfalls wird das Puzzle in der DB neu angelegt und erhält dabei einen generierten Namen: 'PZ (>>Datum<<)'. Falls es schon in der Datenbank ist, wird es mit dem aktuellen Spielstand überschrieben. Der Name des Puzzles kann jederzeit umbenannt werden.

### Neues Puzzle generieren

**Menü-Option: Neu.**

Mittels der Option **Neu** im Menu kann ein neues Puzzle generiert werden. Über die wählbaren Suboptionen kann der gewünschte [Schwierigkeitsgrad](#schwierigkeitsgrade-levels) gewählt werden. Zur Verfügung stehen:

- Sehr leicht
- Leicht
- Mittel
- Schwer

Der Generator generiert nur faire Puzzles mit den Schwierigkeitsgraden 'Sehr leicht', 'Leicht', 'Mittel' und 'Schwer'. Im Gegensatz zu 'Sehr schweren' oder 'Extrem schweren' Puzzles können faire Puzzles allein durch logisches Schließen gelöst werden. Sie benötigen kein "Backtracking", kein Raten und Probieren.

### Puzzle drucken

**Menü-Option: Drucken.** Das aktuelle Puzzle wird ausgedruckt. Falls es noch nicht gespeichert wurde wird es zuvor mit einem Default-Namen 'Druck->>Datum<<' in der Datenbank gespeichert.

## Trainer-Einstellungen

|Menü  |Einstellungen  |
|---------|---------|
|![Menue](./images/menuEinstellung.png){: width="150px"}|![Settings](./images/einstellungen.png){:width="auto"}|

**Menü-Option: Einstellungen.** Aktuell kennt der Sudoku-Trainer 3 Einstellungsparameter
1. Kandidatenauswertung
1. Spielmodus
1. Technik

### Einstellung Kandidatenauswertung

- **Keine Kandidatenanzeige:** Im Hintergrund erfolgt die Kandidatenauswertung im Lazy-Modus.
- **Lazy:** Die Lazy-Auswertungsmethode praktiziert eine verzögerte Auswertung. Die Auswertung erfolgt nur soweit, bis die nächste notwendige Nummer oder die nächste Single-Nummer oder die nächste versteckte Single-Nummer bestimmt ist.
- **Strikt + (Strikt-Plus):** Diese Auswertungsmethode führt eine vollständige Auswertung durch. Alle aktuell unzulässigen Kandidaten, alle notwendigen Nummern, alle Singles und versteckten Singles werden ermittelt und angezeigt.
- **Strikt - (Strikt-Minus):** Wie Strikt +. Jedoch werden die errechneten unzulässigen Kandidaten ausgeblendet.

### Einstellung Spielmodus

- Manuelles Lösen (Automatik-Buttons ausgeblendet)
- Automatisches Lösen mit oder ohne Haltepunkte (Automatik-Buttons eingeblendet)

Der Spielmodus "Manuelles Lösen", bewirkt, dass die Tasten für die automatische Ausführung ausgeblendet werden. Der Spielmodus "Automatisches Lösen" schaltet sie wieder zu.

|Tastenauswahl Manuelles Lösen|Tastenauswahl Automatisches Lösen|
|---------|---------|
|![ButtonsManual](./images/TastenauswahlManuell.png){:width=auto}|![ButtonsAutomatic](./images/tastenauswahlAutomatik.png){: width=auto}|

### Einstellung Technik

- **Import/Export == on:** In der Hauptansicht ist der Teile-Button zugeschaltet. In der Datenbankansicht sind die Buttons für Puzzle-Download und -Import zugeschaltet.
- **Import/Export == off:** In der Hauptansicht ist der Teile-Button ausgeblendet. In der Datenbankansicht sind die Buttons für Puzzle-Download und -Import ausgeblendet.

## Die Lösungssuche des Solvers

### Wie wählt der Solver die nächste Zelle und die in ihr zu setzende Nummer?

Der Solver sucht gemäß der folgenden Priorität die nächste offene Zelle und die zu setzende Nummer:

1. **Zelle mit notwendiger Nummer:** Der Solver wählt in der Tabelle zunächst eine offene Zelle, die in der Menge ihrer Kandidaten eine notwendige Nummer hat. Diese notwendige Nummer wird dann in der Zelle gesetzt.
1. **Zelle mit Single**: Wenn es keine Zelle mit notwendiger Nummer mehr gibt, wählt der Solver eine Zelle mit einer Single-Nummer. Er setzt diese Nummer.
1. **Zelle mit Hidden Single**: Wenn es keine Zelle mit notwendiger Nummer oder mit Single mehr gibt wählt der Solver eine Zelle mit Hidden Single.
1. **Zelle mit minimaler Optionenmenge**. Sind keine Zellen mit notwendigen Nummern oder Singles mehr verfügbar, wählt der Solver eine Zelle mit minimaler Anzahl von Kandidaten. Die sogenannten **Optionen der Zelle**. Meist besteht die minimale Optionenmenge aus zwei Optionen. Die Selektion ist aber nicht eindeutig, d.h. es gibt in der Regel mehrere Zellen mit zwei Optionen. In dieser Menge wählt der Solver zufällig eine Zelle und setzt eine der beiden Optionennummern. Im Laufe der weiteren Suche kann sich herausstellen, dass diese Nummer keine Lösung des Puzzles erlaubt. Der Backtracking-Prozess kehrt im weiteren Verlauf zu dieser Zelle zurück und versucht dann mit der Wahl einer anderen Nummer aus der Optionenmenge die Lösung zu finden. Ein Beispiel dazu gibt es im Abschitt [Training (Ausschließlich automatische Schrittausführung)](#training-ausschließlich-automatische-schrittausführung).

### Wie prüft der Solver die neu gesetzte Nummer?

Der Solver prüft nach der Setzung einer neuen Nummer, ob das Sudoku mit dieser gesetzten Nummer widersprüchlich geworden ist. Falls ja, wird der Solver in den Rückwärts-Modus geschaltet und geht zurück bis zu einer Zelle, die mehrere Optionen für eine Nummernsetzung hatte.

### Vorwärts und Rückwärts (Backtracking)

Der Solver zeigt an, wie er im Suchprozess vorwärts und rückwärts geht. Im Fachjargon: Der Solver realisiert einen Backtracking-Algorithmus. Rückwärts muss er gehen, wenn die aktuell gesetzte Nummer zur Widersprüchlichkeit des Sudokus führt. Rückwärtsgehen bedeutet, dass der Solver der Reihe nach zuvor gesetzte Nummern wieder zurücknimmt, bis er auf eine Zelle trifft, in der er mehrere Kandidatnummern zur Auswahl hatte. Er wählt dann die nächste noch nicht probierte Zahl der Auswahl und geht wieder in den Vorwärts-Modus. Sind alle Kandidatnummern durchprobiert, geht er weiter rückwärts. Wenn er im Rückwärtsgehen bei der ersten gesetzten Zelle ankommt, und die erste Zelle keine weitere unprobierte Nummer mehr hat, hat das Sudoku keine Lösung.

Der Solver zeigt die Anzahl der zurückgelegten Schritte an. Jedes Setzen einer Zelle sowie die Rücknahme einer Setzung erhöht den Zähler um 1. Ebenso zeigt der Solver die Anzahl der Rückwärtsläufe an.

# 3 Nutzungsformen des Sudoku-Trainers

Wir unterscheiden 3 Nutzungsformen des Sudoku-Trainers
1. Manuelles Lösen
1. Automatisches Lösen mit Haltepunkten
1. Automatisches Lösen ohne Haltepunkte

## Manuelles Lösen

Werkzeugeinstellung:
- **Kandidatenauswertung:** Keine Kandidatenanzeige
- **Spielmodus:** Manuelles Lösen

Manuelles Lösen bedeutet, dass der Spieler die Lösungsnummern (grün) in den Zellen setzt. Will der Spieler sich der Herausforderung einer manuellen Lösungssuche ernsthaft stellen, verzichtet er auf jede Hilfe durch den Solver. Keine Kandidatenanzeige: denn sie würde ja die notwendigen Kandidaten anzeigen.

Beim manuellen Lösen kann es passieren, dass eine Nummer falsch gesetzt wird. Viele Setzungen danach laufen in Abhängigkeit von dieser ersten Fehlersetzung Gefahr ebenfalls falsch gesetzt zu werden. Mit der Prüfen-Taste kann in diesem Fall geprüft werden, ob und welche bisherigen Setzungen bereits fehlerhaft sind.

{: style="text-align:center"}
![Prüfen](./images/pruefungfehler.png){: width="150px"}

## Automatisches Lösen mit Haltepunkten

Werkzeugeinstellung:

- **Kandidatenauswertung:** Keine Kandidatenanzeige oder Lazy
- **Spielmodus:** Automatisches Lösen mit Haltepunkten

In dieser Nutzungsform zeigt der Sudoku-Trainer seinen vollen Funktionsumfang. Sie ist damit besonders lehrreich. Der Spieler beobachtet die Lösungssuche anstatt selber die Lösung zu suchen, indem er automatische Lösungsschritte ausführen lässt. Deshalb an dieser Stelle eine Übersicht über die Arten automatischer Schritte. Die folgenden Darstellungen nehmen Bezug auf das Puzzle "Backtrack_10". Es ist in jeder Puzzle-Datenbank vorhanden. Dies ist ein Puzzle mit dem Schwierigkeitsgrad "Sehr schwer".

**Schritt 1: Zelle mit mehreren Optionen.** Schon im ersten Schritt erweist sich dieses Puzzle als sehr schwer, da der Solver keine Zelle mit eindeutiger Nummernbelegung findet und stattdessen eine Zelle mit 2 Optionen selektiert: 1 und 8. Der Solver versucht zuerst die 1.

{: style="text-align:center"}
![Schritt 1](./images/exampleStep1.png){: max-width="75%"}

**Schritt 2: Zelle mit notwendiger Nummer.** Im zweiten Schritt selektiert der Solver eine Zelle mit notwendiger Nummer 1. Sie ist notwendig, weil in dem Block in allen freien Zellen, grün gestrichelte Rahmen, keine 1 mehr gesetzt werden kann. Die weiß gerahmten Zellen liefern die Begründung.

{: style="text-align:center"}
![Schritt 2](./images/exampleStep2.png){: max-width="75%"}

**Schritt 30: Zelle mit Widerspruch.** Im Schritt 30 entdeckt der Solver eine widerspruchsvolle Zelle: kein Kandidat mehr. Deshalb wurde der Solver in den Rückwärts-Modus gesetzt (grüner Pfeil links).

{: style="text-align:center"}
![Schritt 30](./images/exampleStep30.png){: max-width="75%"}

**Schritt 60: Zweiter Besuch in der Zelle.** Im Schritt 60 kehrt der Solver in die Zelle zurück, in der er beim ersten Besuch die 1 gewählt hatte. Nun schaltet er wieder in den Vorwärts-Modus, grüner Pfeil rechts, und selektiert den zweiten Kandidaten mit der Nummer 8.

{: style="text-align:center"}
![Schritt 60](./images/exampleStep60.png){: max-width="75%"}

**Schritt 65: Zelle mit Single.** Im Schritt 65 selektiert der Solver eine Zelle mit nur einem Kandidaten, einem Single.

{: style="text-align:center"}
![Schritt 65](./images/exampleStep65.png){: max-width="75%"}

**Schritt 66: Zelle mit Hidden Single.** Im Schritt 66 selektiert der Solver eine Zelle mit einem Hidden Single, die 4. Die 3 und die 6 sind unzulässige Kandidaten wegen dem "Nackten Paar" {3, 6}.

{: style="text-align:center"}
![Schritt 66](./images/exampleStep66.png){: max-width="75%"}

**Schritt 410: Alle Zellen belegt.** Im Schritt 410 belegt  der Solver die letzte offene Zelle. Das Puzzle ist gelöst.

{: style="text-align:center"}
![Schritt 66](./images/exampleStep410.png){: max-width="75%"}

## Vollautomatisches Lösen

Sinnvolle Werkzeugeinstellung:

- **Kandidatenauswertung:** Strikt+ oder Strikt-
- **Spielmodus:** Automatisch lösen

In dieser Nutzungsform nutzt der Sudoku-Trainer seinen vollen Funktionsumfang. Jedoch für den Spieler nicht sichtbar. Die automatische Lösungssuche kann jederzeit mit der Start-Taste gestartet werden. So können auch bereits manuell teilweise gelöste Puzzles automatisch komplett gelöst werden. Die Tasten der automatischen Ausführung haben folgende Bedeutung:

|Taste  |Bedeutung  |
|---------|---------|
|**Start**|Der Solver startet den automatischen Lösungssuchprozess. Zusätzlich wird ein Timer gestartet, der die Ausführung automatischer Suchschritte anstößt.|
|**Pause**|Der Taktgeber der automatischen Ausführung wird angehalten, nicht jedoch der Suchprozess abgebrochen. Der Spieler kann jetzt weitere automatische Suchschritte mit der Schritt-Taste von Hand anstoßen. Oder er kann durch das erneute Drücken der Start-Taste die getaktete automatische Ausführung fortsetzen.|
|**Stop**|Der Taktgeber der automatischen Ausführung wird angehalten und der aktuelle Suchprozess wird abgebrochen.|
|**Schritt**|Der Solver führt den nächsten automatischen Suchschritt aus. Falls noch nicht geschehen, startet er zuvor den Suchprozess überhaupt. Mit dieser Taste kann man den Solver Schritt für Schritt arbeiten lassen und so jeden einzelnen seiner Schritte beobachten und verstehen.|

# Die Puzzle-Datenbank

Sudoku-Puzzles und ihre Lösungen können im lokalen Speicher des Browsers gespeichert werden, aber nur mit Einschränkungen auf dem Computer selbst. D.h. Man kann seine gespeicherten Puzzles nur in dem Browser wiederfinden, in dem sie gespeichert wurden.

![PuzzleDB](./images/PuzzleDB.png)

Beim Abspeichern erhält das gespeicherte Puzzle automatisch einen Namen, das aktuelle Datum. Bei Bedarf kann der Name umbenannt werden. Bezüglich der Namen gibt es keine Einschränkungen.

|Attribut  |Bedeutung  |
|---------|---------|
|Laufende Nr.|Laufende Nr. in der Tabelle. Sie ist keine ID für Puzzles|
|Puzzle-Name|Name des gespeicherten Puzzles. Muss nicht eindeutig sein.|
|#Givens|Die Zahl der Givens des Puzzles.|
|#Gelöste|Die Zahl der gelösten Zellen des Puzzles.|
|#Offene|Die Zahl der offenen, ungelösten Zellen des Puzzles.|
|Level|Der ermittelte Schwierigkeitsgrad des gespeicherten Puzzles.|
|#Rückwärts|Die Anzahl der Rückwärtsläufe, die der Solver durchgeführt hat, um das Puzzle zu lösen.|
|Datum|Datum, an dem das Puzzle zuletzt gespeichert wurde.

## Operationen der Datenbank

|Taste  |Bedeutung  |
|---------|---------|
|Spaltenkopf|**Sortieren.** Die Puzzles der Datenbank können sortiert werden nach jeder Spalte. Dazu einfach den Spaltenkopf klicken. Wiederholtes Klicken wechselt zwischen der aufsteigenden und der absteigenden Sortierung.|
|Pfeiltasten| **Navigieren.** Mit den Pfeiltasten kann in der Tabelle vorwärts und rückwärts navigiert werden. Durch Klicken auf eine Reihe der Tabelle kann ein Puzzle direkt selektiert werden.|
|Laden| **Puzzle laden.** Durch Drücken der Lade-Taste wird das selektierte Puzzle in den Sudoku-Solver geladen.|
|Löschen| **Puzzle löschen.** Gespeicherte Puzzles können auch wieder gelöscht werden.|
|Drucken| **Puzzle drucken.** Mittels der Taste Drucken kann das aktuell selektierte Puzzle gedruckt werden. Dabei wird nur die Aufgabe, nicht aber die Lösung ausgedruckt. Dies ist besonders dann nützlich wenn man ein generiertes Puzzle von Hand auf dem Papier lösen möchte. 
|Download Puzzle-DB|**Puzzle-Datenbank exportieren.** Durch Drücken dieser Taste wird die aktuelle Puzzle-Datenbank in ein txt-File 'Puzzle-DB.txt' ausgegeben. Es befindet sich im Download-Ordner.|
|Download Puzzle|**Puzzle exportieren.** Durch Drücken dieser Taste wird die aktuelle Puzzle mit dem Namen >>PuzzleName<<  in ein txt-File '>>PuzzleName<<.txt' ausgegeben. Es befindet sich im Download-Ordner.|
|Import Puzzle(s)|**Puzzle(s) importieren.** Mit dieser Taste wird ein File-Selection-Dialog gestartet. nur txt-Files können selektiert werden.
|Puzzle teilen <img src="./images/shareButton.png" width="100px"/>|**Puzzle teilen.** Die Sudoku-Trainer-App ist Progressive Web App (PWA). Wie eine native App kann sie daher Inhalte, in unserem Fall ein Puzzle-File, mit anderen Apps teilen, z.B. mit WhatsApp oder einer EMAIL-App. Auf dem PC startet bei Doppel-Click auf diese Datei die Sudoku-App. Auf dem Android-SmartPhone ist dies leider noch nicht möglich.|

## Import/Export und Teilen von Puzzles

Die Operationen Import/Export und Teilen sind sehr abhängig von der vorliegenden Betriebssystem- und Browser-Version. Konkret von den verfügbaren APIs. es kann also vorkommen, dass manche der nachfolgend gezeigten Beispiele auf dem System des interessierten Anwenders nicht funktionieren.

Nachfolgend einige Beispiele für den Austausch von Puzzles zwischen Sudoku-Trainer-Apps.

### Teilen der Sudoku-Trainer-App URL

In der Sudoku-Trainer-App kann die URL der App geteilt werden. Dies ist dann besonders nützlich, wenn man die App weitergeben will.

**Absender-Smartphone**
1. Teile-Taste
1. WhatsApp selektieren
1. Kontakt selektieren und senden

|Teile Taste  |WhatsApp selektieren |
|---------|---------|
|![Teilen Taste](./images/teilenURLApp.png){: width="200px"}|![TeilenURL](./images/teilenURLApp2.png){: width="200px"}|

**Ziel-Smartphone**

1. In WhatsApp in der empfangenen Nachricht auf den Link klicken.
1. In der geöffneten Web-Seite die PWAP-App installieren.

### Puzzle von SmartPhone zu SmartPhone

In diesem Beispiel wird das aktuelle Puzzle >>DemoPuzzle<< verschickt.

**Absender-Smartphone**

1. Teile-Taste in der Hauptansicht klicken.
1. WhatsApp selektieren (oder eine MAIL App).
1. Kontakt selektieren und senden.

**Ziel-SmartPhone**

1. WhatsApp starten.
1. Die in der empfangenen Nachricht enthaltene Datei >>DemoPuzzle.txt<< downloaden.
1. Die App Soduku-Trainer starten.
1. In der App den Datenbank-Dialog öffnen (Menü Datenbank).
1. Die Taste Import-Puzzle klicken.
1. ![Aktion Dateien](./images/aktionDateien.png){:width="auto"}
1. Die Aktion Dateien auswählen.
1. Die im Download-Ordner abgelegte Datei >>DemoPuzzle.txt<< selektieren.

### Puzzle Datenbank vom PC auf das Smartphone übertragen

**Absender-Smartphone**

1. Sudoku-Trainer starten
1. In den Datenbank-Dialog wechseln
1. ![DownloadDB](./images/downloadDB.png){: width="auto"}
1. Download-DB-Taste in der Hauptansicht klicken.
1. WhatsApp starten (oder eine MAIL App).
1. Datei in den Anhang laden
1. Kontakt selektieren und senden.

**Ziel-SmartPhone**

1. WhatsApp starten.
1. Die in der empfangenen Nachricht enthaltene Datei downloaden.
1. Die App Soduku-Trainer starten.
1. In der App den Datenbank-Dialog öffnen (Menü Datenbank).
1. Die Taste Import-Puzzle klicken.
1. ![Aktion Dateien](./images/aktionDateien.png){:width="auto"}
1. Die Aktion Dateien auswählen.
1. Die im Download-Ordner abgelegte Datei >>DemoPuzzle.txt<< selektieren.

## Die initiale Datenbank ist nicht leer

Sie enthält zwei sehr schwere Puzzles. Also Puzzles, die nur durch Backtracking gelöst werden können. Der Einsteiger in diese App kann damit die automatische Lösungssuche dieses Trainers ausprobieren. In den Zeitungen und Zeitschriften findet man solche Puzzles nicht. Im Internet gibt es unter anderen diese bekannte Adresse [SoEinDing](https://sudoku.soeinding.de/sudokuExtraTeuflischSchwer.php), bei der man solche Puzzles finden kann.

# Sudoku-Theorie

## Unzulässige Nummern und Kandidaten

**Unzulässige Nummern:** Für eine noch nicht belegte Zelle der Sudoku-Tabelle unterscheiden wir Unzulässige Nummern Kandidatennummern, kurz Kandidaten. Für eine unbelegte Zelle ist eine **Nummer unzulässig**, wenn in dem Block, in der Reihe oder Spalte dieser Zelle eine andere Zelle existiert, in der diese Nummer bereits gesetzt ist. Alle anderen Nummern heißen **Kandidatnummern** oder einfach **Kandidaten** dieser Zelle. In einer unbelegten Zelle werden die Kandidaten der Zelle angezeigt, sofern in der Werkzeugeinstellung für den Einstellungsparameter "Kandidatenauswertung" nicht der Wert "Keine Kandidatenanzeige" gesetzt ist.  

**Unzulässige Kandidaten.** Auch Kandidaten können unzulässig sein. Eine Kandidatennummer ist unzulässig, wenn sie das Puzzle widersprüchlich macht. Der Solver würde das sofort oder einige Schritte später aufdecken. Unzulässige Kandidaten werden in roter Farbe angezeigt.  

## Notwendige Nummern

![Lazy notwendig](./images/lazynotwendig.png)
Eine Kandidatnummer in einer Zelle ist notwendig, wenn die Nummer in ihrem Block, in ihrer Reihe oder Spalte einzig ist. D.h. sie kann nur hier gesetzt werden. Im Bild ist die grüne 1 notwendig, weil sie in ihrem Block kein weiteres mal zulässig ist. Im Lazy-Auswertungsmodus zeigt der Solver den die Notwendigkeit verursachenden Block, Spalte oder Reihe an, wenn man die Zelle mit der notwendigen Nummer selektiert hat. Die Zellen des Blocks besitzen einen grün gestrichelten Rahmen. Die Zellen mit den weiß gestrichelten Rahmen zeigen Einsen an, deretwegen in den grün gestrichelten Rahmen keine 1 mehr gesetzt werden kann.

## Unzulässige Kandidaten

**Unzulässige Nummern** sind Nummern, die in einem Block, in einer Spalte oder Reihe bereits einmal existieren. Unzulässige Nummern können keine Kandidaten sein. Es gibt jedoch auch unzulässige Kandidaten. **Unzulässige Kandidaten** werden in roter Schrift angezeigt. Eine Kandidatnummer ist unzulässig, wenn ihre Setzung in der Zelle das Puzzle widerspruchsvoll macht.

In fairen Puzzles kann man unzulässige Kandidaten allein durch logisches Schließen unter Anwendung definierter Kriterien ohne Backtracking erkennen. In der Literatur werden zahlreiche Kriterien genannt. Grundsätzlich ist die rein logische Erkennung der Unzulässigkeit von Kandidaten unvollständig. D.h. es gibt so schwere Puzzles, dass nicht alle unzulässigen Kandidaten mittels der Anwendung von logischen Kriterien erkannt werden können. Solche Sudokus können nur durch Backtracking gelöst werden. Der vorliegende Solver unterstützt nachfolgend beschriebene logische Kriterien für das Erkennen der Unzulässigkeit von Kandidaten. Falls diese für das Lösen eines konkreten Puzzles nicht ausreichen, löst der Solver das Puzzle durch Backtracking.

### Kriterien für die Erkennung unzulässiger Kandidaten

1. **Kriterium: Unzulässig wegen notwendiger Nummer.** Eine Kandidatnummer ist unzulässig wegen einer notwendigen Nummer, wenn sie in ihrer Spalte, Reihe oder ihrem Block auch als notwendige Nummer auftritt. Im nachfolgenden Beispiel sind die roten Nummern 1 wegen der grünen 1 unzulässig. Die grüne 1 ist notwendig, weil sie in ihrem Block einzig ist, also in dem Block kein weiteres mal zulässig ist.![Indirekt wegen notwendig](./images/indirektwgnotwendig.png)

1. **Kriterium: Unzulässig wegen "Nacktes Paar".** Eine Kandidatnummer ist unzulässig, wenn es in einem Block, einer Reihe oder Spalte Paare gibt und Nummern dieser Paare zusätzlich in weiteren Zellen dieses Blocks, dieser Spalte oder Reihe auftauchen. Im Beispiel ist das 2-8-Paar ein nacktes Paar. Das 2-8-Paar macht in seiner Spalte alle 2 und 8 unzulässig. Der Grund: Das Paar bedeutet, dass die 2 und die 8 auf jeden Fall in einer der beiden Zellen des Paares gesetzt werden muss. Aktuell steht nur noch nicht fest, ob die 2 oder die 8 oben ist. Fest steht aber jetzt schon, dass in den übrigen Zellen der Spalte keine 2 oder 8 mehr vorkommen können. Die 2 und 8 sind hier unzulässig. Diese Spaltendarstellung mit den gestrichelten Kanten zeigt der Solver nur im Lazy-Auswertungsmodus, wenn man eine Zelle mit unzulässigen Nummern selektiert hat.![Indirekt unzulässig](./images/indirektWegenPairing.png)

1. **Kriterium: Unzulässig wegen "Verstecktes Paar".** In einem Block, einer Spalte oder Reihe kann es ein verstecktes Paar geben. Ein verstecktes Paar besteht aus zwei Zellen, die zwei gemeinsame Nummern haben, im Beispiel 1 und 8, die in den übrigen Zellen nicht vorkommen. Daneben können sie weitere Nummern haben. Am Ende können in diesen beiden Zellen nur die beiden Nummern 1 und 8 untergebracht werden. Deshalb müssen die übrigen Nummern der beiden Zellen eliminiert werden.
![Verstecktes Paar](./images/hiddenpair.png)

1. **Kriterium: Unzulässig wegen Überschneidung.** Ein Block und eine Spalte oder Reihe überschneiden sich. In der Reihe gibt es Nummern, die nur in den gemeinsamen Zellen mit dem Block auftauchen. Im Beispiel die 7. Damit es am Ende in der Reihe überhaupt eine 7 gibt, muss eine 7 in der Reihe gewählt werden. Dies wiederum bedeutet, dass die Nummern 7 in dem Block jenseits der Reihe gestrichen werden müssen.
![Überschneidung](./images/ueberschneidung.png)

### Methoden der Kandidatenauswertung

Unter Kandidatenauswertung verstehen wir die Anwendung der Kriterien, die im vorigen Abschnitt eingeführt wurden. Es müssen nicht immer alle Kriterien angewandt werden. Der Solver unterscheidet mehrere Methoden der Kandidatenauswertung.

1. **Keine Kandidatenanzeige** Kandidatenauswertung. Der Solver zeigt keine Kandidaten an, wenngleich er im Hintergrund weiter mit Kandidaten arbeitet. Diese Option ist wünschenswert, wenn der Spieler ohne Hilfe des Solvers eine manuelle Lösung des Puzzles suchen will.

1. **Lazy** Kandidatenauswertung. Wenn die Anzahl unzulässiger Kandidaten (die roten Nummern) groß wird, wird es immer schwieriger, nackte Paare oder versteckte Paare zu erkennen. Die Lazy-Auswertungsmethode praktiziert eine verzögerte Auswertung. Die Auswertung erfolgt nur soweit, bis die nächste notwendige Nummer oder die nächste Single-Nummer oder die nächste versteckte Single-Nummer bestimmt ist. Nur im Lazy-Modus, können in den oben gezeigten Beispielen die Erläuterungen der Kandidatennummern angezeigt werden.

1. **Strikt +**: Diese Auswertungsmethode führt eine vollständige Auswertung durch. Alle aktuell unzulässigen Kandidaten, alle notwendigen Nummern, alle Singles und versteckten Singles werden ermittelt und angezeigt.

1. **Strikt -** : Wie Strikt +. Jedoch werden die errechneten unzulässigen Kandidaten ausgeblendet.

Das nachfolgende Bild zeigt ein Puzzle im Strikt-Plus-Auswertungsmodus. Bei genauerer Betrachtung dieses Beispiels fällt auf, dass in allen Zellen nur noch eine Nummer zulässig ist.

![Strict Plus](./images/strictplus.png)

Das nachfolgende Bild zeigt die vorige Tabelle im Strikt-Minus-Modus. Im Strikt-Minus-Modus ist unmittelbar sichtbar, dass alle Zellen dieses Beispiels nur noch genau eine zulässige Nummer haben. Alle Nummern sind Singles. Mit anderen Worten: wir sehen hier die Lösung des Sudokus. Der Solver präsentiert hier eine Lösung ohne Backtracking. Nur die zuvor erläuterten Kriterien für unzulässige Kandidaten wurden angewandt.

![Strict Minus](./images/striktminus.png)

### Vergleich der Auswertungsmodi Lazy und Strikt

Wir vergleichen die jeweiligen Vorteile der Auswertungsmodi.

**Vorteil der Lazy-Auswertung: Nachvollziehbarkeit des Lösungsweges.** Die Lazy-Auswertung ist vorteilhaft, wenn man den Lösungsweg im Einzelnen nachvollziehen will. Es werden nur unzulässige Kandidaten berechnet und angezeigt, die für den nächsten Schritt relevant sind. Für diese wenigen unzulässigen Kandidaten ist ihre Verursachung leicht visuell darstellbar und damit verstehbar. Die in dem Beispiel des Abschnitts [Training (Ausschließlich automatische Schrittausführung)](#training-ausschließlich-automatische-schrittausführung) verwendete Auswertungsmethode 'Keine Kandidatenanzeige' verwendet intern auch die Lazy-Auswertung.

Im Lazy-Modus wird die Verursachung notwendiger Nummern oder unzulässiger Kandidaten angezeigt durch gestrichelte Border, wenn die Zelle der notwendigen Nummer oder unzulässigen Nummer selektiert ist. Durch erneutes Klicken der selektierten Zelle können die Ursachen der notwendigen und unzulässigen Kandidaten der Reihe nach jeweils angezeigt werden. Wenn alle Kandidaten angezeigt wurden, führt das erneute Klicken der Zelle zur Deselektion der Zelle.

**Vorteil der strikten Auswertung: Lösung des Puzzles mit weniger Schritten.** Im Auswertungsmodus Strikt benötigt der Solver im Allgemeinen weniger Schritte bis zur Lösung des Puzzles als im Ausführungsmodus Lazy. Im Lazy-Modus braucht der Solver für die Lösung des Puzzles 'backtrack_9' 410 Schritte, im Strikt-Modus dagegen nur 116 Schritte.

Woran liegt das? Es liegt daran, dass der Solver im Ausführungsmodus Strikt sehr viel früher die Widersprüchlichkeit, falls vorhanden, der aktuellen Nummernbelegungen feststellt. Dies wiederum führt dazu, dass die Anzahl der Vorwärts- und Rückwärtsschritte entsprechend geringer wird und damit die Anzahl der Schritte insgesamt. Die Anzahl der Rückwärtsläufe bleibt in beiden Ausführungsmodi gleich. Der Solver untersucht in beiden Auswertungsmodi dieselben möglchen Nummernsetzungen.

Dieser Sudoku-Trainer zeichnet sich in erster Linie durch seine nachvollziehbare Lösungssuche aus. Die Schrittminimierung ist kein Ziel. Daher ist die Einstellung "Keine Kandidatenanzeige" mit der Lazy-Auswertung im Hintergrund der Default-Auswertungsmodus.

## Widerspruchsvolle Puzzles

Der automatische Solver setzt solange weitere Nummern in der Tabelle, bis er entweder alle Zellen gesetzt hat (das Sudoku ist gelöst), oder er erkennt, dass das Sudoku bei der aktuellen Befüllung widerspruchsvoll ist. Ein Sudoku-Puzzle ist widerspruchsvoll, wenn es

1. eine widerspruchsvolle Zelle besitzt, oder
1. eine widerspruchsvollen Gruppe.

Es können mehrere dieser Bedingungen gleichzeitig vorliegen. Der vorliegende Solver zeigt der Übersichtlichkeit halber immer nur eine Widerspruchsbedingung an.

### Widerspruchsvolle Zellen

Widerspruchsvolle Zellen hatten wir oben schon kennengelernt. Es sind dies Zellen ohne zulässige Kandidaten, Zellen mit zwei notwendigen Nummern gleichzeitig und Zellen, die mit einer direkt unzulässigen Nummer belegt sind.

![No selectable candidates](./images/nochoice.png)
![No candidates at all](./images/nochoice2.png)
![MoreThanOneNecessary](./images/twoNeccessary.png)
![NumberConflict](./images/conflct.png)

### Widerspruchsvolle Gruppen

Wir betrachten hier die abstrakte Gruppe. Eine konkrete Gruppe ist immer entweder eine Reihe oder eine Spalte oder ein Block. So wie es widerspruchsvolle Zellen geben kann - erkennbar an ihrem roten Rand - kann es auch widerspruchsvolle Gruppen geben. Eine Gruppe ist widerspruchsvoll, wenn eine der folgenden Bedingungen vorliegt:

1. **Widerspruch - Zwei gleiche Singles:** Ein Single taucht gleichzeitig in verschiedenen Zellen der Gruppe auf. Fordert also dieselbe Nummer mehrmals in der Gruppe zu setzen. Ein Widerspruch.

1. **Widerspruch - Zwei gleiche notwendige Nummern:** In der Gruppe tritt dieselbe Nummer in verschiedenen Zellen als notwendig auf.

1. **Widerspruch - Fehlende Nummer:** In der Gruppe kommt eine Nummer überhaupt nicht vor.

Wir sehen, dass gleichzeitig mehrere Bedingungen für einen Gruppenwiderspruch vorliegen können. Tritt während der automatischen Ausführung eine solche widerspruchsvolle Gruppe auf, schaltet der Solver in den Rückwärts-Modus um.

## Schwierigkeitsgrade (Levels)

Der Schwierigkeitsgrad eines Sudoku-Puzzles kann auf verschiedene Weisen definiert werden. Wie beispielsweise anhand folgender Kriterien:

- Anzahl der Givens. (Wenige Givens = schwer, viele Givens = leicht).
- Erforderliche Zeit zum Lösen
- Komplexität der Lösungstechniken

Dieser Solver unterscheidet Schwierigkeitsgrade anhand der Komplexität der erforderlichen Lösungstechniken. Folgende Schwierigkeitsgrade werden unterschieden:

1. **Leicht:** Nur durch die Bestimmung [notwendiger Nummern](#notwendige-nummern) kann die Lösung des Sudokus erreicht werden.
1. **Sehr Leicht:** Wie Leicht, jedoch mit höherer Anzahl von Givens.
1. **Mittel:** Durch die Bestimmung notwendiger Nummern und mindestens eines [Singles](#die-möglichen-inhalte-einer-sudoku-zelle) kann die Lösung des Sudokus erreicht werden.
1. **Schwer:** Bei diesem Schwierigkeitsgrad benötigt der Solver mindestens die Bestimmung eines [Hidden Single](#die-möglichen-inhalte-einer-sudoku-zelle). Für die Bestimmung des Hidden Singles müssen unzulässige Kandidaten (rot dargestellt) bestimmt werden. Dies unterscheidet diesen Schwierigkeitsgrad vom Schwierigkeitsgrad 'Mittel'. Zugleich ist dies der höchste Schwierigkeitsgrad, der ohne Backtracking auskommt.
1. **Sehr Schwer:** Bei diesem Schwierigkeitsgrad muss der Solver für mindestens eine Zelle eine Nummer raten und ausprobieren. "Backtracking" ist das dazugehörige Stichwort. Der Solver führt für die Berechnung der Lösung unter Umständen zahlreiche Rückwärtsläufe durch.
1. **Extrem Schwer**: 'Extrem schwer' sind Puzzles, die **mehrere Lösungen** haben. Sie haben keine eindeutige Lösung. Der Solver beherrscht auch die Lösung von Puzzles, die mehrere Lösungen haben. Nach der Erfolgsmeldung mit der ersten Lösung kann der Anwender nach der nächsten Lösung suchen lassen, solange bis der Solver meldet: "*Keine weitere Lösung gefunden*".

## Faire Puzzles

Extrem oder sehr schwere Sudokus eignen sich nicht für die manuelle Lösungssuche, da das notwendige Backtracking mit Papier und Bleistift durchgeführt werden müsste. Die in den Zeitungen oder Zeitschriften als 'Leicht', 'Mittel' oder 'Schwer' klassifizierten Sudoku-Puzzles sind meistens in dem hier dargestellten Sinn 'Leicht' oder 'Mittel'. Selten auch einmal 'Schwer'. D.h. die Zeitungs-Sudokus sind in der Regel fair. Sie können ohne Backtracking gelöst werden.

Dies macht die Anwendung des Sudoku-Trainers auf faire Puzzles gleich ein wenig langweilig. Es werden immer nur exakt soviel Schritte für die Lösung des Puzzles gebraucht, wie das Puzzle offene Zellen hat. Also mit der Schritttaste einmal alle offenen Zellen klicken und schon ist das Puzzle gelöst. Wieder spannend wird es, wenn man die Gründe für jeden Schritt nachvollziehen will.

# Sudoku im Internet

Viele im Internet auffindbare Sudoku-Apps sind reine Sudoku-Solver. Die vorliegende Sudoku-App ist primär ein Sudoku-Trainer und erst sekundär ein Sudoku-Solver. Sie wendet sich an Gelegenheitsspieler. Also Spieler und Spielerinnen, die beispielsweise ein Puzzle aus einer Zeitschrift lösen wollen. Dabei aber steckenbleiben, weil sie die nächste setzbare Nummer nicht finden. Der vorliegende Sudoku-Trainer zeigt Schritt für Schritt, wie man das Puzzle lösen kann.

Dem gegenüber gibt es aber auch "Sudoku-Freaks", die sich zum Ziel setzen, Puzzles allein durch logisches Schließen zu lösen. Ihre Herausforderung besteht darin, herauszufinden, welche der oben genannten Kriterien für unzulässige Kandidaten (es gibt noch weitere, die in dieser App gar nicht implementiert sind) anwendbar sind. Eine herausragende Seite für Sudoku-Interessierte ist die Seite von [Andrew Stuart](https://www.sudokuwiki.org/Main_Page). Dort findest Du einen kompletten Überblick über logische Lösungsstrategien für klassisches Sudoku und auch einen Überblick über nicht klassische Sudoku-Varianten.

Stuarts Sudoku-Solver will wie der Sudoku-Trainer nicht einfach nur ein Solver sein. Er stellt die Anwendung logischer Lösungsstrategien in den Mittelpunkt. Ein Lösungsschritt besteht aus der Anwendung einer logischen Schlussregel. Das kann die Elimination von unzulässigen Kandidaten in mehreren Zellen sein aufgrund eines 'nackten Paares' oder die Setzung von 'versteckten Singles' (notwendigen Nummern) in mehreren Zellen gleichzeitig. Puzzles, die keine Lösung per logischem Schließen haben, löst der Solver (absichtlich) nicht. Echte Sudoku-Freaks verzichten auf Backtracking.
