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
        sudoApp.myGenerator.generatePuzzle(-1);
        // The generator returns the generated puzzle in the form of a database element
        let generatedPuzzle = sudoApp.myGenerator.myGrid.getGeneratedPuzzleRecord();
        let response = {
            name: 'generated',
            value: generatedPuzzle,
        }
        let str_response = JSON.stringify(response);
        // The serialized puzzle is sent as a message to Main
        self.postMessage(str_response);
        // The Web Worker terminates itself
        self.close();
    } else if (request.name == "generateVerySimple") {
        // If the message is "generate", the Web Worker generates a new puzzle
        sudoApp.myGenerator.generateVerySimplePuzzle();
        // The generator returns the generated puzzle in the form of a database element
        let generatedPuzzle = sudoApp.myGenerator.myGrid.getGeneratedPuzzleRecord();
        let response = {
            name: 'generated',
            value: generatedPuzzle,
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
        this.myGenerator = new SudokuGenerator(this);
        // This is a non-interactive app
        this.isInteractive = false;
    }
    init() {
        this.myGenerator.init();
    }
}


class SudokuGenerator extends StepByStepSolver {
    // The generator only extends the StepByStepSolver
    // by one method, the generation method.
    constructor(app) {
        super(app);
        this.init();
    }

    init() {
        super.init();
        super.setActualEvalType('strict-plus');
        super.setPlayMode('solving');
    }

    generateVerySimplePuzzle() {
        this.generatePuzzle(36);
    }
    
    generatePuzzle(nrGivens) {
        this.init();
        // Set a random number in a random cell
        let randomCellIndex = Randomizer.getRandomIntInclusive(0, 80);
        this.myGrid.select(randomCellIndex);

        let randomCellContent = Randomizer.getRandomIntInclusive(1, 9).toString();
        this.atCurrentSelectionSetNumber(randomCellContent);

        // Solve this puzzle with a non-timed
        // automatic execution
        this.startGeneratorSolutionLoop();

        // Turn the dissolved cells into Givens
        this.setSolvedToGiven();

        // Set the puzzle to define mode
        this.setGamePhase('define')
        // Delete numbers in the solution as long
        // as long as the remaining puzzle remains backtrack-free.
        this.takeBackSolvedCells(nrGivens);
        // Solve the generated puzzle to determine its level of difficulty.
        this.autoExecStop();
        this.startGeneratorSolutionLoop();
    }

    startGeneratorSolutionLoop() {
        super.startSyncLoop();
    }
    takeBackSolvedCells(nr) {
        this.myGrid.takeBackSolvedCells(nr);    }
    setSolvedToGiven() {
        this.myGrid.setSolvedToGiven();
    }
}

// Launch and initialize the worker app
start();
