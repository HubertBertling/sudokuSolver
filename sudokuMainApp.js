let sudoApp;
function start() {

    if (navigator.serviceWorker) {
        navigator.serviceWorker.register(
            '/sudokuSolver/sw.js',
            { scope: '/sudokuSolver/' }
        )
    }

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

        // 3. The tab view component
        this.myTabView = new SudokuTabView();
    }

    init() {
        this.myPuzzleDB.migratePuzzleDB()
        this.mySolver.init();
        this.mySolver.notify();
        this.myPuzzleDB.init();
        this.myTabView.init();
    }

    helpFunktion() {
        window.open('./help.html');
    }
}

// Launch and initialize the app
start();
