
class SudokuTabView {
    // The tab view component
    constructor() {
        this.myPages = [];
        // 1. The tab "Sudoku Solver"
        this.myPages.push(new SudokuGridPage("sudoku-grid-tab", "sudoku-solver"));
        // 2. The tab "Puzzle Database"
        this.myPages.push(new SudokuDatabasePage("puzzle-db-tab", "puzzle-db"));
        // 3. the help tab
        this.myPages.push(new SudokuHelpPage("puzzle-help-tab", "help"));
    }
    open(pageToOpen) {
        // Close all tabs
        this.myPages.forEach(page => {
            page.close();
        })
        pageToOpen.open();
    }
    openGrid() {
        // Close all tabs
        this.myPages.forEach(page => {
            page.close();
        })
        // Open the solver tab (the first tab)
        this.myPages[0].open();
    }
    init() {
        this.openGrid();
    }
}
class SudokuTabbedPage {
    // Abstract class for the tabbed page
    constructor(linkNodeId, contentNodeId) {
        this.myLinkNode = document.getElementById(linkNodeId);
        this.myContentNode = document.getElementById(contentNodeId);
        this.myLinkNode.addEventListener('click', () => {
            sudoApp.myTabView.open(this);
        })
        this.close();
    }
    close() {
        this.myContentNode.style.display = "none";
        this.myLinkNode.style.backgroundColor = "";
        this.myLinkNode.style.color = "";
    }
    open() {
        this.myContentNode.style.display = "block";
        this.myLinkNode.style.backgroundColor = '#F2E2F2';
        this.myLinkNode.style.color = 'black';
    }
}
class SudokuGridPage extends SudokuTabbedPage {
    constructor(tabId, contentId) {
        super(tabId, contentId);
    }
    open() {
        sudoApp.mySolver.notify();
        super.open();
    }
} class SudokuDatabasePage extends SudokuTabbedPage {
    constructor(tabId, contentId) {
        super(tabId, contentId);
    }
    open() {
        super.open();
        sudoApp.myPuzzleDB.display();
    }
}
class SudokuHelpPage extends SudokuTabbedPage {
    constructor(tabId, contentId) {
        super(tabId, contentId);
    }
    open() {
        super.open();
    }
}

class SudokuSolverController {
    constructor(solver) {
        // The solver model
        this.mySolver = solver;
        // Used dialogs
        this.mySuccessDialog = new SuccessDialog();
        this.myPuzzleSaveDialog = new PuzzleSaveDialog();

        // =============================================================
        // The events of the solver are set
        // =============================================================

        // Set click event for the number buttons
        this.number_inputs = document.querySelectorAll('.number');
        this.number_inputs.forEach((e, index) => {
            e.addEventListener('click', () => {
                // Notice: index + 1 = number on button
                let btnNumber = (index + 1).toString();
                this.handleNumberPressed(btnNumber);
            })
        });
        this.number_inputs = document.querySelectorAll('.mobile-number');
        this.number_inputs.forEach((e, index) => {
            e.addEventListener('click', () => {
                // Notice: index + 1 = number on button
                let btnNumber = (index + 1).toString();
                this.handleNumberPressed(btnNumber);
            })
        });

        //Click-Events for both delete buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-delete-cell');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleDeletePressed();
            })
        });
        // Events of keys on the keyboard
        window.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    this.handleNumberPressed(event.key);
                    break;
                case "Delete":
                case "Backspace":
                    this.handleDeletePressed();
                    break;
                default:
                    return;
            }
        });

        // Click-Events for both define buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-define');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.defineBtnPressed();
            })
        });

        // Click-Events for both play buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-play');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.playBtnPressed();
            })
        });

        // Click-Events for both step buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-autoStep');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.autoStepBtnPressed();
            })
        });

        // Click-Events for both run buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-run');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.startBtnPressed();
            })
        });

        // Click-Events for both pause buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-pause');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.pauseBtnPressed();
            })
        });

        // Click-Events for both stop buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-stop');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.stopBtnPressed();
            })
        });

        // Click-Events for both init buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-init');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.initBtnPressed();
            })
        });
        // Click-Events for both reset buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-reset');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.resetBtnPressed();
            })
        });
        // Click-Events for both generate buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-generate');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.generateBtnPressed();
            })
        });

        // Click-Event for save button desktop
        document.getElementById('btn-save').addEventListener('click', () => {
            this.saveBtnPressed();
        });
        // Click-Event for save button mobile
        document.getElementById('btn-save-mobile').addEventListener('click', () => {
            // Stop automatic execution that may be running
            this.mySolver.myStepper.stopAsyncLoop();
            // Close possibly open success dialogue
            this.mySuccessDialog.close();
            // Save puzzle 
            this.savePuzzleMobile();
        });
        // Overwrite puzzle data in the puzzle database, 
        // only available in the desktop variant
        document.getElementById('btn-overwrite').addEventListener('click', () => {
            this.overwriteBtnPressed();
        });

        // Save and print puzzle data, 
        // only available in the desktop variant
        document.getElementById('btn-print').addEventListener('click', () => {
            this.printBtnPressed();
        });

        // Click-Events for both showWrongNumbers buttons, desktop and mobile
        this.btns = document.querySelectorAll('.btn-showWrongNumbers');
        this.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showWrongNumbersBtnPressed();
            })
        });

        // Radio button eval type: No-evaluation, Lazy, Strikt+ oder Strikt-
        // desktop variant
        let radioEvalNodes = document.querySelectorAll('.eval-type');
        radioEvalNodes.forEach(radioNode => {
            radioNode.addEventListener('click', () => {
                this.evalTypeSelected(radioNode.value);
            })
        });
        // Radio button eval type: No-evaluation, Lazy, Strikt+ oder Strikt-
        // mobile variant
        let mobileRadioEvalNodes = document.querySelectorAll('.mobile-eval-type');
        mobileRadioEvalNodes.forEach(radioNode => {
            radioNode.addEventListener('click', () => {
                this.evalTypeSelected(radioNode.value);
            })
        });
    }

    // ===============================================================
    // Solver event handler
    // ===============================================================

    handleNumberPressed(nr) {
        if (this.mySolver.isInAutoExecution()) {
            // Number button pressed during automatic execution
            // The stepper is stopped and terminated
            this.mySolver.autoExecStop();
        } else {
            this.mySolver.atCurrentSelectionSetNumber(nr);
            if (this.mySolver.succeeds()) {
                this.mySuccessDialog.open();
            }
        }
    }

    handleDeletePressed() {
        if (this.mySolver.isInAutoExecution()) {
            // Delete button pressed during automatic execution
            // The stepper is stopped and terminated
            this.mySolver.autoExecStop();
        }
        this.mySolver.deleteSelected();

    }

    sudokuCellPressed(cell, index) {
        this.mySolver.select(cell, index);
    }

    defineBtnPressed() {
        this.mySolver.setGamePhase('define');
    }

    playBtnPressed() {
        this.mySolver.setGamePhase('play')
        if (this.mySolver.myGrid.solvedPuzzleRecord == null) {
            this.mySolver.getSolvedPuzzleRecord();
        }
    }

    autoStepBtnPressed() {
        this.mySolver.executeSingleStep();
    }

    startBtnPressed() {
        this.mySolver.startSolverLoop();
        if (this.mySolver.myGrid.solvedPuzzleRecord == null) {
            this.mySolver.getSolvedPuzzleRecord();
        }

    }

    pauseBtnPressed() {
        this.mySolver.autoExecPause();
    }

    stopBtnPressed() {
        this.mySolver.autoExecStop();
    }

    initBtnPressed() {
        this.mySolver.init();
    }

    resetBtnPressed() {
        this.mySolver.reset();
    }

    generateBtnPressed() {
        this.mySolver.getGeneratedPuzzle();
    }

    saveBtnPressed() {
        this.mySuccessDialog.close();
        let newPuzzelId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.myPuzzleSaveDialog.open(newPuzzelId, 'Gespeichert am (' + new Date().toLocaleString('de-DE') + ')');
    }

    overwriteBtnPressed() {
        this.mySolver.autoExecStop();
        this.mySuccessDialog.close();
        let playedPuzzleDbElement = this.mySolver.myGrid.getPlayedPuzzleRecord();

        let puzzleId = this.mySolver.myGrid.loadedPuzzleId;
        if (puzzleId == '' || puzzleId == '-') {
            let newPuzzelId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            this.myPuzzleSaveDialog.open(newPuzzelId, 'Gespeichert am (' + new Date().toLocaleString('de-DE') + ')');
        } else {
            sudoApp.myPuzzleDB.mergePlayedPuzzle(puzzleId, playedPuzzleDbElement);
            // Wechsle in den DB-Reiter
            // document.getElementById("puzzle-db-tab").click();
        }
    }

    printBtnPressed() {
        this.mySolver.autoExecStop();
        this.mySuccessDialog.close();
        let playedPuzzleDbElement = this.mySolver.myGrid.getPlayedPuzzleRecord();

        let puzzleId = this.mySolver.myGrid.loadedPuzzleId;
        if (puzzleId == '' || puzzleId == '-') {
            let newPuzzelId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            // this.myPuzzleSaveDialog.open(newPuzzelId, '');
            //Speichere den named Zustand
            sudoApp.myPuzzleDB.saveNamedPuzzle(newPuzzelId, 'Druck (' + new Date().toLocaleString('de-DE') + ')', playedPuzzleDbElement);

            document.getElementById("puzzle-db-tab").click();
            sudoApp.myPuzzleDBController.printBtnPressed();
        } else {
            document.getElementById("puzzle-db-tab").click();
            sudoApp.myPuzzleDBController.printBtnPressed();
        }
    }
    showWrongNumbersBtnPressed() {
        if (this.mySolver.getGamePhase() == 'play') {
            let solvedPuzzle = this.mySolver.myGrid.solvedPuzzle;
            // Hier die falschen Zellen markieren
            for (let i = 0; i < 81; i++) {
                let currentCellValue = sudoApp.mySolver.myGrid.sudoCells[i].getValue();
                let currentCellPhase = sudoApp.mySolver.myGrid.sudoCells[i].getPhase();
                if (currentCellValue !== '0' &&
                    currentCellPhase !== 'define' &&
                    currentCellValue !== solvedPuzzle[i].cellValue) {
                    // Mark cell wrong
                    sudoApp.mySolver.myGrid.sudoCells[i].setWrong();
                }
            }
            sudoApp.mySolver.notify();
        }
    }

    evalTypeSelected(value) {
        this.mySolver.evalTypeSelected(value);
        this.mySolver.notify();
    }

    savePuzzleDlgOKPressed() {
        this.myPuzzleSaveDialog.close();
        // Der Name unter dem der aktuelle Zustand gespeichert werden soll
        let puzzleId = this.myPuzzleSaveDialog.getPuzzleId();
        let puzzleName = this.myPuzzleSaveDialog.getPuzzleName();
        let playedPuzzleDbElement = this.mySolver.myGrid.getPlayedPuzzleRecord();
        //Speichere den named Zustand
        sudoApp.myPuzzleDB.saveNamedPuzzle(puzzleId, puzzleName, playedPuzzleDbElement);
        // Wechsle in den DB-Reiter
        document.getElementById("puzzle-db-tab").click();
    }

    savePuzzleMobile() {
        let playedPuzzleDbElement = this.mySolver.myGrid.getPlayedPuzzleRecord();
        //Speichere den named Zustand
        sudoApp.myPuzzleDB.saveMobilePuzzle(playedPuzzleDbElement);
    }

    savePuzzleDlgCancelPressed() {
        this.myPuzzleSaveDialog.close()
    }

    successDlgOKPressed() {
        this.mySuccessDialog.close();
        if (this.mySuccessDialog.further()) {
            this.mySolver.tryMoreSolutions();
        }
    }
}


class SudokuView {
    constructor(model) {
        this.myModel = model;
        this.myNode = null;
    }

    getMyModel() {
        return this.myModel;
    }
    setMyNode(node) {
        this.myNode = node;
    }
    getMyNode() {
        return this.myNode;
    }
    upDate() {
        throw new Error('You have to implement the method upDate()!');
    }
    upDateAspect(aspect, aspectValue) {
        throw new Error('You have to implement the method upDateAspect(aspect, aspectValue)!');
    }

}
class SudokuModel {
    constructor() {
        this.myObservers = [];
        // Dies ist eine Sondersituation. In dieser Anwendung
        // besitzt jedes Model eine View.
        this.myView = null;
        this.parentModel = null;
    }
    attach(view) {
        // Die View kann ein Beobachter des Models sein.
        // Aber nicht in jedem Fall.
        // Im Puzzle-Generator sind die Views abgeschaltet,
        // sie sind nicht als Beobachter eingetragen.
        this.myObservers.push(view);
    }
    setMyView(view) {
        this.myView = view;
    }
    getMyView() {
        return this.myView;
    }

    notify() {
        // Die eigene View anzeigen
        this.myObservers.forEach(observer => {
            observer.upDate();
        });
    }

    notifyAspect(aspect, aspectValue) {
        // Die eigene View anzeigen
        this.myObservers.forEach(observer => {
            observer.upDateAspect(aspect, aspectValue);
        });
    }
}

class SudokuSolverView extends SudokuView {
    constructor(solver) {
        super(solver);
        this.progressBar = new ProgressBar();
        this.displayTechnique('&lt Selektiere Zelle mit grüner oder roter Nummer &gt');

    }


    upDate() {
        // Den kompletten Solver neu anzeigen
        let myGrid = this.getMyModel().getMyGrid();
        let myStepper = this.getMyModel().getMyStepper();

        myGrid.getMyView().upDate();
        this.displayGamePhase();
        this.displayLoadedBenchmark(myGrid.difficulty, myGrid.backTracks);
        // this.displayBenchmark(myStepper.levelOfDifficulty, myStepper.countBackwards);
        this.displayGoneSteps(myStepper.getGoneSteps());
        this.displayAutoDirection(myStepper.getAutoDirection());
        this.displayProgress();
        this.displayPuzzle(myGrid.loadedPuzzleId, myGrid.loadedPuzzleName);
    }

    upDateAspect(aspect, aspectValue) {
        switch (aspect) {
            case 'puzzleGenerator': {
                switch (aspectValue) {
                    case 'started': {
                        this.startLoaderAnimation();
                        break;
                    }
                    case 'finished': {
                        this.stopLoaderAnimation();
                        break;
                    }
                    default: {
                        throw new Error('Unknown aspectValue: ' + aspectValue);
                    }
                }
                break;
            }
            case 'evaluationType': {
                this.displayEvalType(aspectValue);
                break;
            }
            default: {
                throw new Error('Unknown aspect: ' + aspect);
            }
        }
    }

    displayGamePhase() {
        let gamePhase = this.getMyModel().getGamePhase();
        if (gamePhase == 'play') {
            this.btns = document.querySelectorAll('.btn-define');
            this.btns.forEach(btn => {
                btn.classList.remove('pressed');
            });
            this.btns = document.querySelectorAll('.btn-play');
            this.btns.forEach(btn => {
                btn.classList.add('pressed');
            });
        } else if (gamePhase == 'define') {
            this.btns = document.querySelectorAll('.btn-define');
            this.btns.forEach(btn => {
                btn.classList.add('pressed');
            });
            this.btns = document.querySelectorAll('.btn-play');
            this.btns.forEach(btn => {
                btn.classList.remove('pressed');
            });
        }
    }

    displayGoneSteps(goneSteps) {
        let goneStepsNode = document.getElementById("step-count");
        goneStepsNode.innerHTML = '<b>Schritte:</b> &nbsp' + goneSteps;
    }

    displayAutoDirection(autoDirection) {
        let forwardNode = document.getElementById("radio-forward");
        let backwardNode = document.getElementById("radio-backward");
        if (autoDirection == 'forward') {
            forwardNode.classList.add('checked');
            backwardNode.classList.remove('checked');
        } else {
            forwardNode.classList.remove('checked');
            backwardNode.classList.add('checked');
        }
    }

    displayEvalType(et) {
        let noEvalNode = document.getElementById('no-eval');
        let lazyNode = document.getElementById('lazy');
        let strictPlusNode = document.getElementById('strict-plus');
        let strictMinusNode = document.getElementById('strict-minus');

        let mobileNoEvalNode = document.getElementById('mobile-no-eval');
        let mobileLazyNode = document.getElementById('mobile-lazy');
        let mobileStrictMinusNode = document.getElementById('mobile-strict-minus');
        switch (et) {
            case 'no-eval': {
                noEvalNode.checked = true;
                mobileNoEvalNode.checked = true;
                break;
            }
            case 'lazy': {
                lazyNode.checked = true;
                mobileLazyNode.checked = true;
                break;
            }
            case 'strict-plus': {
                strictPlusNode.checked = true;
                break;
            }
            case 'no-strict-minus': {
                strictMinusNode.checked = true;
                mobileStrictMinusNode.checked = true;
                break;
            }
            default: {
                throw new Error('Unknown eval type: ' + et);
            }
        }
    }


    displayProgress() {
        let myGrid = this.getMyModel().myGrid;
        let countDef = myGrid.numberOfGivens();
        let countTotal = myGrid.numberOfSolvedCells();
        this.progressBar.setValue(countDef, countTotal);
    }

    displayReasonInsolvability(reason) {
        let reasonNode = document.getElementById("reasonInsolvability");
        let evalNode = document.getElementById("technique");
        if (reason == '') {
            reasonNode.style.display = "none";
            evalNode.style.display = "block";
        } else {
            reasonNode.style.display = "block";
            evalNode.style.display = "none";
            reasonNode.innerHTML =
                '<b>Widerspruch:</b> &nbsp' + reason;
        }
    }

    displayTechnique(tech) {
        let evalNode = document.getElementById("technique");
        if (tech.includes('notwendig, weil')) {
            evalNode.style.color = 'darkgreen';
        } else {
            evalNode.style.color = 'Crimson';
        }
        evalNode.innerHTML = '<b>Erläuterung (nur Lazy):</b> &nbsp' + tech;
    }

    displayLoadedBenchmark(levelOfDifficulty, countBackwards) {
        let evalNode = document.getElementById("loaded-evaluations");
        if (countBackwards == 0) {
            evalNode.innerHTML =
                '<span style="background-color:#7986CB ; color:white ; width: 5rem"> &nbsp Puzzle:</span> <b> &nbsp Schwierigkeitsgrad:</b> &nbsp' + levelOfDifficulty + '; &nbsp'
        } else {
            evalNode.innerHTML =
                '<span style="background-color:#7986CB ; color:white ; width: 5rem"> &nbsp Puzzle:</span> <b> &nbsp Schwierigkeitsgrad:</b> &nbsp' + levelOfDifficulty + '; &nbsp'
                + '<b>Rückwärtsläufe:</b> &nbsp' + countBackwards;
        }
    }
    /*
    displayBenchmark(levelOfDifficulty, countBackwards) {
        let evalNode = document.getElementById("evaluations");
        if (countBackwards == 0) {
            evalNode.innerHTML =
                '<span style="background-color:#4DB6AC; width: 7rem"> &nbsp Berechnet:</span> <b> &nbsp Schwierigkeitsgrad:</b> &nbsp' + levelOfDifficulty + '; &nbsp'
        } else {
            evalNode.innerHTML =
                '<span style="background-color:#4DB6AC; width: 7rem"> &nbsp Berechnet:</span> <b> &nbsp Schwierigkeitsgrad:</b> &nbsp' + levelOfDifficulty + '; &nbsp'
                + '<b>Rückwärtsläufe:</b> &nbsp' + countBackwards;
        }
    }
    */

    startLoaderAnimation() {
        // Der sich drehende Loader wird angezeigt
        document.getElementById("loader").style.display = "block";
    }
    stopLoaderAnimation() {
        document.getElementById("loader").style.display = "none";
    }

    displayPuzzle(uid, name) {
        if (uid == '') uid = ' - ';
        if (name == '') name = ' - ';
        let statusLineNode = document.getElementById('status-line');
        statusLineNode.innerHTML =
            '<b>Puzzle-Id:</b> &nbsp' + uid + '; &nbsp'
            + '<b>Puzzle-Name:</b> &nbsp' + name;
    }

}


class SudokuCalculator extends SudokuModel {
    // SudokuCalculator ist abstrakte Oberklaase für den Solver und Generator.
    // Der Generator und der Solver verwenden dieselben
    // Grid-Operationen.

    constructor() {
        super();
        // Die Matrix des Sudoku-Calculators
        this.myGrid = new SudokuGrid(this);
        //Die Calculator kennt zwei Betriebs-Phasen 'play' or 'define'
        this.currentPhase = 'play';
        // Der Calculator kennt zwei Ausführungsmodi: 
        // manuelle oder automatische Ausführung
        this.isInAutoExecMode = false;
        // Für eine automatische Lösungssuche legt die App
        // einen Stepper an. Für jede Ausführung einen neuen.
        this.myStepper = new StepperOnGrid(this.myGrid);
        this.isStepExecutionObserver = false;
        this.init();
    }

    init() {
        // Die App kann in verschiedenen Ausführungsmodi sein
        // 'automatic' 'manual'
        this.myStepper.stopAsyncLoop();
        this.currentPhase = 'define';
        this.isInAutoExecMode = false;
        this.myGrid.init();
        this.myStepper = new StepperOnGrid(this.myGrid);
        this.myStepper.init();
        // Ein neuer Stepper wird angelegt und initialisert
    }
    reset() {
        this.myStepper.stopAsyncLoop();
        this.myStepper = new StepperOnGrid(this.myGrid);
        this.myGrid.reset();
        this.myStepper.init();
        this.currentPhase = 'play';
        this.isInAutoExecMode = false;

    }
    // =================================================
    // Other Methods
    // =================================================

    loadPuzzle(uid, puzzle) {
        this.init();
        this.myGrid.loadPuzzle(uid, puzzle);
        this.setGamePhase('play');
    }

    loadPuzzleInfos(uid, puzzle) {
        this.myGrid.loadPuzzleInfos(uid, puzzle);
    }


    startAsyncLoop() {
        if (this.isInAutoExecMode) {
            // Im automatischen Ausführungsmodus
            // muss lediglich die zeitgetacktete Loop gestartet werden.
            this.myStepper.startAsyncLoop();
        } else {
            if (this.myStepper.deadlockReached()) {
                // Der Calculator braucht gar nicht in den Auto-Modus gesetzt werden
                alert("Keine (weitere) Lösung gefunden!");
            } else {
                // Der Calculator wird in den Auto-Modus gesetzt
                // und die zeitgetacktete Loop wird gestartet.
                this.setInAutoExecMode();
                this.myStepper.startAsyncLoop();
            }
        }
    }


