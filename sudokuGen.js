// Der Web Worker importiert den gemeinsamen Code
importScripts('./sudokuCommon.js');

let inMainApp = false;

let sudoApp;
const start = () => {
    sudoApp = new SudokuWorkerApp();
    sudoApp.init();
}

// Der Web Worker wartet auf eine Nachricht von Main.
self.onmessage = function (n) {
    if (n.data == "Run") {
        // Der Web Worker generiert ein neues Puzzle
        sudoApp.suGrid.generatePuzzle();
        // Das Grid liefert das generierte Puzzle in der Form eines
        // Datenbankelements
        let puzzle = sudoApp.suGrid.getPlayedPuzzleDbElement();
        let str_puzzle = JSON.stringify(puzzle);
        // Das serialisierte Puzzle wird als Nachricht nach Main gesendet
        self.postMessage(str_puzzle);
        // Der Web Worker beendet sich selbst
        self.close();
    }
};

class SudokuWorkerApp {
    // Die Darstellung der ganzen App
    constructor() {
        // ==============================================================
        // Komponenten der WorkerApp
        // ==============================================================
        // Die Matrix des Sudoku-Solver
        this.suGrid = new SudokuGrid();
        // Die Puzzle-Datenbank
        //Die App kennt zwei Betriebs-Phasen 'play' or 'define'
        this.currentPhase = 'play';
        // Die App kennt zwei Ausführungsmodi: 
        // manuelle oder automatische Ausführung
        this.autoExecOn = false;

        // Für eine automatische Lösungssuche legt die App
        // einen Stepper an. Für jede Ausführung einen neuen.
        this.stepper;

        // ==============================================================
        // Die Ansichtselemente der App
        // ==============================================================

        // ==============================================================
        // Event-Handler der App setzen
        // ==============================================================
    }

    generatePuzzleHandler() {
        sudoApp.suGrid.generatePuzzle();
        sudoApp.stepper.displayProgress();
        sudoApp.suGrid.displayBenchmark('-', sudoApp.suGrid.difficulty);
    }

    autoExecRun() {
        if (this.autoExecOn) {
            this.stepper.solverLoop();
        } else {
            if (this.stepper.deadlockReached()) {
                alert("Keine (weitere) Lösung gefunden!");
            } else {
                this.setGamePhase('play');
                this.setAutoExecOn();
                this.suGrid.deselect();
                this.stepper.init();
                this.stepper.solverLoop();
            }
        }
    }

    setGamePhase(gamePhase) {
        this.currentPhase = gamePhase;
    }

    autoExecRunTimerControlled() {
        if (this.autoExecOn) {
            this.stepper.startTimerLoop();
        } else {
            if (this.stepper.deadlockReached()) {
                alert("Keine (weitere) Lösung gefunden!");
            } else {
                this.setGamePhase('play');
                this.setAutoExecOn();
                this.suGrid.deselect();
                this.stepper.init();
                this.stepper.startTimerLoop('user');
            }
        }
    }

    handleNumberPressed(nr) {
        if (this.autoExecOn) {
            // Während der automatischen Ausführung Nummer gedrückt
            // Der Stepper wird angehalten und beendet
            this.stepper.stopTimer();
            this.stepper.init();
            this.setAutoExecOff();
        } else {
            this.suGrid.atCurrentSelectionSetNumber(nr, this.currentPhase, false);
        }
    }

    handleDeletePressed() {
        if (this.autoExecOn) {
            // Während der automatischen Ausführung Delete-Taste gedrückt
            // Der Stepper wird angehalten und beendet
            this.stepper.stopTimer();
            this.stepper.init();
            this.successDialog.close();
            this.setAutoExecOff();
            this.suGrid.deselect();
        } else {
            this.suGrid.deleteSelected(this.currentPhase, false);
        };
    }

    init() {
        this.suGrid.init();
        // Die App kann in verschiedenen Ausführungsmodi sein
        // 'automatic' 'manual'
        this.setGamePhase('define');
        this.setAutoExecOff();
        // Ein neuer Stepper wird angelegt und initialisert
        this.stepper = new StepperOnGrid(this.suGrid);
        this.stepper.init();
    }

    setAutoExecOn() {
        if (!this.autoExecOn) {
            this.suGrid.removeAutoExecCellInfos();
            this.autoExecOn = true;
            this.stepper.init();
        }
    }

    setAutoExecOff() {
        this.autoExecOn = false;
    }

    autoExecIsOn() {
        return this.autoExecOn;
    }


    sudokuCellPressed(cellNode, cell, index) {
        if (this.autoExecOn) {
            this.stepper.stopTimer();
            this.stepper.init();
            this.successDialog.close();
            this.setAutoExecOff();
            this.suGrid.deselect();
        }
        this.suGrid.select(cellNode, cell, index);
    }

    loadCurrentPuzzle() {
        this.stepper.stopTimer();
        this.stepper.init();
        this.setAutoExecOff();
        let puzzle = this.sudokuPuzzleDB.getSelectedPuzzle();
        let uid = this.sudokuPuzzleDB.getSelectedUid();
        this.suGrid.loadPuzzle(uid, puzzle);
        this.stepper.displayProgress();
        this.setGamePhase('play');
        this.tabView.openGrid();
    }

    getPhase() {
        return this.currentPhase;
    }
}

start();