let sudoApp;
const searchDepth = 4;

const init = () => {
    sudoApp = new (SudokuApp);
    sudoApp.init();
}

class SudokuApp {
    constructor() {
        //Die App kennt zwei Betriebs-Modi 'play' or 'define'
        this.currentMode = 'play';
        // Die App erhält eine Sudoku-Tabelle. Die als HTML schon existierende Tabelle 
        // erhält hier einen Javascript Wrapper.

        // Die App hat bisher drei  Dialoge
        this.storageSaveDialog = new StorageSaveDialog();
        this.storageRestoreDialog = new StorageRestoreDialog();
        this.storageDeleteDialog = new StorageDeleteDialog();
        // Der Zustandsspeicher
        this.sudokuStorage = new SudokuStateStorage();
        // Die Hauptansicht
        this.suGrid = new SudokuGrid();
        this.progressBar = new ProgressBar();
        this.runner = new AutomatedRunnerOnGrid(this.suGrid);
        // Die App kann in verschiedenen Ausführungsmodi sein
        // 'undefined' 'automatic' 'manual'
        this.execMode = 'undefined';
        this.timer = undefined;

        //Die Buttons der App werden Event-Hhandler zugeordnet
        // Nummer-Buttons
        this.number_inputs = document.querySelectorAll('.number');
        // Hinweis: index + 1 = number on button
        this.number_inputs.forEach((e, index) => {

            e.addEventListener('click', () => {
                sudoApp.numberButtonPressed(index + 1)
            })
            //Der Delete-Button: Löscht aktuelle selektierte Zelle
            document.querySelector('#btn-delete-cell').addEventListener('click', () => {
                sudoApp.deleteCellButtonPressed();
            });

        });
        // Die beiden Mode-button 
        document.querySelector('#btn-define').addEventListener('click', () => {
            sudoApp.setMode('define');
        });
        document.querySelector('#btn-play').addEventListener('click', () => {
            sudoApp.setMode('play');
        });
        // Undo- und Redo-Button
        /* document.querySelector('#btn-redo').addEventListener('click', () => {
             sudoApp.redo();
         });
         document.querySelector('#btn-undo').addEventListener('click', () => {
             sudoApp.undo();
         });
         */

        // Automatische Ausführung: schrittweise
        document.querySelector('#btn-autoStep').addEventListener('click', () => {
            sudoApp.autoStep();
        });

        // Automatische Ausführung: vollautomatisch
        document.querySelector('#btn-run').addEventListener('click', () => {
            sudoApp.autoRun();
        });

        // Automatische Ausführung: vollautomatisch
        document.querySelector('#btn-pause').addEventListener('click', () => {
            sudoApp.autoRunPause();
        });


        // Der Initialisieren-Button: Initialisiert die Tabelle
        document.querySelector('#btn-init').addEventListener('click', () => {
            sudoApp.initButtonPressed();
        });
        // Der Zurücksetzen-Button: Setzt die Tabelle zurück auf die Definition.
        // Alle Zellen bis auf die, die zur Definition gehören, werden gelöscht
        document.querySelector('#btn-reset').addEventListener('click', () => {
            sudoApp.resetBtnPressed();
        });
        // Der Speichern-Button: Der aktuelle Zustand wird unter einem Namen gespeichert.
        document.querySelector('#btn-save').addEventListener('click', () => {
            sudoApp.saveBtnPressed();
        });
        // Der Wiederherstellen--Button: Ein gespeicherter Zustand wird wiederhergestellt.
        document.querySelector('#btn-restore').addEventListener('click', () => {
            sudoApp.restoreBtnPressed();
        });
        // Der Lösche--Button: Ein gespeicherter Zustand wird gelöscht.
        document.querySelector('#btn-delete').addEventListener('click', () => {
            sudoApp.deleteBtnPressed();
        });

    }


    init() {
        this.storageSaveDialog.close();
        this.storageRestoreDialog.close();
        this.storageDeleteDialog.close();

        // Der initiale Modus ist `play'.
        this.setMode('play');
        // Die Sudoku-Tabelle wird geladen.
        // Schritt 1: Lade die DOM-Tabelle in die internen Wrapper-Objekte
        this.suGrid.loadGrid();
        // Schritt 2: 
        // Erzeuge das Gruppen-Layout der Sudoku-Tabelle.
        this.suGrid.setLayout();
        // Schritt 3:
        // Fülle die Sudokutabelle initial
        this.suGrid.initGrid();
        this.setExecMode('undefined');
        this.autoRunStop()
        this.runner.init();
        this.progressBar.init();
        this.progressBar.setValue(0);
    }

    setExecMode(execMode) {
        if (execMode == 'undefined') {
            this.execMode = 'undefined';
            // Checkbox setzen
         
            let manualGroup = document.getElementById("manual-exec-btns");
            let autoGroup = document.getElementById("automatic-exec");
            manualGroup.classList.remove('on');
            autoGroup.classList.remove('on');
        } else if (execMode == 'manual') {
            this.execMode = 'manual';
            // Checkbox setzen
     
            let manualGroup = document.getElementById("manual-exec-btns");
            let autoGroup = document.getElementById("automatic-exec");
            autoGroup.classList.remove('on');
            manualGroup.classList.add('on');

        } else if (execMode == 'automatic') {
            this.execMode = 'automatic';
            // Checkbox setzen
            let manualGroup = document.getElementById("manual-exec-btns");
            let autoGroup = document.getElementById("automatic-exec");
            manualGroup.classList.remove('on');
            autoGroup.classList.add('on');
            } else {
            alert("Ein unzulässiger Exec-Mode is aufgetreten!");
        }
    }

    setMode(mode) {
        if (mode == 'play') {
            this.currentMode = 'play';
            document.querySelector('#btn-define').classList.remove('pressed');
            document.querySelector('#btn-play').classList.add('pressed');
        } else if (mode == 'define') {
            this.currentMode = 'define';
            document.querySelector('#btn-define').classList.add('pressed');
            document.querySelector('#btn-play').classList.remove('pressed');
        }
    }

    autoStep() {
        if (this.execMode !== 'automatic') {
            this.setExecMode('automatic');
        }
        let result = this.runner.autoStep();
        if (result == 'success') {
            this.autoRunStop();
            alert("Spielende: Glückwunsch! Sudoku gelöst!");
        } else if (result == 'fail') {
            this.autoRunStop();
            alert("Spielende: Sudoku nicht gelöst. Versuche es mit einer größeren Suchtiefe.");
        } else {
            // 'stopped' oder 'inProgress'
            // Keine Aktion
        }
        let count = this.suGrid.countSolvedSteps();
        this.progressBar.setValue(count);
        let depth = document.getElementById("search-depth");
        depth.innerText = this.runner.getCurrentSearchDepth();
    }


    autoRun() {
        // Die automatische Ausführung
        this.timer = window.setInterval(() => { sudoApp.autoStep(); }, 500);
    }

    autoRunPause() {
        // Die automatische Ausführung
        window.clearInterval(this.timer);
    }

