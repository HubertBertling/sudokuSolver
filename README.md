# Sudoku Trainer

Diese Software ist ein Trainer für klassisches Sudoku. Sie besteht aus drei Komponenten, (1) dem Sudoku-Solver, (2) dem Sudoku-Generator und (3) der Sudoku-Datenbank.

(1) Der Sudoku-Solver kann manuell oder automatisch genutzt werden. Seine Besonderheit: man kann ihm bei der automatischen Suche nach der Lösung zuschauen. Bei jeder automatischen Setzung einer Nummer zeigt der Solver den logischen Grund für die Setzung. Der Anwender kann ein Puzzle manuell lösen, oder er kann den Solver einen nächsten möglichen Schritt machen lassen. Es ist auch möglich, das Puzzle vollständig automatisch lösen zu lassen. Automatisch löst der Solver jedes Puzzle in wenigen Sekunden oder erkennt es als nicht lösbar (weil es widersprüchlich ist).

(2) Der Generator generiert faire Puzzles mit den Schwierigkeitsgraden 'Sehr leicht', 'Leicht', 'Mittel' und 'Schwer'. Im Gegensatz zu 'Sehr schweren' oder 'Extrem schweren' Puzzles können faire Puzzles allein durch logisches Schließen gelöst werden. Sie benötigen kein "Backtracking", kein Raten und Probieren.

(3) Der Spielstand von Sudoku-Puzzles kann im lokalen Speicher des Browsers gespeichert werden. Die Tabelle (Datenbank) der gespeicherten Puzzles kann nach ihren Spalten sortiert werden.

## Sudoku Trainer Installation

Technisch gesehen ist der [Sudoku-Trainer](https://hubertbertling.github.io/sudokuSolver/) eine progressive Web-App (PWA) . Als solche besitzt er eine URL. Für die Installation benötigt man lediglich diese URL. Moderne Browser erkennen an der App-URL, dass es sich um eine Web-App handelt, und zeigen die Möglichkeit der Installation an. Zur Installation einer Web-App siehe etwa [Installation-Web-App](https://support.google.com/chrome/answer/9658361?hl=de&co=GENIE.Platform%3DAndroid&oco=1).
