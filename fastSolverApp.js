// The Web Worker imports the common code
importScripts('./sudokuCommon.js');

let sudoApp;
function start() {
    //A worker app is assigned to the variable "sudoApp".
    sudoApp = new SudokuFastSolverApp();
    sudoApp.init();
    
}

// The Web Worker is assigned a message handler.
self.onmessage = function (n) {
    let request = JSON.parse(n.data);
    if (request.name == 'preRun') {
        // If the message is "solve", the Web Worker solves the puzzle, given in the request
        sudoApp.myFastSolver.solvePuzzle(request.value);
        // The FastSolver returns the metadata of the puzzle obtained through a preliminary run
        let preRunRecord = sudoApp.myFastSolver.myGrid.getPreRunRecord();
        let response = {
            name: 'preRun',
            value: preRunRecord,
        }
        let str_response = JSON.stringify(response);
        // The serialized puzzle is sent as a message to Main
        self.postMessage(str_response);
        // The Web Worker terminates itself
        self.close();
    }
};

class SudokuFastSolverApp {
    constructor() {
        // The only component of this app is the FastSolver.
        this.myFastSolver = new SudokuFastSolver();
    }
    init() {
        this.myFastSolver.init();
    }
}

class SudokuFastSolver extends SudokuCalculator {
    // Der FastSolver erweitert den SudokuCalculator lediglich
    // um eine Methode, die Solve-Methode.
    constructor() {
        super();
        super.init();
    }

    init() {
        super.init();
        // sudoApp.myFastSolver.myGrid.evalType ='strict-plus';
    }
    solvePuzzle(puzzleArray) {
        // this.init();
        // Löse dieses Sudoku mit einer nicht getakteten
        // und nicht beobachteten automatischen Ausführung
        // Create the puzzle from the supplied string
        // Load the puzzle into the solver
        this.myGrid.loadPuzzleArray(puzzleArray);
        this.myGrid.evaluateMatrix();
        this.startFastSolverSolutionLoop();
    }

    startFastSolverSolutionLoop() {
        super.startSyncLoop();
    }
}

// Launch and initialize the worker app
start();