    autoRunStop() {
        // Die automatische Ausführung
        window.clearInterval(this.timer);
        this.runner.stop();
    }



    numberButtonPressed(btnNumber) {
        // Ist manuelle Operation
        this.setExecMode('manual');
        this.suGrid.atCurrentSelectionSetNumber(btnNumber, this.currentMode, false);
    }
    deleteCellButtonPressed() {
        // Ist manuelle Operation
        this.setExecMode('manual');
        this.suGrid.deleteSelected(this.currentMode, false);
    }

    initButtonPressed() {
        this.init();
        this.setExecMode('undefined');
    }
    resetBtnPressed() {
        this.suGrid.reset();
        this.autoRunStop()
        this.runner.init();
        this.progressBar.init();
        this.progressBar.setValue(0);
        this.setExecMode('undefined');
    }

    saveBtnPressed() {
        // Zustand soll gespeichert werden
        this.autoRunStop()
        this.runner.init();
        this.progressBar.init();
        this.progressBar.setValue(0);
        this.setExecMode('undefined');

        let tmpNameList = this.sudokuStorage.getNameList();
        this.storageSaveDialog.open(tmpNameList);

    }

    restoreBtnPressed() {
        // Zustand soll wiederhergestellt werden
        let tmpNameList = this.sudokuStorage.getNameList();
        this.storageRestoreDialog.open(tmpNameList);

    }
    deleteBtnPressed() {
        // Zustand soll gelöscht werden
        let tmpNameList = this.sudokuStorage.getNameList();
        this.storageDeleteDialog.open(tmpNameList);
    }

    sudokuCellPressed(cellNode, index) {
        if (this.execMode !== 'manual') {
            this.setExecMode('manual');
            this.autoRunStop()
            this.runner.init();
            this.progressBar.init();
            this.progressBar.setValue(0);
            this.setExecMode('undefined');
        }
        this.suGrid.select(cellNode, index);
    }

    saveStorageDlgOKPressed() {
        this.storageSaveDialog.close();
        // Der Name unter dem der aktuelle Zustand gespeichert werden soll
        let stateName = this.storageSaveDialog.getSelectedName();

        let tmpNamedState = this.sudokuStorage.getNamedState(stateName);
        if (tmpNamedState == null) {
            // Alles gut: es existiert noch kein state mit diesem Namen
            // Speichere den Zustand
        } else {
            // Es existiert bereits ein Zustand mit diesem Namen
            stateName = stateName + 'A';
        }
        // Berechne den aktuellen Zustand
        let currentState = this.suGrid.getCurrentState();
        //Speichere den named Zustand
        this.sudokuStorage.saveNamedState(stateName, currentState);
    }

    saveStorageDlgCancelPressed() {
        this.storageSaveDialog.close()
    }

    restoreStorageDlgOKPressed() {
        this.storageRestoreDialog.close();
        // DerZustand mit diesem Namen soll geholt werden
        let stateName = this.storageRestoreDialog.getSelectedName();
        // Hole den State mit diesem Namen
        let tmpState = this.sudokuStorage.getNamedState(stateName);
        if (tmpState !== null) {
            this.setExecMode('undefined');
            this.autoRunStop()
            this.runner.init();
            this.progressBar.init();
            this.progressBar.setValue(0);
            this.setExecMode('undefined');
            //Lösche aktuelle Selektio
            this.suGrid.deselect();
            // Setze den aus dem Speicher geholten Zustand
            this.suGrid.setCurrentState(tmpState);
            // Berechne die möglichen Inhalte der Zellen
            this.suGrid.recalculatePermissibleSets();
            // Berechne potentiell vorhandene Konflikte
            this.suGrid.reCalculateErrorCells();
            // Berechne die notwendigen Zellinhalte
            this.suGrid.reEvaluateNecessarys();
        } else {
            alert("Zustand mit diesem Namen existiert nicht");
        }
    }

    restoreStorageDlgCancelPressed() {
        this.storageRestoreDialog.close()
    }

    deleteStorageDlgOKPressed() {
        this.storageDeleteDialog.close();
        // DerZustand mit diesem Namen soll geholt werden
        let stateName = this.storageDeleteDialog.getSelectedName();
        // Lösche den named State mit diesem Namen
        this.sudokuStorage.deleteNamedState(stateName);
    }

    deleteStorageDlgCancelPressed() {
        this.storageDeleteDialog.close()
    }

    comboBoxNameSelected(comboBoxNode) {
        comboBoxNode.setInputField();
    }

    getMode() {
        return this.currentMode;
    }
}

class ProgressBar {
    constructor() {
        this.elem = document.getElementById("myBar");
    }
    init() {
        this.elem.style.width = "10%"
    }
    setValue(stepCount) {
        let stepProzent = Math.floor(stepCount / 81 * 100);
        this.elem.style.width = stepProzent + "%";
        if (stepCount < 10){
            this.elem.innerHTML = '';       
        } else {
            this.elem.innerHTML = stepCount + " / 81";
        }
    }
}

//========================================================================
class Stepper {
    constructor() {
        this.currentStep = new OptionStep(null, -1, ['0']);
        console.log("Tiefe 0");
    }
    getCurrentStep() {
        return this.currentStep;
    }
    searchDepthLimitReached() {
        return (!(this.currentStep.getDepth() < searchDepth + 1));
    }
    getCurrentSearchDepth() {
        return this.currentStep.getDepth();
    }
    isOnOptionStep() {
        this.currentStep instanceof OptionStep;
    }
    addOptionStep(cellIndex, optionList) {
        this.currentStep = this.currentStep.addOptionStep(cellIndex, optionList);
        return this.currentStep;
    }
    addRealStep(cellIndex, cellValue) {
        this.currentStep = this.currentStep.addRealStep(cellIndex, cellValue);
        return this.currentStep;
    }
    getNextRealStep() {
        this.currentStep = this.currentStep.getNextRealStep();
        return this.currentStep;
    }
    previousStep() {
        this.currentStep = this.currentStep.previousStep();
        return this.currentStep;
    }
}

