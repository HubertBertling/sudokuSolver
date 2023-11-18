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
        //   let found = false;
        //   while (!found) {
        this.generatePuzzlePrivate();
        //       found = (this.myGrid.difficulty == requestedLevel);
        //   }
    }

    generatePuzzleWithLevel(requestedLevel) {
        // Zufälliger Anfangszustand
        this.initializeGeneratedPuzzle();
        // Generiere die ersten 20 Zellen
        for (let i = 0; i < 21; i++) {
            this.myGenerator.executeSingleStep();
        }
        while (!this.hiddenSingleSolvable()){
            this.myGenerator.executeSingleStep();
        }
        let currentLevel = this.calculateLevel();
        if (currentLevel == requestedLevel){
            return;
        }
        
        if (currentLevel == 'Schwer') {
            
        }
       
         // Mache die gelösten Zellen zu Givens
         this.setSolvedToGiven();

         // Prüfe Hidden Single Property
         // Falls nicht gegeben berechne eine weitere belegte Zelle
 
         //Falls Hidden Single Property gegeben
         // Berechne Schwierigkeitsgrad
 
         // Falls berechneter Schwierigkeitsgrad = gewünschter Schwierigkeitsgrad --> OK
         // Falls nicht:
         //      SWITCH berechneter Schwierigkeitsgrad
         //      case schwer: berechne eine weitere belegte Zelle. Und prüfe erneut.
         //      case leicht: nimm zuletzt berechnete Zelle zurück und wähle alternative Option
 

    }

    hiddenSingleSolvable() {
        // The matrix is hidden-single-solvable, if all unset cells
        // have an hidden single
        this.setSolvedToGiven();
        let hsSolvable = true;    
        for (let i = 0; i < 81; i++) {
            if (this.myGrid.sudoCells[i].getValue() !== '0'){
                if (this.sudoCells[i].getTotalAdmissibles().size !== 1) {
                    return false;
                };
            }
        }     
        this.setGivenToSolved();
        return hsSolvable;
    }





    initializeGeneratedPuzzle() {
        this.init();
        // Setze in zufälliger Zelle eine zufällige Nummer
        let randomCellIndex = Randomizer.getRandomIntInclusive(0, 80);
        this.myGrid.indexSelect(randomCellIndex);
        let randomCellContent = Randomizer.getRandomIntInclusive(1, 9).toString();
        this.atCurrentSelectionSetNumber(randomCellContent);
    }


    generatePuzzlePrivate() {
        this.init();
        // Setze in zufälliger Zelle eine zufällige Nummer
        let randomCellIndex = Randomizer.getRandomIntInclusive(0, 80);
        this.myGrid.indexSelect(randomCellIndex);

        let randomCellContent = Randomizer.getRandomIntInclusive(1, 9).toString();
        this.atCurrentSelectionSetNumber(randomCellContent);

        // Löse dieses Sudoku mit einer nicht getakteten
        // und nicht beobachteten automatischen Ausführung

        // Berechne Puzzle mit gewünschtem Schwierigkeitsgrad
        // Berechne 20 belegte Zellen
        // Merke: zuletzt gesetzte Zelle und die gewählte Option
        this.startGeneratorSolutionLoop();

       
        // Setze das Puzzle in den Define-Mode
        this.setGamePhase('define')
        // Lösche in der Lösung Nummern, solange
        // wie das verbleibende Puzzle backtrack-frei bleibt.
        this.takeBackSolvedCells();
        // Löse das generierte Puzzle, um seinen Schwierigkeitsgrad zu ermitteln.
        this.autoExecStop();
        this.startGeneratorSolutionLoop();
    }

    startGeneratorSolutionLoop() {
        super.startSyncLoop();
    }
    takeBackSolvedCells(level) {
        this.myGrid.takeBackSolvedCells(level);
    }
    setSolvedToGiven() {
        this.myGrid.setSolvedToGiven();
    }
}


// Launch and initialize the worker app
start();
