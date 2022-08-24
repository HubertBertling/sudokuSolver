let sudoApp;
const start = () => {
    sudoApp = new SudokuApp();
    sudoApp.init();
}

class SudokuApp {
    // Die Darstellung der ganzen App
    constructor() {
        // ==============================================================
        // Komponenten der App
        // ==============================================================
        this.mySolver = new SudokuSolver();
        this.mySolverView = new SudokuSolverView(this.mySolver);
        this.mySolverController = new SudokuSolverController(this.mySolver);
        // Ein echtes MVC-Pattern gibt es nur für den Solver
        // Die übrigen Model- und View-Klassen sind nur Subkomponenten
        // der Solver-Klassen. Sie verwirklichen keine eigene
        // Observer-Beziehung
        this.mySolver.attach(this.mySolverView);
        this.mySolver.setMyView(this.mySolverView);

        this.myPuzzleDB = new SudokuPuzzleDB();
        this.myPuzzleDBController = new SudokuPuzzleDBController(this.myPuzzleDB);
        // Die Reiteransicht
        this.myTabView = new SudokuTabView();
    }

    init() {
        this.mySolver.init();
        this.mySolver.notify();
        this.myPuzzleDB.init();
        this.myTabView.init();
    }

    helpFunktion() {
        window.open('./help.html');
    } 
}

// Starte und initialisiere die App
start();