class OptionStep {
    constructor(ownerPath, cellIndex, optionList) {
        // Der Optinlstep befindet sich in einem Optionpath
        this.myOwnerPath = ownerPath;
        // Der Step zeigt auf Sudokuzelle
        // Der OptionStep zeigt auf eine Grid-Zelle
        this.myCellIndex = cellIndex;
        this.myOptionList = optionList.slice();
        this.myNextOptions = optionList.slice();

        // Der OptonStep hat für jede Option einen eigenen OptionPath
        if (optionList.length == 1) {
            // Dann kann es nur einen Pfad geben, und dieser wird sofort angelegt.
            // Das ist die Startsituation
            // Später gibt es keine einelementigen Optionlists.
            // Sie sind durch die Realsteps abgebildet
            this.myOwnerPath = new OptionPath(optionList[0], this)
        }
    }
    addRealStep(cellIndex, cellValue) {
        return this.myOwnerPath.addRealStep(cellIndex, cellValue);
    }
    addOptionStep(cellIndex, optionList) {
        return this.myOwnerPath.addOptionStep(cellIndex, optionList);
    }
    getNextRealStep() {
        let nextOption = this.myNextOptions.pop();
        let nextPath = new OptionPath(nextOption, this);
        return nextPath.addRealStep(this.myCellIndex, nextOption);
    }
    previousStep() {
        return this.myOwnerPath.previousFromOptionStep();
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
        // Der OptionStep ist beendet, wenn alle seine Pfade beendet sind
        for (let i = 0; i < this.myOptionPaths.length; i++) {
            if (!this.myOptionPaths[i].isFinished()) {
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
class RealStep {
    constructor(ownerPath, stepIndex, cellIndex, cellValue) {
        // Der Realstep befindet sich in einem Optionpath
        this.myOwnerPath = ownerPath;
        // Der Step zeigt auf Sudokuzelle
        this.myStepsIndex = stepIndex;
        this.myCellIndex = cellIndex;
        // Der Step kennt den Inhalt der Sudoku-Zelle
        this.myCellValue = cellValue;
    }
    addRealStep(cellIndex, cellValue) {
        return this.myOwnerPath.addRealStep(cellIndex, cellValue);
    }
    addOptionStep(cellIndex, optionList) {
        return this.myOwnerPath.addOptionStep(cellIndex, optionList);
    }
    previousStep() {
        return this.myOwnerPath.previousFromRealStep(this.myStepsIndex);
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
}

class OptionPath {
    // Ein OptionPath besteht im Kern aus zwei Elmenten:
    // 1. Die Nummer (Option), für die der Pfad gemacht wird.
    // 2. aus einer Sequenz von RealSteps
    // 3. Der letzte Schritt ist ein OptonStep, wenn nicht vorher
    // ein Erfolg oder Unlösbarkeit eingetreten ist.
    constructor(value, ownerStep) {
        // Nie nummeer, für die dieser path entsteht
        this.myValue = value;
        //Die Schrittsequenz bestehend ausschließlich aus realsteps
        this.myRealSteps = [];
        //Weitere Hilfsattribute
        this.myLastOptionStep; // Der Abschluss dies Pfades
        this.myOwnerStep = ownerStep; // Der Optionstep, der diesen Pfad besitzt
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
        return (!(this.myLastOptionStep == null));
    }

    addRealStep(cellIndex, cellValue) {
        // Der neue Realstep wird in diesem Path angelegt
        let realStep = new RealStep(this, this.myRealSteps.length, cellIndex, cellValue);
        this.myRealSteps.push(realStep);
        return realStep;
    }

    addOptionStep(cellIndex, optionList) {
        // Der neue Optionstep wird in diesem Path angelegt
        this.myLastOptionStep = new OptionStep(this, cellIndex, optionList);
        console.log("Tiefe " + this.myLastOptionStep.getDepth());
        // Damit ist dieser Pfad beendet. Es kann nur in seinen Subpfaden weitergehen
        return this.myLastOptionStep;
    }

    getValue() {
        return this.myValue;
    }

    previousFromRealStep(currentIndex) {
        // Rückwärtz vom RealStep
        if (currentIndex == 0) {
            // der vorige Step liegt nicht in diesem Path
            // und ist ein Option-Step
            if (this.myValue == '0') {
                // Dann ist dieser Pfad er Root-Path
                // D.h. es gibt keinen Vorgängerschritt mehr
                // Dann wird der Schritt selbst zurückgegeben
                return this.myRealSteps[0];
            } else {
                // Eon optionstep
                return this.myOwnerStep;
            }
        } else {
            // der vorige step liegt in diesem Path
            return this.myRealSteps[currentIndex - 1];
        }
    }
    previousFromOptionStep() {
        // Rückwärtz vom OptionStep
        // Es kann vorkommen, dass die realStep Sequenz leer ist
        if (this.myRealSteps.length == 0) {
            return this.myOwnerStep;
        } else
            return this.myRealSteps[this.myRealSteps.length - 1];
    }
}



//=================================================
class AutomatedRunnerOnGrid {
    constructor(suGrid) {
        this.suGrid = suGrid;
        this.myStepper;
        this.autoMode = 'forward';
        this.isStopped = false;
    }

    init() {
        this.isStopped = false;
        this.myStepper = new Stepper();
        this.setAutoMode('undefined');
    }

    getCurrentSearchDepth() {
        return this.myStepper.getCurrentSearchDepth();
    }
    stop() {
        this.isStopped = true;
    }
    setAutoMode(mode) {
        this.autoMode = mode;
        // Forward Mode setzen
        let forwardNode = document.getElementById("radio-forward");
        let backwardNode = document.getElementById("radio-backward");
        if (mode == 'forward') {
            forwardNode.checked = true;
            backwardNode.checked = false;
        } else {
            forwardNode.checked = false;
            backwardNode.checked = true;
        }
    }

    getAutoMode() {
        return this.autoMode;
    }

    autoStep() {
        if (!this.isStopped) {
            if (this.autoMode == 'undefined') {
                this.setAutoMode('forward');
            }
            if (this.autoMode == 'forward') {
                this.stepForward();
                return 'inProgress'
            } else if (this.autoMode == 'backward') {
                if (!this.stepBackward()) {
                    return 'fail';
                };
            } else {
                alert("Unzuässiger Mode im Stepper");
            }
            if (this.suGrid.solved()) {
                return 'success'
            }
        } else {
            return 'stopped';
        }
    }

    stepForward() {
        if (this.deadlockReached() || this.myStepper.searchDepthLimitReached()) {
            // deadlock reached
            this.setAutoMode('backward');
            return;
        }
        if (this.suGrid.indexSelected == -1) {
            // Keine Zelle selekteirt
            let tmpSelection = this.autoSelect();
            if (tmpSelection.index == -1) {
                if (this.suGrid.solved()) {
                    return;
                } else {
                    sudoApp.autoRunStop();
                    alert("Hinweis:es gibt keine nächste Selektion, obwohl das Spiel nicht beendet ist")
                }
            } else {
                // Gültige nächste Selektion
                this.suGrid.indexSelect(tmpSelection.index);
                // Jetzt muss für diese Selektion eine Nummer bestimmt werden.
                // Ergebnis wird sein: realStep mit Nummer
                /*  if (this.myStepper.isOnOptionStep()) {
                     // Dann muss die nächste Option verwendet werden
                     this.myStepper.getNextRealStep();
                 } else { */
                // steht auf einem Realstep, dann muss der nächste Realstep konfiguriert werden
                let tmpValue = '0';
                if (tmpSelection.options.length == 1) { tmpValue = tmpSelection.options[0]; }
                if (tmpSelection.necessaryOnes.length == 1) { tmpValue = tmpSelection.necessaryOnes[0]; }
                if (!(tmpValue == '0')) {
                    //Die Selektion hat eine eindeutige Nummer.
                    //D.h. es geht eindeutig weiter.
                    this.myStepper.addRealStep(tmpSelection.index, tmpValue);
                } else {
                    //Die Selektion hat keine eindeutige Nummer.
                    //D.h. es geht mit mehreren Optionen weiter.
                    this.myStepper.addOptionStep(tmpSelection.index, tmpSelection.options.slice());
                    // Nächster realstep mit einer Optionsnummer
                    // Aber nur wenn das Tiefenlimit nicht überschritten ist
                    if (this.myStepper.searchDepthLimitReached()) {
                        this.setAutoMode('backward');
                        // Schritt vor dem OptionStep
                        let prevStep = this.myStepper.previousStep();
                    } else {
                        if (!this.myStepper.getCurrentStep().isCompleted()) {
                            this.myStepper.getNextRealStep();
                        } else {
                            sudoApp.autoRunStop();
                            alert("Softearefehler: Für die selektierte Zelle gibt es keine Nummer");
                        }
                    }
                }
                //}
            }
        } else if (this.suGrid.indexSelected !== -1) {
            // Eine Zelle ist selektiert
            // Aktuelle Selektion --> Nummer setzen
            let currentStep = this.myStepper.getCurrentStep();
            if (currentStep instanceof RealStep) {
                // Setze die eindeutige Nummer
                this.suGrid.atCurrentSelectionSetNumber(currentStep.getValue(), 'play', false);
            }
        }
    }

    stepBackward() {
        let currentStep = this.myStepper.getCurrentStep();
        // Prüfen, ob das der Wurzelschritt ist. Dann Abbruch.
        if (currentStep instanceof OptionStep) {
            if (currentStep.getCellIndex() == -1) {
                //Wurzel erreicht
                return false;
            }
        } else {
            // Der erste Schrit im Pfad 0 ist ein korrekter Reastep.
        }
        if (this.suGrid.indexSelected !== currentStep.getCellIndex()) {
            // Keine aktuelle Selektion oder falsche Selektion --> Selektion setzen
            this.suGrid.deselect();
            this.suGrid.indexSelect(currentStep.getCellIndex());
            return true;
        } else if (this.suGrid.sudoCells[currentStep.getCellIndex()].value() !== '0') {
            // Die selektierte Zelle ist noch nicht gelöscht
            // und wird jetz gelöscht
            this.suGrid.deleteSelected('play', false);
            // Im Stepper heißt das: einen Schritt zurück
            let prevStep = this.myStepper.previousStep();
            return true;
        } else if (currentStep instanceof RealStep) {
            //Setze aktuellen Schritt des Steppers rückwärtz
            let previousStep = this.myStepper.previousStep();
            // Und gleich nochmal, um auf eine Realstep zu kommen
            //let prevRealstep = previousStep.previousFromOptionStep();
            let prevRealstep = this.myStepper.previousStep();
            if (prevRealstep.getCellIndex == -1) {
                // Die Wurzel ist erreicht
                return false;
            } else {
                // Den Schritt selekktieren
                this.suGrid.deselect();
                this.suGrid.indexSelect(prevRealstep.getCellIndex());
                return true;
            }
        } else if (currentStep instanceof OptionStep) {
            if (!currentStep.isCompleted()) {
                // Dieser Schritt muss noch mit weiteren Nummern probiert werden
                this.myStepper.getNextRealStep();
                this.setAutoMode('forward');
            } else {
                this.myStepper.previousStep();
            }
            return true;
        } else {
            sudoApp.autoRunStop();
            alert("Softwarefehler: Beim Rückwärtsgehen unerwarteter Fehler")
        }
    }

    calculateMinSelectionFrom(selectionList) {
        // Berechnet Zellindex mit der geringsten Anzahl zulässiger Nummern
        // Nicht eindeutig; Anfangs gibt es oft mehrere Zellen mit
        // nur einer zulässigen Nummer
        let minSelection = {
            index: -1,
            options: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
            necessaryOnes: []
        }
        for (let i = 0; i < selectionList.length; i++) {
            if (selectionList[i].options.length < minSelection.options.length) {
                minSelection = selectionList[i];
            }
        }
        return minSelection;
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
            necessaryOnes: []
        }
        return emptySelection;
    }

    getOptionalSelections() {
        let selectionList = [];
        for (let i = 0; i < 81; i++) {
            if (this.suGrid.sudoCells[i].value() == '0') {
                let selection = {
                    index: i,
                    options: Array.from(this.suGrid.sudoCells[i].getPermissibleNumbers()),
                    necessaryOnes: Array.from(this.suGrid.sudoCells[i].getNecessaryNumbers())
                }
                selectionList.push(selection);
            }
        }
        // Wenn alle Zellen gesetzt sind, ist diese Liste leer
        return selectionList;
    }

    autoSelect() {
        let optionList = this.getOptionalSelections();
        //Bestimmt die nächste Zelle mit notwendiger Nummer unter den zulässigen Nummern
        let tmpSelection = this.calculateNeccesarySelectionFrom(optionList);
        if (tmpSelection.index == -1) {
            // Bestimmt die nächste Zelle mit minimaler Anzahl zulässiger Nummern
            return this.calculateMinSelectionFrom(optionList);
        } else {
            // Gibt tmpSelection mit index = -1 zurück, falls keine gültige Selektion mehr gibt
            return tmpSelection;
        }
    }
    deadlockReached() {
        // Deadlock ist erreicht, wenn es eine unlösbare Zelle gibt
        for (let i = 0; i < 81; i++) {
            if (this.suGrid.sudoCells[i].isInsolvable()) {
                return true;
            }
        }
        return false;
    }



}

class SudokuGrid {
    constructor() {
        // Speichert die Sudokuzellen in der DOM-Version
        this.cells = [];
        // Speichert die Sudokuzellen in der Wrapper-Version
        this.sudoCells = [];
        // Speichert die Wrapper-Zellen in Gruppen
        this.sudoGroups = [];
        // Speichert die aktuell selektierte Zelle und ihren Index
        this.selectedCell = undefined;
        this.indexSelected = -1;
        // Ermöglicht schrittweises undo und redo in der Lösung
        //  this.actionHistory = [];
        //  this.undoHistory = [];
    }

    initGrid() {
        // Die Tabelle wird initialisert
        // Schritt 1: Die aktuelle Zellenselektion wird zurückgesetzt
        this.initCurrentSelection();
        // this.initActionHistory();
        // Die aktuellen Zellinhalte werden gelöscht
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].clear();
        }
        // Die für die Zellen möglichen Inhalte 
        // werden neu berechnet. Notwendige Inhalte gibt
        // es im initialen Zustand nochnicht
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].init();
        }
    }

