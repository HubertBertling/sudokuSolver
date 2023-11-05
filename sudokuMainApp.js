let sudoApp;
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