    startSyncLoop() {
        if (this.isInAutoExecMode) {
            // Im automatischen Ausführungsmodus
            // muss lediglich die Loop gestartet werden.
            this.myStepper.startSynchronousLoop();
        } else {
            if (this.myStepper.deadlockReached()) {
                // Der Calculator braucht gar nicht in den Auto-Modus gesetzt werden
                if (sudoApp instanceof SudokuMainApp) {
                    alert("Keine (weitere) Lösung gefunden!");
                } else {
                    // Übertrage Stepper-Infos nach Grid-Infos.
                    this.myGrid.difficulty = 'unlösbar';
                    this.myGrid.backTracks = this.countBackwards;
                    this.myGrid.steps = this.goneSteps;
                    this.notifyLoopFinished();
                }
            } else {
                // Der Calculator wird in den Auto-Modus gesetzt
                // und die Loop wird gestartet.
                this.setInAutoExecMode();
                this.myStepper.startSynchronousLoop();
            }
        }
    }


    setInAutoExecMode() {
        // Calculator in autoExecMode setzen, so
        // dass die Looper gestartet werden können.
        this.setGamePhase('play');
        this.isInAutoExecMode = true;
        if (this.myGrid.evalType == 'no-eval') {
            this.myGrid.setEvalType('lazy');
            this.notifyAspect('evaluationType', 'lazy');
        }
        this.myGrid.clearAutoExecCellInfos();
        this.myGrid.deselect();
        this.myStepper.init();

    }

    tryMoreSolutions() {
        this.myStepper.setAutoDirection('backward');
        this.myStepper.myResult = '';
        this.myStepper.startAsyncLoop();
    }

    setExecutionObserver() {
        this.isStepExecutionObserver = true;
    }


    isInAutoExecution() {
        return this.isInAutoExecMode;
    }

    atCurrentSelectionSetNumber(number) {
        this.myGrid.atCurrentSelectionSetNumber(number, this.currentPhase, false);
    }
    deleteSelected() {
        this.myStepper.deleteSelected(this.currentPhase, false);
    }

    select(cell, index) {
        this.myGrid.select(cell, index);
    }
    deselect() {
        this.myGrid.deselect();
    }

    executeSingleStep() {
        if (this.isInAutoExecMode) {
            this.myStepper.executeSingleStep();
        } else {
            if (this.myStepper.deadlockReached()) {
                alert("Keine (weitere) Lösung gefunden!");
            } else {
                this.setInAutoExecMode();
                this.myStepper.executeSingleStep();
            }
        }
    }

    autoExecPause() {
        this.myStepper.stopAsyncLoop();
    }

    autoExecProceed() {
        //  this.myGrid.deselect();
        this.myStepper.startAsyncLoop();
    }

    autoExecStop() {
        // Die automatische Ausführung des Calculators wird gestoppt.
        // 1. Die eventuell laufende asynchrone Loop wird angehalten
        this.myStepper.stopAsyncLoop();
        // 2. Der ExecMode des Calculators wird abgeschaltet.
        this.isInAutoExecMode = false;
        // this.myGrid.deselect();
        this.myGrid.clearAutoExecCellInfos();
        this.myStepper.init();
    }

    evalTypeSelected(value) {
        this.myGrid.deselect();
        this.myGrid.setEvalType(value);
    }

    setAutoDirection(direction) {
        this.myStepper.setAutoDirection(direction);
    }

    // =================================================
    // Getter
    // =================================================

    getMyGrid() {
        return this.myGrid;
    }
    getMyStepper() {
        return this.myStepper;
    }

    autoExecIsOn() {
        return this.isInAutoExecMode;
    }

    getGamePhase() {
        return this.currentPhase;
    }

    // =================================================
    // Setter
    // =================================================
    setMyStepper(stepper) {
        this.myStepper = stepper;
    }

    setGamePhase(gamePhase) {
        this.currentPhase = gamePhase;
    }

}



class SudokuSolver extends SudokuCalculator {
    // Der Solver erweitert den Calculator um
    // um die Ansichtsklassen, die die Matrix 
    // über den DOM-Tree sichtbar machen.

    constructor() {
        super();
        // Die Matrix des Sudoku-Solver
        this.myGridView = new SudokuGridView(this.myGrid);
        this.myGrid.setMyView(this.myGridView);
        super.setExecutionObserver();
    }

    init() {
        super.init();
        this.notify();
    }

    clearLoadedPuzzleInfo(key) {
        let loadedPuzzleId = this.myGrid.loadedPuzzleId;
        if (loadedPuzzleId == key) {
            this.myGrid.loadedPuzzleId = '';
            this.myGrid.loadedPuzzleName = '';
        }
    }

    getGeneratedPuzzle() {
        // The rotating loader icon is started
        this.notifyAspect('puzzleGenerator', 'started');
        // A new web worker that performs the generation, is created.
        let webworkerPuzzleGenerator = new Worker("./generatorApp.js");
        // A message handler is given to the web worker. The web worker
        // sends a message containing the generated puzzle as a string.
        webworkerPuzzleGenerator.onmessage = function (e) {
            // Create the puzzle from the supplied string
            let response = JSON.parse(e.data);
            // Load the puzzle into the solver
            sudoApp.mySolver.loadPuzzle('-', response.value);
            // The delivered puzzle contains its solution along with other info. Therefore
            // the puzzle must be reset at this point.
            sudoApp.mySolver.reset();
            sudoApp.mySolver.notify();
            sudoApp.myTabView.openGrid();
            // The rotating loader icon is stopped
            sudoApp.mySolver.notifyAspect('puzzleGenerator', 'finished');
        }
        // The new web worker is sent the request message, 
        // which starts the generation of the new puzzle. 
        let request = {
            name: 'generate',
            value: ''
        }
        let str_request = JSON.stringify(request);
        webworkerPuzzleGenerator.postMessage(str_request);
    }

    getSolvedPuzzleRecord() {
        // The rotating loader icon is started
        // this.notifyAspect('puzzleGenerator', 'started');
        // A new web worker that performs the fast solution of this puzzle, is created.
        let webworkerFastSolver = new Worker("./fastSolverApp.js");
        // A message handler is given to the web worker. The web worker
        // sends a message containing the solved puzzle as a string.
        webworkerFastSolver.onmessage = function (e) {
            // Create the puzzle from the supplied string
            let response = JSON.parse(e.data);
            sudoApp.mySolver.loadPuzzleInfos('-', response.value);
            sudoApp.mySolver.notify();
            // The rotating loader icon is stopped
            // sudoApp.mySolver.notifyAspect('puzzleGenerator', 'finished');
        }
        // The new web worker is sent the request message, 
        // which starts the fast solution of the puzzle.
        let puzzleRecord = sudoApp.mySolver.myGrid.getPlayedPuzzleRecord();
        let request = {
            name: 'solve',
            value: puzzleRecord
        }
        let str_request = JSON.stringify(request);
        webworkerFastSolver.postMessage(str_request);
    }

    startSolverLoop() {
        // Der Solver nutzt die asynchrone solution loop.
        super.startAsyncLoop();
    }

    isInAutoExecution() {
        return super.isInAutoExecution();
    }

    succeeds() {
        return this.myGrid.isFinished() && !this.myGrid.isInsolvable();
    }

    atCurrentSelectionSetNumber(number) {
        super.atCurrentSelectionSetNumber(number);
        this.notify();
    }
    deleteSelected() {
        super.deleteSelected();
        this.notify();
    }
    select(cell, index) {
        super.select(cell, index);
        this.notify();
    }
    deselect() {
        super.deselect();
        this.notify();
    }
    setGamePhase(phase) {
        super.setGamePhase(phase);
        this.notify();
    }
    executeSingleStep() {
        super.executeSingleStep();
    }
    autoExecStop() {
        super.autoExecStop();
        this.notify();
    }

    onStepExecution() {
        this.notify();
    }
    onLoopFinish() {
        sudoApp.mySolverController.mySuccessDialog.open();
    }

    reset() {
        super.reset();
        this.notify();
    }

    evalTypeSelected(value) {
        super.evalTypeSelected(value);
        this.notify();
    }

    autoExecProceed() {
        super.autoExecProceed();
    }
}

class ProgressBar {
    constructor() {
        this.elemPlay = document.getElementById("myBarPlay");
        this.elemDef = document.getElementById("myBarDef");
        this.elemUnset = document.getElementById("total-bar-value");
    }
    init() {
        this.elemPlay.style.width = "10%"
        this.elemDef.style.width = "10%"
    }
    setValue(defCount, totalCount) {
        let playCount = totalCount - defCount;
        let defCountProzent = Math.floor(defCount / 81 * 100);
        let playCountProzent = Math.floor(totalCount / 81 * 100);

        this.elemDef.style.width = defCountProzent + "%";
        this.elemPlay.style.width = playCountProzent + "%";
        if (defCount < 10) {
            this.elemDef.innerHTML = '';
        } else {
            this.elemDef.innerHTML = defCount;
        }
        if (playCount < 2) {
            this.elemPlay.innerHTML = '';
            this.elemPlay.style.paddingRight = "0px"

        } else {
            this.elemPlay.innerHTML = playCount;
            this.elemPlay.style.paddingRight = "5px"
        }
        this.elemUnset.innerHTML = 81 - totalCount;
    }
}


class PuzzleSaveDialog {
    constructor() {
        this.winBox;
        this.myOpen = false;

        this.myPuzzleNameNode = document.getElementById("puzzle-name");
        this.myPuzzleIdNode = document.getElementById("save-dlg-puzzle-id");
        this.okNode = document.getElementById("btn-saveStorageOK");
        this.cancelNode = document.getElementById("btn-saveStorageCancel");
        // Mit der Erzeugung des Wrappers werden 
        // auch der Eventhandler OK und Abbrechen gesetzt
        this.okNode.addEventListener('click', () => {
            sudoApp.mySolverController.savePuzzleDlgOKPressed();
        });
        this.cancelNode.addEventListener('click', () => {
            sudoApp.mySolverController.savePuzzleDlgCancelPressed();
        });
    }
    open(uid, name) {
        if (window.screen.availWidth < 421) {
            this.winBox = new WinBox("Puzzle speichern unter ...", {
                x: "center",
                y: "center",
                width: "400px",
                height: "280px",
                mount: document.getElementById("contentSaveDlg")
            });
        } else {
            this.winBox = new WinBox("Puzzle speichern unter ...", {
                x: "center",
                y: "center",
                width: "300px",
                height: "240px",
                mount: document.getElementById("contentSaveDlg")
            });
        }

        this.myOpen = true;
        this.myPuzzleIdNode.removeAttribute("readonly");
        this.myPuzzleIdNode.value = uid;
        this.myPuzzleIdNode.setAttribute("readonly", true);
        this.myPuzzleNameNode.value = name;
    }

    close() {
        if (this.myOpen) {
            this.winBox.close();
            this.myOpen = false;
        }
    }
    getPuzzleId() {
        return this.myPuzzleIdNode.value;
    }
    getPuzzleName() {
        return this.myPuzzleNameNode.value;
    }
}

class SuccessDialog {
    constructor() {
        this.myWidth = 240;
        this.myHeight = 390;
        this.winBox;
        this.myOpen = false;
        this.okNode = document.getElementById("btn-successOK");
        this.checkBoxNode = document.getElementById("further");
        this.okNode.addEventListener('click', () => {
            sudoApp.mySolverController.successDlgOKPressed();
        });
    }
    open() {
        if (window.screen.availWidth < 421) {
            this.winBox = new WinBox("Lösung gefunden", {
                x: "center",
                y: "center",
                width: "255px",
                height: "400px",
                mount: document.getElementById("contentSuccessDlg")
            });
        } else {
            this.winBox = new WinBox("Lösung gefunden", {
                x: "center",
                y: "center",
                width: "255px",
                height: "400px",
                mount: document.getElementById("contentSuccessDlg")
            });
        }
        this.checkBoxNode.checked = false;
        this.myOpen = true;
    }
    close() {
        if (this.myOpen) {
            this.winBox.close();
            this.myOpen = false;
        }
    }
    init() {
        this.checkBoxNode.checked = false;
    }
    further() {
        return this.checkBoxNode.checked;
    }
}



class Randomizer {
    static getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static getRandomNumbers(numberOfrandoms, min, max) {
        let randoms = [];
        let currentRandom = 0;
        while (randoms.length < numberOfrandoms) {
            currentRandom = Randomizer.getRandomIntInclusive(min, max);
            if (currentRandom < max && !randoms.includes(currentRandom)) {
                randoms.push(currentRandom);
            }
        }
        return randoms;
    }
}

class SudokuSet extends Set {
    // Die mathematische Menge ohne Wiederholungen
    // Intensiv genutzt für die Berechnung indirekt unzulässiger
    // Nummern in der Sudoku-Matrix.
    constructor(arr) {
        super(arr);
    }
    logSet() {
        console.log('       ====  Set: ');
        this.forEach(elem => {
            console.log('                     ' + elem);
        })
    }
    isSuperset(subset) {
        for (var elem of subset) {
            if (!this.has(elem)) {
                return false;
            }
        }
        return true;
    }

    isSubset(superset) {
        for (var elem of this) {
            if (!superset.has(elem)) {
                return false;
            }
        }
        return true;
    }

    union(setB) {
        var _union = new SudokuSet(this);
        for (var elem of setB) {
            _union.add(elem);
        }
        return _union;
    }
    difference(setB) {
        var _difference = new SudokuSet(this);
        for (var elem of setB) {
            _difference.delete(elem);
        }
        return _difference;
    }

    intersection(setB) {
        var _intersection = new SudokuSet();
        for (var elem of setB) {
            if (this.has(elem)) {
                _intersection.add(elem);
            }
        }
        return _intersection;
    }
    equals(setB) {
        if (this.size !== setB.size) {
            return false
        } else {
            for (var a of this) if (!setB.has(a)) return false;
            return true;
        }
    }
}

//========================================================================
class BackTracker {
    // Der Backtracker realisiert eine Back-Tracking-Buchführung. Er wird vom
    // Stepper genutzt, damit dieser in der Sequenz seiner Schritte einen
    // Backtracking-Prozess realisieren kann. 
    // Der Backtracker dokumentiert die vom Stepper durchgeführten Schritte, so dass
    // sie bei Bedarf wieder rückgängig gemacht werden können.
    // Schritte müssen rückgängig gemacht werden, wenn der letzte vollzogene Schritt des
    // Steppers für das Puzzle einen Widerspruch aufgedeckt hat. Dann muss der Stepper
    // mit Hilfe des Backtrackers solange rückwärts gehen, bis er einen Optionsschritt erreicht,
    // an dem er beim ersten Besuch eine Option hatte. Nun startet er einen weiteren Versuch mit einer
    // anderen Option des Optionsschrittes.

    // Der Backtracker erzeugt einen Ausführungsbaum aus Optionsschritten, die für jede Option
    // des Optionsschrittes einen Optionspfad haben. Der Optionspfad besteht aus einer Sequenz
    // von wirklichen Schritten, die eine Nummernsetzung dokumentieren.

    constructor() {
        // Der Backtracker speichert den aktuellen Schritt des Backtracking-Prozesses.
        // Initial ist der aktuelle Schritt ein Pseudo-Optionsschritt, der zugleich
        // die Wurzel des Backtracking-Baumes ist.
        // Die Besonderheiten des Wurzeloptionsschrittes:
        // 1. Der Wurzeloptionsschritt befindet sich nicht in einem Pfad eines anderen Optionsschrittes
        // 2. Der Wurzeloptionsschritt zeigt nicht auf eine Zelle der Sudoku-Matrix.
        // 3. Die Optionsliste enthält keine zulässige Nummer.
        this.currentStep = new BackTrackOptionStep(null, -1, ['0']);
        this.maxDepth = 0;
    }
    getCurrentStep() {
        return this.currentStep;
    }
    getCurrentSearchDepth() {
        let tmpDepth = this.currentStep.getDepth();
        if (tmpDepth > this.maxDepth) {
            this.maxDepth = tmpDepth;
        }
        return tmpDepth;
    }
    getMaxSearchDepth() {
        return this.maxDepth;
    }
    isOnBackTrackOptionStep() {
        this.currentStep instanceof BackTrackOptionStep;
    }
    addBackTrackOptionStep(cellIndex, optionList) {
        this.currentStep = this.currentStep.addBackTrackOptionStep(cellIndex, optionList);
        return this.currentStep;
    }
    addBackTrackRealStep(cellIndex, cellValue) {
        this.currentStep = this.currentStep.addBackTrackRealStep(cellIndex, cellValue);
        return this.currentStep;
    }
    getNextBackTrackRealStep() {
        this.currentStep = this.currentStep.getNextBackTrackRealStep();
        return this.currentStep;
    }
    previousStep() {
        this.currentStep = this.currentStep.previousStep();
        return this.currentStep;
    }
}

class BackTrackOptionStep {
    constructor(ownerPath, cellIndex, optionList) {
        // Der Optionstep befindet sich in einem Optionpath
        this.myOwnerPath = ownerPath;
        // Der BackTrackOptionStep zeigt auf eine Grid-Zelle
        this.myCellIndex = cellIndex;
        // Der BackTrackOptionStep speichert die Optionsnummern des Schrittes
        this.myOptionList = optionList.slice();
        // Die Optionsliste wird mittels pop-Operationen abgearbeitet.
        // Damit dennoch die normale (FIFO) Reihenfolge der Bearbeitung realisiert wird,
        // wird die Liste umgedreht.
        this.myNextOptions = optionList.slice().reverse();

        // Der OptonStep hat für jede Option einen eigenen BackTrackOptionPath
        if (optionList.length == 1) {
            // Dann kann es nur einen Pfad geben, und dieser wird sofort angelegt.
            // Nur der Optionsschritt an der Wurzel hat nur eine Option, eine Pseudo-Option.
            // Später gibt es keine einelementigen Optionslisten.
            // Denn eine Option wählen muss man erst, wenn mindestens 2 Optionen zur Auswahl stehen.
            this.myOwnerPath = new BackTrackOptionPath(optionList[0], this)
        }
    }
    isOpen(nr) {
        // Die Nummer nr ist offen, wenn sie noch nicht probiert wurde,
        // d.h. sie befindet sich noch in der NextOption-Liste
        for (let i = 0; i < this.myNextOptions.length; i++) {
            if (this.myNextOptions[i] == nr) {
                return true;
            }
        }
        return false;
    }
    options() {
        // Die Optionen des Option-Steps
        let tmpOptionList = [];
        this.myOptionList.forEach(optionNr => {
            let tmpOption = {
                value: optionNr,
                open: this.isOpen(optionNr)
            }
            tmpOptionList.push(tmpOption);
        });
        return tmpOptionList;
    }

    addBackTrackRealStep(cellIndex, cellValue) {

        return this.myOwnerPath.addBackTrackRealStep(cellIndex, cellValue);
    }
    addBackTrackOptionStep(cellIndex, optionList) {
        return this.myOwnerPath.addBackTrackOptionStep(cellIndex, optionList);
    }
    getNextBackTrackRealStep() {
        let nextOption = this.myNextOptions.pop();
        let nextPath = new BackTrackOptionPath(nextOption, this);
        return nextPath.addBackTrackRealStep(this.myCellIndex, nextOption);
    }
    previousStep() {
        return this.myOwnerPath.previousFromBackTrackOptionStep();
    }
    isCompleted() {
        return this.myNextOptions.length == 0;
    }
    getDepth() {
        if (this.myCellIndex == -1) {
            return 0;
        } else {
            return this.myOwnerPath.getDepth() + 1;
        }
    }
    isFinished() {
        // Der BackTrackOptionStep ist beendet, wenn alle seine Pfade beendet sind
        for (let i = 0; i < this.myBackTrackOptionPaths.length; i++) {
            if (!this.myBackTrackOptionPaths[i].isFinished()) {
                return false;
            }
        }
        return true;
    }
    getCellIndex() {
        return this.myCellIndex;
    }
    getOwnerPath() {
        return this.myOwnerPath;
    }
}
class BackTrackRealStep {
    constructor(ownerPath, stepIndex, cellIndex, cellValue) {
        // Der Realstep befindet sich in einem Optionpath
        this.myOwnerPath = ownerPath;
        // Der Step zeigt auf Sudokuzelle
        this.myStepsIndex = stepIndex;
        this.myCellIndex = cellIndex;
        // Der Step kennt den Inhalt der Sudoku-Zelle
        this.myCellValue = cellValue;
    }
    addBackTrackRealStep(cellIndex, cellValue) {
        return this.myOwnerPath.addBackTrackRealStep(cellIndex, cellValue);
    }
    addBackTrackOptionStep(cellIndex, optionList) {
        return this.myOwnerPath.addBackTrackOptionStep(cellIndex, optionList);
    }
    previousStep() {
        return this.myOwnerPath.previousFromBackTrackRealStep(this.myStepsIndex);
    }
    getValue() {
        return this.myCellValue;
    }
    getCellIndex() {
        return this.myCellIndex;
    }
    getPathIndex() {
        return this.myStepsIndex;
    }
    getOwnerPath() {
        return this.myOwnerPath;
    }
    getDepth() {
        return this.myOwnerPath.getDepth();
    }
    options() {
        return this.myOwnerPath.options(this.myStepsIndex);
    }
}

class BackTrackOptionPath {
    // Ein BackTrackOptionPath besteht im Kern aus zwei Elmenten:
    // 1. Die Nummer (Option), für die der Pfad gemacht wird.
    // 2. aus einer Sequenz von BackTrackRealSteps
    // 3. Der letzte Schritt ist ein OptonStep, wenn nicht vorher
    // ein Erfolg oder Unlösbarkeit eingetreten ist.
    constructor(value, ownerStep) {
        // Nie nummeer, für die dieser path entsteht
        this.myValue = value;
        //Die Schrittsequenz bestehend ausschließlich aus realsteps
        this.myBackTrackRealSteps = [];
        //Weitere Hilfsattribute
        this.myLastBackTrackOptionStep; // Der Abschluss dies Pfades
        this.myOwnerStep = ownerStep; // Der Optionstep, der diesen Pfad besitzt
    }
    options(currentIndex) {
        let tmpOptions = [];
        if (currentIndex > 0) {
            // Nur eine Option mitten im Pfad
            let tmpOption = {
                value: this.myBackTrackRealSteps[currentIndex].getValue(),
                open: false
            }
            tmpOptions.push(tmpOption);
        } else {
            // Der erste Schritt im Pfad
            if (this.myValue == '0') {
                // Der Wurzelpfad
                let tmpOption = {
                    value: this.myBackTrackRealSteps[currentIndex].getValue(),
                    open: false
                }
                tmpOptions.push(tmpOption);
            } else {
                tmpOptions = this.myOwnerStep.options();
            }
        }
        return tmpOptions;
    }
    getDepth() {
        if (this.myValue == '0') {
            // Ich bin der Rootpath
            return 0;
        } else {
            return this.myOwnerStep.getDepth();
        }
    }
    isFinished() {
        return (!(this.myLastBackTrackOptionStep == null));
    }