    solved() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].value() == '0') {
                return false;
            }
        }
        return true;
    }
    countSolvedSteps() {
        let tmp = 0;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].value() !== '0') {
                tmp++;
            }
        }
        return tmp;
    }

    reset() {
        // Alle im Mode 'play' gesetzten Zahlen werden gelöscht
        // Die Zellen der Aufgabenstellung bleiben erhalten
        // Schritt 1: Die aktuelle Selektion wird zurückgesetzt
        this.initCurrentSelection();
        //this.initActionHistory();
        // Schritt 2: Die aktuellen Zellinhalte werden gelöscht
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getMode() !== 'define') {
                this.sudoCells[i].clear();
            }
        }
        // Die für die Zellen möglichen Inhalte 
        // werden neu berechnet.
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getMode() !== 'define') {
                this.sudoCells[i].init();
            }
        }
        // Schritt 3: Für alle Zellen werden die notwendigen Inhalte
        // neu berechnet
        this.reEvaluateNecessarys();
    }

    /*
        initActionHistory() {
            this.actionHistory = [];
            this.undoHistory = [];
        }
    
        undo() {
            this.runner.switchOff();
            //Macht die letzte Tabellenoperation rückgängig
            if (this.actionHistory.length > '0') {
                let action = this.actionHistory.pop();
                this.undoHistory.push(action);
                let undoOp = true;
                if (action.op === "setNumber") {
                    // Lösche die gesetzte Nummer
                    this.setMode(action.mode);
                    this.suGrid.select(action.mode, action.cellIndex);
                    this.suGrid.deleteSelected(this.currentMode, undoOp);
                    this.suGrid.deselect();
                } else if (action.op === "deleteNumber") {
                    // Setze die zuvor gelöschte Nummer erneut
                    this.setMode(action.mode);
                    this.suGrid.select(action.Mode, action.cellIndex);
                    this.suGrid.atCurrentSelectionSetNumber(action.nr, action.mode, undoOp);
                    this.suGrid.deselect();
                }
            }
        }
    
        redo() {
            //Macht undo rückgängig
            if (this.undoHistory.length > '0') {
                let action = this.undoHistory.pop();
                let undoOp = false;
                if (action.op === "setNumber") {
                    // Wiederhole die Aktion
                    this.setMode(action.mode);
                    this.suGrid.select(action.mode, action.cellIndex);
                    this.suGrid.atCurrentSelectionSetNumber(action.nr, action.mode, undoOp);
                    this.suGrid.deselect();
                } else if (action.op === "deleteNumber") {
                    // Wiederhole die Aktion
                    this.setMode(action.mode);
                    this.suGrid.select(action.Mode, action.cellIndex);
                    this.suGrid.deleteSelected(this.currentMode, undoOp);
                    this.suGrid.deselect();
                }
            }
        }
    */


    getCurrentState() {
        // Zusammenstellung des Zustandes, um ihn abspeichern zu können
        let tmpGrid = [];
        for (let i = 0; i < 81; i++) {
            let storedCell = {
                cellValue: this.sudoCells[i].value(),
                cellMode: this.sudoCells[i].getMode()
            };
            tmpGrid.push(storedCell);
        }
        return tmpGrid;
    }

    setCurrentState(previousState) {
        for (let i = 0; i < 81; i++) {
            let storedCell = previousState.shift();
            this.sudoCells[i].massSetNumber(storedCell.cellValue, storedCell.cellMode);
        }
        // Berechne die möglichen Inhalte der Zellen
        this.recalculatePermissibleSets();
        // Berechne potentiell vorhandene Konflikte
        this.reCalculateErrorCells();
        // Berechne die notwendigen Zellinhalte
        this.reEvaluateNecessarys();
    }

    loadGrid() {
        this.cells = document.querySelectorAll('.sudoku-grid-cell');
        for (let i = 0; i < 9; i++) {
            let tmpArr = [];
            this.sudoGroups.push(tmpArr);
        }
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

        for (let i = 0; i < 81; i++) {
            let row = Math.floor(i / 9);
            let col = i % 9;
            let groupRow = Math.floor(row / 3);
            let groupCol = Math.floor(col / 3);

            // Die Wrapper-Zellen für die DOM-Zellen werden erzeugt
            // und im Array sudoCells gespeicehrt
            let tmpSudoCell = new SudokuCell(this, i, this.cells[i]);
            this.sudoCells.push(tmpSudoCell);

            // Gleichzeitig werden die Wrapper-Zellen in Gruppen gespeichert.
            // Die Tabelle besitzt 9 Gruppen mit jeweils 9 Zellen.
            let tmpGroupIndex = calcIndex(groupCol, groupRow);
            this.sudoGroups[tmpGroupIndex].push(tmpSudoCell);
        }
    }
    initCurrentSelection() {
        this.deselect();
    }
    setCurrentSelection(cell, index) {
        this.indexSelected = index;
        this.selectedCell = cell;
    }

    isCellSelected() {
        return this.indexSelected != -1;
    }

    setLayout() {
        // Das Gruppen-Layout der Zellen wird erzeugt
        let index = 0;
        for (let i = 0; i < Math.pow(9, 2); i++) {
            let row = Math.floor(i / 9);
            let col = i % 9;
            if (row === 2 || row === 5) this.cells[index].style.marginBottom = '10px';
            if (col === 2 || col === 5) this.cells[index].style.marginRight = '10px';
            index++;
        }
    }

    atCurrentSelectionSetNumber(btnNumber, currentMode, undoOp) {
        // Setze Nummer in einer Zelle
        if ( // Das geht nur, wenn eine Zelle selektiert ist
            this.isCellSelected()) {
            if (// Wenn die Zelle leer ist, kein Problem
                (this.selectedCell.value() == '0') ||
                // Wenn die Zelle geüllt ist, kann nur im gleichen Modus
                // eine Neusetzung erfolgen
                (this.selectedCell.getMode() == currentMode)
            ) {
                this.selectedCell.setNumber(btnNumber, currentMode);
                // Setze action in der action history, aber nur, wenn nicht im Undo
                /*               let action = null;
                               if (!undoOp) {
                                   action = {
                                       op: "setNumber",
                                       mode: currentMode,
                                       nr: btnNumber,
                                       cellIndex: this.indexSelected
                                   };
                               }
                               this.actionHistory.push(action); */
                // Berechne die jetzt noch möglichen Inhalte der Zellen
                this.recalculatePermissibleSets();
                // Berechne potentiell jetzt vorhandene Konflikte
                this.reCalculateErrorCells();
                // Berechne die jetzt notwendigen Zellinhalte
                this.reEvaluateNecessarys();
                // Nehme die aktuelle Selektion zurück
                this.deselect();
            }
        }
    }

    deleteSelected(currentMode, undoOp) {
        // Lösche die selektierte Zelle
        if (this.isCellSelected()) {
            // Das Löschen kann nur im gleichen Modus
            // eine Neusetzung erfolgen
            if (this.selectedCell.getMode() == currentMode) {
                /*                let action = null;
                                if (!undoOp) {
                                    action = {
                                        op: "deleteNumber",
                                        mode: currentMode,
                                        nr: this.selectedCell.value(),
                                        cellIndex: this.indexSelected
                                    };
                                } */
                this.selectedCell.delete();
                // this.actionHistory.push(action);
                // Berechne die jetzt noch möglichen Inhalte der Zellen
                this.recalculatePermissibleSets();
                // Berechne potentiell jetzt (nicht mehr) vorhandene Konflikte
                this.reCalculateErrorCells();
                // Berechne die jetzt (nicht mehr) notwendigen Zellinhalte
                this.reEvaluateNecessarys();
                // Nehme die aktuelle Selektion zurück
                //this.deselect();
            }
        }
    }


    reEvaluateNecessarys() {
        // Bestimme für alle 9 Gruppen der Tabelle 
        // ob es eine Ziffer gibt, die in der Gruppe
        // nur genau einmal vorkommt. 
        // Dann ist sie notwendig.

        // Initialisiere das necessary Feld in allen Zellen   
        for (let i = 0; i < this.sudoCells.length; i++) {
            let tmpCell = this.sudoCells[i];
            tmpCell.necessary = new Set();
        }

        // Setze die neuen Werte
        for (let i = 0; i < 9; i++) {
            this.checkUniquesInGroup(i);
        }
    }

    checkUniquesInGroup(groupNr) {
        for (let i = 1; i < 10; i++) {
            let cellIndex = this.isNrUniqueInGroupInCell(groupNr, i);
            if (cellIndex !== -1) {
                this.sudoCells[cellIndex].setNecessary(i.toString());
            }
        }
    }

    isNrUniqueInGroupInCell(groupNr, permNr) {
        // Berechne, ob die Zahl permNr in möglichen Zahlen der Gruppe 
        // genau einmal vorkommt
        // Rücgabe: der Index der Zelle, die das einmalige Auftreten enthält
        let countOccurrences = 0;
        let lastCellwithNr = undefined;
        let currentGroup = this.sudoGroups[groupNr];
        for (let i = 0; i < 9; i++) {

            if (currentGroup[i].value() == '0') {
                if (currentGroup[i].hasThisPermNr(permNr)) {
                    countOccurrences++;
                    lastCellwithNr = currentGroup[i];
                }
            }
        }
        if (countOccurrences == 1) {
            return lastCellwithNr.getIndex();
        } else {
            return -1;
        }
    }

    deselect() {
        if (this.isCellSelected()) {
            // Deselektiere die Zelle selbst
            this.selectedCell.deselect();
            // Lösche die Selektionsinformation der Tabelle
            this.selectedCell = undefined;
            this.indexSelected = -1;
        }
    }

    recalculatePermissibleSets() {
        for (let i = 0; i < this.sudoCells.length; i++) {
            let tmpCell = this.sudoCells[i];
            tmpCell.calculatePermissibleNumbers();
            // Nur leere Zellen erhalten möglche Nummern
            if (tmpCell.value() == '0') {
                tmpCell.setPermissibleNumbers();
            }
        }
    }

    reCalculateErrorCells() {
        for (let i = 0; i < this.sudoCells.length; i++) {
            let tmpCell = this.sudoCells[i];
            tmpCell.unsetError();
            if (tmpCell.isSetinError()) {
                tmpCell.setError();
            }
        }
    }


    cellOf(cellNode) {
        // Get the wrapper of a DOM-Cell
        for (let i = 0; i < this.cells.length; i++) {
            if (this.sudoCells[i].cellNode() == cellNode) {
                return this.sudoCells[i];
            }
        }
    }

    selectCell(cell, index) {
        // Selektiere in der Tabelle eine Zelle
        // Parameter:
        //      cell: Wrapper der Zelle
        //      index: index der Zelle
        // 1. Lösche eine möglche alte Selektion
        this.deselect();
        // 2. Setze die neue Selektion in der slektierten Zelle
        cell.select();
        // 3.Setze die information in der Tabelle 
        this.setCurrentSelection(cell, index);
    }

    select(cellNode, index) {
        // Die gleiche Operation wie zuvor, jetzt aber mit dem Knoten der Zelle
        // Setze eine Zelle auf selektiert
        let tmpCell = this.cellOf(cellNode);
        this.selectCell(tmpCell, index);
    }

    indexSelect(index) {
        this.selectCell(this.sudoCells[index], index);
    }


    influencersOfCell(index) {
        // Jede Zelle besitzt die Menge der sie beeinflussenden Zellen
        // Diese werden hier berechnet.
        const grid_size = 9;
        const box_size = 3;

        let tmpInfluencers = [];

        let row = Math.floor(index / grid_size);
        let col = index % grid_size;

        let box_start_row = row - row % 3;
        let box_start_col = col - col % 3;

        for (let i = 0; i < box_size; i++) {
            for (let j = 0; j < box_size; j++) {
                let tmpIndex = 9 * (box_start_row + i) + (box_start_col + j);
                if (index !== tmpIndex) {
                    let cell = this.sudoCells[tmpIndex];
                    tmpInfluencers.push(cell);
                }
            }
        }

        let step = 9;
        while (index - step >= 0) {
            tmpInfluencers.push(this.sudoCells[index - step]);
            step += 9;
        }

        step = 9;
        while (index + step < 81) {
            tmpInfluencers.push(this.sudoCells[index + step]);
            step += 9;
        }

        step = 1;
        while (index - step >= 9 * row) {
            tmpInfluencers.push(this.sudoCells[index - step]);
            step += 1;
        }

        step = 1;
        while (index + step < 9 * row + 9) {
            tmpInfluencers.push(this.sudoCells[index + step]);
            step += 1;
        }
        return tmpInfluencers;
    }
}


