let sudoApp;
let generator_1 = undefined;
let generator_2 = undefined;
let generator_3 = undefined;
let generator_4 = undefined;
let generator_5 = undefined;
let generator_6 = undefined;

let generatorHandler = function (e) {
    // Create the puzzle from the supplied string
    let tmpEvalType = sudoApp.mySolver.currentEvalType;
    let response = JSON.parse(e.data);
    // Load the puzzle into the solver
    sudoApp.mySolver.loadPuzzle('-', response.value);
    // The delivered puzzle contains its solution along with other info. Therefore
    // the puzzle must be reset at this point.
    sudoApp.mySolver.reset();
    sudoApp.mySolver.notify();
    sudoApp.mySolver.setActualEvalType(tmpEvalType);

    // console.log('generator_' + response.lfdNr + ' erfolgreich.');

    generator_1.terminate(); generator_1 = undefined;
    generator_2.terminate(); generator_2 = undefined;
    generator_3.terminate(); generator_3 = undefined;
    generator_4.terminate(); generator_4 = undefined;
    generator_5.terminate(); generator_5 = undefined;
    generator_6.terminate(); generator_6 = undefined;
    // The rotating loader icon is stopped
    aspectValue = {
        op: 'finished',
        rl: ''
    }
    sudoApp.mySolver.notifyAspect('puzzleGenerator', aspectValue);
}

function start() {

    sudoApp = new SudokuMainApp();
    sudoApp.init();

}
class SudokuMainApp {
    constructor() {
        // ==============================================================
        // Components of the app
        // ==============================================================
        // 1. The solver component
        this.mySolver = new SudokuSolver();
        this.mySolverView = new SudokuSolverView(this.mySolver);
        this.mySolverController = new SudokuSolverController(this.mySolver);
        // A true MVC pattern exists only for the solver. 
        // The other model and view classes are only subcomponents of the solver classes. 
        // They do not realize any own observer relationship.
        this.mySolver.attach(this.mySolverView);
        this.mySolver.setMyView(this.mySolverView);

        // 2. The database component
        this.myPuzzleDB = new SudokuPuzzleDB();
        this.myPuzzleDBController = new SudokuPuzzleDBController(this.myPuzzleDB);
        // this.myPuzzleDBView = new SudokuPuzzleDBView(this.myPuzzleDB);
        // this.myMobilePuzzleDBView = new SudokuMobilePuzzleDBView(this.myPuzzleDB);
    }

    init() {
        this.myPuzzleDB.migratePuzzleDB()
        this.mySolver.init();
        this.mySolver.notify();
        this.myPuzzleDB.init();
    }

    helpFunktion() {
        window.open('./help.html');
    }
}

// Launch and initialize the app
start();