    addBackTrackRealStep(cellIndex, cellValue) {
        // Der neue Realstep wird in diesem Path angelegt
        let realStep = new BackTrackRealStep(this, this.myBackTrackRealSteps.length, cellIndex, cellValue);
        this.myBackTrackRealSteps.push(realStep);
        return realStep;
    }

    addBackTrackOptionStep(cellIndex, optionList) {
        // Der neue Optionstep wird in diesem Path angelegt
        this.myLastBackTrackOptionStep = new BackTrackOptionStep(this, cellIndex, optionList);
        // Damit ist dieser Pfad beendet. Es kann nur in seinen Subpfaden weitergehen
        return this.myLastBackTrackOptionStep;
    }

    getValue() {
        return this.myValue;
    }

    previousFromBackTrackRealStep(currentIndex) {
        // Rückwärts vom BackTrackRealStep
        if (currentIndex == 0) {
            return this.myOwnerStep;
        } else {
            // der vorige step liegt in diesem Path
            return this.myBackTrackRealSteps[currentIndex - 1];
        }
    }
    previousFromBackTrackOptionStep() {
        // Rückwärts vom BackTrackOptionStep
        // Es kann vorkommen, dass die realStep Sequenz leer ist
        if (this.myBackTrackRealSteps.length == 0) {
            return this.myOwnerStep;
        } else
            return this.myBackTrackRealSteps[this.myBackTrackRealSteps.length - 1];
    }
}


//=================================================
class StepperOnGrid {
    // Für die Sudoku-Matrix kann ein temporärer
    // Stepper für die automatische Ausführung angelegt werde.
    // Jede neue automatische Ausführung erfolgt mit einem neuen Stepper.
    // Der Stepper führt elementare Vorwärts- oder Rückwärtsschritte durch.
    // Ein Vorwärtsschritt ist ein Aktionspaar (Zelle selektieren, Nummer setzen),
    // ein Rückwärtsschritt ist ein Paar (Zelle selektieren, gesetzte Nummer zurücknehmen)

    constructor(suGrid) {
        this.indexSelected = -1;
        this.myResult = '';
        this.myGrid = suGrid;
        this.myBackTracker;
        this.timer = false;
        this.execSpeed = 75;
        this.execSpeedLevel = 'very-fast';
        this.goneSteps = 0;
        this.levelOfDifficulty = 'Keine Angabe';
        this.countBackwards = 0;
        this.autoDirection = 'forward';
        this.init();
    }

    init() {
        this.indexSelected = this.myGrid.indexSelected;
        this.myResult = '';
        this.goneSteps = 0;
        this.countBackwards = 0;

        this.autoDirection = 'forward';
        this.levelOfDifficulty = 'Keine Angabe';
        // Der Stepper hat immer einen aktuellen BackTracker
        this.myBackTracker = new BackTracker();
    }

    notifyStepExecuted() {
        if (this.myGrid.myCalculator.isStepExecutionObserver) {
            this.myGrid.myCalculator.onStepExecution();
        }
    }

    notifyLoopFinished() {
        if (this.myGrid.myCalculator.isStepExecutionObserver) {
            this.myGrid.myCalculator.onLoopFinish();
        }
    }

    // =============================================================
    // Getter
    // =============================================================
    getGoneSteps() {
        return this.goneSteps;
    }

    getAutoDirection() {
        return this.autoDirection;
    }

    isRunningAsyncLoop() {
        // StepExecution-Observer sind Sudoku-Calculators, die jede einzelne Schrittausführung
        // beobachten. Sie benutzen daher eine zeit-getaktete asynchrone Schrittausführung.
        // 
        // Von Nicht-Observern nehmen wir an, dass sie die synchrone Schrittausführung verwenden.
        // D.h. wenn der Owner des Steppers der ein Observer ist,
        // dann können wir den Timer prüfen. Im Web-Worker kann der Generator den Timer nicht benutzen.

        let myCalculator = this.myGrid.myCalculator;
        if (myCalculator.isStepExecutionObserver) {
            // Trickprogrammierung:
            // Der timer ist ungleich false, wenn er läuft.
            return this.timer !== false;
        } else {
            return false;
        }

    }

    // =============================================================
    // Setter
    // =============================================================

    setAutoDirection(direction) {
        this.autoDirection = direction;
    }

    // =============================================================
    // Other methods
    // =============================================================

    startAsyncLoop() {
        if (this.indexSelected !== this.myGrid.indexSelected && this.indexSelected !== -1) {
            this.myGrid.indexSelect(this.indexSelected);
        }

        if (!this.isRunningAsyncLoop()) {
            this.timer = window.setInterval(() => {
                if (this.myResult == '' || this.myResult == 'inProgress') {
                    this.myResult = this.asyncObservedStep();
                } else {
                    this.stopAsyncLoop();
                    this.cleanupFinishedLoop();
                }
            }, this.execSpeed);
        }
    }

    stopAsyncLoop() {
        if (this.isRunningAsyncLoop()) {
            // Die automatische Ausführung
            window.clearInterval(this.timer);
            this.timer = false;
        }
    }

    executeSingleStep() {
        if (this.indexSelected !== this.myGrid.indexSelected && this.indexSelected !== -1) {
            this.myGrid.indexSelect(this.indexSelected);
        }

        if (this.myResult == '' || this.myResult == 'inProgress') {
            this.myResult = this.asyncObservedStep();
            if (this.myResult == 'success') {
                this.cleanupFinishedLoop();
            }
        } else {
            this.cleanupFinishedLoop();
        }
    }

    asyncObservedStep() {
        let result = this.autoStep();
        this.notifyStepExecuted();
        return result;
    }

    cleanupFinishedLoop() {
        switch (this.myResult) {
            case 'success': {
                // Übertrage Stepper-Infos nach Grid-Infos.
                this.myGrid.difficulty = this.levelOfDifficulty;
                this.myGrid.backTracks = this.countBackwards;
                this.myGrid.steps = this.goneSteps;
                this.notifyLoopFinished();
                break;
            }
            case 'fail': {
                if (sudoApp instanceof SudokuMainApp) {
                    alert("Keine (weitere) Lösung gefunden!");
                } else {
                    // Übertrage Stepper-Infos nach Grid-Infos.
                    this.myGrid.difficulty = 'unlösbar';
                    this.myGrid.backTracks = this.countBackwards;
                    this.myGrid.steps = this.goneSteps;
                    this.notifyLoopFinished();
                }
                break;
            }
            case '':
            case 'inProgress': {
                // Proceed looping
                break;
            }
            default: {
                throw new Error('Unknown autoStep result: ' + this.myResult);
            }
        }
    }

    startSynchronousLoop() {
        if (this.indexSelected !== this.myGrid.indexSelected && this.indexSelected !== -1) {
            this.myGrid.indexSelect(this.indexSelected);
        }

        while (this.myResult == '' || this.myResult == 'inProgress') {
            this.myResult = this.synchronousHiddenStep();
        }
        this.synchronousLoopFinished();
    }

    synchronousHiddenStep() {
        let result = this.autoStep();
        return result;
    }

    synchronousLoopFinished() {
        switch (this.myResult) {
            case 'success': {
                // Übertrage Stepper-Infos nach Grid-Infos.
                this.myGrid.difficulty = this.levelOfDifficulty;
                this.myGrid.backTracks = this.countBackwards;
                this.myGrid.steps = this.goneSteps;
                break;
            }
            case 'fail': {
                // throw new Error('Generator with unexpected fail! ');
                this.myGrid.difficulty = 'unlösbar';
                this.myGrid.backTracks = this.countBackwards;
                this.myGrid.steps = this.goneSteps;      
                break;
            }
            case '':
            case 'inProgress': {
                break;
            }
            default: {
                throw new Error('Unknown autoStep result: ' + this.myResult);
            }
        }
    }

    indexSelect(index) {
        this.indexSelected = index;
        this.myGrid.indexSelect(index);
    }

    autoStep() {
        // Rückgabemöglichkeiten: {'success', 'fail', 'inProgress'}
        if (this.autoDirection == 'forward') {
            return this.stepForward();
        }
        else if (this.autoDirection == 'backward') {
            return this.stepBackward();
        }
    }

    stepForward() {
        let currentStep = this.myBackTracker.getCurrentStep();
        if (this.indexSelected == -1) {
            // Annahmen:
            // a) Noch keine nächste Zelle für eine Nummernsetzung selektiert.
            // b) Noch keine dazu passende zu setzende Nummer im aktuellen Realstep gespeichert
            // Zielzustand:
            // a) Die nächste Zelle für eine Nummernsetzung ist selektiert.
            // b) Die zu setzende Nummer ist im neuen, aktuellen Realstep gespeichert

            // ====================================================================================
            // Aktion: Die nächste Zelle selektieren
            // ====================================================================================
            // Aktion Fall 1: Der BackTracker steht auf einem echten Optionstep (nicht die Wurzel), 
            // d.h.die nächste Selektion ist die nächste Option dieses Schrittes
            if (currentStep instanceof BackTrackOptionStep &&
                currentStep.getCellIndex() !== -1) {
                // Lege einen neuen Step an mit der Nummer der nächsten Option
                let realStep = this.myBackTracker.getNextBackTrackRealStep();
                // Selektiere die Zelle des Optionsteps, deren Index auch im neuen Realstep gespeichert ist
                this.indexSelect(realStep.getCellIndex());
                return 'inProgress';
            }
            // ====================================================================================
            // Aktion Fall 2: Die nächste Zelle bestimmen
            let tmpSelection = this.autoSelect();
            if (tmpSelection.index == -1) {
                // Es gibt erst dann keine Selektion mehr, wenn die Tabelle vollständig gefüllt ist.
                // D.h. das Sudoku ist erfolgreich gelöst
                return 'success';
            } else {
                // ================================================================================
                // Die ermittelte Selektion wird gesetzt
                this.indexSelect(tmpSelection.index);
                // ================================================================================
                // Jetzt muss für diese Selektion eine Nummer bestimmt werden.
                // Ergebnis wird sein: realStep mit Nummer
                let tmpValue = '0';
                if (tmpSelection.options.length == 1) { tmpValue = tmpSelection.options[0]; }
                if (tmpSelection.necessaryOnes.length == 1) { tmpValue = tmpSelection.necessaryOnes[0]; }
                // if (tmpSelection.indirectNecessaryOnes.length == 1) { tmpValue = tmpSelection.indirectNecessaryOnes[0]; }
                if (!(tmpValue == '0')) {
                    // Die Selektion hat eine eindeutige Nummer. D.h. es geht eindeutig weiter.
                    // Lege neuen Realstep mit der eindeutigen Nummer an
                    this.myBackTracker.addBackTrackRealStep(tmpSelection.index, tmpValue);
                    return 'inProgress';
                } else {
                    // =============================================================================
                    // Die Selektion hat keine eindeutige Nummer. D.h. es geht mit mehreren Optionen weiter.
                    this.myBackTracker.addBackTrackOptionStep(tmpSelection.index, tmpSelection.options.slice());
                    // Die erste Option des Optionsschrittes, wird gleich gewählt
                    // Neuer realstep mit der ersten Optionsnummer

                    let realStep = this.myBackTracker.getNextBackTrackRealStep();
                    return 'inProgress';
                }
            }
        } else {
            // Annahmen:
            // a) Die nächste Zelle für eine Nummernsetzung ist selektiert.
            // b) Die zu setzende Nummer ist im aktuellen Realstep gespeichert
            // Aktion:
            // Setze die eindeutige Nummer
            this.atCurrentSelectionSetAutoNumber(currentStep);
            this.goneSteps++;
            // Falls die Nummernsetzung zur Unlösbarkeit führt
            // muss der Solver zurückgehen

            /*   if (this.deadlockReached()) {
                this.setAutoDirection('backward');
                this.countBackwards++;
            }           
            return 'inProgress';
            */
            if (this.myGrid.isInsolvable()) {
                this.setAutoDirection('backward');
                this.countBackwards++;
                return 'inProgress';
            } else if (this.myGrid.isFinished()) {
                return 'success'
            } else {
                return 'inProgress';
            }
        }
    }

    atCurrentSelectionSetAutoNumber(step) {
        this.myGrid.atCurrentSelectionSetAutoNumber(step);
        this.deselect();
    }

    deleteSelected(phase) {
        this.myGrid.deleteSelected(phase, false);
        this.deselect();
    }

    deselect() {
        this.myGrid.deselect();
        this.indexSelected = -1;
    }

    stepBackward() {
        // Wenn die letzte gesetzte Nummer zur Unlösbarkeit des Sudokus führt, 
        // muss der Solver rückwärts gehen.
        let currentStep = this.myBackTracker.getCurrentStep();
        if (currentStep instanceof BackTrackOptionStep) {
            if (currentStep.getCellIndex() == -1) {
                // Im Wurzel-Optionsschritt gibt es keine Option mehr
                // Spielende, keine Lösung
                return 'fail';
            }
            if (currentStep.isCompleted()) {
                // Der Optionstep ist vollständig abgearbeitet
                // Deshalb wird der Vorgänger dieses Optionsteps neuer aktueller Step
                this.myBackTracker.previousStep();
                return this.stepBackward();
            } else {
                // Es gibt noch nicht probierte Optionen
                // Suchrichtung umschalten!!
                this.setAutoDirection('forward');
                return this.stepForward();
            }
        } else if (currentStep instanceof BackTrackRealStep) {
            if (this.indexSelected !== currentStep.getCellIndex()) {
                // Fall 1: Keine oder eine falsch selektierte Zelle
                this.indexSelect(currentStep.getCellIndex());
                // In der Matrix ist die Zelle des aktuellen Schrittes selektiert
                return 'inProgress';
            }
            // Fall 2: 
            // Startzustand
            // a) In der Matrix ist die Zelle des aktuellen Schrittes selektiert
            // b) Die selektierte Zelle ist noch nicht gelöscht
            if (this.myGrid.sudoCells[currentStep.getCellIndex()].getValue() !== '0') {
                this.goneSteps++;
                this.deleteSelected('play', false);
                // Nach Löschen der Zelle den neuen aktuellen Schritt bestimmen
                let prevStep = this.myBackTracker.previousStep();
                return 'inProgress'
            }
        }
    }


    calculateMinSelectionFrom(selectionList) {
        // Berechnet die nächste Selektion
        // Nicht eindeutig;        
        // In der Regel sind das Zellen mit 2 Optionsnummern.
        let maxSelection = selectionList[0];
        let maxIndex = maxSelection.index;
        let maxWeight = this.myGrid.sudoCells[maxIndex].countMyInfluencersWeight();
        // Kontexte mit einem größeren Entscheidungsgrad, also mit weniger zulässigen Nummern, zählen mehr.
        for (let i = 1; i < selectionList.length; i++) {
            let currentSelection = selectionList[i];
            let currentIndex = currentSelection.index;
            let currentWeight = this.myGrid.sudoCells[currentIndex].countMyInfluencersWeight();
            if (currentWeight > maxWeight) {
                maxSelection = currentSelection;
                maxIndex = currentIndex;
                maxWeight = currentWeight;
            }
        }
        return maxSelection;
    }

    calculateNeccesarySelectionFrom(selectionList) {
        // Berechnet Selektion von Zellen, die eine notwendige Nummer enthalten.
        for (let i = 0; i < selectionList.length; i++) {
            if (selectionList[i].necessaryOnes.length > 0) {
                return selectionList[i];
            }
        }
        // Falls es keine Zellen mit notwendigen Nummern gibt
        let emptySelection = {
            index: -1,
            options: [],
            //       indirectNecessaryOnes: [],
            necessaryOnes: [],
            level_0_singles: []
        }
        return emptySelection;
    }

    calculateLevel_0_SinglesSelectionFrom(selectionList) {
        // Berechnet Selektion von Zellen, die ein level_0_single enthalten.
        for (let i = 0; i < selectionList.length; i++) {
            if (selectionList[i].level_0_singles.length > 0) {
                return selectionList[i];
            }
        }
        // Falls es keine Zellen mit dieser Eigenschaft gibt
        let emptySelection = {
            index: -1,
            options: [],
            //indirectNecessaryOnes: [],
            necessaryOnes: [],
            level_0_singles: []
        }
        return emptySelection;
    }

    calculateOneOptionSelectionFrom(selectionList) {
        // Berechnet Selektion von Zellen, die genau eine zulässige Nummer enthalten.
        for (let i = 0; i < selectionList.length; i++) {
            if (selectionList[i].necessaryOnes.length == 0 &&
                selectionList[i].options.length == 1) {
                return selectionList[i];
            }
        }
        // Falls es keine Zellen mit diese Eigenschaft gibt
        let emptySelection = {
            index: -1,
            options: [],
            // indirectNecessaryOnes: [],
            necessaryOnes: [],
            level_0_singles: []
        }
        return emptySelection;
    }

    getOptionalSelections() {
        let selectionList = [];
        for (let i = 0; i < 81; i++) {
            if (this.myGrid.sudoCells[i].getValue() == '0') {
                let selection = {
                    index: i,
                    options: Array.from(this.myGrid.sudoCells[i].getTotalAdmissibles()),
                    //       indirectNecessaryOnes: Array.from(this.myGrid.sudoCells[i].getIndirectNecessarys()),
                    necessaryOnes: Array.from(this.myGrid.sudoCells[i].getNecessarys()),
                    level_0_singles: Array.from(this.myGrid.sudoCells[i].getSingles())
                }
                selectionList.push(selection);
            }
        }
        // Wenn alle Zellen gesetzt sind, ist diese Liste leer
        return selectionList;
    }


    autoSelect() {
        let optionList = this.getOptionalSelections();
        if (optionList.length == 0) {
            let emptySelection = {
                index: -1,
                options: [],
                ///             indirectNecessaryOnes: [],
                necessaryOnes: [],
                level_0_singles: []
            }
            return emptySelection;
        }
        //Bestimmt die nächste Zelle mit notwendiger Nummer unter den zulässigen Nummern
        let tmpNeccessary = this.calculateNeccesarySelectionFrom(optionList);
        if (tmpNeccessary.index !== -1) {
            switch (this.levelOfDifficulty) {
                case 'Keine Angabe': {
                    this.levelOfDifficulty = 'Leicht';
                    break;
                }
                default: {
                    // Schwierigkeitsgrad bleibt unverändert.
                }
            }
            return tmpNeccessary;
        }
        // Bestimmt die nächste Zelle mit level-0 single
        let tmpLevel_0_single = this.calculateLevel_0_SinglesSelectionFrom(optionList);
        if (tmpLevel_0_single.index !== -1) {
            switch (this.levelOfDifficulty) {
                case 'Keine Angabe':
                case 'Leicht': {
                    this.levelOfDifficulty = 'Mittel';
                    break;
                }
                default: {
                    // Schwierigkeitsgrad bleibt unverändert.
                }
            }
            return tmpLevel_0_single;
        }

        // Bestimmt die nächste Zelle mit level > 0 single, d.h.
        // unter Verwendung von indirekt unzulässigen Nummern
        let oneOption = this.calculateOneOptionSelectionFrom(optionList);
        if (oneOption.index !== -1) {
            switch (this.levelOfDifficulty) {
                case 'Keine Angabe':
                case 'Leicht':
                case 'Mittel': {
                    this.levelOfDifficulty = 'Schwer';
                    break;
                }
                default: {
                    // Schwierigkeitsgrad bleibt unverändert.
                }
            }
            return oneOption;
        }

        let tmpMin = this.calculateMinSelectionFrom(optionList);
        // Falls es keine notwendigen Nummern gibt:
        // Bestimme eine nächste Zelle mit minimaler Anzahl zulässiger Nummern
        // Diese Zelle ist nicht eindeuitig
        // Diese Zelle kann eine mit der vollen Optionsmenge sein
        switch (this.levelOfDifficulty) {
            case 'Keine Angabe':
            case 'Leicht':
            case 'Mittel':
            case 'Schwer': {
                this.levelOfDifficulty = 'Sehr schwer';
                break;
            }
            default: {
                // Schwierigkeitsgrad bleibt unverändert.
            }
        }
        return tmpMin;
    }

    deadlockReached() {
        return this.myGrid.isInsolvable();
    }
}

class SudokuGroupView extends SudokuView {
    constructor(group) {
        super(group);
    }
    getMyGroup() {
        return this.myModel;
    }
    displayInsolvability() {
        // Die Widersprüchlichkeit des Puzzles steht schon fest, wenn in einer Gruppe, also einem Block, 
        // einer Reihe oder einer Spalte an verschiedenen Stellen das gleiche Single auftritt.
        let intSingle = this.getMyGroup().withConflictingSingles();
        if (intSingle > 0) {
            this.displayError();
            sudoApp.mySolver.getMyView().displayReasonInsolvability('Zwei gleiche Singles: ' + intSingle);
            return true;
        }
        // Analog die Widerspruchserkennung durch zwei gleiche notwendige Nummern in der Gruppe.
        let intNecessary = this.getMyGroup().withConflictingNecessaryNumbers();
        if (intNecessary > 0) {
            this.displayError();
            sudoApp.mySolver.getMyView().displayReasonInsolvability('Zwei gleiche notwendige Nummern: ' + intNecessary);
            return true;
        }
        // Widerspruchserkennung durch eine fehlende Nummer in der Gruppe.
        let missingNumbers = this.getMyGroup().withMissingNumber();
        if (missingNumbers.size > 0) {
            this.displayError();
            const [missingNr] = missingNumbers;
            sudoApp.mySolver.getMyView().displayReasonInsolvability('Fehlende Nummer: ' + missingNr);
            return true;
        }
        return false;

        // Das nachfolgende Kriterium wird abgeschaltet, weil es nicht wesentlich zur Früherkennung von 
        // der Widersprüchlichkeit beiträgt.
        /*
        if (this.getMyGroup().withPairConflict()) {
            this.displayError();
            sudoApp.mySolver.getMyView().displayReasonInsolvability('Nacktes Paar Konflikt.');
            return true;
        }
        */
    }

    // displayError() {
    //    this.myNode.classList.add('err');
    /*    this.myNode.classList.add('cell-err');
        setTimeout(() => {
            this.myNode.classList.remove('cell-err');
        }, 500); */
    // }
}
class SudokuGroup extends SudokuModel {
    // Abstrakte Klasse, deren konkrete Instanzen
    // ein Block, eine Spalte oder Reihe der Tabelle sind
    constructor(suTable) {
        super();
        // Die Collection kennt ihre Tabelle
        this.myGrid = suTable;
        this.myCells = [];
        // In jedem Block, jeder Spalte und Reihe müssen alle Zahlen 1..9 einmal vorkommen.
        // Für eine konkreten Block, eine Spalte oder Reihe sind MissingNumbers Zahlen,
        // die nicht in ihr vorkommen.
        this.myPairInfos = [];
    }

    clear() {
        this.clearEvaluations();
    }