class SudokuCell {
    constructor(suTable, index, cellNode) {
        // Die Zelle kennt ihr Tabelle und ihren Index
        this.myTable = suTable;
        this.myIndex = index;
        // Die Zelle kennt ihre DOM-Version
        this.myCellNode = cellNode;
        // Mit der Erzeugung des Wrappers wird
        // auch der Eventhandler der Zelle gesetzt
        this.myCellNode.addEventListener('click', () => {
            sudoApp.sudokuCellPressed(cellNode, index);
        });
        // Speichert den Modus, der beim Setzen einer Nummer
        // in der Zelle aktuell war.
        this.myMode = '';
        // Speichert ein für alle mal bei der Initialisierung
        // die beeinflussenden Zellen dieser Zelle
        this.influencers = [];
        // Speiceht die aktuell möglichen Zahlen für diese Zelle
        this.myPermissibles;
        // Speichert, falls vorhanden  notwendige Zahlen dieser Zelle. 
        // Mehr als eine bedeuten einen Widerspruch in der Lösung.
        this.necessary = new Set();
    }

    getNecessaryNumbers() {
        return this.necessary;
    }

    clear() {
        this.unsetNumber();
        this.unsetError();
        this.unsetNecessary();
    }

    init() {
        this.influencers = this.myTable.influencersOfCell(this.myIndex);
        this.calculatePermissibleNumbers();
        this.setPermissibleNumbers();
    }

