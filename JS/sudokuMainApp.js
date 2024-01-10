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
     
        this.myNewPuzzleStore = new NewPuzzleStore();
        this.myNavBar = new NavigationBar();

        // There are two play-modes 'training' and 'solving'.
        this.playMode = 'solving';
    }

    init() {
        //this.myPuzzleDB.migratePuzzleDB()
        this.mySolver.init();
        this.mySolver.notify();
        this.myPuzzleDB.init();
        this.myPuzzleDB.importBackRunPuzzle(back23, 'Backtrack_23', 'lqwgzcback23g2ak');
        this.myPuzzleDB.importBackRunPuzzle(back9, 'Backtrack_9', 'lqgwgzcback9hpfg2ak');

        this.myNewPuzzleStore.init();
        this.myNavBar.init();
    }
    

    helpFunktion() {
        window.open('./help.html');
    }
}

// Example puzzle with 23 back tracks

const back23 =   ["0","3","0","0","1","0","0","0","9",
            "0","0","6","0","0","0","5","0","0",
            "1","0","0","0","0","0","0","4","0",
            "4","0","0","0","0","3","2","0","0",
            "0","9","0","0","7","0","0","0","8",
            "0","0","5","6","0","0","0","0","0",
            "8","0","0","0","0","2","0","0","3",
            "0","0","0","0","9","0","0","7","0",
            "0","0","0","4","0","0","1","0","0"];

const back9  =   ["1","4","0","0","0","6","8","0","0",
            "0","0","0","0","5","0","0","0","2",
            "0","0","0","0","9","4","0","6","0",
            "0","0","4","0","0","0","0","0","0",
            "0","0","0","0","0","8","0","3","6",
            "7","5","0","0","0","1","9","0","0",
            "0","0","0","3","0","0","0","1","0",
            "0","9","0","0","0","0","0","0","5",
            "8","0","0","0","0","0","7","0","0"];


// Launch and initialize the app
start();