    clearEvaluations() {
        this.myPairInfos = [];
    }


    isInsolvable() {
        // Wenn es eine Gruppe mit Conflicting Singles gibt, ist das Sudoku unlösbar.
        // Wenn es eine Gruppe gibt, in der nicht mehr alle Nummern vorkommen.
        // Wenn es eine Gruppe gibt, in der dieselbe Nummer mehrmals notwendig ist.
        return (
            this.withConflictingSingles() > 0 ||
            this.withConflictingNecessaryNumbers() > 0 ||
            this.withMissingNumber().size > 0);
    }

    withConflictingNecessaryNumbers() {
        let numberCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let found = false;
        let intNecessary = -1;
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                // Wir betrachten nur offene Zellen
                let necessarys = this.myCells[i].getNecessarys();
                if (necessarys.size == 1) {
                    necessarys.forEach(nr => {
                        intNecessary = parseInt(nr);
                        numberCounts[intNecessary - 1]++;
                        if (numberCounts[intNecessary - 1] > 1) {
                            found = true;
                        };
                    });
                }
            }
            // Wenn wir den ersten Konflikt gefunden haben, können wir die Suche
            // abbrechen. 
            if (found) return intNecessary;
        }
        return -1;
    }

    withMissingNumber() {
        let myNumbers = new SudokuSet();
        this.myCells.forEach(cell => {
            if (cell.getValue() == '0') {
                myNumbers = myNumbers.union(cell.getTotalAdmissibles());
            } else {
                myNumbers.add(cell.getValue());
            }
        })
        let missingNumbers = new SudokuSet(['1', '2', '3', '4', '5', '6', '7', '8', '9']).difference(myNumbers);
        return (missingNumbers);
    }
    getTotalAdmissibles() {
        let myNumbers = new SudokuSet();
        this.myCells.forEach(cell => {
            if (cell.getValue() == '0') {
                myNumbers = myNumbers.union(cell.getTotalAdmissibles());
            }
        })
        return myNumbers;
    }

    calculateHiddenPairs() {
        // Berechnet Subpaare in der Gruppe. Dies sind
        // Zellen, die mindestens 2 Nummern enthalten und
        // zwei Zellen enthalten das gleiche Paar-Subset und
        // alle anderen Zellen enthalten keine der Paarnummern.

        // Idee: Zähle für jede Nummer 1 .. 9 die Häufigkeit ihres Auftretens
        // numberCounts[0] = Häufigkeit der 1, bzw. die Indices der Auftreten der 1
        // numberCounts[1] = Häufigkeit der 2, bzw. die Indices der Auftreten der 2
        // usw.

        this.numberCounts = [];
        this.twinPosition = [];
        this.hiddenPairs = [];
        for (let i = 0; i < 9; i++) {
            // Für die 9 Nummern jeweils eine leere Indices-Liste
            this.numberCounts.push([]);
            // Für jede Position in der Gruppe eine leere twin-nummernliste
            this.twinPosition.push([]);
        }
        // Iteriere über die Gruppe
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                let permNumbers = this.myCells[i].getAdmissibles();
                permNumbers.forEach(nr => {
                    let iNr = parseInt(nr);
                    // Für jede Nummer die Indices ihres Auftretens speichern
                    this.numberCounts[iNr - 1].push(i);
                })
            }
        }
        // NumberCounts auswerten auf Paare
        // Bestimme Nummern, die genau 2 mal vorkommen
        // Iteriere über die Nummern
        for (let i = 0; i < 9; i++) {
            if (this.numberCounts[i].length == 2) {
                // Eine Nummer, für die es 2 Indices gibt, 
                // d.h. in der collection gibt es sie 2-mal.
                // In twinPosition für jede twin-Nummer die beiden Positionen speichern.
                this.twinPosition[this.numberCounts[i][0]].push(i + 1);
                this.twinPosition[this.numberCounts[i][1]].push(i + 1);
            }
        }
        // Ein Subpaar liegt dann vor, wenn 
        // an einer twinPosition exakt 2 Nummern vorliegen und
        // die gleichen zwei Nummern an einer zweiten Postion ein weiteres mal vorliegen.
        // Rückgabe: Nummernpaare mit jeweils 2 Positionen. Gegebenenfalls leer

        // Es können mehrere Paare vorhanden sein
        let tmpSubPairs = [];
        for (let i = 0; i < 9; i++) {
            if (this.twinPosition[i].length == 2) {
                // An dieser Position liegen zwei twin-nummern vor
                // Checke alle begonnenen Paare
                let hiddenPairFound = false;
                for (let k = 0; k < tmpSubPairs.length; k++) {
                    let tmpSubPair = tmpSubPairs[k];
                    if (tmpSubPair.nr1 == this.twinPosition[i][0].toString() &&
                        tmpSubPair.nr2 == this.twinPosition[i][1].toString()) {
                        // Übereinstimmung  mit einem begonnenen Paar
                        tmpSubPair.pos2 = i;
                        // Das Paar ist vollständig
                        this.hiddenPairs.push(tmpSubPair);
                        hiddenPairFound = true;
                        // tmpSubPairs = [];
                    }
                }
                if (!hiddenPairFound) {
                    // Keine Übereinstimmung mit einem begonnenen Paar
                    // Ein neues Paar wird begonnen.
                    let tmpSubPair = {
                        nr1: this.twinPosition[i][0].toString(),
                        nr2: this.twinPosition[i][1].toString(),
                        pos1: i,
                        pos2: -1
                    }
                    tmpSubPairs.push(tmpSubPair);
                }
            }
        }

    }



    calculateEqualPairs() {
        // Zellen, die exakt ein Paar enthalten und
        // zwei Zellen enthalten das gleiche Paar
        this.myPairInfos = [];
        // Iteriere über die Gruppe
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                let tmpAdmissibles = this.myCells[i].getTotalAdmissibles()
                if (tmpAdmissibles.size == 2) {
                    // Infos zum Paar speichern
                    let currentPair = new SudokuSet(tmpAdmissibles);
                    // Prüfen, ob das Paar schon in der PaarInfoliste ist
                    if (this.myPairInfos.length == 0) {
                        let pairInfo = {
                            pairInfoIndex: i,
                            pairIndices: [this.myCells[i].getIndex()],
                            pairSet: tmpAdmissibles
                        }
                        this.myPairInfos.push(pairInfo);
                    } else {
                        let j = 0;
                        let pairInfoStored = false;
                        while (j < this.myPairInfos.length && !pairInfoStored) {
                            if (currentPair.equals(this.myPairInfos[j].pairSet)) {
                                // Das Paar existiert schon in der Infoliste
                                this.myPairInfos[j].pairIndices.push(this.myCells[i].getIndex());
                                pairInfoStored = true;
                            } else {
                                if (j == this.myPairInfos.length - 1) {
                                    // Das Paar ist nicht vorhanden und wird jetzt eingefügt
                                    let pairInfo = {
                                        pairInfoIndex: i,
                                        pairIndices: [this.myCells[i].getIndex()],
                                        pairSet: tmpAdmissibles
                                    }
                                    this.myPairInfos.push(pairInfo);
                                    pairInfoStored = true;
                                }
                            }
                            j++;
                        }
                    }
                }
            }
        }
    }

    derive_inAdmissiblesFromHiddenPairs() {
        this.calculateHiddenPairs();
        let inAdmissiblesAdded = false;
        for (let k = 0; k < this.hiddenPairs.length; k++) {
            let hiddenPair = this.hiddenPairs[k];
            // Erste Paar-Zelle bereinigen
            let cell1 = this.myCells[hiddenPair.pos1];
            let tmpAdmissibles1 = cell1.getTotalAdmissibles();
            let newInAdmissibles1 = tmpAdmissibles1.difference(new SudokuSet([hiddenPair.nr1, hiddenPair.nr2]));

            if (newInAdmissibles1.size > 0) {
                let oldInAdmissibles = new SudokuSet(cell1.myLevel_gt0_inAdmissibles);
                cell1.myLevel_gt0_inAdmissibles =
                    cell1.myLevel_gt0_inAdmissibles.union(newInAdmissibles1);
                let localAdded = !oldInAdmissibles.equals(cell1.myLevel_gt0_inAdmissibles);
                if (localAdded) {
                    newInAdmissibles1.forEach(inAdNr => {
                        let inAdmissibleSubPairInfo = {
                            collection: this,
                            subPairCell1: this.myCells[hiddenPair.pos1],
                            subPairCell2: this.myCells[hiddenPair.pos2]
                        }
                        cell1.myLevel_gt0_inAdmissiblesFromHiddenPairs.set(inAdNr, inAdmissibleSubPairInfo);
                    })
                    inAdmissiblesAdded = true;
                }
            }

            // Zweite Paar-Zelle bereinigen
            let cell2 = this.myCells[hiddenPair.pos2];
            let tmpAdmissibles2 = cell2.getTotalAdmissibles();
            let newInAdmissibles2 = tmpAdmissibles2.difference(new SudokuSet([hiddenPair.nr1, hiddenPair.nr2]));

            if (newInAdmissibles2.size > 0) {
                let oldInAdmissibles = new SudokuSet(cell2.myLevel_gt0_inAdmissibles);
                cell2.myLevel_gt0_inAdmissibles =
                    cell2.myLevel_gt0_inAdmissibles.union(newInAdmissibles2);
                let localAdded = !oldInAdmissibles.equals(cell2.myLevel_gt0_inAdmissibles);
                if (localAdded) {
                    newInAdmissibles2.forEach(inAdNr => {
                        let inAdmissibleSubPairInfo = {
                            collection: this,
                            subPairCell1: this.myCells[hiddenPair.pos1],
                            subPairCell2: this.myCells[hiddenPair.pos2]
                        }
                        cell2.myLevel_gt0_inAdmissiblesFromHiddenPairs.set(inAdNr, inAdmissibleSubPairInfo);
                    })
                    inAdmissiblesAdded = true;
                }
            }
        }
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromNecessarys(necessaryCell, necessaryNr) {
        let inAdmissiblesAdded = false;
        this.myCells.forEach(cell => {
            if (cell.getValue() == '0' && cell !== necessaryCell) {
                let oldInAdmissibles = new SudokuSet(cell.myLevel_gt0_inAdmissibles);
                if (cell.getAdmissibles().has(necessaryNr)) {
                    // Nur zulässige können neu unzulässig werden.
                    cell.myLevel_gt0_inAdmissibles =
                        cell.myLevel_gt0_inAdmissibles.add(necessaryNr);
                    let localAdded = !oldInAdmissibles.equals(cell.myLevel_gt0_inAdmissibles);
                    if (localAdded) {
                        // Die Liste der indirekt unzulässigen verursacht von necessarys wird gesetzt
                        cell.myLevel_gt0_inAdmissiblesFromNecessarys.add(necessaryNr);
                        inAdmissiblesAdded = true;
                    }
                }
            }
        })
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromNakedPairs() {
        this.calculateEqualPairs();
        let inAdmissiblesAdded = false;
        for (let i = 0; i < this.myPairInfos.length; i++) {
            if (this.myPairInfos[i].pairIndices.length == 2) {
                // Ein Paar, das zweimal in der Gruppe vorkommt
                let pair = this.myPairInfos[i].pairSet;
                // Prüfe, ob Nummern dieses Paar in den admissibles der Gruppe vorkommen
                for (let j = 0; j < 9; j++) {
                    if (this.myCells[j].getValue() == '0') {
                        if (this.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[0] &&
                            this.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[1]) {
                            // Zelle der Gruppe, die nicht Paar-Zelle ist
                            let tmpAdmissibles = this.myCells[j].getTotalAdmissibles();
                            let tmpIntersection = tmpAdmissibles.intersection(pair);
                            let oldInAdmissibles = new SudokuSet(this.myCells[j].myLevel_gt0_inAdmissibles);
                            this.myCells[j].myLevel_gt0_inAdmissibles =
                                this.myCells[j].myLevel_gt0_inAdmissibles.union(tmpIntersection);

                            let localAdded = !oldInAdmissibles.equals(this.myCells[j].myLevel_gt0_inAdmissibles);
                            inAdmissiblesAdded = inAdmissiblesAdded || localAdded;
                            if (localAdded) {
                                let newInAdmissibles =
                                    this.myCells[j].myLevel_gt0_inAdmissibles.difference(oldInAdmissibles);
                                newInAdmissibles.forEach(inAdNr => {
                                    let inAdmissiblePairInfo = {
                                        collection: this,
                                        pairCell1: this.myGrid.sudoCells[this.myPairInfos[i].pairIndices[0]],
                                        pairCell2: this.myGrid.sudoCells[this.myPairInfos[i].pairIndices[1]]
                                    }
                                    this.myCells[j].myLevel_gt0_inAdmissiblesFromPairs.set(inAdNr, inAdmissiblePairInfo);
                                })
                            }
                        }
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }

    calculateNecessarys() {
        // Notwendige Nummern sind zulässige Nummern einer Zelle,
        // die in der Block, Reihe oder Spalte der Zelle genau einmal vorkommen.
        let inAdmissiblesAdded = false;
        for (let i = 1; i < 10; i++) {
            // let cellIndex = this.occursOnceInTotalAdmissibles(i);
            let cellIndex = this.occursOnce(i);
            // Wenn die Nummer i genau einmal in der Gruppe vorkommt
            // trage sie ein in der Necessary-liste der Zelle
            if (cellIndex !== -1) {
                if (!this.myCells[cellIndex].myNecessarys.has(i.toString())) {
                    this.myCells[cellIndex].addNecessary(i.toString(), this);
                    let necessaryCell = this.myCells[cellIndex];
                    if (this instanceof SudokuBlock) {
                        let tmpRow = necessaryCell.myRow;
                        let tmpCol = necessaryCell.myCol;
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpRow.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpCol.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                    } else if (this instanceof SudokuRow) {
                        let tmpBlock = necessaryCell.myBlock;
                        let tmpCol = necessaryCell.myCol;
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpBlock.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpCol.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                    } else if (this instanceof SudokuCol) {
                        let tmpRow = necessaryCell.myRow;
                        let tmpBlock = necessaryCell.myBlock;
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpRow.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                        inAdmissiblesAdded = inAdmissiblesAdded || tmpBlock.derive_inAdmissiblesFromNecessarys(necessaryCell, i.toString());
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }

    occursOnce(permNr) {
        // Berechne, ob die Zahl permNr in möglichen Zahlen aller Zellen 
        // der Gruppe genau einmal vorkommt
        // Rücgabe: der Index der Zelle, die das einmalige Auftreten enthält
        // -1, falls die Nummer gar nicht auftaucht oder mehrmals
        let countOccurrences = 0;
        let lastCellNr = -1;

        // Iteriere über alle Zellen der Gruppe
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                if (this.myCells[i].getAdmissibles().has(permNr.toString())) {
                    countOccurrences++;
                    lastCellNr = i;
                }
            }
        }
        if (countOccurrences == 1) {
            return lastCellNr;
        } else {
            return -1;
        }
    }

    occursOnceInTotalAdmissibles(permNr) {
        // Berechne, ob die Zahl permNr in den total zulässigen Zahlen aller Zellen 
        // der Gruppe genau einmal vorkommt
        // Rücgabe: der Index der Zelle, die das einmalige Auftreten enthält
        // -1, falls die Nummer gar nicht auftaucht oder mehrmals
        let countOccurrences = 0;
        let lastCellNr = -1;

        // Iteriere über alle Zellen der Gruppe
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                if (this.myCells[i].getTotalAdmissibles().has(permNr.toString())) {
                    countOccurrences++;
                    lastCellNr = i;
                }
            }
        }
        if (countOccurrences == 1) {
            return lastCellNr;
        } else {
            return -1;
        }
    }

    withConflictingSingles() {
        // Singles sind Zellen, die nur noch exakt eine zulässige Nummer haben.
        // Conflicting singles sind zwei oder mehr singles in einer Gruppe, 
        // die dieselbe eine zulässige Nummer haben. Sie fordern ja, dass dieselbe Nummer zweimal
        // in der Gruppe vorkommen soll. Mit anderen Worten: 
        // Wenn es eine Gruppe mit Conflicting Singles gibt, ist das Sudoku unlösbar.

        // Idee: Zähle für jede Nummer 1 .. 9 die Häufigkeit ihres Auftretens
        // numberCounts[0] = Häufigkeit der 1, 
        // numberCounts[1] = Häufigkeit der 2, 
        // usw.
        let numberCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let found = false;
        let intSingle = -1;
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                // Wir betrachten nur offene Zellen
                // Denn, wenn eine der Konfliktzellen geschlossen wäre, würde
                // die noch offene Zelle ohne zulässige Nummer sein. Eine offene Zelle
                // ohne zulässige Nummer fangen wir schon an anderer Stelle ab.
                let permNumbers = this.myCells[i].getTotalAdmissibles();
                if (permNumbers.size == 1) {
                    permNumbers.forEach(nr => {
                        intSingle = parseInt(nr);
                        numberCounts[intSingle - 1]++;
                        if (numberCounts[intSingle - 1] > 1) {
                            found = true;
                        };
                    });
                }
            }
            // Wenn wir den ersten Konflikt gefunden haben, können wir die Suche
            // abbrechen. 
            if (found) return intSingle;
        }
        return -1;
    }

    withPairConflict() {
        // Pairs sind Zellen, die nur noch exakt zwei zulässige Nummern haben.
        // Ein Pair-Konflikt liegt vor, wenn eine Nummer aus einem Paar 
        // außerhalb des Paares einzeln oder als Paar ein weiteres mal vorkommt.
        this.calculateEqualPairs();
        let found = false;
        for (let i = 0; i < this.myPairInfos.length; i++) {
            if (this.myPairInfos[i].pairIndices.length > 2) {
                // Ein Paar, das dreimal oder mehr in der Gruppe vorkommt
                return true;
            } else if (this.myPairInfos[i].pairIndices.length == 2) {
                let pairSet = this.myPairInfos[i].pairSet;
                this.myCells.forEach(cell => {
                    if (cell.getValue() == '0'
                        && cell.getIndex() !== this.myPairInfos[i].pairIndices[0]
                        && cell.getIndex() !== this.myPairInfos[i].pairIndices[1]) {
                        let numbers = cell.getTotalAdmissibles();
                        if (numbers.size == 1) {
                            if (pairSet.isSuperset(numbers)) {
                                // Eine Single-Nummer, die Paar-Nummer ist
                                // Widerspruch
                                return true;
                            }
                        }
                    }
                })
            }

        }
        return false;
    }

}

class SudokuBlockView extends SudokuGroupView {
    constructor(block) {
        super(block);

    }
    upDate() {
        let block = this.getMyModel();
        let grid = block.myGrid;
        let gridView = grid.getMyView();
        let gridNode = gridView.getMyNode();

        // Neuer Blockknoten
        let blockNode = document.createElement("div");
        blockNode.setAttribute("class", "sudoku-block");
        // Knoten in dieser View speichern
        this.setMyNode(blockNode);
        //Neuen Blockknoten in den Baum einhängen
        gridNode.appendChild(blockNode);
        // Die Zellen des Blocks anzeigen
        block.myCells.forEach(cell => {
            // Jede Zelle des Blocks anzeigen.
            let cellView = cell.getMyView();
            cellView.upDate();
        })
    }

    getMyBlock() {
        return super.getMyModel();
    }

    displayError() {
        this.getMyBlock().myCells.forEach(sudoCell => {
            sudoCell.myView.displayColError();
        })
    }

}

class BlockVector {
    constructor(block, vNr) {
        this.myBlock = block;
        this.myVectorNr = vNr;
        this.myCells = [];
        this.cv1 = undefined;
        this.cv2 = undefined;
        switch (vNr) {
            case 0: {
                let row = 0;
                for (let col = 0; col < 3; col++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            case 1: {
                let row = 1;
                for (let col = 0; col < 3; col++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            case 2: {
                let row = 2;
                for (let col = 0; col < 3; col++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            case 3: {
                let col = 0;
                for (let row = 0; row < 3; row++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            case 4: {
                let col = 1;
                for (let row = 0; row < 3; row++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            case 5: {
                let col = 2;
                for (let row = 0; row < 3; row++) {
                    this.myCells.push(this.myBlock.getBlockCellAt(row, col));
                }
                break;
            }
            default: { };
        }
    }

    //Testen
    logVector() {
        this.myCells.forEach(cell => {
            console.log('    Zelle:')
            cell.logCell();
        })
    }

    addComplementVectors(v1, v2) {
        this.cv1 = v1;
        this.cv2 = v2;
    }

    getAdmissibles() {
        let tmpAdmissibles = new SudokuSet();
        this.myCells.forEach(cell => {
            tmpAdmissibles = tmpAdmissibles.union(cell.getTotalAdmissibles());
        })
        return tmpAdmissibles;
    }

    getPointingNrCandidates() {
        let numberCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let tmpPointingNrs = new SudokuSet();
        let intSingle = -1;
        this.myCells.forEach(cell => {
            if (cell.getValue() == '0') {
                let tmpAdmissibles = cell.getTotalAdmissibles();
                tmpAdmissibles.forEach(nr => {
                    intSingle = parseInt(nr);
                    numberCount[intSingle - 1]++;
                });
            }
        })
        for (let i = 0; i < 9; i++) {
            if (numberCount[i] > 1) {
                tmpPointingNrs.add((i + 1).toString());
            }
        }
        return tmpPointingNrs;
    }

    getPointingNrs() {
        let pointingNrs = new SudokuSet();
        // Nummern, die mindestens 2 mal auftauchen
        let pointingCandidates = this.getPointingNrCandidates();
        let complement = this.cv1.getAdmissibles().union(this.cv2.getAdmissibles());
        pointingCandidates.forEach(candidate => {
            if (!complement.has(candidate)) {
                // Nummer nur im Pointing Vektor, 
                // Nicht in den beiden anderen Vektoren des Blocks
                pointingNrs.add(candidate);
            }
        })
        return pointingNrs;
    }

}
class SudokuBlock extends SudokuGroup {
    constructor(suTable, blockIndex) {
        // Der Block kennt seine Tabelle und seinen Index
        super(suTable);
        this.myIndex = blockIndex;
        this.myOrigin = {
            row: -1,
            col: -1
        }
        this.myRowVectors = [];
        this.myColVectors = [];
        this.setBlockOrigin(blockIndex);
    }

    addBlockVectors() {
        // 3 Reihen des Blocks
        this.myRowVectors.push(new BlockVector(this, 0));
        this.myRowVectors.push(new BlockVector(this, 1));
        this.myRowVectors.push(new BlockVector(this, 2));
        this.myRowVectors[0].addComplementVectors(this.myRowVectors[1], this.myRowVectors[2]);
        this.myRowVectors[1].addComplementVectors(this.myRowVectors[0], this.myRowVectors[2]);
        this.myRowVectors[2].addComplementVectors(this.myRowVectors[0], this.myRowVectors[1]);

        // 3 Spalten des Blocks
        this.myColVectors.push(new BlockVector(this, 3));
        this.myColVectors.push(new BlockVector(this, 4));
        this.myColVectors.push(new BlockVector(this, 5));
        this.myColVectors[0].addComplementVectors(this.myColVectors[1], this.myColVectors[2]);
        this.myColVectors[1].addComplementVectors(this.myColVectors[0], this.myColVectors[2]);
        this.myColVectors[2].addComplementVectors(this.myColVectors[0], this.myColVectors[1]);
    }

    getBlockCellAt(row, col) {
        return this.myGrid.getCellAt(this.myOrigin.row + row, this.myOrigin.col + col);
    }

    getMatrixRowFromBlockRow(blockRow) {
        return this.myOrigin.row + blockRow;
    }
    getMatrixColFromBlockCol(blockCol) {
        return this.myOrigin.col + blockCol;
    }

    isBlockRow(matrixRow) {
        let blockRow = matrixRow - this.myOrigin.row;
        return (blockRow >= 0 && blockRow < 3);
    }

    isBlockCol(matrixCol) {
        let blockCol = matrixCol - this.myOrigin.col;
        return (blockCol >= 0 && blockCol < 3);
    }

    setBlockOrigin() {
        switch (this.myIndex) {
            case 0: {
                this.myOrigin.row = 0;
                this.myOrigin.col = 0;
                break;
            }
            case 1: {
                this.myOrigin.row = 0;
                this.myOrigin.col = 3;
                break;
            }
            case 2: {
                this.myOrigin.row = 0;
                this.myOrigin.col = 6;
                break;
            }
            case 3: {
                this.myOrigin.row = 3;
                this.myOrigin.col = 0;
                break;
            }
            case 4: {
                this.myOrigin.row = 3;
                this.myOrigin.col = 3;
                break;
            }
            case 5: {
                this.myOrigin.row = 3;
                this.myOrigin.col = 6;
                break;
            }
            case 6: {
                this.myOrigin.row = 6;
                this.myOrigin.col = 0;
                break;
            }
            case 7: {
                this.myOrigin.row = 6;
                this.myOrigin.col = 3;
                break;
            }
            case 8: {
                this.myOrigin.row = 6;
                this.myOrigin.col = 6;
            }
            default: { }
        }
    }

    clearEvaluations() {
        super.clearEvaluations();
        this.myCells.forEach(sudoCell => {
            sudoCell.clearEvaluations();
        })
    }

    clear() {
        super.clear();
        this.myCells.forEach(sudoCell => {
            sudoCell.clear();
        })
    }

    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setBlock(this);
    }
}

class SudokuRowView extends SudokuGroupView {
    constructor(row) {
        super(row);
    }
    getMyRow() {
        return super.getMyModel();
    }

    displayError() {
        this.getMyRow().myCells.forEach(sudoCell => {
            sudoCell.myView.displayRowError();
        })
    }
}
class SudokuRow extends SudokuGroup {
    constructor(suGrid, index) {
        super(suGrid);
        this.myIndex = index;
    }

    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setRow(this);
    }
}

class SudokuColView extends SudokuGroupView {
    constructor(col) {
        super(col);
    }

    getMyCol() {
        return super.getMyModel();
    }

    displayError() {
        this.getMyCol().myCells.forEach(sudoCell => {
            sudoCell.myView.displayColError();
        })
    }
}
class SudokuCol extends SudokuGroup {
    constructor(suGrid, index) {
        super(suGrid);
        this.myIndex = index;
    }
    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setCol(this);
    }

}
class SudokuGridView extends SudokuView {
    constructor(suGrid) {
        super(suGrid);
        // Das bisherige DOM-Modell löschen
        this.domExplainer = document.getElementById("grid-plus-explainer");
    }
    upDate() {
        // Das bisherige DOM-Modell löschen
        let old_Node = document.getElementById("main-sudoku-grid");
        // Das neue DOM-Modell erzeugen
        let new_Node = document.createElement('div');
        new_Node.setAttribute('id', 'main-sudoku-grid');
        new_Node.classList.add('main-sudoku-grid');
        this.domExplainer.replaceChild(new_Node, old_Node);
        this.setMyNode(new_Node);

        // Die 9 Blöcke anzeigen
        let grid = this.getMyModel();
        grid.sudoBlocks.forEach(sudoBlock => {
            // Jeden Block anzeigen.
            let tmpBlockView = sudoBlock.getMyView();
            tmpBlockView.upDate();
            // Dem Block seine View geben
        });
        // Unlösbarkeit anzeigen.
        this.displayInsolvability();
        this.displayWrongNumbers();
        this.displaySelection();
    }


    displaySelection() {
        let grid = this.getMyModel();
        if (grid.indexSelected == -1) {
            grid.sudoCells.forEach(cell => {
                let cellView = cell.getMyView();
                cellView.unsetSelectStatus();
            })
        } else {
            let selectedCell = grid.sudoCells[grid.indexSelected];
            let selectedCellView = selectedCell.getMyView();
            selectedCellView.unsetSelectStatus();
            selectedCellView.setSelectStatus();
        }
    }

    getMyNode() {
        return this.myNode;
    }
    displayInsolvability() {
        let myGrid = this.getMyModel();
        // Nur einen Widerspruch zeigen.
        // Tatsächlich weist ein widerspruchsvolles Sudoku viele
        // Widersprüche gleichzeitig auf.
        for (let i = 0; i < 81; i++) {
            if (myGrid.sudoCells[i].getMyView().displayInsolvability()) return;
        }
        for (let i = 0; i < 9; i++) {
            if (myGrid.sudoRows[i].getMyView().displayInsolvability()) return;
        }
        for (let i = 0; i < 9; i++) {
            if (myGrid.sudoCols[i].getMyView().displayInsolvability()) return;
        }
        for (let i = 0; i < 9; i++) {
            if (myGrid.sudoBlocks[i].getMyView().displayInsolvability()) return;
        }
    }
    displayWrongNumbers() {
        let myGrid = this.getMyModel();
        for (let i = 0; i < 81; i++) {
            if (myGrid.sudoCells[i].getMyView().displayWrongNumber());
        }
    }

}

class SudokuGrid extends SudokuModel {
    // Speichert die Sudokuzellen in der Wrapper-Version
    constructor(calculator) {
        super();
        // Neue Puzzles sind noch nicht geladen, weil sie sich
        // noch nicht in der DB befinden. 
        // Sie besitzen daher auch noch keine Id.

        this.myCalculator = calculator;

        // Aktuelle Selektion
        this.selectedCell = undefined;
        this.indexSelected = -1;
        // In der slektierten Zelle der Indes der selektierten
        // zulässigen Nummer
        this.adMissibleIndexSelected = -1;

        this.loadedPuzzleId = '';
        this.loadedPuzzleName = '';

        this.difficulty = 'Keine Angabe';
        this.steps = 0;
        this.backTracks = 0;

        this.sudoCells = [];
        this.sudoBlocks = [];
        this.sudoRows = [];
        this.sudoCols = [];

        this.evalType = 'no-eval';
        this.solvedPuzzleRecord = null;
        // this.init();
    }



    init() {
        // Speichert die aktuell selektierte Zelle und ihren Index
        this.selectedCell = undefined;
        this.indexSelected = -1;
        this.adMissibleIndexSelected = -1;

        this.loadedPuzzleId = '';
        this.loadedPuzzleName = '';

        this.difficulty = 'Keine Angabe';
        this.steps = 0;
        this.backTracks = 0;
        // Erzeuge die interne Tabelle
        this.createSudoGrid();
        this.evaluateMatrix();
    }

    // ========================================================
    // Setter
    // ========================================================
    setEvalType(et) {
        this.evalType = et;
        if (et == 'no-eval') {
            this.myCalculator.autoExecStop();
        }
        this.evaluateMatrix();
    }

    setSolvedToGiven() {
        // Vom Generator verwendete Funktion
        // Alle gelöste Zellen werden in Givens umgewandelt
        this.initCurrentSelection();
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() !== '0') {
                if (this.sudoCells[i].getPhase() == 'play') {
                    this.sudoCells[i].clearAutoExecInfo();
                    this.sudoCells[i].setPhase('define');
                }
            }
        }
        this.evaluateMatrix();
    }

    setAdMissibleIndexSelected(nr) {
        this.adMissibleIndexSelected = nr;
    }

    // ========================================================
    // Getter
    // ========================================================

    getCellAt(row, col) {
        return this.sudoCells[9 * row + col];
    }

    puzzleSolved() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() == '0') {
                return false;
            }
        }
        return true;
    }
    numberOfSolvedCells() {
        let tmp = 0;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() !== '0') {
                tmp++;
            }
        }
        return tmp;
    }
    numberOfGivens() {
        let tmp = 0;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() !== '0') {
                if (this.sudoCells[i].getPhase() == 'define') {
                    tmp++;
                }
            }
        }
        return tmp;
    }
    getPuzzleStr() {
        let tmpPuzzle = [];
        for (let i = 0; i < 81; i++) {
            tmpPuzzle[i] = {
                cellValue: this.sudoCells[i].getValue(),
                cellPhase: this.sudoCells[i].getPhase()
            }
        }
        return JSON.stringify(tmpPuzzle);
    }

    setPuzzleStr(strPuzzle) {
        let tmpPuzzle = JSON.parse(strPuzzle);
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].setValue(tmpPuzzle[i].cellValue);
            this.sudoCells[i].setPhase(tmpPuzzle[i].cellPhase);
        }
    }

    getPlayedPuzzleRecord() {
        // Zusammenstellung des Puzzles, um es abspeichern zu können
        let puzzleDbElement = new SudokuPuzzle(
            "-",
            0,
            'ungelöst',
            0,
            0,
            'Keine Angabe',
            0,
            (new Date()).toJSON(),
            [
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
            ],
            [
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0", "0",
            ]
        );
        puzzleDbElement.defCount = 0;
        for (let i = 0; i < 81; i++) {
            puzzleDbElement.puzzle[i] = {
                cellValue: this.sudoCells[i].getValue(),
                cellPhase: this.sudoCells[i].getPhase()
            }
            if (this.sudoCells[i].getPhase() == 'define') {
                puzzleDbElement.defCount++;
            }
        }
        // Status setzen
        puzzleDbElement.level = this.difficulty;
        if (this.puzzleSolved()) {
            puzzleDbElement.status = 'gelöst';
            if (this.evalType == 'lazy') {
                puzzleDbElement.stepsLazy = this.steps;
            } else if (this.evalType == 'strict-plus' || this.evalType == 'strict-minus') {
                puzzleDbElement.stepsStrict = this.steps;
            }
            puzzleDbElement.backTracks = this.backTracks;
            for (let i = 0; i < 81; i++) {
                puzzleDbElement.solution[i] = this.sudoCells[i].getValue();
            }
            puzzleDbElement.date = (new Date()).toJSON();
        } else {
            puzzleDbElement.status = 'unlösbar';
        }
        return puzzleDbElement;
    }

    isInsolvable() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].isInsolvable()) {
                return true;
            }
        }
        for (let i = 0; i < 9; i++) {
            if (this.sudoBlocks[i].isInsolvable()) {
                return true;
            }
        }
        for (let i = 0; i < 9; i++) {
            if (this.sudoRows[i].isInsolvable()) {
                return true;
            }
        }
        for (let i = 0; i < 9; i++) {
            if (this.sudoCols[i].isInsolvable()) {
                return true;
            }
        }
        return false;
    }
    isFinished() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() == '0') return false;
        }
        return true;
    }
    // ========================================================
    // Other methods
    // ========================================================
    evaluateMatrix() {
        if (this.evalType == 'no-eval') this.clearEvaluations();
        if (this.evalType == 'lazy') this.evaluateGridLazy();
        if (this.evalType == 'strict-plus' || this.evalType == 'strict-minus') this.evaluateGridStrict();
    }

    clearAutoExecCellInfos() {
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].clearAutoExecInfo();
        }
    }

    reset() {
        // Alle in der Phase 'play' gesetzten Zahlen werden gelöscht
        // Die Zellen der Aufgabenstellung bleiben erhalten
        // Schritt 1: Die aktuelle Selektion wird zurückgesetzt
        this.initCurrentSelection();
        // Schritt 2: Die aktuellen Zellinhalte werden gelöscht
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() !== '0') {
                if (this.sudoCells[i].getPhase() == 'play') {
                    this.sudoCells[i].clear();
                }
            }
        }
        this.evaluateMatrix();
    }


    takeBackSolvedCells() {
        // Vom Generator verwendete Funktion
        // Löscht solange gelöste Zellen, wie das Grid 
        // eine eindeutige Lösung behält.
        let randomCellOrder = Randomizer.getRandomNumbers(81, 0, 81);
        for (let i = 0; i < 81; i++) {
            let k = randomCellOrder[i];
            if (this.sudoCells[k].getValue() !== '0') {
                // Selektiere Zelle mit gesetzter Nummer
                this.select(this.sudoCells[k], k);
                // Notiere die gesetzte Nummer, um sie eventuell wiederherstellen zu können
                let tmpNr = this.sudoCells[k].getValue();
                // Lösche die gesetzte Nummer
                this.deleteSelected('define', false);
                // Werte die verbliebene Matrix strikt aus.
                this.evaluateGridStrict();
                if (this.sudoCells[k].getNecessarys().size == 1) {
                    // Die gelöschte Zelle hat eine eindeutig zu wählende Nummer 
                    // necessaryCondition
                } else if (this.sudoCells[k].getTotalAdmissibles().size == 1) {
                    // Die gelöschte Zelle hat eine eindeutig zu wählende Nummer 
                    // totalAdmissibleCondition
                } else {
                    // Die gelöschte Zelle weist keine eindeutig zu wählende Nummer aus
                    // Dann wird die Löschung zurückgenommen.
                    this.select(this.sudoCells[k], k);
                    this.sudoCells[k].manualSetValue(tmpNr, 'define');
                }
            }
        }
    }


    loadPuzzle(uid, puzzleDbElement) {
        this.loadedPuzzleId = uid;
        this.loadedPuzzleName = puzzleDbElement.name;
        this.difficulty = puzzleDbElement.level;
        this.backTracks = puzzleDbElement.backTracks;
        this.solvedPuzzle = puzzleDbElement.puzzle;
        for (let i = 0; i < 81; i++) {
            let tmpCellValue = this.solvedPuzzle[i].cellValue;
            let tmpCellPhase = 'define';
            if (tmpCellValue == undefined) {
                // Altes Format lesen
                tmpCellValue = this.solvedPuzzle[i];
            } else {
                tmpCellPhase = this.solvedPuzzle[i].cellPhase;
            }
            this.sudoCells[i].manualSetValue(tmpCellValue, tmpCellPhase);
        }
        this.evaluateMatrix();
    }

    loadPuzzleInfos(uid, puzzleDbElement) {
        // this.loadedPuzzleId = uid;
        // this.loadedPuzzleName = puzzleDbElement.name;
        this.difficulty = puzzleDbElement.level;
        this.backTracks = puzzleDbElement.backTracks;
        this.solvedPuzzle = puzzleDbElement.puzzle;
        this.evaluateMatrix();
    }

    createSudoGrid() {
        // Eine lokale Hilfsfunktion
        function calcIndex(row, col) {
            if (row == 0 && col == 0) {
                return 0;
            } else if (row == 0 && col == 1) {
                return 1;
            } else if (row == 0 && col == 2) {
                return 2;
            } else if (row == 1 && col == 0) {
                return 3;
            } else if (row == 1 && col == 1) {
                return 4;
            } else if (row == 1 && col == 2) {
                return 5;
            } else if (row == 2 && col == 0) {
                return 6;
            } else if (row == 2 && col == 1) {
                return 7;
            } else if (row == 2 && col == 2) {
                return 8;
            }
        }
        this.sudoCells = [];
        this.sudoBlocks = [];
        this.sudoRows = [];
        this.sudoCols = [];

        // Die 9 Blöcke anlegen
        for (let i = 0; i < 9; i++) {
            let block = new SudokuBlock(this, i);
            let blockView = new SudokuBlockView(block);

            block.setMyView(blockView);
            this.sudoBlocks.push(block);
        }
        // Die 81 Zellen anlegen und in ihren jeweiligen Block einfügen
        for (let i = 0; i < 81; i++) {
            let row = Math.floor(i / 9);
            let col = i % 9;
            let blockRow = Math.floor(row / 3);
            let blockCol = Math.floor(col / 3);
            let tmpBlockIndex = calcIndex(blockRow, blockCol);

            let cell = new SudokuCell(this, i);
            cell.setBlock(this.sudoBlocks[tmpBlockIndex]);
            let cellView = new SudokuCellView(cell);
            cell.setMyView(cellView);
            this.sudoCells.push(cell);
            this.sudoBlocks[tmpBlockIndex].addCell(cell);
        }
        // Influencers in den Zellen setzen
        // Das geschieht nur einmal bei der Initialisierung
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].setInfluencers(this.influencersOfCell(i));
        }
        // Setze die Row-Col-Vektoren
        // Laufindex über dem Cell-Vektor
        let currentIndex = 0;
        // Die Col-Vektoren werden angelegt, zunächst leer
        for (let i = 0; i < 9; i++) {
            let col = new SudokuCol(this, i);
            let colView = new SudokuColView(col);
            col.setMyView(colView);
            this.sudoCols.push(col);
        }
        for (let i = 0; i < 9; i++) {
            // Ein Row-Vektor wird angelegt
            let row = new SudokuRow(this, i);
            let rowView = new SudokuRowView(row);
            row.setMyView(rowView);
            for (let j = 0; j < 9; j++) {
                let currentCell = this.sudoCells[currentIndex];
                // Die aktuelle Zelle wird der aktuellen Reihe hinzugefügt
                row.addCell(currentCell);
                // Die aktuelle Zelle wird dem Spaltenvektor j hinzugefügt
                this.sudoCols[j].addCell(currentCell);
                currentIndex++;
            }
            this.sudoRows.push(row);
        }
        // Row- und Col-Vektoren in den Blöcken anlegen
        for (let i = 0; i < 9; i++) {
            this.sudoBlocks[i].addBlockVectors();
        }

    }

    initCurrentSelection() {
        this.deselect();
    }

    deselect() {
        if (this.isCellSelected()) {
            // Lösche die Selektionsinformation der Tabelle
            this.selectedCell = undefined;
            this.indexSelected = -1;
            this.adMissibleIndexSelected = -1;
        }
    }

    setCurrentSelection(cell, index) {
        cell.setSelected();
        this.indexSelected = index;
        this.selectedCell = cell;
        // Erste Subselektion setzen
        // Subselektion kann leer sein.
        this.adMissibleIndexSelected = cell.nextAdMissibleIndex();
    }

    isCellSelected() {
        return this.indexSelected != -1;
    }

    atCurrentSelectionSetNumber(btnNumber, currentPhase) {
        // Setze Nummer in einer Zelle
        if ( // Das geht nur, wenn eine Zelle selektiert ist
            this.isCellSelected()) {
            if (// Wenn die Zelle leer ist, kein Problem
                (this.selectedCell.getValue() == '0') ||
                // Wenn die Zelle gefüllt ist, kann nur im gleichen Modus
                // eine Neusetzung erfolgen
                (this.selectedCell.getPhase() == currentPhase)
            ) {
                this.selectedCell.manualSetValue(btnNumber, currentPhase);
                this.deselect();
                this.evaluateMatrix();
            }
        }
    }

    atCurrentSelectionSetAutoNumber(currentStep) {
        // Setze Nummer in einer Zelle
        if ( // Das geht nur, wenn eine Zelle selektiert ist
            this.isCellSelected()) {
            if (// Wenn die Zelle leer ist, kein Problem
                (this.selectedCell.getValue() == '0') ||
                // Wenn die Zelle geüllt ist, kann nur im gleichen Modus
                // eine Neusetzung erfolgen
                (this.selectedCell.getPhase() == 'play')
            ) {
                this.selectedCell.autoSetValue(currentStep);
                this.evaluateMatrix();
            }
        }
    }

    deleteSelected(currentPhase, undoOp) {
        // Lösche die selektierte Zelle
        if (this.isCellSelected()) {
            // Das Löschen kann nur im gleichen Modus
            // eine Neusetzung erfolgen
            if (this.selectedCell.getPhase() == currentPhase) {
                this.selectedCell.clear();
                this.evaluateMatrix();
            }
        }
    }


    evaluateGridLazy() {
        // Berechne das Grid nur soweit, 
        // dass der nächste eindeutige Schritt getan werden kann
        this.clearEvaluations();
        this.calculate_level_0_inAdmissibles();

        let inAdmissiblesAdded = true;
        while (inAdmissiblesAdded && !this.isInsolvable()) {

            if (this.calculateNecessarys()) return true;
            if (this.calculateSingles()) return true;

            inAdmissiblesAdded = false;

            // inAdmissiblesFromNecessarys kann es nicht mehr geben, 
            // weil die necessarys im ersten Teil der Schleife verbraucht werden

            // derive_inAdmissiblesFromSingles kann es nicht mehr geben,
            // aus dem gleichen Grund.

            if (this.derive_inAdmissiblesFromHiddenPairs()) {
                inAdmissiblesAdded = true;
            } else if (this.derive_inAdmissiblesFromNakedPairs()) {
                inAdmissiblesAdded = true;
            } else if (this.derive_inAdmissiblesFromIntersection()) {
                inAdmissiblesAdded = true;
            } else if (this.derive_inAdmissiblesFromPointingPairs()) {
                inAdmissiblesAdded = true;
            }

        }
    }

    evaluateGridStrict() {
        this.clearEvaluations();
        this.calculate_level_0_inAdmissibles();

        this.calculateNecessarys();

        let inAdmissiblesAdded = true;
        let c1 = false;
        let c2 = false;
        let c3 = false;
        let c4 = false;
        let c5 = false;

        while (inAdmissiblesAdded && !this.isInsolvable()) {
            c4 = this.derive_inAdmissiblesFromSingles();
            c1 = this.derive_inAdmissiblesFromHiddenPairs();
            c2 = this.derive_inAdmissiblesFromNakedPairs();
            c3 = this.derive_inAdmissiblesFromIntersection();
            c5 = this.derive_inAdmissiblesFromPointingPairs();
            inAdmissiblesAdded = c1 || c2 || c3 || c4 || c5;
        }
    }

    clearEvaluations() {
        // Iteriere über die Blöcke
        for (let i = 0; i < 9; i++) {
            let tmpBlock = this.sudoBlocks[i];
            tmpBlock.clearEvaluations();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            tmpRow.clearEvaluations();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            tmpCol.clearEvaluations();
        }
    }


    calculateSingles() {
        let added = false;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() == '0') {
                if (this.sudoCells[i].getTotalAdmissibles().size == 1) {
                    return true;
                }
            }
        }
        return added;
    }

    derive_inAdmissiblesFromSingles() {
        // Das das zweite Auftreten einer einzig verbliebenen Nummer ist indirekt unzulässig
        // Iteriere über alle Zellen

        let inAdmissiblesAdded = false;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() == '0') {
                // Die Zelle ist ungesetzt
                // Die Zelle hat selbst keine notwendige Nummer
                let singlesInContext = new SudokuSet();
                this.sudoCells[i].myInfluencers.forEach(cell => {
                    if (cell.getValue() == '0') {
                        singlesInContext = singlesInContext.union(cell.getTotalSingles());
                    }
                })
                let oldInAdmissibles = new SudokuSet(this.sudoCells[i].myLevel_gt0_inAdmissibles);
                let mySingle = this.sudoCells[i].getTotalSingles();
                if (mySingle.size == 1 && singlesInContext.isSuperset(mySingle)) {
                    // Das ist die Situation: Dieselbe Single zweimal in einer Block, Spalte oder Reihe.
                    // Also eine unlösbares Sudoku.
                    // Das weitere Ausrechnen bringt nichts, da die Unlösbarkeit
                    // bereits auf der Gruppe-Ebene festgestellt werden kann.
                    // Auch ist auf der Gruppe-Ebene die Unlösbarkeit für den Anwender leichter verständlich.
                } else {
                    // Nur zulässige können neu unzulässig werden.
                    let tmpAdmissibles = this.sudoCells[i].getAdmissibles();
                    let inAdmissiblesFromSingles = tmpAdmissibles.intersection(singlesInContext);
                    // Die indirekt unzulässigen werden neu gesetzt
                    this.sudoCells[i].myLevel_gt0_inAdmissibles =
                        this.sudoCells[i].myLevel_gt0_inAdmissibles.union(inAdmissiblesFromSingles);

                    let localAdded = !oldInAdmissibles.equals(this.sudoCells[i].myLevel_gt0_inAdmissibles);
                    inAdmissiblesAdded = inAdmissiblesAdded || localAdded;
                    if (localAdded) {
                        let newInAdmissibles =
                            this.sudoCells[i].myLevel_gt0_inAdmissibles.difference(oldInAdmissibles);
                        this.sudoCells[i].myLevel_gt0_inAdmissiblesFromSingles = newInAdmissibles;
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromNakedPairs() {
        let c1 = false;
        let c2 = false;
        let c3 = false;
        // Iteriere über die Blockn
        for (let i = 0; i < 9; i++) {
            let tmpBlock = this.sudoBlocks[i];
            c1 = c1 || tmpBlock.derive_inAdmissiblesFromNakedPairs();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            c2 = c2 || tmpRow.derive_inAdmissiblesFromNakedPairs();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            c3 = c3 || tmpCol.derive_inAdmissiblesFromNakedPairs();
        }
        let inAdmissiblesAdded = c1 || c2 || c3;
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromHiddenPairs() {
        let c1 = false;
        let c2 = false;
        let c3 = false;
        // Iteriere über die Blockn
        for (let i = 0; i < 9; i++) {
            let tmpBlock = this.sudoBlocks[i];
            c1 = c1 || tmpBlock.derive_inAdmissiblesFromHiddenPairs();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            c2 = c2 || tmpRow.derive_inAdmissiblesFromHiddenPairs();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            c3 = c3 || tmpCol.derive_inAdmissiblesFromHiddenPairs();
        }
        let inAdmissiblesAdded = c1 || c2 || c3;
        return inAdmissiblesAdded;
    }

    // Funktionen für die Überschneidungstechnik

    cellIntersectionInRowEliminate(tmpBlock, row, strongRow, strongNumbers) {
        // Eliminiere die strongNumbers in row des Blocks tmpBlock
        let inAdmissiblesAdded = false;

        // Iteriere über die 3 Zellen der Blockreihe
        for (let col = 0; col < 3; col++) {
            let tmpCell = tmpBlock.getBlockCellAt(row, col);

            if (tmpCell.getValue() == '0') {
                let oldInAdmissibles = new SudokuSet(tmpCell.myLevel_gt0_inAdmissibles);
                let tmpAdmissibles = tmpCell.getTotalAdmissibles();
                let inAdmissiblesFromIntersection = tmpAdmissibles.intersection(strongNumbers);

                if (inAdmissiblesFromIntersection.size > 0) {
                    tmpCell.myLevel_gt0_inAdmissibles =
                        tmpCell.myLevel_gt0_inAdmissibles.union(inAdmissiblesFromIntersection);
                    let localAdded = !oldInAdmissibles.equals(tmpCell.myLevel_gt0_inAdmissibles);
                    inAdmissiblesAdded = inAdmissiblesAdded || localAdded;
                    if (localAdded) {
                        let newInAdmissibles =
                            tmpCell.myLevel_gt0_inAdmissibles.difference(oldInAdmissibles);
                        // Die Liste der indirekt unzulässigen verursacht von overlap wird gesetzt
                        tmpCell.myLevel_gt0_inAdmissiblesFromIntersection = newInAdmissibles;
                        newInAdmissibles.forEach(inAdNr => {
                            let overlapInfo = {
                                block: tmpBlock,
                                rowCol: strongRow
                            }
                            tmpCell.myLevel_gt0_inAdmissiblesFromIntersectionInfo.set(inAdNr, overlapInfo);
                        })
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }

    cellIntersectionInColEliminate(tmpBlock, col, strongCol, strongNumbers) {
        // Eliminiere die strongNumbers in col des Blocks tmpBlock
        let inAdmissiblesAdded = false;

        // Iteriere über die 3 Zellen der Blockspalte
        for (let row = 0; row < 3; row++) {
            let tmpCell = tmpBlock.getBlockCellAt(row, col);

            if (tmpCell.getValue() == '0') {
                let oldInAdmissibles = new SudokuSet(tmpCell.myLevel_gt0_inAdmissibles);
                let tmpAdmissibles = tmpCell.getTotalAdmissibles();
                let inAdmissiblesFromIntersection = tmpAdmissibles.intersection(strongNumbers);

                if (inAdmissiblesFromIntersection.size > 0) {

                    tmpCell.myLevel_gt0_inAdmissibles =
                        tmpCell.myLevel_gt0_inAdmissibles.union(inAdmissiblesFromIntersection);
                    let localAdded = !oldInAdmissibles.equals(tmpCell.myLevel_gt0_inAdmissibles);
                    inAdmissiblesAdded = inAdmissiblesAdded || localAdded;
                    if (localAdded) {
                        let newInAdmissibles =
                            tmpCell.myLevel_gt0_inAdmissibles.difference(oldInAdmissibles);
                        tmpCell.myLevel_gt0_inAdmissiblesFromIntersection = newInAdmissibles;

                        newInAdmissibles.forEach(inAdNr => {
                            let overlapInfo = {
                                block: tmpBlock,
                                rowCol: strongCol
                            }
                            tmpCell.myLevel_gt0_inAdmissiblesFromIntersectionInfo.set(inAdNr, overlapInfo);
                        })
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }


    derive_inAdmissiblesFromPointingPairs() {
        let tmpBlock = null;
        let inAdmissiblesAdded = false;

        // Iteriere über die 9 Blöcke der Matrix
        for (let i = 0; i < 9; i++) {
            tmpBlock = this.sudoBlocks[i];

            // Iteriere über die Reihenvektoren
            for (let row = 0; row < 3; row++) {
                let pointingNrs = tmpBlock.myRowVectors[row].getPointingNrs();
                pointingNrs.forEach(pointingNr => {
                    let newInAdmissiblesAdded = this.eliminatePointingNrInGridRow(pointingNr, tmpBlock.myRowVectors[row], tmpBlock.myOrigin.row + row);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded;
                })
            }

            // Iteriere über die Spaltenvektoren
            for (let col = 0; col < 3; col++) {
                let pointingNrs = tmpBlock.myColVectors[col].getPointingNrs();
                pointingNrs.forEach(pointingNr => {
                    let newInAdmissiblesAdded = this.eliminatePointingNrInGridCol(pointingNr, tmpBlock.myColVectors[col], tmpBlock.myOrigin.col + col);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded;
                })
            }
        }
        return inAdmissiblesAdded;
    }

    eliminatePointingNrInGridRow(pointingNr, pointingVector, rowIndex) {
        // Eliminiere pointingNr in row mit Index rowIndex
        let inAdmissiblesAdded = false;
        let block = pointingVector.myBlock;
        let blockOriginCol = block.myOrigin.col;

        // Iteriere über die Zellen der Reihe
        for (let col = 0; col < 9; col++) {
            if (col < blockOriginCol || col > (blockOriginCol + 2)) {
                // col nicht im Pointing Vector
                let tmpCell = this.getCellAt(rowIndex, col);
                if (tmpCell.getValue() == '0') {
                    // Die Zelle ist ungesetzt
                    let oldInAdmissibles = new SudokuSet(tmpCell.myLevel_gt0_inAdmissibles);
                    let tmpAdmissibles = tmpCell.getTotalAdmissibles();

                    if (tmpAdmissibles.has(pointingNr)) {
                        tmpCell.myLevel_gt0_inAdmissibles.add(pointingNr);

                        let localAdded = !oldInAdmissibles.equals(tmpCell.myLevel_gt0_inAdmissibles);
                        inAdmissiblesAdded = inAdmissiblesAdded || localAdded;

                        if (localAdded) {
                            tmpCell.myLevel_gt0_inAdmissiblesFromPointingPairs.add(pointingNr);
                            let pointingPairInfo = {
                                pNr: pointingNr,
                                pVector: pointingVector,
                                rowCol: this.sudoRows[rowIndex]
                            }
                            tmpCell.myLevel_gt0_inAdmissiblesFromPointingPairsInfo.set(pointingNr, pointingPairInfo);
                        }
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }


    eliminatePointingNrInGridCol(pointingNr, pointingVector, colIndex) {
        // Eliminiere pointingNr in coö mit Index colIndex
        let inAdmissiblesAdded = false;
        let block = pointingVector.myBlock;
        let blockOriginRow = block.myOrigin.row;

        // Iteriere über die Zellen der Spalte
        for (let row = 0; row < 9; row++) {
            if (row < blockOriginRow || row > (blockOriginRow + 2)) {
                // row nicht im Pointing Vector
                let tmpCell = this.getCellAt(row, colIndex);

                if (tmpCell.getValue() == '0') {
                    // Die Zelle ist ungesetzt
                    let oldInAdmissibles = new SudokuSet(tmpCell.myLevel_gt0_inAdmissibles);
                    let tmpAdmissibles = tmpCell.getTotalAdmissibles();

                    if (tmpAdmissibles.has(pointingNr)) {
                        tmpCell.myLevel_gt0_inAdmissibles.add(pointingNr);

                        let localAdded = !oldInAdmissibles.equals(tmpCell.myLevel_gt0_inAdmissibles);
                        inAdmissiblesAdded = inAdmissiblesAdded || localAdded;

                        if (localAdded) {
                            tmpCell.myLevel_gt0_inAdmissiblesFromPointingPairs.add(pointingNr);
                            let pointingPairInfo = {
                                pNr: pointingNr,
                                pVector: pointingVector,
                                rowCol: this.sudoCols[colIndex]
                            }
                            tmpCell.myLevel_gt0_inAdmissiblesFromPointingPairsInfo.set(pointingNr, pointingPairInfo);
                        }
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromIntersection() {
        let tmpBlock = null;
        let tmpRow = null;
        let tmpCol = null;
        let inAdmissiblesAdded = false;

        // Iteriere über die 9 Blöcke der Matrix
        for (let i = 0; i < 9; i++) {
            tmpBlock = this.sudoBlocks[i];

            // Iteriere über die 3 Reihen des Blocks
            for (let row = 0; row < 3; row++) {
                let matrixRow = tmpBlock.getMatrixRowFromBlockRow(row);
                let numbersInRowOutsideBlock = new SudokuSet();
                let numbersInRowInsideBlock = new SudokuSet();
                let strongNumbersInRowInsideBlock = new SudokuSet();
                tmpRow = this.sudoRows[matrixRow];

                // Iteriere über die Zellen der Reihe
                for (let col = 0; col < 9; col++) {
                    if (tmpRow.myCells[col].getValue() == '0') {
                        if (tmpBlock.isBlockCol(col)) {
                            numbersInRowInsideBlock = numbersInRowInsideBlock.union(tmpRow.myCells[col].getTotalAdmissibles());
                        } else {
                            numbersInRowOutsideBlock = numbersInRowOutsideBlock.union(tmpRow.myCells[col].getTotalAdmissibles());
                        }
                    }
                    // Die strengen Nummern kommen nur im Block vor, nicht außerhalb des Blocks
                    strongNumbersInRowInsideBlock = numbersInRowInsideBlock.difference(numbersInRowOutsideBlock);
                }
                // Die Blockzellen um die strengen Nummern reduzieren
                if (strongNumbersInRowInsideBlock.size > 0) {
                    // In 2 Reihen des Blocks die strengen Nummern inadmissible setzen
                    let row1 = 0;
                    let row2 = 0;
                    switch (row) {
                        case 0: {
                            row1 = 1;
                            row2 = 2;
                            break;
                        }
                        case 1: {
                            row1 = 0;
                            row2 = 2;
                            break;
                        }
                        case 2: {
                            row1 = 0;
                            row2 = 1;
                        }
                    }
                    let newInAdmissiblesAdded1 = this.cellIntersectionInRowEliminate(tmpBlock, row1, tmpRow, strongNumbersInRowInsideBlock);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded1;

                    let newInAdmissiblesAdded2 = this.cellIntersectionInRowEliminate(tmpBlock, row2, tmpRow, strongNumbersInRowInsideBlock);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded2;
                }
            }
            // Iteriere über die Spalten des Blocks
            for (let col = 0; col < 3; col++) {
                let matrixCol = tmpBlock.getMatrixColFromBlockCol(col);
                let numbersInColOutsideBlock = new SudokuSet();
                let numbersInColInsideBlock = new SudokuSet();
                let strongNumbersInColInsideBlock = new SudokuSet();
                tmpCol = this.sudoCols[matrixCol];

                // Iteriere über die Zellen der Spalte
                for (let row = 0; row < 9; row++) {
                    if (tmpCol.myCells[row].getValue() == '0') {
                        if (tmpBlock.isBlockRow(row)) {
                            numbersInColInsideBlock = numbersInColInsideBlock.union(tmpCol.myCells[row].getTotalAdmissibles());
                        } else {
                            numbersInColOutsideBlock = numbersInColOutsideBlock.union(tmpCol.myCells[row].getTotalAdmissibles());
                        }
                    }
                    strongNumbersInColInsideBlock = numbersInColInsideBlock.difference(numbersInColOutsideBlock);
                }
                // Die Blockzellen um die strengen Nummern reduzieren
                if (strongNumbersInColInsideBlock.size > 0) {
                    // In 2 Spalten der Block die strong NUmmern inadmissible setzen
                    let col1 = 0;
                    let col2 = 0;
                    //
                    switch (col) {
                        case 0: {
                            col1 = 1;
                            col2 = 2;
                            break;
                        }
                        case 1: {
                            col1 = 0;
                            col2 = 2;
                            break;
                        }
                        case 2: {
                            col1 = 0;
                            col2 = 1;
                        }
                    }
                    // col1 bereinigen            
                    let newInAdmissiblesAdded1 = this.cellIntersectionInColEliminate(tmpBlock, col1, tmpCol, strongNumbersInColInsideBlock);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded1;

                    let newInAdmissiblesAdded2 = this.cellIntersectionInColEliminate(tmpBlock, col2, tmpCol, strongNumbersInColInsideBlock);
                    inAdmissiblesAdded = inAdmissiblesAdded || newInAdmissiblesAdded2;
                }
            }
        }
        return inAdmissiblesAdded;
    }


    calculate_level_0_inAdmissibles() {
        // Berechne für jede nicht gesetzte Zelle 
        // die noch möglichen Nummern
        for (let i = 0; i < 81; i++) {
            let tmpCell = this.sudoCells[i];
            tmpCell.calculate_level_0_inAdmissibles();
            tmpCell.candidatesEvaluated = true;
        }
    }

    calculateNecessarys() {
        // Berechne und setze für jede nicht gesetzte Zelle
        // in der Menge ihrer möglichen Nummern die
        // notwendigen Nummern
        // Iteriere über die Blöcke
        for (let i = 0; i < 9; i++) {
            let tmpBlock = this.sudoBlocks[i];
            tmpBlock.calculateNecessarys();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            tmpRow.calculateNecessarys();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            tmpCol.calculateNecessarys();
        }
    }

    select(sudoCell, index) {
        // Selektiere in der Tabelle eine Zelle
        // Parameter:
        //      cell: Wrapper der Zelle
        //      index: index der Zelle
        let oldIndex = this.indexSelected;

        if (oldIndex == index) {
            // Die selektierte Zelle bleibt unverändert
            if (this.adMissibleIndexSelected == -1) {
                // Die Gesamtselektion besitzt keine Subselektion
                // Die Gesamtselektion wird deselektiert.
                this.deselect();
            } else {
                // Setze die nächste Subselektion
                let adMissibleIndexSelected = sudoCell.nextAdMissibleIndex();
                if (adMissibleIndexSelected == -1) {
                    // Die Gesamtselektion besitzt keine weitere Subselektion
                    // Die Gesamtselektion wird deselektiert.
                    this.deselect();
                } else {
                    this.setAdMissibleIndexSelected(adMissibleIndexSelected);
                }
            }
        } else {
            // Neue Gesamtselektion
            this.setCurrentSelection(sudoCell, index);
        }
    }

    indexSelect(index) {
        this.select(this.sudoCells[index], index);
    }

    influencersOfCell(index) {
        // Jede Zelle besitzt die Menge der sie beeinflussenden Zellen
        // Diese werden hier berechnet.

        const grid_size = 9;
        const box_size = 3;

        let indexSet = new SudokuSet();
        let tmpInfluencers = [];

        let row = Math.floor(index / grid_size);
        let col = index % grid_size;

        let box_start_row = row - row % 3;
        let box_start_col = col - col % 3;

        for (let i = 0; i < box_size; i++) {
            for (let j = 0; j < box_size; j++) {
                let tmpIndex = 9 * (box_start_row + i) + (box_start_col + j);
                if (index !== tmpIndex) {
                    indexSet.add(tmpIndex);
                }
            }
        }

        let step = 9;
        while (index - step >= 0) {
            indexSet.add(index - step);
            step += 9;
        }

        step = 9;
        while (index + step < 81) {
            indexSet.add(index + step);
            step += 9;
        }

        step = 1;
        while (index - step >= 9 * row) {
            indexSet.add(index - step);
            step += 1;
        }

        step = 1;
        while (index + step < 9 * row + 9) {
            indexSet.add(index + step);
            step += 1;
        }
        indexSet.forEach(i => {
            tmpInfluencers.push(this.sudoCells[i]);
        })
        return tmpInfluencers;
    }
}
class SudokuCellView extends SudokuView {
    constructor(cell) {
        super(cell);

    }
    upDate() {
        let tmpCellNode = document.createElement("div");
        tmpCellNode.setAttribute("class", "sudoku-grid-cell");
        this.setMyNode(tmpCellNode);
        // Neue Zelle in ihren Block einhängen
        let myCell = this.getMyModel();
        let myBlock = myCell.myBlock;
        let myBlockView = myBlock.getMyView();
        let myBlockNode = myBlockView.getMyNode();

        myBlockNode.appendChild(tmpCellNode);
        tmpCellNode.addEventListener('click', () => {
            sudoApp.mySolverController.sudokuCellPressed(myCell, myCell.getMyIndex());
        });
        this.upDateCellContent();
    }

    upDateCellContent() {
        let cell = this.getMyModel();
        if (cell.myValue == '0') {
            // Die Zelle ist noch nicht gesetzt
            if (cell.candidatesEvaluated) {
                this.displayAdmissibles();
                this.displayNecessary(cell.myNecessarys);
                this.displayLevel_gt0_inAdmissibles(cell.myLevel_gt0_inAdmissibles, cell.myNecessarys);
            } else {
                // Leere Zelle anzeigen
                this.myNode.classList.add('nested');
            }
        } else {
            // Die Zelle ist mit einer Nummer belegt
            // Setze die Klassifizierung in der DOM-Zelle
            this.displayGamePhase(cell.myGamePhase);
            if (cell.myValueType == 'auto') {
                this.displayAutoValue(cell.myValue);
            } else {
                this.displayMainValueNode(cell.myValue);
            }
        }
    }

    displayAdmissibles() {
        let cell = this.getMyModel();
        let inAdmissiblesVisible = (sudoApp.mySolver.myGrid.evalType == 'lazy' || sudoApp.mySolver.myGrid.evalType == 'strict-plus');
        if (inAdmissiblesVisible) {
            this.displayAdmissiblesInDetail(cell.getAdmissibles());
        } else {
            // Angezeigte inAdmissibles sind zunächst einmal Zulässige
            // und dürfen jetzt nicht mehr angezeigt werden
            this.displayAdmissiblesInDetail(cell.getTotalAdmissibles());
        }
    }

    displayAdmissiblesInDetail(admissibles) {
        this.myNode.classList.add('nested');
        // Übertrage die berechneten Möglchen in das DOM
        admissibles.forEach(e => {
            let admissibleNrElement = document.createElement('div');
            admissibleNrElement.setAttribute('data-value', e);
            admissibleNrElement.innerHTML = e;
            this.getMyNode().appendChild(admissibleNrElement);
        });
    }

    displayNecessary(myNecessarys) {
        let admissibleNodes = this.myNode.children;
        for (let i = 0; i < admissibleNodes.length; i++) {
            if (myNecessarys.has(admissibleNodes[i].getAttribute('data-value'))) {
                admissibleNodes[i].classList.add('neccessary');
            }
        }
    }

    displayLevel_gt0_inAdmissibles(myLevel_gt0_inAdmissibles, myNecessarys) {
        let admissibleNodes = this.myNode.children;
        for (let i = 0; i < admissibleNodes.length; i++) {
            if (myLevel_gt0_inAdmissibles.has(admissibleNodes[i].getAttribute('data-value'))) {
                // In der Menge der unzulässigen Nummern gibt es die Knotennummer
                if (!myNecessarys.has(admissibleNodes[i].getAttribute('data-value'))) {
                    // Die Knotennummer wird als unzulässig markiert, aber
                    // nur, wenn die Nummer nicht gleichzeitig notwendig ist.
                    // Diese widersprüchliche Situation wird schon an anderer Stelle
                    // aufgefangen.
                    admissibleNodes[i].classList.add('inAdmissible');
                }
            }
        }
    }

    displayGamePhase(gamePhase) {
        if (gamePhase == 'define') {
            this.myNode.classList.add('define');
            this.myNode.classList.remove('play');
        } else {
            this.myNode.classList.add('play');
            this.myNode.classList.remove('define');
        }
    }

    displayMainValueNode(value) {
        this.myNode.setAttribute('data-value', value);
        this.myNode.innerHTML = value;
    }

    displayAutoStepNumber(autoValueCellNode) {
        // Die step-Nummer, also die wievielte Nummer wird gesetzt
        let autoStepNumberElement = document.createElement('div');
        autoStepNumberElement.setAttribute('class', 'auto-step-number');
        autoStepNumberElement.innerHTML = this.getMyModel().myAutoStepNumber;
        autoValueCellNode.appendChild(autoStepNumberElement);
    }

    displaySubValueNode(autoValueCellNode) {
        // Die gesetzte Nummer im Tripel
        let cellNumberElement = document.createElement('div');
        cellNumberElement.setAttribute('class', 'auto-value-number');
        cellNumberElement.innerHTML = this.getMyModel().myValue;
        autoValueCellNode.appendChild(cellNumberElement);
    }

    displayOptions(autoValueCellNode) {
        // Die optionalen Elemente dieser Zelle
        let options = this.getMyModel().myOptions;
        let optionLength = options.length;

        if (optionLength > 2) {
            // 3 Optionen werden optisch dargestellt
            // Die erste Option
            let option = options[0];
            let optionNumberElement = document.createElement('div');
            optionNumberElement.classList.add('auto-value-option1');
            if (option.open) {
                optionNumberElement.classList.add('open');
            }
            optionNumberElement.innerHTML = option.value;
            autoValueCellNode.appendChild(optionNumberElement);

            // Die zweite Option
            option = options[1];
            optionNumberElement = document.createElement('div');
            optionNumberElement.classList.add('auto-value-option2');
            if (option.open) {
                optionNumberElement.classList.add('open');
            }
            optionNumberElement.innerHTML = option.value;
            autoValueCellNode.appendChild(optionNumberElement);

            // Die dritte Option
            // option = this.myOptions[1];
            optionNumberElement = document.createElement('div');
            optionNumberElement.classList.add('auto-value-option3');
            optionNumberElement.classList.add('open');
            optionNumberElement.innerHTML = '*';
            autoValueCellNode.appendChild(optionNumberElement);
        } else if (optionLength == 2) {
            // 2 Optionen werden optisch dargestellt
            // Die erste Option
            let option = options[0];
            let optionNumberElement = document.createElement('div');
            optionNumberElement.classList.add('auto-value-option1');
            if (option.open) {
                optionNumberElement.classList.add('open');
            }
            optionNumberElement.innerHTML = option.value;
            autoValueCellNode.appendChild(optionNumberElement);

            // Die zweite Option
            option = options[1];
            optionNumberElement = document.createElement('div');
            optionNumberElement.classList.add('auto-value-option2');
            if (option.open) {
                optionNumberElement.classList.add('open');
            }
            optionNumberElement.innerHTML = option.value;
            autoValueCellNode.appendChild(optionNumberElement);

            // Die dritte Option
            // option = this.myOptions[1];
            optionNumberElement = document.createElement('div');
            optionNumberElement.classList.add('auto-value-option3');
            optionNumberElement.innerHTML = '-';
            autoValueCellNode.appendChild(optionNumberElement);

        } else {
            // Es gibt nur eine Option
            // Die erste Option
            let option = options[0];
            let optionNumberElement = document.createElement('div');
            optionNumberElement.classList.add('auto-value-option1');
            if (option.open) {
                optionNumberElement.classList.add('open');
            }
            optionNumberElement.innerHTML = option.value;
            autoValueCellNode.appendChild(optionNumberElement);

            // Die zweite Option
            optionNumberElement = document.createElement('div');
            optionNumberElement.classList.add('auto-value-option2');
            optionNumberElement.innerHTML = '-';
            autoValueCellNode.appendChild(optionNumberElement);

            // Die dritte Option
            // option = this.myOptions[1];
            optionNumberElement = document.createElement('div');
            optionNumberElement.classList.add('auto-value-option3');
            optionNumberElement.innerHTML = '-';
            autoValueCellNode.appendChild(optionNumberElement);
        }

    }
    displayAutoValue() {
        //Setze das data-value Attribut der Zelle
        this.myNode.setAttribute('data-value', this.myValue);
        // Automatisch gesetzte Nummer
        this.myNode.classList.add('auto-value');

        // Neuer Knotentyp für aut.values
        let autoValueCellNode = document.createElement("div");
        autoValueCellNode.setAttribute("class", "auto-value-cell");
        this.myNode.appendChild(autoValueCellNode);
        // Die Schrittnummer setzen
        this.displayAutoStepNumber(autoValueCellNode);
        // Die automatische Nummer setzen
        this.displaySubValueNode(autoValueCellNode);
        // Die Optionen
        this.displayOptions(autoValueCellNode);
    }

    displayCellError() {
        this.myNode.classList.add('err');
        /*   setTimeout(() => {
               this.myNode.classList.remove('cell-err');
           }, 500); */
    }

    displayRowError() {
        this.myNode.classList.add('row-err');
        /*    this.myNode.classList.add('cell-err');
            setTimeout(() => {
                this.myNode.classList.remove('cell-err');
            }, 500); */

    }

    displayColError() {
        this.myNode.classList.add('col-err');
        /*    this.myNode.classList.add('cell-err');
            setTimeout(() => {
                this.myNode.classList.remove('cell-err');
            }, 500); */
    }

    setSelected() {
        this.myNode.classList.add('selected');
    }

    unsetSelected() {
        this.myNode.classList.remove('selected');
    }


    setBorderSelected() {
        this.myNode.classList.add('hover');
    }
    setBorderRedSelected() {
        this.myNode.classList.add('hover-red');
    }

    setBorderGreenSelected() {
        this.myNode.classList.add('hover-green');
    }

    unsetBorderSelected() {
        this.myNode.classList.remove('hover');
        this.myNode.classList.remove('hover-red');
        this.myNode.classList.remove('hover-green');
    }

    setSelectStatus() {
        let tmpCell = this.getMyModel();
        let adMissibleNrSelected = tmpCell.getAdMissibleNrSelected();
        this.setSelected();
        if (sudoApp.mySolver.myGrid.evalType == 'lazy') {
            // Wenn die selektierte Zelle eine notwendige Nummer hat, dann
            // wird die verursachende collection angezeigt.

            // Anzeige initialisieren
            sudoApp.mySolver.myView.displayTechnique('&lt Selektiere Zelle mit grüner oder roter Nummer &gt');


            if (tmpCell.myNecessarys.size > 0) {
                if (adMissibleNrSelected == Array.from(tmpCell.myNecessarys)[0]) {
                    let collection = tmpCell.myNecessaryCollections.get(Array.from(tmpCell.myNecessarys)[0]);
                    collection.myCells.forEach(e => {
                        if (e !== tmpCell) {
                            e.myView.setBorderGreenSelected()
                        }
                    });
                    sudoApp.mySolver.myView.displayTechnique(Array.from(tmpCell.myNecessarys)[0] +
                        ' notwendig, weil in der Gruppe nur hier Kandidat.');
                    return;
                }
            }

            if (tmpCell.myLevel_gt0_inAdmissibles.size > 0 &&
                tmpCell.myLevel_gt0_inAdmissiblesFromNecessarys.size > 0) {
                if (tmpCell.myLevel_gt0_inAdmissiblesFromNecessarys.has(adMissibleNrSelected)) {
                    // Wenn die selektierte Zelle eine rote Nummer enthält, die durch eine notwendige
                    // Nummer verursacht ist, wird dies angezeigt.
                    let necessaryCell = undefined;
                    // Bestimme die Zelle der notwendigen Nummer
                    tmpCell.myInfluencers.forEach(cell => {
                        if (cell.getNecessarys().has(adMissibleNrSelected)) {
                            necessaryCell = cell;
                        }
                    })
                    // Bestimme die gemeinsame Gruppe der Zelle mit der roten Nummer
                    // und der Zelle mit der notwendigen Nummer
                    let tmpGroup = undefined;
                    if (tmpCell.myBlock == necessaryCell.myBlock) {
                        tmpGroup = tmpCell.myBlock;
                    } else if (tmpCell.myRow == necessaryCell.myRow) {
                        tmpGroup = tmpCell.myRow;
                    } else if (tmpCell.myCol == necessaryCell.myCol) {
                        tmpGroup = tmpCell.myCol;
                    }
                    // Gebe die Gruppe aus
                    tmpGroup.myCells.forEach(cell => {
                        cell.myView.setBorderSelected();
                        if (cell.getNecessarys().has(adMissibleNrSelected)) {
                            cell.myView.setBorderRedSelected();
                        }
                    })
                    sudoApp.mySolver.myView.displayTechnique(adMissibleNrSelected + ' unzulässig wegen notwendiger Nummer: ' + adMissibleNrSelected);
                    return;
                }
            }

            if (tmpCell.myLevel_gt0_inAdmissibles.size > 0 &&
                tmpCell.myLevel_gt0_inAdmissiblesFromPairs.size > 0) {
                if (tmpCell.myLevel_gt0_inAdmissiblesFromPairs.has(adMissibleNrSelected)) {
                    // Wenn für die selektierte Zelle kritische Paare gespeichert sind,
                    // dann gibt es in der Zelle indirekt unzulässige Nummern, die durch sie
                    // verursacht werden.
                    // Die Block, Spalte oder Zeile des Paares wird markiert.
                    tmpCell.myLevel_gt0_inAdmissiblesFromPairs.forEach(pairInfo => {
                        pairInfo.collection.myCells.forEach(cell => {
                            if (cell !== tmpCell) {
                                cell.myView.setBorderSelected();
                            }
                        });
                        pairInfo.pairCell1.myView.setBorderRedSelected();
                        pairInfo.pairCell2.myView.setBorderRedSelected();
                    })
                    sudoApp.mySolver.myView.displayTechnique(adMissibleNrSelected + ' unzulässig wegen "Nacktem Paar" ');
                    return;
                }
            }

            if (tmpCell.myLevel_gt0_inAdmissibles.size > 0 &&
                tmpCell.myLevel_gt0_inAdmissiblesFromHiddenPairs.size > 0) {
                if (tmpCell.myLevel_gt0_inAdmissiblesFromHiddenPairs.has(adMissibleNrSelected)) {
                    // Für ein Subpaar muss nicht jede einzelne Nummer geprüft werden.
                    // 
                    const [pairInfo] = tmpCell.myLevel_gt0_inAdmissiblesFromHiddenPairs.values();
                    pairInfo.collection.myCells.forEach(cell => {
                        if (cell == pairInfo.subPairCell1 || cell == pairInfo.subPairCell2) {
                            cell.myView.setBorderRedSelected();
                        } else {
                            cell.myView.setBorderSelected();
                        }
                    });
                    sudoApp.mySolver.myView.displayTechnique(adMissibleNrSelected + ' unzulässig wegen "Verstecktem Paar"')
                    return;
                }
            }

            if (tmpCell.myLevel_gt0_inAdmissibles.size > 0 &&
                tmpCell.myLevel_gt0_inAdmissiblesFromIntersection.size > 0) {

                let info = tmpCell.myLevel_gt0_inAdmissiblesFromIntersectionInfo.get(adMissibleNrSelected);
                info.block.myCells.forEach(cell => {
                    cell.myView.setBorderSelected();
                });
                info.rowCol.myCells.forEach(cell => {
                    cell.myView.setBorderSelected();
                });

                sudoApp.mySolver.myView.displayTechnique(adMissibleNrSelected + ' unzulässig wegen Überschneidung');
                return;
            }


            if (tmpCell.myLevel_gt0_inAdmissibles.size > 0 &&
                tmpCell.myLevel_gt0_inAdmissiblesFromPointingPairs.size > 0) {

                let info = tmpCell.myLevel_gt0_inAdmissiblesFromPointingPairsInfo.get(adMissibleNrSelected);
                info.rowCol.myCells.forEach(cell => {
                    cell.myView.setBorderSelected();
                });
                info.pVector.myCells.forEach(cell => {
                    if (cell.getValue() == '0' && cell.getTotalAdmissibles().has(adMissibleNrSelected)) {
                        cell.myView.unsetSelected();
                        cell.myView.setBorderRedSelected();
                    }
                })

                sudoApp.mySolver.myView.displayTechnique(adMissibleNrSelected + ' unzulässig wegen Pointing Pair');
                return;
            }
        }
    }

    unsetSelectStatus() {
        this.unsetSelected();
        this.unsetBorderSelected();
        sudoApp.mySolver.myView.displayTechnique('&lt Selektiere Zelle mit grüner oder roter Nummer &gt');
    }
    displayWrongNumber() {
        let cell = this.getMyModel();
        if (cell.isWrong()) {
            this.myNode.classList.add('wrong');
        }
    }
    displayInsolvability() {
        let cell = this.getMyModel();
        let mySolverView = sudoApp.mySolver.getMyView();
        // 1) Nachfolgend wird der Basiswiderspruch des Sudokus definiert. Mit ihm allein würde der Solver
        // erfolgreich durch Backtracking die Puzzles lösen. Allerdings müssten sehr viel mehr Zellen
        // gesetzt werden, bis das ein vorhandener Widerspruch mit diesem Kriterium aufgedeckt würde.
        // Alle weiteren Kriterien dienen lediglich der früheren Aufdeckung von Widersprüchen.
        if (cell.getValue() !== '0' && cell.myDirectInAdmissibles().has(cell.getValue())) {
            cell.myInfluencers.forEach(influencerCell => {
                if (influencerCell.getValue() == cell.getValue()) {
                    influencerCell.myView.displayCellError();
                }
            })
            this.displayCellError();
            mySolverView.displayReasonInsolvability('Die Nummer ' + cell.getValue() + ' ist bereits einmal gesetzt.');
            return true;
        }
        // 2) Die Widersprüchlichkeit steht schon fest, wenn es überhaupt keinen zulässigen Kandidaten 
        // mehr gibt.
        if (cell.getValue() == '0' && cell.getTotalAdmissibles().size == 0) {
            this.displayCellError();
            mySolverView.displayReasonInsolvability('Überhaupt keine zulässige Nummer.');
            return true;
        }
        // 3) Ebenfalls steht die Widersprüchlichkeit schon fest, wenn in einer Zelle gleichzeitig
        // zwei verschiedene notwendige Nummern gesetzt werden sollen.
        if (cell.getValue() == '0' && cell.myNecessarys.size > 1) {
            this.displayCellError();
            mySolverView.displayReasonInsolvability('Gleichzeitig verschiedene notwendige Nummern.');
            return true;
        }
        // Das nachfolgende Widerspruchskriterium haben wir abgeschaltet, weil es schwerer zu visualisieren ist
        // und nur unwesentlich zur einer früheren Erkennung der Widersprüchlichkeit führt.
        /*
        if (cell.getValue() == '0' &&
            cell.myLevel_0_inAdmissibles.union(cell.myLevel_gt0_inAdmissibles).intersection(cell.myNecessarys).size > 0) {
            this.displayCellError();
            mySolverView.displayReasonInsolvability('Eine notwendige Nummer ist gleichzeitig unzulässig');
            return true;
        }
        */
        mySolverView.displayReasonInsolvability('');
        return false;
    }


}

class SudokuCell extends SudokuModel {
    constructor(suTable, index) {
        super();
        // Die Zelle kennt ihre Tabelle und ihren Index
        this.myGrid = suTable;
        this.myIndex = index;
        // Die Zelle kennt ihre DOM-Version
        // Mit der Erzeugung des Wrappers wird
        // auch der Eventhandler der Zelle gesetzt
        // Speichert die Phase, die beim Setzen einer Nummer
        // in der Zelle aktuell war.
        this.myGamePhase = '';
        this.myBlock;
        this.myRow;
        this.myCol;
        // Speichert ein für alle mal bei der Initialisierung
        // die beeinflussenden Zellen dieser Zelle
        this.myInfluencers = [];
        // Die gesetzte Nummer dieser Zelle. 
        // Die Nummer '0' bedeutet ungesetzte Nummer.
        this.myValue = '0';
        this.wrong = false;
        this.myOptions = [];
        this.myAutoStepNumber = -1;

        this.isSelected = false;
        this.adMissibleIndexSelected = -1;
        // 'manual' oder 'auto'
        this.myValueType = 'manual';
        this.myGamePhase = 'play';
        // Speichert die aktuell unzulässigen Zahlen für diese Zelle
        this.myLevel_0_inAdmissibles = new SudokuSet();
        this.myLevel_gt0_inAdmissibles = new SudokuSet();

        this.myLevel_gt0_inAdmissiblesFromPairs = new Map();
        this.myLevel_gt0_inAdmissiblesFromHiddenPairs = new Map();
        this.myLevel_gt0_inAdmissiblesFromIntersection = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromIntersectionInfo = new Map();

        this.myLevel_gt0_inAdmissiblesFromPointingPairs = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromPointingPairsInfo = new Map();

        this.myLevel_gt0_inAdmissiblesFromNecessarys = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromSingles = new SudokuSet();

        // Außer bei widerspruchsvollen Sudokus einelementig
        this.myNecessarys = new SudokuSet();
        this.myNecessaryCollections = new Map();

        // Außer bei widerspruchsvollen Sudokus einelementig
        // this.myIndirectNecessarys = new SudokuSet();
        // this.myIndirectNecessaryCollections = new Map();
    }

    // ===================================================================
    // Getter
    // ===================================================================
    isWrong() {
        return this.wrong;
    }
    setWrong() {
        this.wrong = true;
    }

    getMyIndex() {
        return this.myIndex;
    }
    getIsSelected() {
        return this.isSelected;
    }
    getAdMissibleNrSelected() {
        let adMissibleArray = Array.from(this.getAdmissibles());
        return adMissibleArray[this.adMissibleIndexSelected];
    }

    setAdMissibleIndexSelected(nr) {
        this.adMissibleIndexSelected = nr;
    }


    getTotalInAdmissibles() {
        let totalInAdmissibles = this.myLevel_0_inAdmissibles.union(this.myLevel_gt0_inAdmissibles);
        // In widerspruchsvollen Sudokus können notwendige Nummern gleichzeitig unzulässig sein.
        // Aus pragmatischen Gründen zählen wir solche Nummern nicht zu den inAdmissibles.
        // Dann werden sie auch angezeigt, wenn die Anzeige von inAdmissibles abgeschaltet ist.
        // Semantisch ist das kein Problem, da bekanntlich in widerspruchsvollen Mengen beliebiges 
        // gefolgert werden kann.
        return totalInAdmissibles.difference(this.getNecessarys());
    }

    getAdmissibles() {
        // Die zulässigen Zahlen einer Zelle sind das Komplement der unzulässigen Zahlen
        return new SudokuSet(['1', '2', '3', '4', '5', '6', '7', '8', '9']).difference(
            this.myLevel_0_inAdmissibles);
    }
    getTotalAdmissibles() {
        if (this.getValue() == '0') {
            // Die zulässigen Zahlen einer Zelle sind das Komplement der unzulässigen Zahlen
            return new SudokuSet(['1', '2', '3', '4', '5', '6', '7', '8', '9']).difference(
                this.getTotalInAdmissibles());
        } else {
            return new SudokuSet();
        }
    }

    getNecessarys() {
        return new SudokuSet(this.myNecessarys);
    }
    /* getIndirectNecessarys() {
        return new SudokuSet(this.myIndirectNecessarys);
    }
    */
    getTotalSingles() {
        let singles = this.getTotalAdmissibles();
        if (singles.size == 1) {
            return singles;
        } else {
            return new SudokuSet();
        }
    }
    getSingles() {
        let singles = this.getAdmissibles();
        if (singles.size == 1) {
            return singles;
        } else {
            return new SudokuSet();
        }
    }

    getPhase() {
        return this.myGamePhase;
    }

    getValue() {
        return this.myValue;
    }

    getIndex() {
        return this.myIndex;
    }

    // ===================================================================
    // Setter
    // ===================================================================
    setInfluencers(influencers) {
        this.myInfluencers = influencers;
    }
    setBlock(block) {
        this.myBlock = block;
    }
    setRow(row) {
        this.myRow = row;
    }
    setCol(col) {
        this.myCol = col;
    }

    setSelected() {
        this.isSelected = true;
        this.adMissibleIndexSelected = -1;
    }

    unsetSelected() {
        this.isSelected = false;
    }

    manualSetValue(nr, gamePhase) {
        this.myValue = nr;
        this.myValueType = 'manual';
        this.myGamePhase = gamePhase;
        this.myAutoStepNumber = this.myGrid.numberOfSolvedCells() - this.myGrid.numberOfGivens();
    }

    autoSetValue(currentStep) {
        let nr = currentStep.getValue();
        this.myValue = nr;
        this.myValueType = 'auto';
        this.myGamePhase = 'play';
        this.myAutoStepNumber = this.myGrid.numberOfSolvedCells() - this.myGrid.numberOfGivens();
        this.myOptions = currentStep.options();
    }

    setPhase(phase) {
        this.myGamePhase = phase;
    }
    nextAdMissibleIndex() {
        let maxIndex = this.getAdmissibles().size;
        let adMissibleArray = Array.from(this.getAdmissibles());

        let nextIndex = this.adMissibleIndexSelected + 1;
        let nextAdmissible = '-1';
        let found = false;

        while (nextIndex < maxIndex && !found) {
            nextAdmissible = adMissibleArray[nextIndex];
            if (this.isDisplayRelevant(nextAdmissible)) {
                found = true;
            } else {
                nextIndex++;
            }
        }

        if (found) {
            this.adMissibleIndexSelected = nextIndex;
            return nextIndex;
        } else {
            return -1;
        }
    }

    isDisplayRelevant(admissibleNr) {
        let relevant =
            admissibleNr == Array.from(this.myNecessarys)[0] ||
            this.myLevel_gt0_inAdmissibles.has(admissibleNr);
        return relevant;
    }

    // ===================================================================
    // Methods
    // ===================================================================
    clear() {
        // Lösche Inhalt der Zelle
        this.myValue = '0';
        this.myValueType = 'manual';
        this.myGamePhase = '';
        this.wrong = false;
        this.clearEvaluations();
    }

    clearEvaluations() {
        // 
        this.candidatesEvaluated = false;
        // Speichert die aktuell unzulässigen Zahlen für diese Zelle
        this.myLevel_0_inAdmissibles = new SudokuSet();
        this.myLevel_gt0_inAdmissibles = new SudokuSet();

        this.myLevel_gt0_inAdmissiblesFromPairs = new Map();
        this.myLevel_gt0_inAdmissiblesFromHiddenPairs = new Map();
        this.myLevel_gt0_inAdmissiblesFromIntersection = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromIntersectionInfo = new Map();
        this.myLevel_gt0_inAdmissiblesFromPointingPairs = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromPointingPairsInfo = new Map();

        this.myLevel_gt0_inAdmissiblesFromNecessarys = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromSingles = new SudokuSet();

        // Außer bei widerspruchsvollen Sudokus einelementig
        this.myNecessarys = new SudokuSet();
        this.myNecessaryCollections = new Map();

        // Außer bei widerspruchsvollen Sudokus einelementig
        // this.myIndirectNecessarys = new SudokuSet();
        // this.myIndirectNecessaryCollections = new Map();
    }

    calculate_level_0_inAdmissibles() {
        // Level 0 unzulässige Nummern sind direkt unzulässige Nummern.
        // Sie werden in der Zelle nicht mehr angezeigt
        this.myLevel_0_inAdmissibles = this.myDirectInAdmissibles();
        return this.myLevel_0_inAdmissibles;
    }

    myDirectInAdmissibles() {
        // Direkt unzulässige Nummern dieser Zelle sind Nummern,
        // die an anderer Stelle in der Block, Zeile oder Spalte dieser Zelle
        // gesetzt sind.
        let tmpInAdmissibles = new SudokuSet();
        this.myInfluencers.forEach(influenceCell => {
            if (influenceCell.getValue() !== '0') {
                // Die Einflusszelle ist gesetzt
                tmpInAdmissibles.add(influenceCell.getValue());
            }
        })
        return tmpInAdmissibles;
    }


    clearAutoExecInfo() {
        this.myValueType = 'manual';
        this.myAutoStepNumber = 0;
        this.myOptions = [];
    }



    countMyAdmissibles() {
        return this.getAdmissibles().size;
    }

    countMyOpenInfluencers() {
        let tmpCount = 0;
        this.myInfluencers.forEach(influencer => {
            if (influencer.getValue() == '0') {
                tmpCount++;
            }
        });
        return tmpCount;
    }

    countMyInfluencersWeight() {
        // Idee: Kontexte mit einem größeren Endscheidungsgrad zählen mehr,
        // weil durch sie die Entscheidungen schneller vorangetrieben werden.
        let tmpWeight = 0;
        let summand = 0;
        let tmpAdmissibles = this.getTotalAdmissibles();
        if (tmpAdmissibles.size == 2) {
            tmpWeight = 300;
        }
        // Den Kontext der Zelle betrachten
        this.myInfluencers.forEach(influencer => {
            if (influencer.getValue() == '0') {
                // Paare, die vollständig in Influenz-Zellen enthalten sind
                // werden bevorzugt
                let influenceAdmissible = influencer.getTotalAdmissibles();
                summand = 0;
                if (tmpAdmissibles.size == 2) {
                    if (influenceAdmissible.equals(tmpAdmissibles)) {
                        // Mehrfachauftreten von Paaren bekommt die höchste Bewertung
                        summand = 300;
                    } else {
                        let interSecSize = influenceAdmissible.intersection(tmpAdmissibles).size;
                        if (interSecSize > 0) {
                            // Das aktuelle Paar mit Schnitt in den Influenz-Zellen
                            summand = 27 + interSecSize;
                        }
                    }
                } else {
                    let interSecSize = influenceAdmissible.intersection(tmpAdmissibles).size;
                    // Die aktuelle Zelle mit Schnitt in den Influenz-Zellen
                    if (interSecSize > 0) {
                        summand = Math.floor(9 / interSecSize) + interSecSize;
                    } else {
                        summand = 1;
                    }
                }
                tmpWeight = tmpWeight + summand;
            }
        });
        return tmpWeight;
    }

    countMyInfluencersAdmissibles() {
        let tmpCount = 0;
        this.myInfluencers.forEach(influencer => {
            if (influencer.getValue() == '0') {
                tmpCount = tmpCount + influencer.countMyAdmissibles();
            }
        });
        return tmpCount;
    }


    addNecessary(nr, nineCellCollection) {
        this.myNecessarys.add(nr);
        this.myNecessaryCollections.set(nr, nineCellCollection);
    }

    isInsolvable() {
        return (
            // 1) Die Nummer ist bereits einmal gesetzt.
            (this.getValue() !== '0' && this.myDirectInAdmissibles().has(this.getValue())) ||
            // 2) Überhaupt keine zulässige Kandidaten mehr
            (this.getValue() == '0' && this.getTotalAdmissibles().size == 0) ||
            // 3) Gleichzeitig verschiedene notwendige Nummern
            (this.getValue() == '0' && this.myNecessarys.size > 1));
        // Das nachfolgende Kriterium ist nicht effektiv. Es kostet nur Laufzeit.
        // 4) Eine notwendige Nummer ist gleichzeitig unzulässig       
        /*    (this.getValue() == '0' &&
                this.myLevel_0_inAdmissibles.union(this.myLevel_gt0_inAdmissibles).intersection(this.myNecessarys).size > 0));
                */
    }
    init() {
        this.myPuzzleSaveDialog.close();
    }
}

class SudokuPuzzleDBController {
    constructor(puzzleDb) {
        // Der Save-Dialog
        this.myPuzzleDB = puzzleDb;

        //Click-Event für die Spaltenköpfe
        document.getElementById('col-name').addEventListener('click', () => {
            this.myPuzzleDB.sort('name');
        });
        document.getElementById('col-defCount').addEventListener('click', () => {
            this.myPuzzleDB.sort('defCount');
        });
        document.getElementById('col-status').addEventListener('click', () => {
            this.myPuzzleDB.sort('status');
        });
        document.getElementById('col-steps-lazy').addEventListener('click', () => {
            this.myPuzzleDB.sort('steps-lazy');
        });
        document.getElementById('col-steps-strict').addEventListener('click', () => {
            this.myPuzzleDB.sort('steps-strict');
        });
        document.getElementById('col-level').addEventListener('click', () => {
            this.myPuzzleDB.sort('level');
        });
        document.getElementById('col-backTracks').addEventListener('click', () => {
            this.myPuzzleDB.sort('backTracks');
        });
        document.getElementById('col-date').addEventListener('click', () => {
            this.myPuzzleDB.sort('date');
        });


        document.getElementById('pz-btn-load').addEventListener('click', () => {
            this.loadBtnPressed();
        });

        document.getElementById('btn-restore-mobile').addEventListener('click', () => {
            this.mobileRestoreBtnPressed();

        });
    }

    // ===============================================================
    // DB-Event handler
    // ===============================================================

    loadBtnPressed() {
        if (this.myPuzzleDB.getSize() > 0) {
            let puzzle = this.myPuzzleDB.getSelectedPuzzle();
            let uid = this.myPuzzleDB.getSelectedUid();
            sudoApp.mySolver.loadPuzzle(uid, puzzle);
            sudoApp.mySolver.notify();
            sudoApp.myTabView.openGrid();
        }
    }

    mobileRestoreBtnPressed() {
        if (this.myPuzzleDB.getSize() > 0) {
            let uid = 'l2rcvi2mobile8h05azkg';
            if (!sudoApp.myPuzzleDB.has(uid)) {
                uid = this.myPuzzleDB.getSelectedUid();
            }
            let puzzle = this.myPuzzleDB.getPuzzle(uid);
            sudoApp.mySolver.init();
            sudoApp.mySolver.myGrid.loadPuzzle(uid, puzzle);
            sudoApp.mySolver.setGamePhase('play');
            sudoApp.mySolver.notify();
        }
    }

    printBtnPressed() {
        if (this.myPuzzleDB.getSize() > 0) {
            let str_puzzleMap = localStorage.getItem("localSudokuDB");
            let puzzleMap = new Map(JSON.parse(str_puzzleMap));
            let key = Array.from(puzzleMap.keys())[sudoApp.myPuzzleDB.selectedIndex];
            let selectedPZ = puzzleMap.get(key);
            this.myPuzzleDB.displayTablePrint('print-puzzle', selectedPZ.puzzle);
            window.print();
        }
    }

    nextBtnPressed() {
        if (this.myPuzzleDB.getSize() > 0) {
            this.myPuzzleDB.nextPZ();
        }
    }
    previousBtnPressed() {
        if (this.myPuzzleDB.getSize() > 0) {
            // Select previous Puzzle
            this.myPuzzleDB.previousPZ();
        }
    }

    deleteBtnPressed() {
        if (this.myPuzzleDB.getSize() > 0) {
            this.myPuzzleDB.deleteSelected();

        }
    }

}
class SudokuPuzzleDB {
    constructor() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        if (puzzleMap.size > 0) {
            this.selectedIndex = puzzleMap.size - 1;
        } else {
            this.selectedIndex = -1;
        }

        // 
        this.sorted = new Map([
            ['name', 'desc'],
            ['defCount', 'desc'],
            ['status', 'desc'],
            ['steps-lazy', 'desc'],
            ['steps-strict', 'desc'],
            ['level', 'desc'],
            ['backTracks', 'desc'],
            ['date', 'desc']
        ]);
    }

    getSize() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        return puzzleMap.size;
    }

    init() {
        // Bisher nichts
    }
    sort(col) {
        // Hole den Speicher als ein Objekt
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let selectedKey = this.selectedKey();
        switch (col) {
            case 'name': {
                let nameSorted = this.sorted.get('name');
                if (nameSorted == '' || nameSorted == 'desc') {
                    this.sorted.set('name', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (a[1].name > b[1].name ? 1 : -1)));
                } else {
                    this.sorted.set('name', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (a[1].name > b[1].name ? -1 : 1)));
                }
                break;
            }
            case 'defCount': {
                let defCountSorted = this.sorted.get('defCount');
                if (defCountSorted == '' || defCountSorted == 'desc') {
                    this.sorted.set('defCount', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].defCount - b[1].defCount));
                } else {
                    this.sorted.set('defCount', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].defCount - a[1].defCount));
                }
                break;
            }
            case 'status': {
                let statusSorted = this.sorted.get('status');
                if (statusSorted == '' || statusSorted == 'desc') {
                    this.sorted.set('status', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (a[1].status > b[1].status ? 1 : -1)));
                } else {
                    this.sorted.set('status', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (a[1].status > b[1].status ? -1 : 1)));
                }
                break;
            }
            case 'steps-lazy': {
                let stepsSorted = this.sorted.get('steps-lazy');
                if (stepsSorted == '' || stepsSorted == 'desc') {
                    this.sorted.set('steps-lazy', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].stepsLazy - b[1].stepsLazy));
                } else {
                    this.sorted.set('steps-lazy', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].stepsLazy - a[1].stepsLazy));
                }
                break;
            }
            case 'steps-strict': {
                let stepsSorted = this.sorted.get('steps-strict');
                if (stepsSorted == '' || stepsSorted == 'desc') {
                    this.sorted.set('steps-strict', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].stepsStrict - b[1].stepsStrict));
                } else {
                    this.sorted.set('steps-strict', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].stepsStrict - a[1].stepsStrict));
                }
                break;
            }
            case 'level': {
                let levelSorted = this.sorted.get('level');
                if (levelSorted == '' || levelSorted == 'desc') {
                    this.sorted.set('level', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (a[1].level > b[1].level ? 1 : -1)));
                } else {
                    this.sorted.set('level', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (a[1].level > b[1].level ? -1 : 1)));
                }
                break;
            }
            case 'backTracks': {
                let backTracksSorted = this.sorted.get('backTracks');
                if (backTracksSorted == '' || backTracksSorted == 'desc') {
                    this.sorted.set('backTracks', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => a[1].backTracks - b[1].backTracks));
                } else {
                    this.sorted.set('backTracks', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => b[1].backTracks - a[1].backTracks));
                }
                break;
            }
            case 'date': {
                let dateSorted = this.sorted.get('date');
                if (dateSorted == '' || dateSorted == 'desc') {
                    this.sorted.set('date', 'asc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (new Date(a[1].date) > new Date(b[1].date) ? 1 : -1)));
                } else {
                    this.sorted.set('date', 'desc');
                    puzzleMap = new Map([...puzzleMap].sort((a, b) => (new Date(a[1].date) > new Date(b[1].date) ? -1 : 1)));
                }
                break;
            }
            default: {
                // Kann nicht vorkommen
            }
        }
        // Kreiere die JSON-Version des Speicherobjektes
        // und speichere sie.
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);
        this.selectedIndex = this.getIndex(selectedKey);
        this.display();
    }

    saveMobilePuzzle(playedPuzzleDbElement) {
        let puzzleId = 'l2rcvi2mobile8h05azkg';
        playedPuzzleDbElement.name = 'mobile';
        this.savePuzzle(puzzleId, playedPuzzleDbElement);
    }

    saveNamedPuzzle(id, name, playedPuzzleDbElement) {
        if (name !== '') {
            playedPuzzleDbElement.name = name;
        }
        this.savePuzzle(id, playedPuzzleDbElement);
    }
    mergePlayedPuzzle(puzzleId, playedPuzzleDbElement) {
        let storedPuzzleDbElement = this.getPuzzle(puzzleId);

        storedPuzzleDbElement.defCount = playedPuzzleDbElement.defCount;
        storedPuzzleDbElement.status = playedPuzzleDbElement.status;
        if (playedPuzzleDbElement.stepsLazy !== 0) {
            storedPuzzleDbElement.stepsLazy = playedPuzzleDbElement.stepsLazy;
        }
        if (playedPuzzleDbElement.stepsStrict !== 0) {
            storedPuzzleDbElement.stepsStrict = playedPuzzleDbElement.stepsStrict;
        }
        storedPuzzleDbElement.level = playedPuzzleDbElement.level;
        storedPuzzleDbElement.backTracks = playedPuzzleDbElement.backTracks;
        storedPuzzleDbElement.date = playedPuzzleDbElement.date;
        storedPuzzleDbElement.puzzle = playedPuzzleDbElement.puzzle;
        storedPuzzleDbElement.solution = playedPuzzleDbElement.solution;
        this.savePuzzle(puzzleId, storedPuzzleDbElement);
    }

    savePuzzle(puzzleId, puzzleDbElement) {
        // Hole den Speicher als ein Objekt
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        // Füge das Puzzle in das Speicherobjekt ein
        puzzleMap.set(puzzleId, puzzleDbElement);
        // Kreiere die JSON-Version des Speicherobjektes
        // und speichere sie.
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);
        this.selectedIndex = this.getIndex(puzzleId);
    }

    getPuzzle(uid) {
        // Vielleicht ändern in getSelectedPuzzle();
        // Hole den Speicher als ein Objekt
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        // Füge das Puzzle in das Speicherobjekt ein
        return puzzleMap.get(uid);
    }
    getIndex(uid) {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let i = 0;
        for (const [key, value] of puzzleMap) {
            if (key == uid) {
                return i;
            } else {
                i++;
            }
        }
        // Uid existiert nicht
        return -1;
    }

    deleteSelected() {
        // Get the database as an object
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let key = Array.from(puzzleMap.keys())[this.selectedIndex];
        if (this.selectedIndex > 0) {
            this.selectedIndex--;
        }
        puzzleMap.delete(key);
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);
        //Clear loaded puzzle info, if loaded puzzle is deleted
        sudoApp.mySolver.clearLoadedPuzzleInfo(key);
        this.display();
    }

    selectedPZ() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let key = Array.from(puzzleMap.keys())[this.selectedIndex];
        let puzzleDbElement = puzzleMap.get(key);
        return puzzleDbElement;
    }

    selectedKey() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let key = Array.from(puzzleMap.keys())[this.selectedIndex];
        return key;
    }

    nextPZ() {
        let displayRows = document.getElementById('puzzle-db-tbody').rows;
        for (let i = 0; i < displayRows.length - 1; i++) {
            if (displayRows[i].classList.contains('selected')) {
                displayRows[i].classList.remove('selected');
                displayRows[i + 1].classList.add('selected');
                displayRows[i + 1].scrollIntoView();
                this.selectedIndex = this.getIndex(displayRows[i + 1].cells[0].innerText);
                this.displayCurrentPZ();
                return;
            }
        }
    }

    previousPZ() {
        let displayRows = document.getElementById('puzzle-db-tbody').rows;
        for (let i = 1; i < displayRows.length; i++) {
            if (displayRows[i].classList.contains('selected')) {
                displayRows[i].classList.remove('selected');
                displayRows[i - 1].classList.add('selected');
                displayRows[i - 1].scrollIntoView();
                this.selectedIndex = this.getIndex(displayRows[i - 1].cells[0].innerText);
                this.displayCurrentPZ();
                return;
            }
        }
    }

    display() {
        this.displayPuzzleDB();
        this.displayCurrentPZ()
    }

    setSelected(trNode) {
        let displayRows = document.getElementById('puzzle-db-tbody').rows;
        for (let i = 0; i < displayRows.length; i++) {
            if (displayRows[i].classList.contains('selected')) {
                displayRows[i].classList.remove('selected');
            }
        }
        trNode.classList.add('selected');
        this.selectedIndex = this.getIndex(trNode.cells[0].innerText);
        this.displayCurrentPZ();
    }

    displayPuzzleDB() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let tbNode = document.getElementById('puzzle-db-tbody');
        while (tbNode.childElementCount > 0) {
            tbNode.removeChild(tbNode.lastChild);
        }
        if (puzzleMap.size > 0) {

            let i = 0;
            let selectedTr = null;
            for (let [key, pz] of puzzleMap) {
                let tr = document.createElement('tr');
                tr.setAttribute("onClick", "sudoApp.myPuzzleDB.setSelected(this)");
                tr.setAttribute("style", "cursor:pointer");
                tr.classList.add('item')
                if (i == this.selectedIndex) {
                    tr.classList.add('selected');
                    selectedTr = tr;
                }
                i++;

                let td_key = document.createElement('td');
                td_key.innerText = key;
                tr.appendChild(td_key);

                let td_name = document.createElement('td');
                td_name.innerText = pz.name;
                tr.appendChild(td_name);

                let td_defCount = document.createElement('td');
                td_defCount.innerText = pz.defCount;
                tr.appendChild(td_defCount);

                let td_status = document.createElement('td');
                td_status.innerText = pz.status;
                tr.appendChild(td_status);

                let td_steps_lazy = document.createElement('td');
                td_steps_lazy.innerText = pz.stepsLazy;
                tr.appendChild(td_steps_lazy);

                let td_steps_strict = document.createElement('td');
                td_steps_strict.innerText = pz.stepsStrict;
                tr.appendChild(td_steps_strict);

                let td_level = document.createElement('td');
                td_level.innerText = pz.level;
                tr.appendChild(td_level);

                let td_backTracks = document.createElement('td');
                td_backTracks.innerText = pz.backTracks;
                tr.appendChild(td_backTracks);

                let td_date = document.createElement('td');
                td_date.innerText = (new Date(pz.date)).toLocaleDateString();
                tr.appendChild(td_date);

                tbNode.appendChild(tr);
            }
            selectedTr.scrollIntoView();
        }
    }


    displayClear() {
        this.displayClearPZNr();
        this.displayClearTable('screen-puzzle');
        // this.displayClearTable('solution');
    }


    displayCurrentPZ() {
        this.displayClear()
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        if (puzzleMap.size > 0) {
            let key = Array.from(puzzleMap.keys())[this.selectedIndex];
            let selectedPZ = puzzleMap.get(key);
            this.displayIdRow(key, selectedPZ.name, selectedPZ.level);
            this.displayTable('screen-puzzle', selectedPZ.puzzle);
            this.displayDefineCounter(selectedPZ);
        }
    }
    displayIdRow(uid, name, level) {
        let puzzleIdentityRow = document.getElementById('pz-id-row')
        puzzleIdentityRow.innerHTML =
            '<b>Puzzle-Id:</b> &nbsp' + uid + '; &nbsp'
            + '<b>Name:</b> &nbsp' + name + '; &nbsp'
            + '<b>Schwierigkeitsgrad:</b> &nbsp' + level + ';';
    }
    displayClearPZNr() {
        let nrElem = document.getElementById('pz-id-row')
        nrElem.innerHTML = "";
    }

    displayDefineCounter(selectedPZ) {
        let defineCounter = 0;
        selectedPZ.puzzle.forEach(nr => {
            if (nr !== '0') {
                defineCounter++;
            }
        })
    }

    displayTable(nodeId, tableArray) {
        let table = document.getElementById(nodeId);
        let k = 0;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                let cellField = document.createElement('div')
                cellField.classList.add('cell-field');
                if (tableArray[k].cellValue == '0') {
                    let currentText = document.createTextNode('');
                    cellField.appendChild(currentText);
                } else {
                    let currentText = document.createTextNode(tableArray[k].cellValue);
                    cellField.appendChild(currentText);
                    if (tableArray[k].cellPhase == 'define') {
                        cellField.style.color = 'blue';
                        cellField.style.fontWeight = 'bold';
                    }
                }

                cellField.style.border = "1px solid darkgrey";
                if (row === 2 || row === 5) {
                    cellField.style.borderBottom = "2px solid black";
                }
                if (col === 2 || col === 5) {
                    cellField.style.borderRight = "2px solid black";
                }
                table.appendChild(cellField);
                k++;
            }
        }
    }

    displayTablePrint(nodeId, tableArray) {
        this.displayClearTable('print-puzzle');
        let table = document.getElementById(nodeId);
        let k = 0;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                let cellField = document.createElement('div')
                cellField.classList.add('cell-field');
                if (tableArray[k].cellValue == '0') {
                    let currentText = document.createTextNode('');
                    cellField.appendChild(currentText);
                } else {
                    let currentText = document.createTextNode(tableArray[k].cellValue);
                    cellField.appendChild(currentText);
                    if (tableArray[k].cellPhase == 'define') {
                        cellField.style.color = 'blue';
                        cellField.style.fontWeight = 'bold';
                    }
                }
                cellField.style.border = "1px solid darkgrey";
                if (row === 2 || row === 5) {
                    cellField.style.borderBottom = "2px solid black";
                }
                if (col === 2 || col === 5) {
                    cellField.style.borderRight = "2px solid black";
                }
                table.appendChild(cellField);
                k++;
            }
        }
    }

    displayClearTable(nodeId) {
        let node = document.getElementById(nodeId);
        while (node.firstChild) {
            node.removeChild(node.lastChild);
        }
    }

    getSelectedPuzzle() {

        let selectedPZ = this.selectedPZ();
        return selectedPZ;
    }

    getSelectedUid() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let key = Array.from(puzzleMap.keys())[this.selectedIndex];
        return key;
    }

    has(uid) {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        return puzzleMap.has(uid);
    }
}

class SudokuPuzzle {
    constructor(
        name,
        defCount,
        status,
        stepsLazy,
        stepsStrict,
        level,
        backTracks,
        date,
        puzzle,
        solution) {
        this.name = name;
        this.defCount = defCount;
        this.status = status;
        this.stepsLazy = stepsLazy;
        this.stepsStrict = stepsStrict;
        this.level = level;
        this.backTracks = backTracks;
        this.date = date;
        this.puzzle = puzzle;
        this.solution = solution;
    }
}