    setNumber(number, mode) {
        this.privateSetNumber(number, mode);

        this.myCellNode.classList.add('zoom-in');
        setTimeout(() => {
            this.myCellNode.classList.remove('zoom-in');
        }, 500);
    }

    massSetNumber(number, mode) {
        //Wird augerufen für die Wiederherstellung
        this.privateSetNumber(number, mode);
    }

    privateSetNumber(number, mode) {
        this.myCellNode.setAttribute('data-value', number);
        //remove permissible numbers
        while (this.myCellNode.firstChild) {
            this.myCellNode.removeChild(this.myCellNode.lastChild);
        }
        // Lösche die 'nested'-Klassifizierung 
        this.myCellNode.classList.remove('nested')
        this.myCellNode.classList.remove('inSolvable');

        //Setze das data-value Attribut der Zelle
        this.myCellNode.setAttribute('data-value', number);
        // Setze das Zahlelement
        this.myCellNode.innerHTML = number;
        // Notiere den Modus im Wrapper
        this.myMode = mode;
        // Setze die Klassifizierung in der DOM-Zelle
        if (mode == 'define') {
            this.myCellNode.classList.add('define');
        } else {
            this.myCellNode.classList.remove('define');
        }
    }

    unsetNumber() {
        // Setze das Value-Attribut im Knoten auf 0
        // Damit kann man leicht eine leere Zelle bestimmen
        this.myCellNode.setAttribute('data-value', '0');
        this.myCellNode.innerHTML = '';
        this.myMode = '';
        // LÖsche die gegebenfalls vorhandene Define-KLassifizierung
        this.myCellNode.classList.remove('define');
        // Hinweis: Die Neuberechnung der möglchen und notwendigen
        // Zahlen erfolgt auf Tabellenebene. 
        this.myCellNode.classList.add('zoom-in');
        setTimeout(() => {
            this.myCellNode.classList.remove('zoom-in');
        }, 500);
    }

