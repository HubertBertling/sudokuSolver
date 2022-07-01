importScripts('./sudokuCommon.js');

let inMainApp = false;

let sudoApp;
const start = () => {
    sudoApp = new SudokuWorkerApp();
    sudoApp.init();
}


self.onmessage = function (n) {
    if (n.data == "Run") {
        sudoApp.suGrid.generatePuzzle();
        let puzzle = sudoApp.suGrid.getPlayedPuzzleDbElement();
        let str_puzzle = JSON.stringify(puzzle);
        self.postMessage(str_puzzle);
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


    setGamePhase(gamePhase) {
        this.currentPhase = gamePhase;
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

    handleNumberPressed(nr) {
        if (this.autoExecOn) {
            // Während der automatischen Ausführung Nummer gedrückt
            // Der Stepper wird angehalten und beendet
            this.stepper.stopTimer();
            this.stepper.init();
            this.setAutoExecOff();
        } else {
            this.suGrid.atCurrentSelectionSetNumber(nr, this.currentPhase, false);
            this.stepper.displayProgress();
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
            this.stepper.displayProgress();
        };
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

    getPhase() {
        return this.currentPhase;
    }
}

start();