# Herzlich willkommen zur Sudoku-Trainer-App

## Die App  

Diese App ist ein Trainer für klassisches Sudoku. Sie besteht aus drei Komponenten, dem Sudoku-Solver, dem Sudoku-Generator und der Sudoku-Datenbank.

1. Der **Sudoku-Solver** kann manuell oder automatisch genutzt werden. Seine Besonderheit: man kann ihm bei der automatischen Suche nach der Lösung zuschauen. Bei jeder automatischen Setzung einer Nummer zeigt der Solver den logischen Grund für die Setzung. Der Anwender kann ein Puzzle manuell lösen, oder er kann den Solver einen nächsten möglichen Schritt machen lassen. Es ist auch möglich, das Puzzle vollständig automatisch lösen zu lassen. Automatisch löst der Solver jedes Puzzle in wenigen Sekunden oder erkennt es als nicht lösbar (weil es widersprüchlich ist).

1. Der **Sudoku-Generator** generiert faire Puzzles mit den Schwierigkeitsgraden 'Sehr leicht', 'Leicht', 'Mittel' und 'Schwer'. Im Gegensatz zu 'Sehr schweren' oder 'Extrem schweren' Puzzles können faire Puzzles allein durch logisches Schließen gelöst werden. Sie benötigen kein "Backtracking", kein Raten und Probieren.

1. In der **Sudoku-Datenbank** kann der Spielstand von Sudoku-Puzzles gespeichert werden. Die Datenbank wird im lokalen Speicher des Browsers(!) abgelegt. D.h. installierte Web Apps sind einem Browser fest zugeordnet.

## Sudoku Trainer Installation

Technisch gesehen ist der [Sudoku-Trainer](https://hubertbertling.github.io/sudokuSolver/) eine progressive Web-App (PWA). Als solche besitzt er eine URL. Für die Installation benötigt man lediglich diese URL. Moderne Browser erkennen an der Manifest-Datei im Startverzeichnis, dass es sich um eine installierbare PWA handelt. In der URL-Zeile zeigen sie die Möglichkeit der Installation an durch einen Installations-Button oder Ähnliches.  

Die Installation ist sehr einfach: einfach den Dialogen folgen. Betriebssystemseitig verhält sich die App wie eine native App. Sie kann daher wie eine native App auch wieder deinstalliert werden.

Viel Spaß mit der App und neue Einsichten über das Wesen klassischer Sudokus.

Hubert Bertling  