    setError() {
        this.myCellNode.classList.add('err');
        this.myCellNode.classList.add('cell-err');
        setTimeout(() => {
            this.myCellNode.classList.remove('cell-err');
        }, 500);
    }

    unsetError() {
        this.myCellNode.classList.remove('err');
    }

    getMode() {
        return this.myMode;
    }
    setMode(mode) {
        this.myMode = mode;
    }

    select() {
        this.myCellNode.classList.add('selected');
        this.influencers.forEach(e => e.setSelected());
    }

    setSelected() {
        this.myCellNode.classList.add('hover');
    }

    deselect() {
        this.myCellNode.classList.remove('selected');
        this.influencers.forEach(e => e.unsetSelected());
    }

    unsetSelected() {
        this.myCellNode.classList.remove('hover');
    }


    value() {
        return this.myCellNode.getAttribute('data-value');
    }

    cellNode() {
        return this.myCellNode;
    }
    calculatePermissibleNumbers() {
        // Die möglchen Zahlen einer Zelle werden berechnet
        // Aus den prinzipiell 9 möglichen Zahlen werden die gestrichen,
        // die bereits in einer der Einflusszellen vorkommt.
        let permissibles = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
        for (let i = 0; i < this.influencers.length; i++) {
            if (this.influencers[i].value() !== '0')
                permissibles.delete(this.influencers[i].value());
        }
        this.myPermissibles = permissibles;
    }

    hasThisPermNr(permNr) {
        let permNrStr = permNr.toString();
        return this.myPermissibles.has(permNrStr);
    }

    setPermissibleNumbers() {
        // Lösche die bisherigen Zahlen
        this.myCellNode.innerHTML = '';
        this.myCellNode.setAttribute('data-value', '0');
        while (this.myCellNode.firstChild) {
            this.myCellNode.removeChild(this.myCellNode.lastChild);
        }
        // Klassifizire die Zelle als 'nested'
        this.myCellNode.classList.add('nested');
        // Übertrage die berechneten Möglchen in das DOM
        if (this.myPermissibles.size == 0) {
            // Klassefiziere diese Zelle als widersprüchlich
            this.myCellNode.classList.add('inSolvable');
        } else {
            this.myCellNode.classList.remove('inSolvable');
            this.myPermissibles.forEach(e => {
                let permNumberElement = document.createElement('div');
                permNumberElement.setAttribute('data-value', e);
                permNumberElement.innerHTML = e;
                this.myCellNode.appendChild(permNumberElement);
            });
        }

    }
    getPermissibleNumbers() {
        return this.myPermissibles;
    }

    setNecessary(permNr) {
        // Klassifiziere die Zahl permNr in der Menge der möglichen Zahlen
        // als notwendig
        this.necessary.add(permNr);
        let permNodes = this.myCellNode.children;
        for (let i = 0; i < permNodes.length; i++) {
            if (permNodes[i].getAttribute('data-value') == permNr) {
                permNodes[i].classList.add('neccessary');
            }
        }
        if (this.necessary.size > 1) {
            this.myCellNode.classList.add('inSolvable');
        }
    }

    unsetNecessary(permNr) {
        let permNodes = this.myCellNode.children;
        for (let i = 1; i < permNodes.length; i++) {
            if (permNodes[i].getAttribute('data-value') == permNr) {
                permNodes[i].classList.remove('neccessary');
            }
        }
        this.necessary.delete(permNr);
    }

    delete() {
        this.unsetNumber();
    }

    isSetinError() {
        let tmpValue = this.value();
        // Wenn die Zelle gar nicht gesetzt ist, kann sie nicht fehlerhaft gesezt sein
        if (tmpValue == '0') {
            return false;
        } else {
            // Wenn die gesetzte Zahl nicht in der Menge der erlaubten Zahlen ist, ist die Zahl fehlerhaft gesetzt
            return !this.myPermissibles.has(tmpValue);
        }
    }

    isInsolvable() {
        // Nur eine nicht gesetzte Zelle kann unlösbar sein
        let tmpValue = this.value();
        if (tmpValue !== '0') {
            return false;
        } else {
            return (this.necessary.size > 1 || this.myPermissibles.size == 0);
        }
    }


    hasUniqueSolution() {
        // Gibt, falls vorhanden, die einzig mögliche Zahl zurück 
        let tmpValue = '0';
        // Wir betrachten nicht gesetzte Zellen
        if (this.value() == '0') {
            // Es kann vorkommen, dass mehrere notwendige Zahlen
            // für eine Zelle berechnet werden. 
            // Dann ist das sudoku unlösbar.
            if (this.necessary.size == 1) {
                this.necessary.forEach(e => {
                    tmpValue = e;
                });
            } else if (this.myPermissibles.size == 1) {
                // Wenn nur eine Zahl zulässig ist, dann ist sie
                // notwendig. D.h. sie ist die einzig mögliche Lösung
                this.myPermissibles.forEach(e => {
                    tmpValue = e;
                });
            } else {
                // Gibt 0 zurück, wenn keine eindeutig mögliche Zahl existiert
                tmpValue = '0';
            }
            return tmpValue;
        }

    }

