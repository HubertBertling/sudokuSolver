
let inMainApp = true;
let sudoApp;
const start = () => {
    sudoApp = new SudokuApp();
    sudoApp.init();
}


class SudokuTabView {
    // Die Software der Reiteransicht
    constructor() {
        this.myPages = [];
        // 1. Der Reiter "Sudoku-Solver"
        this.myPages.push(new SudokuGridPage("sudoku-grid-tab", "sudoku-solver"));
        // 2. Der Reiter "Puzzle-Datenbank"
        this.myPages.push(new SudokuDatabasePage("puzzle-db-tab", "puzzle-db"));
        // 3. Der Reiter "Hilfe"
        this.myPages.push(new SudokuHelpPage("puzzle-help-tab", "help"));
    }
    open(pageToOpen) {
        // Alle Seiten schließen.
        this.myPages.forEach(page => {
            page.close();
        })
        pageToOpen.open();
    }
    openGrid() {
        // Alle Seiten schließen.
        this.myPages.forEach(page => {
            page.close();
        })
        // Die Grid-Seite öffnen (Die Grid-Seite ist die erste Seite)
        this.myPages[0].open();
    }
    init() {
        this.openGrid();
    }
}
class SudokuPage {
    // Abstrakte Klasse für den Reiter
    constructor(linkNodeId, contentNodeId) {
        this.myLinkNode = document.getElementById(linkNodeId);
        this.myContentNode = document.getElementById(contentNodeId);
        this.myLinkNode.addEventListener('click', () => {
            sudoApp.tabView.open(this);
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
class SudokuGridPage extends SudokuPage {
    // Reiter der Matrix
    constructor(tabId, contentId) {
        super(tabId, contentId);
    }
    open() {
        super.open();
        // Der angezeigte Inhalt der Seite 
        // braucht bei der Selektion des Reiters
        // nicht aktualisiert zu werden. Es wird der Inhalt angezeigt,
        // der bei Verlassen der Seite vorlag.
    }
} class SudokuDatabasePage extends SudokuPage {
    // Reiter der Datenbank
    constructor(tabId, contentId) {
        super(tabId, contentId);
    }
    open() {
        super.open();
        sudoApp.sudokuPuzzleDB.display();
    }
}
class SudokuHelpPage extends SudokuPage {
    // Reiter der Hilfeseite
    constructor(tabId, contentId) {
        super(tabId, contentId);
    }
    open() {
        super.open();
    }
}
class SudokuApp {
    // Die Darstellung der ganzen App
    constructor() {
        // ==============================================================
        // Komponenten der App
        // ==============================================================
        // Die Matrix des Sudoku-Solver
        this.suGrid = new SudokuGrid();
        // Die Puzzle-Datenbank
        this.sudokuPuzzleDB = new SudokuPuzzleDB();

        //Die App kennt zwei Betriebs-Phasen 'play' or 'define'
        this.currentPhase = 'play';
        // Die App kennt zwei Ausführungsmodi: 
        // manuelle oder automatische Ausführung
        this.autoExecOn = false;

        // Für eine automatische Lösungssuche legt die App
        // einen Stepper an. Für jede Ausführung einen neuen.
        this.stepper;

        // ==============================================================
        // Die Ansichtselemente der App
        // ==============================================================
        // Die Reiteransicht
        this.tabView = new SudokuTabView();
        // Der Save-Dialog
        this.puzzleSaveDialog = new PuzzleSaveDialog();
        // Der Erfolgsdialog
        this.successDialog = new SuccessDialog();

        // ==============================================================
        // Event-Handler der App setzen
        // ==============================================================

        // Click-Event für die Nummern-Buttons setzen
        this.number_inputs = document.querySelectorAll('.number');
        this.number_inputs.forEach((e, index) => {
            e.addEventListener('click', () => {
                // Hinweis: index + 1 = number on button
                let btnNumber = (index + 1).toString();
                this.handleNumberPressed(btnNumber);
            })
        });

        //Click-Event für den Delete-Button setzen
        document.querySelector('#btn-delete-cell').addEventListener('click', () => {
            this.handleDeletePressed();
        });

        document.querySelector('#btn-rm-exec-infos').addEventListener('click', () => {
            this.autoExecOn = false;
            this.suGrid.removeAutoExecCellInfos();
            this.displayOnOffStatus();

        });

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

        // Die beiden Phase-Button 
        document.querySelector('#btn-define').addEventListener('click', () => {
            sudoApp.setGamePhase('define');
            this.stepper.stopTimer();
            this.stepper.init();
            this.setAutoExecOff();
            this.suGrid.deselect();
        });
        document.querySelector('#btn-play').addEventListener('click', () => {
            sudoApp.setGamePhase('play');
            this.stepper.stopTimer();
            this.stepper.init();
            this.setAutoExecOff();
            this.suGrid.deselect();
        });

        // Automatische Ausführung: schrittweise
        document.querySelector('#btn-autoStep').addEventListener('click', () => {
            if (this.autoExecOn) {
                this.stepper.triggerAutoStep('user');
            } else {
                if (this.stepper.deadlockReached()) {
                    alert("Keine (weitere) Lösung gefunden!");
                } else {
                    this.setGamePhase('play');
                    this.setAutoExecOn();
                    this.suGrid.deselect();
                    this.stepper.triggerAutoStep('user');
                }
            }
        });

        // Automatische Ausführung: starten bzw. fortsetzen
        document.querySelector('#btn-run').addEventListener('click', () => {
            this.autoExecRunTimerControlled();
        });


        // Automatische Ausführung pausieren
        document.querySelector('#btn-pause').addEventListener('click', () => {
            sudoApp.stepper.stopTimer();
        });

        // Automatische Ausführung beenden
        document.querySelector('#btn-stop').addEventListener('click', () => {
            this.stepper.stopTimer();
            this.stepper.init();
            this.setAutoExecOff();
            this.suGrid.deselect();
        });

        // Der Initialisieren-Button: Initialisiert die Tabelle
        document.querySelector('#btn-init').addEventListener('click', () => {
            this.stepper.stopTimer()
            this.stepper.init();
            this.successDialog.close();
            this.setAutoExecOff();
            this.suGrid.deselect();
            this.suGrid.init();
            this.stepper.displayProgress();
            this.setGamePhase('define');
        });
        // Der Zurücksetzen-Button: Setzt die Tabelle zurück auf die Definition.
        // Alle Zellen bis auf die, die zur Definition gehören, werden gelöscht
        document.querySelector('#btn-reset').addEventListener('click', () => {
            this.stepper.stopTimer();
            //  this.stepper.init();
            this.successDialog.close();
            this.setAutoExecOff();
            this.suGrid.deselect();
            this.suGrid.reset();
            this.stepper.displayProgress();
        });
        // Der Generieren-Button: generiert ein neues Puzzle
        document.querySelector('#btn-generate').addEventListener('click', () => {
            this.generatePuzzleHandler();
        });
        // Der Speichern-Button: Das aktuelle Puzzle wird unter einem Namen 
        // in der Puzzle-DB gespeichert.
        document.querySelector('#btn-save').addEventListener('click', () => {
            this.stepper.stopTimer();
            this.successDialog.close();
            let newPuzzelId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            this.puzzleSaveDialog.open(newPuzzelId, '');
        });

        document.querySelector('#btn-statistic').addEventListener('click', () => {
            this.stepper.stopTimer();
            this.successDialog.close();
            let playedPuzzleDbElement = this.suGrid.getPlayedPuzzleDbElement();

            let puzzleId = this.suGrid.loadedPuzzleId;
            if (puzzleId == '') {
                let newPuzzelId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                this.puzzleSaveDialog.open(newPuzzelId, '');
            } else {
                this.sudokuPuzzleDB.mergePlayedPuzzle(puzzleId, playedPuzzleDbElement);
                document.getElementById("puzzle-db-tab").click();
            }
        });

        document.querySelector('#btn-save-mobile').addEventListener('click', () => {
            this.stepper.stopTimer();
            this.successDialog.close();
            this.savePuzzleMobile();
        });
        document.querySelector('#btn-restore-mobile').addEventListener('click', () => {
            this.loadCurrentMobilePuzzle();
        });
        // Radio-Button Auswertungstyp: Lazy, Strikt+ oder Strikt-
        let radioEvalNodes = document.querySelectorAll('.eval-type');
        radioEvalNodes.forEach(radioNode => {
            radioNode.addEventListener('click', () => {
                this.suGrid.deselect();
                this.suGrid.setEvalType(radioNode.value);
            })
        });
    }

    generatePuzzleHandler() {
        document.getElementById("loader").style.display = "block";
        let webworkerGenerate = new Worker("sudokuGen.js");
        webworkerGenerate.onmessage = function (e) {
            let puzzle = JSON.parse(e.data);
            sudoApp.stepper.stopTimer();
            sudoApp.stepper.init();
            sudoApp.setAutoExecOff();    
            sudoApp.suGrid.loadPuzzle('-', puzzle);
            sudoApp.stepper.displayProgress();
            sudoApp.setGamePhase('play');
            sudoApp.tabView.openGrid();    
            document.getElementById("loader").style.display = "none";
        }
        webworkerGenerate.postMessage('Run');
    }

    autoExecRun() {
        if (this.autoExecOn) {
            this.stepper.solverLoop();
        } else {
            if (this.stepper.deadlockReached()) {
                alert("Keine (weitere) Lösung gefunden!");
            } else {
                this.setGamePhase('play');
                this.setAutoExecOn();
                this.suGrid.deselect();
                this.stepper.init();
                this.stepper.solverLoop();
            }
        }
    }

    autoExecRunTimerControlled() {
        if (this.autoExecOn) {
            this.stepper.startTimerLoop();
        } else {
            if (this.stepper.deadlockReached()) {
                alert("Keine (weitere) Lösung gefunden!");
            } else {
                this.setGamePhase('play');
                this.setAutoExecOn();
                this.suGrid.deselect();
                this.stepper.init();
                this.successDialog.close();
                this.stepper.startTimerLoop('user');
            }
        }
    }

    handleNumberPressed(nr) {
        if (this.autoExecOn) {
            // Während der automatischen Ausführung Nummer gedrückt
            // Der Stepper wird angehalten und beendet
            this.stepper.stopTimer();
            this.stepper.init();
            this.setAutoExecOff();
        } else {
            this.suGrid.atCurrentSelectionSetNumber(nr, this.currentPhase, false);
            this.stepper.displayProgress();
        }
    }

    handleDeletePressed() {
        if (this.autoExecOn) {
            // Während der automatischen Ausführung Delete-Taste gedrückt
            // Der Stepper wird angehalten und beendet
            this.stepper.stopTimer();
            this.stepper.init();
            this.successDialog.close();
            this.setAutoExecOff();
            this.suGrid.deselect();
        } else {
            this.suGrid.deleteSelected(this.currentPhase, false);
            this.stepper.displayProgress();
        };
    }

    init() {
        this.puzzleSaveDialog.close();
        this.successDialog.close();
        this.suGrid.init();
        // Die App kann in verschiedenen Ausführungsmodi sein
        // 'automatic' 'manual'
        this.setGamePhase('define');
        this.setAutoExecOff();
        // Ein neuer Stepper wird angelegt und initialisert
        this.stepper = new StepperOnGrid(this.suGrid);
        this.stepper.init();
        this.tabView.init();
    }

    setAutoExecOn() {
        if (!this.autoExecOn) {
            this.suGrid.removeAutoExecCellInfos();
            this.autoExecOn = true;
            this.stepper.init();
            this.successDialog.close();
            this.displayOnOffStatus();
        }
    }

    setAutoExecOff() {
        this.autoExecOn = false;
        this.displayOnOffStatus();
    }

    autoExecIsOn() {
        return this.autoExecOn;
    }

    displayOnOffStatus() {
        let manualGroup = document.getElementById("manual-btn-group");
        let autoGroup = document.getElementById("auto-exec-btns");
        if (this.autoExecOn) {
            manualGroup.classList.remove('on');
            autoGroup.classList.add('on');
        } else {
            autoGroup.classList.remove('on');
            manualGroup.classList.add('on');
        }
    }

    setGamePhase(gamePhase) {
        if (gamePhase == 'play') {
            this.currentPhase = 'play';
            document.querySelector('#btn-define').classList.remove('pressed');
            document.querySelector('#btn-play').classList.add('pressed');
        } else if (gamePhase == 'define') {
            this.currentPhase = 'define';
            document.querySelector('#btn-define').classList.add('pressed');
            document.querySelector('#btn-play').classList.remove('pressed');
        }
    }

    sudokuCellPressed(cellNode, cell, index) {
        if (this.autoExecOn) {
            this.stepper.stopTimer();
            this.stepper.init();
            this.successDialog.close();
            this.setAutoExecOff();
            this.suGrid.deselect();
        }
        this.suGrid.select(cellNode, cell, index);
    }

    savePuzzleDlgOKPressed() {
        this.puzzleSaveDialog.close();
        // Der Name unter dem der aktuelle Zustand gespeichert werden soll
        let puzzleId = this.puzzleSaveDialog.getPuzzleId();
        let puzzleName = this.puzzleSaveDialog.getPuzzleName();

        let playedPuzzleDbElement = this.suGrid.getPlayedPuzzleDbElement();
        //Speichere den named Zustand
        this.sudokuPuzzleDB.saveNamedPuzzle(puzzleId, puzzleName, playedPuzzleDbElement);
        document.getElementById("puzzle-db-tab").click();
    }

    savePuzzleMobile() {
        let playedPuzzleDbElement = this.suGrid.getPlayedPuzzleDbElement();
        //Speichere den named Zustand
        this.sudokuPuzzleDB.saveMobilePuzzle(playedPuzzleDbElement);
    }

    savePuzzleDlgCancelPressed() {
        this.puzzleSaveDialog.close()
    }

    loadCurrentPuzzle() {
        this.stepper.stopTimer();
        this.stepper.init();
        this.setAutoExecOff();
        let puzzle = this.sudokuPuzzleDB.getSelectedPuzzle();
        let uid = this.sudokuPuzzleDB.getSelectedUid();
        this.suGrid.loadPuzzle(uid, puzzle);
        this.stepper.displayProgress();
        this.setGamePhase('play');
        this.tabView.openGrid();
    }

    printCurrentPuzzle() {
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let key = Array.from(puzzleMap.keys())[sudoApp.sudokuPuzzleDB.selectedIndex];
        let selectedPZ = puzzleMap.get(key);
        this.sudokuPuzzleDB.displayTablePrint('print-puzzle', selectedPZ.puzzle);
        window.print();
    }

    loadCurrentMobilePuzzle() {
        this.stepper.stopTimer();
        this.stepper.init();
        this.setAutoExecOff();
        let uid = 'l2rcvi2mobile8h05azkg';
        if (!this.sudokuPuzzleDB.has(uid)) {
            uid = this.sudokuPuzzleDB.getSelectedUid();
        }
        let puzzle = this.sudokuPuzzleDB.getPuzzle(uid);
        this.suGrid.loadPuzzle(uid, puzzle);
        this.stepper.displayProgress();
        this.setGamePhase('play');
    }


    nextPuzzle() {
        this.sudokuPuzzleDB.nextPZ();
    }
    previousPuzzle() {
        // Select previous Puzzle
        this.sudokuPuzzleDB.previousPZ();
    }

    deleteCurrentPuzzle() {
        this.sudokuPuzzleDB.deleteSelected();
    }
    comboBoxNameSelected(comboBoxNode, e) {
        comboBoxNode.setInputField(e.target.value);
    }

    getPhase() {
        return this.currentPhase;
    }
    successDlgOKPressed() {
        this.successDialog.close();
        if (sudoApp.successDialog.further()) {
            this.stepper.setAutoDirection('backward');
            this.stepper.startTimerLoop();
        }
    }

    successDlgCancelPressed() {
        this.successDialog.close();
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
            sudoApp.savePuzzleDlgOKPressed();
        });
        this.cancelNode.addEventListener('click', () => {
            sudoApp.savePuzzleDlgCancelPressed();
        });
    }
    open(uid, name) {
        if (window.screen.availWidth < 421) {
            this.winBox = new WinBox("Puzzle speichern unter ...", {
                x: "center",
                y: "center",
                width: "400px",
                height: "300px",
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
        this.cancelNode = document.getElementById("btn-successCancel");
        this.checkBoxNode = document.getElementById("further");
        this.okNode.addEventListener('click', () => {
            sudoApp.successDlgOKPressed();
        });
        this.cancelNode.addEventListener('click', () => {
            sudoApp.successDlgCancelPressed();
        });
    }
    open() {
        if (window.screen.availWidth < 421) {
            this.winBox = new WinBox("Lösung gefunden", {
                x: "center",
                y: "center",
                width: "170px",
                height: "270px",
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
// Starte und initialisiere die App
start();