// Der Web Worker importiert den gemeinsamen Code
importScripts('./sudokuCommon.js');

let sudoApp;
const start = () => {
    sudoApp = new SudokuWorkerApp();
    sudoApp.init();
}

// Der Web Worker wartet auf eine Nachricht von Main.
self.onmessage = function (n) {
    if (n.data == "Run") {
        // Der Web Worker generiert ein neues Puzzle
        sudoApp.myGenerator.generatePuzzle();
        // Das Generator-Grid liefert das generierte Puzzle in der Form eines
        // Datenbankelements
        let puzzle = sudoApp.myGenerator.myGrid.getPlayedPuzzleDbElement();
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
        // Komponenten der WorkerApp
        this.myGenerator = new SudokuGenerator();
    }
    init(){
        this.myGenerator.init();
    }
}

// Starte und initialisiere die App
start();