    getIndex() {
        return this.myIndex;
    }
}
class Combobox {
    constructor(comboBoxNode) {
        // Der Combobox Knoten
        this.myComboBoxNode = comboBoxNode;
        // 1. Kind: das Input-Feld der Combobox
        this.theinput = comboBoxNode.firstElementChild;
        // 2. und letztes Kind: das Selektionsfeld Options-Liste
        this.optionList = comboBoxNode.lastElementChild;

        // Mit der Erzeugung des Wrappers wird
        // auch der Eventhandler der Combobox gesetzt
        this.optionList.addEventListener('change', () => {
            sudoApp.comboBoxNameSelected(this);
        });
    }
    getNode() {
        return this.myComboBoxNode;
    }
    getDialog() {
        return this.myDialog;
    }
    setInputField() {
        // Eine Selektion in der Optionsliste ruft diese Operation au
        // und überträgt die Auswahl in das Inputfeld (Combbox)
        let idx = this.optionList.selectedIndex;
        if (idx >= 0) {
            let content = this.optionList.options[idx].innerHTML;
            this.theinput.value = content;
        } else {
            this.theinput.value = '';
        }
    }
    init(optionListNew) {
        // Fülle optionListNew in die comboBoxliste
        // remove existing list

        while (this.optionList.firstChild) {
            this.optionList.removeChild(this.optionList.lastChild);
        }
        //fill new list
        for (let i = 0; i < optionListNew.length; i++) {
            let optionElement = document.createElement('option');
            optionElement.innerHTML = optionListNew[i];
            this.optionList.appendChild(optionElement);
        }
        this.setInputField();
    }
    getSelectedName() {
        return this.theinput.value;
    }
}
class StorageSaveDialog {
    constructor() {
        this.storageSaveDlgNode = document.getElementById("storageSaveDialog");
        this.myComboBoxNode = document.getElementById("storageSaveComboBox");
        this.myComboBox = new Combobox(this.myComboBoxNode);
        this.okNode = document.getElementById("btn-saveStorageOK");
        this.cancelNode = document.getElementById("btn-saveStorageCancel");
        // Mit der Erzeugung des Wrappers werden 
        // auch der Eventhandler OK und Abbrechen gesetzt
        this.okNode.addEventListener('click', () => {
            sudoApp.saveStorageDlgOKPressed();
        });
        this.cancelNode.addEventListener('click', () => {
            sudoApp.saveStorageDlgCancelPressed();
        });
    }
    open(nameList) {
        this.myComboBox.init(nameList);
        this.storageSaveDlgNode.style.visibility = "visible";
    }
    close() {
        this.storageSaveDlgNode.style.visibility = "hidden";
    }
    init(nameList) {
        this.myComboBox.init(nameList);
    }
    getSelectedName() {
        return this.myComboBox.getSelectedName();
    }
}

class StorageRestoreDialog {
    constructor() {
        this.storageRestoreDialog = document.getElementById("storageRestoreDialog");
        this.myComboBox = new Combobox(document.getElementById("storageRestoreComboBox"));
        this.okNode = document.getElementById("btn-restoreStorageOK");
        this.cancelNode = document.getElementById("btn-restoreStorageCancel");
        // Mit der Erzeugung des Wrappers werden 
        // auch der Eventhandler OK und Abbrechen gesetzt
        this.okNode.addEventListener('click', () => {
            sudoApp.restoreStorageDlgOKPressed();
        });
        this.cancelNode.addEventListener('click', () => {
            sudoApp.restoreStorageDlgCancelPressed();
        });
    }
    open(nameList) {
        this.myComboBox.init(nameList);
        this.storageRestoreDialog.style.visibility = "visible";
    }
    close() {
        this.storageRestoreDialog.style.visibility = "hidden";
    }
    init(nameList) {
        this.myComboBox.init(nameList);
    }
    getSelectedName() {
        return this.myComboBox.getSelectedName();
    }
}
class StorageDeleteDialog {
    constructor() {
        this.storageDeleteDialog = document.getElementById("storageDeleteDialog");
        this.myComboBox = new Combobox(document.getElementById("storageDeleteComboBox"));
        this.okNode = document.getElementById("btn-deleteStorageOK");
        this.cancelNode = document.getElementById("btn-deleteStorageCancel");
        // Mit der Erzeugung des Wrappers werden 
        // auch der Eventhandler OK und Abbrechen gesetzt
        this.okNode.addEventListener('click', () => {
            sudoApp.deleteStorageDlgOKPressed();
        });
        this.cancelNode.addEventListener('click', () => {
            sudoApp.deleteStorageDlgCancelPressed();
        });
    }
    open(nameList) {
        this.myComboBox.init(nameList);
        this.storageDeleteDialog.style.visibility = "visible";
    }
    close() {
        this.storageDeleteDialog.style.visibility = "hidden";
    }
    init(nameList) {
        this.myComboBox.init(nameList);
    }
    getSelectedName() {
        return this.myComboBox.getSelectedName();
    }
}
class SudokuStateStorage {
    constructor() { }

    getNamedState(name) {
        // Gibt ein Zustandsobjekt zurück
        let str_storageOBj = localStorage.getItem("sudokuStorage");
        let storageObj = JSON.parse(str_storageOBj);
        if (storageObj == null) {
            storageObj = [];
        }
        let foundIndex = -1;
        let i = 0;
        let tmpNamedState = null;
        while ((foundIndex == -1) && i < storageObj.length) {
            tmpNamedState = storageObj[i];
            if (tmpNamedState.name == name) {
                foundIndex = i;
            }
            i++;
        }
        if (foundIndex !== -1) {
            return tmpNamedState.state;
        } else {
            // Es gibt keinen Zustand mit diesem Namen
            // Auch nicht den leeren Zustand []
            return null;
        }
    }
    saveNamedState(name, state) {
        // Hole den Speicher als ein Objekt
        let str_storageOBj = localStorage.getItem("sudokuStorage");
        let storageObj = JSON.parse(str_storageOBj);
        if (storageObj == null) {
            storageObj = [];
        }
        // Definiere neues NamedState
        let newNamedState = {
            name: name,
            state: state
        }
        // Füge den namedState in das Speicherobjekt ein
        storageObj.push(newNamedState);
        // Kreiere die JSON-Version des Speicherobjektes
        // und speichere sie.
        let updateStorageObj = JSON.stringify(storageObj);
        localStorage.setItem("sudokuStorage", updateStorageObj);
    }
    deleteNamedState(name) {
        // Hole den Speicher als ein Objekt
        let str_storageOBj = localStorage.getItem("sudokuStorage");
        let storageObj = JSON.parse(str_storageOBj);
        if (storageObj == null) {
            storageObj = [];
        }
        let foundIndex = -1;
        let i = 0;
        let tmpNamedState = null;
        while ((foundIndex == -1) && i < storageObj.length) {
            tmpNamedState = storageObj[i];
            if (tmpNamedState.name == name) {
                foundIndex = i;
            }
            i++;
        }
        if (foundIndex !== -1) {
            storageObj.splice(foundIndex, 1);
            let updateStorageObj = JSON.stringify(storageObj);
            localStorage.setItem("sudokuStorage", updateStorageObj);
        }
    }
    getNameList() {
        // Hole den Speicher als ein Objekt
        let str_storageObj = localStorage.getItem("sudokuStorage");
        let storageObj = JSON.parse(str_storageObj);
        if (storageObj == null) {
            storageObj = [];
        }
        let nameList = [];
        for (let i = 0; i < storageObj.length; i++) {
            nameList.push(storageObj[i].name);
        }
        return nameList;
    }

}
init();