// The Web Worker imports the common code
importScripts('./sudokuCommon.js');

let sudoApp;
function start() {
    //A worker app is assigned to the variable "sudoApp".
    sudoApp = new SudokuGeneratorApp();
    sudoApp.init();
}

// The Web Worker is assigned a message handler.
self.onmessage = function (n) {
    let request = JSON.parse(n.data);
    if (request.name == "generate") {
        // If the message is "generate", the Web Worker generates a new puzzle
        sudoApp.myGenerator.generatePuzzle(request.level);
        // The generator returns the generated puzzle in the form of a database element
        let generatedPuzzle = sudoApp.myGenerator.myGrid.getGeneratedPuzzleRecord();
        let response = {
            name: 'generated',
            value: generatedPuzzle
        }
        let str_response = JSON.stringify(response);
        // The serialized puzzle is sent as a message to Main
        self.postMessage(str_response);
        // The Web Worker terminates itself
        self.close();
    }
};

class SudokuGeneratorApp {
    constructor() {
        // The only component of the Sudoku worker app is the generator.
        this.myGenerator = new SudokuGenerator();
    }
    init() {
        this.myGenerator.init();
    }
}


class SudokuGenerator extends SudokuCalculator {
    // Der Generator erweitert den SudokuCalculator lediglich
    // um eine Methode, die Generierungsmethode.
    constructor() {
        super();
        this.init();
    }
    init() {
        super.init();
        super.setActualEvalType('strict-plus');
    }

       
    generatePuzzle(requestedLevel) {
        this.init();
        // Setze in zufälliger Zelle eine zufällige Nummer
        let randomCellIndex = Randomizer.getRandomIntInclusive(0, 80);
        this.myGrid.indexSelect(randomCellIndex);

        let randomCellContent = Randomizer.getRandomIntInclusive(1, 9).toString();
        this.atCurrentSelectionSetNumber(randomCellContent);

        // Suche unter den Lösungen dieses Sudoku eine Lösung 
        // mit dem vorgegebenen Schwierigkeitsgrad
        this.startGeneratorSolutionLoop(requestedLevel);
        if (this.myStepper.myResult !== 'success') {
            throw new Error('Generator is not able to find a puzzle with given difficulty');
        }
        
        // Löse das generierte Puzzle, um seinen Schwierigkeitsgrad zu ermitteln.
        // this.autoExecStop();
         // this.startGeneratorSolutionLoop(undefined);
    }

    startGeneratorSolutionLoop(requestedLevel) {
        super.startSyncLoop(requestedLevel);
    }
    takeBackSolvedCells(solTrack) {
        this.myGrid.takeBackSolvedCells(solTrack);
    }
    setSolvedToGiven() {
        this.myGrid.setSolvedToGiven();
    }
}
// Launch and initialize the worker app
start();
