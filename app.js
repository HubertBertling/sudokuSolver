let sudoApp;
const init = () => {
    sudoApp = new (SudokuApp);
    sudoApp.init();
}
class SudokuSet extends Set {
    constructor(arr) {
        super(arr);
    }
    isSuperset(subset) {
        for (var elem of subset) {
            if (!this.has(elem)) {
                return false;
            }
        }
        return true;
    }
    union(setB) {
        var _union = new Set(this);
        for (var elem of setB) {
            _union.add(elem);
        }
        return _union;
    }
    difference(setB) {
        var _difference = new Set(this);
        for (var elem of setB) {
            _difference.delete(elem);
        }
        return _difference;
    }

    intersection(setB) {
        var _intersection = new Set();
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

class SudokuApp {
    constructor() {
        //Die App kennt zwei Betriebs-Phasen 'play' or 'define'
        this.currentPhase = 'play';
        // Die App erhält eine Sudoku-Tabelle. Die als HTML schon existierende Tabelle 
        // erhält hier einen Javascript Wrapper.

        // Die App hat bisher vier  Dialoge
        this.storageSaveDialog = new StorageSaveDialog();
        this.storageRestoreDialog = new StorageRestoreDialog();
        this.storageDeleteDialog = new StorageDeleteDialog();
        this.successDialog = new SuccessDialog();

        // Der Zustandsspeicher
        this.sudokuStorage = new SudokuStateStorage();
        // Die Hauptansicht
        this.suGrid = new SudokuGrid();

        // Die App kennt zwei Ausführungsmodi.
        this.autoExecOn = false;
        this.runner;

        //Die Buttons der App werden Event-Handler zugeordnet
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

        document.querySelector('#speedSetting').addEventListener('input', (e) => {
            sudoApp.runner.setSpeed(e.target.value);
        });

        // Die beiden Phase-button 
        document.querySelector('#btn-define').addEventListener('click', () => {
            sudoApp.setGamePhase('define');
            this.runner.stopTimer();
            this.runner.init();
            this.setAutoExecOff();
            this.suGrid.deselect();
        });
        document.querySelector('#btn-play').addEventListener('click', () => {
            sudoApp.setGamePhase('play');
            this.runner.stopTimer();
            this.runner.init();
            this.setAutoExecOff();
            this.suGrid.deselect();
        });

        // Automatische Ausführung: schrittweise
        document.querySelector('#btn-autoStep').addEventListener('click', () => {
            if (this.autoExecOn) {
                this.runner.triggerAutoStep();
            } else {
                if (this.runner.deadlockReached()) {
                    alert("Keine (weitere) Lösung gefunden!");
                } else {
                    this.setGamePhase('play');
                    this.setAutoExecOn();
                    this.suGrid.deselect();
                    this.runner.triggerAutoStep();
                }
            }
        });

        // Automatische Ausführung: starten bzw. fortsetzen
        document.querySelector('#btn-run').addEventListener('click', () => {
            if (this.autoExecOn) {
                this.runner.startTimer();
            } else {
                if (this.runner.deadlockReached()) {
                    alert("Keine (weitere) Lösung gefunden!");
                } else {
                    this.setGamePhase('play');
                    this.setAutoExecOn();
                    this.suGrid.deselect();
                    this.runner.init();
                    this.successDialog.close();
                    this.runner.startTimer();
                }
            }
        });

        // Automatische Ausführung pausieren
        document.querySelector('#btn-pause').addEventListener('click', () => {
            sudoApp.runner.stopTimer();
        });

        // Automatische Ausführung beenden
        document.querySelector('#btn-stop').addEventListener('click', () => {
            this.runner.stopTimer();
            this.runner.init();
            this.setAutoExecOff();
            this.suGrid.deselect();
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
        this.successDialog.close();

        // Die Sudoku-Tabelle wird geladen.
        // Schritt 1: Lade die DOM-Tabelle in die internen Wrapper-Objekte
        this.suGrid.createGrid();
        // Schritt 2: 
        this.suGrid.initGrid();
        // Die App kann in verschiedenen Ausführungsmodi sein
        // 'automatic' 'manual'
        this.setGamePhase('define');
        this.setAutoExecOff();
        // Ein neuer Runner wird angelegt und initialisert
        this.runner = new AutomatedRunnerOnGrid(this.suGrid);
        this.runner.init();
        this.sudokuStorage.init();
    }

    setAutoExecOn() {
        if (!this.autoExecOn) {
            this.autoExecOn = true;
            this.runner.init();
            this.successDialog.close();
            this.displayOnOffStatus();
        }
    }

    setAutoExecOff() {
        this.autoExecOn = false;
        this.suGrid.removeAutoExecCellInfos();
        this.displayOnOffStatus();
    }

    autoExecIsOn() {
        return this.autoExecOn;
    }

    displayOnOffStatus() {
        let manualGroup = document.getElementById("manual-exec-btns");
        let autoGroup = document.getElementById("automatic-exec");
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

    numberButtonPressed(btnNumber) {
        // Ist manuelle Operation
        if (this.autoExecOn) {
            this.runner.stopTimer();
            this.runner.init();
            this.successDialog.close();
            this.setAutoExecOff();
        } else {
            this.suGrid.atCurrentSelectionSetNumber(btnNumber, this.currentPhase, false);
            this.runner.displayProgress();
        }
    }
    deleteCellButtonPressed() {
        // Ist manuelle Operation
        if (this.autoExecOn) {
            this.runner.stopTimer();
            this.runner.init();
            this.successDialog.close();
            this.setAutoExecOff();
            this.suGrid.deselect();
        } else {
            this.suGrid.deleteSelected(this.currentPhase, false);
            this.runner.displayProgress();
        }
    }

    initButtonPressed() {
        this.runner.stopTimer()
        this.runner.init();
        this.successDialog.close();
        this.setAutoExecOff();
        this.suGrid.deselect();
        this.suGrid.initGrid();
        this.runner.displayProgress();
        this.setGamePhase('define');
    }

    resetBtnPressed() {
        this.runner.stopTimer();
        this.runner.init();
        this.successDialog.close();
        this.setAutoExecOff();
        this.suGrid.deselect();
        this.suGrid.reset();
        this.runner.displayProgress();
    }

    saveBtnPressed() {
        // Zustand soll gespeichert werden
        this.runner.stopTimer();
        this.runner.init();
        this.successDialog.close();
        this.setAutoExecOff();
        let tmpNameList = this.sudokuStorage.getNameList();
        this.storageSaveDialog.open(tmpNameList);
    }

    restoreBtnPressed() {
        // Zustand soll wiederhergestellt werden
        this.runner.stopTimer();
        this.runner.init();
        this.successDialog.close();
        this.setAutoExecOff();
        let tmpNameList = this.sudokuStorage.getNameList();
        this.storageRestoreDialog.open(tmpNameList);
    }
    deleteBtnPressed() {
        // Zustand soll gelöscht werden
        this.runner.stopTimer();
        this.runner.init();
        this.successDialog.close();
        this.setAutoExecOff();
        let tmpNameList = this.sudokuStorage.getNameList();
        this.storageDeleteDialog.open(tmpNameList);
    }

    sudokuCellPressed(cellNode, index) {
        if (this.autoExecOn) {
            this.runner.stopTimer();
            this.runner.init();
            this.successDialog.close();
            this.setAutoExecOff();
            this.suGrid.deselect();
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
            //Lösche aktuelle Selektion
            this.suGrid.deselect();
            // Setze den aus dem Speicher geholten Zustand
            this.suGrid.setCurrentState(tmpState);
            this.runner.displayProgress();
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

    comboBoxNameSelected(comboBoxNode, e) {
        comboBoxNode.setInputField(e.target.value);
    }

    getPhase() {
        return this.currentPhase;
    }

    successDlgOKPressed() {
        this.successDialog.close();
        if (sudoApp.successDialog.further()) {
            this.runner.setAutoDirection('backward');
            this.runner.startTimer();
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
    }
}

//========================================================================
class Stepper {
    constructor() {
        this.currentStep = new OptionStep(null, -1, ['0']);
        this.maxDepth = 0;
        // console.log("Tiefe 0");
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
    isOpen(nr) {
        for (let i = 0; i < this.myNextOptions.length; i++) {
            if (this.myNextOptions[i] == nr) {
                return true;
            }
        }
        return false;
    }
    options() {
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
    options() {
        return this.myOwnerPath.options(this.myStepsIndex);
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
    options(currentIndex) {
        let tmpOptions = [];
        if (currentIndex > 0) {
            // Nur eine Option mitten im Pfad
            let tmpOption = {
                value: this.myRealSteps[currentIndex].getValue(),
                open: false
            }
            tmpOptions.push(tmpOption);
        } else {
            // Der erste Schritt im Pfad
            if (this.myValue == '0') {
                // Der Wurzelpfad
                let tmpOption = {
                    value: this.myRealSteps[currentIndex].getValue(),
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
        // console.log("Tiefe " + this.myLastOptionStep.getDepth());
        // Damit ist dieser Pfad beendet. Es kann nur in seinen Subpfaden weitergehen
        return this.myLastOptionStep;
    }

    getValue() {
        return this.myValue;
    }

    previousFromRealStep(currentIndex) {
        // Rückwärts vom RealStep
        if (currentIndex == 0) {
            return this.myOwnerStep;
        } else {
            // der vorige step liegt in diesem Path
            return this.myRealSteps[currentIndex - 1];
        }
    }
    previousFromOptionStep() {
        // Rückwärts vom OptionStep
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
        this.timer = false;
        this.execSpeed = 250;
        this.execSpeedLevel = 'fast';
        this.goneSteps = 0;
        this.countBackwards = 0;
        this.progressBar = new ProgressBar();
        this.autoDirection = 'forward';
        this.init();
    }

    init() {
        this.goneSteps = 0;
        this.countBackwards = 0;
        this.autoDirection = 'forward';
        // Der Runner hat immer einen aktuellen Stepper
        this.myStepper = new Stepper();
        this.displayStatus();
    }

    displayStatus() {
        this.displayDepth();
        this.displayAutoDirection();
        this.displayProgress();
        this.displayGoneSteps();
        this.displaySpeedSetting();
    }
    displaySpeedSetting() {
        let element = document.getElementById('speedSetting');
        element.value = this.execSpeedLevel;
    }

    displayGoneSteps() {
        let goneStepsNode = document.getElementById("step-count");
        goneStepsNode.textContent = this.goneSteps;
    }

    displayAutoDirection() {
        let forwardNode = document.getElementById("radio-forward");
        let backwardNode = document.getElementById("radio-backward");
        if (this.autoDirection == 'forward') {
            forwardNode.classList.add('checked');
            backwardNode.classList.remove('checked');
        } else {
            forwardNode.classList.remove('checked');
            backwardNode.classList.add('checked');
        }
    }

    displayDepth() {
        let depth = document.getElementById("search-depth");
        let maxDepth = document.getElementById("search-max-depth");
        this.myStepper.getCurrentSearchDepth();
        depth.innerText = this.countBackwards;
        maxDepth.innerText = this.myStepper.getMaxSearchDepth();
    }

    displayProgress() {
        let countDef = this.suGrid.countDefSteps();
        let countTotal = this.suGrid.countSolvedSteps();
        this.progressBar.setValue(countDef, countTotal);
    }


    setAutoDirection(direction) {
        this.autoDirection = direction;
        this.displayAutoDirection();
    }

    getAutoDirection() {
        return this.autoDirection;
    }

    setSpeed(value) {
        switch (value) {
            case 'very-slow': {
                //Schritt pro 2 Sekunden
                this.execSpeedLevel = value;
                this.execSpeed = 2000;
                break;
            }
            case 'slow': {
                //Schritt pro 1 Sekunde
                this.execSpeedLevel = value;
                this.execSpeed = 1000;
                break;
            }
            case 'normal': {
                //Schritt pro 0,5 Sekunden
                this.execSpeedLevel = value;
                this.execSpeed = 500;
                break;
            }
            case 'fast': {
                //Schritt pro 0,25  Sekunden
                this.execSpeedLevel = value;
                this.execSpeed = 125;
                break;
            }
            case 'very-fast': {
                //Schritt pro 0,125  Sekunden
                this.execSpeedLevel = value;
                this.execSpeed = 75;
                break;
            }
            default: {
                alert('Softwarefehler: unbekannte Geschwindigkeitseingabe');
            }
        }
        // Nur, wenn der Timer läuft
        // Also nur im laufenden Betrieb.Denn sonst schaltet diese Operation den runner ein.
        if (this.isRunning()) {
            window.clearInterval(this.timer);
            this.timer = window.setInterval(() => { sudoApp.runner.triggerAutoStep(); }, this.execSpeed);
        }
    }

    isRunning() {
        // Trickprogrammierung:
        return this.timer !== false;
    }

    startTimer() {
        if (!this.isRunning()) {
            this.timer = window.setInterval(() => { sudoApp.runner.triggerAutoStep(); }, this.execSpeed);
        }
    }

    stopTimer() {
        // Die automatische Ausführung
        window.clearInterval(this.timer);
        this.timer = false;
    }

    triggerAutoStep() {
        let result = this.autoStep();
        this.displayStatus();
        if (result == 'success') {
            if (this.isRunning()) {
                this.stopTimer();
            }
            sudoApp.successDialog.open();
        } else if (result == 'fail') {
            this.stopTimer();
            alert("Keine (weitere) Lösung gefunden!");
        } else {
            // 'inProgress'
            // Keine Aktion
        }
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
        let currentStep = this.myStepper.getCurrentStep();
        if (this.suGrid.indexSelected == -1) {
            // Annahmen:
            // a) Noch keine nächste Zelle für eine Nummernsetzung selektiert.
            // b) Noch keine dazu passende zu setzende Nummer im aktuellen Realstep gespeichert
            // Zielzustand:
            // a) Die nächste Zelle für eine Nummernsetzung ist selektiert.
            // b) Die zu setzende Nummer ist im neuen, aktuellen Realstep gespeichert

            // ====================================================================================
            // Aktion: Die nächste Zelle selektieren
            // ====================================================================================
            // Aktion Fall 1: Der Stepper steht auf einem echten Optionstep (nicht die Wurzel), 
            // d.h.die nächste Selektion ist die nächste Option dieses Schrittes
            if (currentStep instanceof OptionStep &&
                currentStep.getCellIndex() !== -1) {
                // Lege einen neuen Step an mit der Nummer der nächsten Option
                let realStep = this.myStepper.getNextRealStep();
                // Selektiere die Zelle des Optionsteps, deren Index auch im neuen Realstep gespeichert ist
                this.suGrid.indexSelect(realStep.getCellIndex());
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
                this.suGrid.indexSelect(tmpSelection.index);
                // ================================================================================
                // Jetzt muss für diese Selektion eine Nummer bestimmt werden.
                // Ergebnis wird sein: realStep mit Nummer
                let tmpValue = '0';
                if (tmpSelection.options.length == 1) { tmpValue = tmpSelection.options[0]; }
                if (tmpSelection.necessaryOnes.length == 1) { tmpValue = tmpSelection.necessaryOnes[0]; }
                if (!(tmpValue == '0')) {
                    // Die Selektion hat eine eindeutige Nummer. D.h. es geht eindeutig weiter.
                    // Lege neuen Realstep mit der eindeutigen Nummer an
                    this.myStepper.addRealStep(tmpSelection.index, tmpValue);
                    return 'inProgress';
                } else {
                    // =============================================================================
                    // Die Selektion hat keine eindeutige Nummer. D.h. es geht mit mehreren Optionen weiter.
                    this.myStepper.addOptionStep(tmpSelection.index, tmpSelection.options.slice());
                    // Die erste Option des Optionsschrittes, wird gleich gewählt
                    // Neuer realstep mit der ersten Optionsnummer
                    let realStep = this.myStepper.getNextRealStep();
                    return 'inProgress';
                }
            }
        } else {
            // Annahmen:
            // a) Die nächste Zelle für eine Nummernsetzung ist selektiert.
            // b) Die zu setzende Nummer ist im aktuellen Realstep gespeichert
            // Aktion:
            // Setze die eindeutige Nummer
            this.suGrid.atCurrentSelectionSetAutoNumber(currentStep);
            this.goneSteps++;
            // Falls die Nummernsetzung zur Unlösbarkeit führt
            // muss der Solver zurückgehen
            if (this.deadlockReached()) {
                this.setAutoDirection('backward');
                this.countBackwards++;
            }
            return 'inProgress';
        }
    }

    stepBackward() {
        // Wenn die letzte gesetzte Nummer zur Unlösbarkeit des Sudokus führt, 
        // muss der Solver rückwärts gehen.
        let currentStep = this.myStepper.getCurrentStep();
        if (currentStep instanceof OptionStep) {
            if (currentStep.getCellIndex() == -1) {
                // Im Wurzel-Optionsschritt gibt es keine Option mehr
                // Spielende, keine Lösung
                return 'fail';
            }
            if (currentStep.isCompleted()) {
                // Der Optionstep ist vollständig abgearbeitet
                // Deshalb wird der Vorgänger dieses Optionsteps neuer aktueller Step
                this.myStepper.previousStep();
                return this.stepBackward();
            } else {
                // Es gibt noch nicht probierte Optionen
                // Suchrichtung umschalten!!
                this.setAutoDirection('forward');
                return this.stepForward();
            }
        } else if (currentStep instanceof RealStep) {
            if (this.suGrid.indexSelected !== currentStep.getCellIndex()) {
                // Fall 1: Keine oder eine falsch selektierte Zelle
                this.suGrid.indexSelect(currentStep.getCellIndex());
                // In der Matrix ist die Zelle des aktuellen Schrittes selektiert
                return 'inProgress';
            }
            // Fall 2: 
            // Startzustand
            // a) In der Matrix ist die Zelle des aktuellen Schrittes selektiert
            // b) Die selektierte Zelle ist noch nicht gelöscht
            if (this.suGrid.sudoCells[currentStep.getCellIndex()].value() !== '0') {
                this.goneSteps++;
                this.suGrid.deleteSelected('play', false);
                // Nach Löschen der Zelle den neuen aktuellen Schritt bestimmen
                let prevStep = this.myStepper.previousStep();
                return 'inProgress'
            }
        }
    }

    calculateMinSelectionFrom(selectionList) {
        // return this.calculateMinSelectionFromBest(selectionList);
        return this.calculateMinSelectionFromExperiment1(selectionList);
    }
    calculateMinSelectionFromExperiment1(selectionList) {
        // Berechnet die nächste Selektion
        // Nicht eindeutig; Anfangs gibt es oft mehrere Zellen mit
        // nur einer zulässigen Nummer
        // In der Regel sind das Zellen mit 2 Optionsnummern.
        //  console.log('');
        let maxSelection = selectionList[0];
        let maxIndex = maxSelection.index;
        // Wenige Optionen werden bevorzugt
        let maxLengthFactor = Math.floor(1000 / maxSelection.options.length);
        let maxWeight = maxLengthFactor + this.suGrid.sudoCells[maxIndex].countMyInfluencersWeight();
        for (let i = 1; i < selectionList.length; i++) {
            let currentSelection = selectionList[i];
            let currentIndex = currentSelection.index;
            let currentLengthFactor = Math.floor(1000 / currentSelection.options.length);
            let currentWeight = currentLengthFactor + this.suGrid.sudoCells[currentIndex].countMyInfluencersWeight();
            //    console.log('Laufende-Zelle: ' + currentIndex + ', Gewicht: ' + currentWeight + '   Max-Zelle: ' + maxIndex + ', Gewicht: ' + maxWeight);
            if (currentWeight > maxWeight) {
                maxSelection = currentSelection;
                maxIndex = currentIndex;
                maxWeight = currentWeight;
            }
        }
        // console.log('Entscheidung: ' + maxIndex + ', Gewicht: ' + maxWeight);
        return maxSelection;


    }

    calculateMinSelectionFromBest(selectionList) {
        // Berechnet die nächste Selektion
        // Nicht eindeutig; Anfangs gibt es oft mehrere Zellen mit
        // nur einer zulässigen Nummer
        let minSelection = selectionList[0];
        let minLength = minSelection.options.length;
        let minIndex = minSelection.index;
        for (let i = 1; i < selectionList.length; i++) {
            let currentSelection = selectionList[i];
            let currentLength = currentSelection.options.length;
            let currentIndex = currentSelection.index;
            if (currentLength < minLength) {
                // Zellen mit weniger Optionen werden bevorzugt
                minSelection = currentSelection;
                minLength = currentLength;
                minIndex = currentIndex;
            } else if (currentLength == minLength) {
                // Bei Zellen mit gleicher Anzahl von Optionen (meist sind das 2 Optionen),
                // werden die Zellen mit einem größeren Endscheidungsgrad (= höheres Gewicht) bevorzugt.
                let maxWeight = this.suGrid.sudoCells[minIndex].countMyInfluencersWeight();;
                let currentWeight = this.suGrid.sudoCells[currentIndex].countMyInfluencersWeight();
                if (currentWeight >= maxWeight) {
                    minSelection = currentSelection;
                    minIndex = currentIndex;
                    maxWeight = currentWeight;
                }
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
                    options: Array.from(this.suGrid.sudoCells[i].getStrongPermissibleNumbers()),
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
        if (optionList.length == 0) {
            let emptySelection = {
                index: -1,
                options: [],
                necessaryOnes: []
            }
            return emptySelection;
        }
        //Bestimmt die nächste Zelle mit notwendiger Nummer unter den zulässigen Nummern
        let tmpNeccessary = this.calculateNeccesarySelectionFrom(optionList);
        if (tmpNeccessary.index !== -1) {
            return tmpNeccessary;
        }
        let tmpMin = this.calculateMinSelectionFrom(optionList);
        // Falls es keine notwendigen Nummern gibt:
        // Bestimmt eine nächste Zelle mit minimaler Anzahl zulässiger Nummern
        // Diese Zelle ist nicht eindeuitig
        // Diese Zelle kann eine mit der vollen Optionsmenge sein
        return tmpMin;
    }
    deadlockReached() {
        // Deadlock ist erreicht, wenn es eine unlösbare Zelle gibt
        for (let i = 0; i < 81; i++) {
            if (this.suGrid.sudoCells[i].isInsolvable()) {
                return true;
            }
        }
        // Oder wenn es eine unlösbare Gruppe gibt
        for (let i = 0; i < 9; i++) {
            if (this.suGrid.sudoGroups[i].isInsolvable()) {
                return true;
            }
        }
        // Oder wenn es eine unlösbare Reihe gibt
        for (let i = 0; i < 9; i++) {
            if (this.suGrid.sudoRows[i].isInsolvable()) {
                return true;
            }
        }

        // Oder wenn es eine unlösbare Spalte gibt
        for (let i = 0; i < 9; i++) {
            if (this.suGrid.sudoCols[i].isInsolvable()) {
                return true;
            }
        }
        return false;
    }
}

class NineCellCollection {
    constructor(suTable) {
        // Die Collection kennt ihre Tabelle
        this.myGrid = suTable;
        this.myCells = [];
        // In jeder Gruppe, Spalte und Zeile müssen alle Zahlen 1..9 einmal vorkommen.
        // Für eine konkrete Gruppe, Spalte oder Zeile sind MissingNumbers Zahlen,
        // die nicht in ihr vorkommen.
        this.myMissingNumbers =new SudokuSet();
        this.myPairInfos = [];
    }
    clear() {
        this.myMissingNumbers =new SudokuSet();
        this.myPairInfos = [];
    }

    isInsolvable() {
        // Wenn eine Gruppe, Zeile oder Spalte MissingNumbers hat, ist das Sudoku unlösbar.
        // Wenn es eine Collection mit Conflicting Singles gibt, ist das Sudoku unlösbar.
        return (this.myMissingNumbers.size > 0 || this.withConflictingSingles());
    }

    calculateEqualPairs() {
        this.myPairInfos = [];
        // Iteriere über die Collection
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].value() == '0') {
                // let tmpPermissibles = this.myCells[i].getPermissibleNumbers()
                let tmpPermissibles = this.myCells[i].getStrongPermissibleNumbers()
                if (tmpPermissibles.size == 2) {
                    // Infos zum Paar speichern
                    let currentPair = new SudokuSet(tmpPermissibles);
                    // Prüfen, ob das Paar schon in der PaarInfoliste ist
                    if (this.myPairInfos.length == 0) {
                        let pairInfo = {
                            pairInfoIndex: i,
                            pairIndices: [this.myCells[i].getIndex()],
                            pairSet: tmpPermissibles
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
                                        pairSet: tmpPermissibles
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
        /*
        this.myPairInfos.forEach(pair => {
            console.log('Paar:');
            for (let item of pair.pairSet) console.log('    ' + item);
            console.log('   Anzahl Auftreten:' + pair.pairIndices.length)
        })
        */
    }

    calculateIndirectInadmissibleNumbers() {
        /* let tmpType = '';
        if (this instanceof SudokuGroup) { tmpType = 'Gruppe' };
        if (this instanceof SudokuRow) { tmpType = 'Reihe' };
        if (this instanceof SudokuCol) { tmpType = 'Spalte' };
        console.log('Berechnete Paare für ' + tmpType + ' Zellen:  '
            + ' ' + this.myCells[0].myIndex
            + ', ' + this.myCells[1].myIndex
            + ', ' + this.myCells[2].myIndex
            + ', ' + this.myCells[3].myIndex
            + ', ' + this.myCells[4].myIndex
            + ', ' + this.myCells[5].myIndex
            + ', ' + this.myCells[6].myIndex
            + ', ' + this.myCells[7].myIndex
            + ', ' + this.myCells[8].myIndex
        );

        */

        this.calculateEqualPairs();
        for (let i = 0; i < this.myPairInfos.length; i++) {
            if (this.myPairInfos[i].pairIndices.length == 2) {
                // Ein Paar, das zweimal in der Collection vorkommt
                let pair = this.myPairInfos[i].pairSet;
                // Prüfe, ob Nummern dieses Paar in den Permissibles der Collection vorkommen
                for (let j = 0; j < 9; j++) {
                    if (this.myCells[j].value() == '0') {
                        //console.log('');
                        //console.log('this.myCells[j].getIndex() = ' + this.myCells[j].getIndex());
                        //console.log('this.myPairInfos[i].pairIndices[0] = ' + this.myPairInfos[i].pairIndices[0]);
                        //console.log('this.myPairInfos[i].pairIndices[1] = ' + this.myPairInfos[i].pairIndices[1]);
                        if (this.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[0] &&
                            this.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[1]) {
                            // Zelle der Collection, die nicht Paar-Zelle ist
                            let tmpPermissibles = this.myCells[j].getPermissibleNumbers();
                            let tmpIntersection = tmpPermissibles.intersection(pair);
                            this.myCells[j].myIndirectInadmissibleNumbers = tmpIntersection;
                        }
                    }
                }
            }
        }
    }


    calculateMissingNumbers() {
        let missingNumbers =new SudokuSet(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
        // Prüfe alle Zellen der Gruppe
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].value() !== '0') {
                // Entferne die gesetzten Nummern der Gruppe aus missingNumbers
                missingNumbers.delete(this.myCells[i].value());
            } else {
                //Entferne die Permissibles jeder Zelle der Gruppe aus missingNumbers
                let permNumbers = this.myCells[i].getPermissibleNumbers();
                permNumbers.forEach(e => { missingNumbers.delete(e) });
            }
        }
        this.myMissingNumbers = missingNumbers;
    }

    calculateNecessaryNumbers() {
        // Notwendige Nummern sind zulässige Nummern einer Zelle,
        // die in der Gruppe, Reihe oder Spalte der Zelle genau einmal vorkommen.
        // Hinweis: in den Influencer-Zellen insgesamt können sie dennoch mehrfach
        // vorkommen. Deshalb muss diese Prüfung hier stattfinden.
        for (let i = 1; i < 10; i++) {
            let cellIndex = this.occursOnce(i);
            // Wenn die Nummer i genau einmal in der Collection vorkommt
            // trage sie ein in der Necessary-liste der Zelle
            if (cellIndex !== -1) {
                this.myCells[cellIndex].setNecessary(i.toString());
            }
        }
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
            if (this.myCells[i].value() == '0') {
                if (this.myCells[i].hasThisPermNr(permNr)) {
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
        // Conflicting singles sind zwei oder mehr singles in einer Collection, 
        // die dieselbe eine zulässige Nummer haben. Sie fordern ja, dass dieselbe Nummer zweimal
        // in der Collection vorkommen soll. Mit anderen Worten: 
        // Wenn es eine Collection mit Conflicting Singles gibt, ist das Sudoku unlösbar.

        // Idee: Zähle für jede Nummer 1 .. 9 die Häufigkeit ihres Auftretens
        // numberCounts[0] = Häufigkeit der 1, 
        // numberCounts[1] = Häufigkeit der 2, 
        // usw.
        let numberCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let found = false;
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].value() == '0') {
                // Wir betrachten nur offene Zellen
                // Denn, wenn eine der Konfliktzellen geschlossen wäre, würde
                // die noch offene Zelle ohne zulässige Nummer sein. Eine offene Zelle
                // ohne zulässige Nummer fangen wir schon an anderer Stelle ab.
                let permNumbers = this.myCells[i].getPermissibleNumbers();
                if (permNumbers.size == 1) {
                    permNumbers.forEach(nr => {
                        let iNr = parseInt(nr);
                        numberCounts[iNr - 1]++;
                        if (numberCounts[iNr - 1] > 1) {
                            found = true;
                        };
                    });
                }
            }
            // Wenn wir den ersten Konflikt gefunden haben, können wir die Suche
            // abbrechen. 
            if (found) return true;
        }
        return false;
    }

}

class SudokuGroup extends NineCellCollection {
    constructor(suTable, groupNode, groupIndex) {
        // Die Gruppe kennt ihre Tabelle und ihren Index
        super(suTable);
        this.myGroupIndex = groupIndex;
        this.myGroupNode = groupNode;
    }

    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setGroup(this);
    }
    unsetError() {
        this.myGroupNode.classList.remove('err');
    }
    setError() {
        this.myGroupNode.classList.add('err');
        this.myGroupNode.classList.add('cell-err');
        setTimeout(() => {
            this.myGroupNode.classList.remove('cell-err');
        }, 500);

    }
}
class SudokuRow extends NineCellCollection {
    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setRow(this);
    }
    unsetError() {
        this.myCells.forEach(cell => { cell.unsetRowError(); })
    }
    setError() {
        this.myCells.forEach(cell => { cell.setRowError(); })
    }
}

class SudokuCol extends NineCellCollection {
    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setCol(this);
    }
    unsetError() {
        this.myCells.forEach(cell => { cell.unsetColError(); })
    }
    setError() {
        this.myCells.forEach(cell => { cell.setColError(); })
    }
}

class SudokuGrid {
    constructor() {
        // Speichert die Sudokuzellen in der DOM-Version
        this.cells = [];
        // Speichert die Sudokuzellen in der Wrapper-Version
        this.sudoCells = [];
        // Speichert die Wrapper-Zellen in Gruppen
        this.groups = [];
        this.sudoGroups = [];
        this.sudoRows = [];
        this.sudoCols = [];
        // Speichert die aktuell selektierte Zelle und ihren Index
        this.selectedCell = undefined;
        this.indexSelected = -1;
    }

    getCells() {
        return this.sudoCells;
    }

    clearCells() {
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].clear();
        }
    }

    clearGroups() {
        for (let i = 0; i < 9; i++) {
            let tmpGroup = this.sudoGroups[i];
            tmpGroup.clear();
        }
    }
    clearRows() {
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            tmpRow.clear();
        }
    }
    clearCols() {
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            tmpCol.clear();
        }
    }
    initGrid() {
        // Die Tabelle wird initialisert
        // Schritt 1: Die aktuelle Zellenselektion wird zurückgesetzt
        this.initCurrentSelection();
        // Die aktuellen Zellinhalte werden gelöscht
        this.clearCells();
        // Die für die Zellen zulässigen Inhalte 
        // werden neu berechnet.
        this.refresh();
    }

    removeAutoExecCellInfos() {
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].clearAutoExecInfo();
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

    countDefSteps() {
        let tmp = 0;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getPhase() == 'define') {
                tmp++;
            }
        }
        return tmp;
    }

    reset() {
        // Alle in der Phase 'play' gesetzten Zahlen werden gelöscht
        // Die Zellen der Aufgabenstellung bleiben erhalten
        // Schritt 1: Die aktuelle Selektion wird zurückgesetzt
        this.initCurrentSelection();
        //this.initActionHistory();
        // Schritt 2: Die aktuellen Zellinhalte werden gelöscht
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getPhase() !== 'define') {
                this.sudoCells[i].clear();
            }
        }
        this.refresh();
    }

    getCurrentState() {
        // Zusammenstellung des Zustandes, um ihn abspeichern zu können
        let tmpGrid = [];
        for (let i = 0; i < 81; i++) {
            let storedCell = {
                cellValue: this.sudoCells[i].value(),
                cellPhase: this.sudoCells[i].getPhase()
            };
            tmpGrid.push(storedCell);
        }
        return tmpGrid;
    }

    setCurrentState(previousState) {
        for (let i = 0; i < 81; i++) {
            let storedCell = previousState.shift();
            this.sudoCells[i].massSetNumber(storedCell.cellValue, storedCell.cellPhase);
        }
        this.refresh();
    }

    createGrid() {
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

        let sudoGridNode = document.getElementById("main-sudoku-grid");
        // Die 9 Gruppen anlegen
        for (let i = 0; i < 9; i++) {
            let groupNode = document.createElement("div");
            groupNode.setAttribute("class", "sudoku-group");
            this.groups.push(groupNode);
            //Neue Gruppe in den Baum einhängen
            sudoGridNode.appendChild(groupNode);
            // Die Wrapper-Zellen für die DOM-Zellen werden erzeugt
            // und im Array sudoGroups gespeicehrt
            let tmpSudoGroup = new SudokuGroup(this, groupNode, i);
            this.sudoGroups.push(tmpSudoGroup);
        }
        // Die 81 Zellen anlegen
        for (let i = 0; i < 81; i++) {
            let row = Math.floor(i / 9);
            let col = i % 9;
            let groupRow = Math.floor(row / 3);
            let groupCol = Math.floor(col / 3);

            let cellNode = document.createElement("div");
            cellNode.setAttribute("class", "sudoku-grid-cell");
            this.cells.push(cellNode);
            // Neue Zelle in ihre Gruppe einhängen
            let tmpGroupIndex = calcIndex(groupRow, groupCol);
            this.groups[tmpGroupIndex].appendChild(cellNode);
            // Die Wrapper-Zellen für die DOM-Zellen werden erzeugt
            // und im Array sudoCells gespeicehrt
            let tmpSudoCell = new SudokuCell(this, i, cellNode);
            this.sudoCells.push(tmpSudoCell);
            // Gleichzeitig werden die Wrapper-Zellen in Gruppen-Wrapper gespeichert.
            // Die Tabelle besitzt 9 Gruppen mit jeweils 9 Zellen.
            this.sudoGroups[tmpGroupIndex].addCell(tmpSudoCell);
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
            let col = new SudokuCol();
            this.sudoCols.push(col);
        }
        for (let i = 0; i < 9; i++) {
            // Ein Row-Vektor wird angelegt
            let row = new SudokuRow();
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

    atCurrentSelectionSetNumber(btnNumber, currentPhase) {
        // Setze Nummer in einer Zelle
        if ( // Das geht nur, wenn eine Zelle selektiert ist
            this.isCellSelected()) {
            if (// Wenn die Zelle leer ist, kein Problem
                (this.selectedCell.value() == '0') ||
                // Wenn die Zelle geüllt ist, kann nur im gleichen Modus
                // eine Neusetzung erfolgen
                (this.selectedCell.getPhase() == currentPhase)
            ) {
                this.selectedCell.setNumber(btnNumber, currentPhase);
                this.refresh();
                this.deselect();
            }
        }
    }

    atCurrentSelectionSetAutoNumber(currentStep) {
        // Setze Nummer in einer Zelle
        if ( // Das geht nur, wenn eine Zelle selektiert ist
            this.isCellSelected()) {
            if (// Wenn die Zelle leer ist, kein Problem
                (this.selectedCell.value() == '0') ||
                // Wenn die Zelle geüllt ist, kann nur im gleichen Modus
                // eine Neusetzung erfolgen
                (this.selectedCell.getPhase() == 'play')
            ) {
                this.selectedCell.autoSetNumber(currentStep);
                this.refresh();
                this.deselect();
            }
        }
    }

    deleteSelected(currentPhase, undoOp) {
        // Lösche die selektierte Zelle
        if (this.isCellSelected()) {
            // Das Löschen kann nur im gleichen Modus
            // eine Neusetzung erfolgen
            if (this.selectedCell.getPhase() == currentPhase) {
                this.selectedCell.delete();
                this.refresh();
                this.deselect();
            }
        }
    }

    refresh() {
        this.clearGroups();
        this.clearRows();
        this.clearCols();
        this.calculatePermissibleNumbers();
        this.calculateIndirectInadmissibleNumbers();
        this.calculateNecessaryNumbers();
        this.calculateMissingNumbers();
        this.markErrorCells();
        this.markErrorGroups();
        this.markErrorRows();
        this.markErrorCols();
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


    calculatePermissibleNumbers() {
        // Berechne und setze für jede nicht gesetzte Zelle 
        // die noch möglichen Nummern
        for (let i = 0; i < this.sudoCells.length; i++) {
            let tmpCell = this.sudoCells[i];
            tmpCell.calculatePermissibleNumbers();
            // Nur leere Zellen erhalten zulässige Nummern
            if (tmpCell.value() == '0') {
                tmpCell.setPermissibleNumbers();
            }
        }
    }

    calculateIndirectInadmissibleNumbers() {
        function traverseCollections() {
            // Iteriere über die Gruppen
            for (let i = 0; i < 9; i++) {
                let tmpGroup = sudoApp.suGrid.sudoGroups[i];
                tmpGroup.calculateIndirectInadmissibleNumbers();
            }
            // Iteriere über die Reihen
            for (let i = 0; i < 9; i++) {
                let tmpRow = sudoApp.suGrid.sudoRows[i];
                tmpRow.calculateIndirectInadmissibleNumbers();
            }
            // Iteriere über die Spalten
            for (let i = 0; i < 9; i++) {
                let tmpCol = sudoApp.suGrid.sudoCols[i];
                tmpCol.calculateIndirectInadmissibleNumbers();
            }
        }

        function setzeAnzeige() {
            for (let i = 0; i < sudoApp.suGrid.sudoCells.length; i++) {
                let tmpCell = sudoApp.suGrid.sudoCells[i];
                if (tmpCell.value() == '0') {
                    // Setze die Anzeige
                    tmpCell.myIndirectInadmissibleNumbers.forEach(nr => {
                        tmpCell.setIndirectInadmissibleNumber(nr);
                    });
                }
            }
        }

        // Initialisierung
        for (let i = 0; i < this.sudoCells.length; i++) {
            let tmpCell = this.sudoCells[i];
            tmpCell.clearIndirectInadmissibleNumbers();
        }

        let startCount = -1;
        let iterationCount = 0;
        // Wiederhole die Berechnung bis keine Änderung mehr auftritt
        traverseCollections();
        setzeAnzeige();
        /*     
                while (startCount !== iterationCount) {
                    startCount = iterationCount;
                    iterationCount = 0;
                    traverseCollections();
                    for (let i = 0; i < 81; i++) {
                        if (sudoApp.suGrid.sudoCells[i].value() == '0') {
                            iterationCount = iterationCount + sudoApp.suGrid.sudoCells[i].myIndirectInadmissibleNumbers.size
                        }
                    }
                    setzeAnzeige();
                }
        */
    }

    calculateNecessaryNumbers() {
        // Berechne und setze für jede nicht gesetzte Zelle
        // in der Menge ihrer möglichen Nummern die
        // notwendigen Nummern
        // Necessary-Einträge initialisieren
        for (let i = 0; i < this.sudoCells.length; i++) {
            let tmpCell = this.sudoCells[i];
            if (tmpCell.value() == '0') {
                tmpCell.clearNecessarys();
            }
        }
        // Iteriere über die Gruppen
        for (let i = 0; i < 9; i++) {
            let tmpGroup = this.sudoGroups[i];
            tmpGroup.calculateNecessaryNumbers();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            tmpRow.calculateNecessaryNumbers();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            tmpCol.calculateNecessaryNumbers();
        }
    }

    calculateMissingNumbers() {
        // Iteriere über die Gruppen
        for (let i = 0; i < 9; i++) {
            let tmpGroup = this.sudoGroups[i];
            tmpGroup.calculateMissingNumbers();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            tmpRow.calculateMissingNumbers();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            tmpCol.calculateMissingNumbers();
        }

    }

    markErrorCells() {
        for (let i = 0; i < this.sudoCells.length; i++) {
            let tmpCell = this.sudoCells[i];
            tmpCell.unsetError();
            if (tmpCell.isInsolvable()) {
                tmpCell.setError();
            }
        }
    }

    markErrorGroups() {
        for (let i = 0; i < 9; i++) {
            let tmpGroup = this.sudoGroups[i];
            tmpGroup.unsetError();
            if (tmpGroup.isInsolvable()) {
                tmpGroup.setError();
            }
        }
    }

    markErrorRows() {
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            tmpRow.unsetError();
            if (tmpRow.isInsolvable()) {
                tmpRow.setError();
            }
        }
    }

    markErrorCols() {
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            tmpCol.unsetError();
            if (tmpCol.isInsolvable()) {
                tmpCol.setError();
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

        let indexSet =new SudokuSet();
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



class SudokuCell {
    constructor(suTable, index, cellNode) {
        // Die Zelle kennt ihre Tabelle und ihren Index
        this.myGrid = suTable;
        this.myIndex = index;
        // Die Zelle kennt ihre DOM-Version
        this.myCellNode = cellNode;
        // Mit der Erzeugung des Wrappers wird
        // auch der Eventhandler der Zelle gesetzt
        this.myCellNode.addEventListener('click', () => {
            sudoApp.sudokuCellPressed(cellNode, index);
        });
        // Speichert die Phase, die beim Setzen einer Nummer
        // in der Zelle aktuell war.
        this.myGamePhase = '';
        this.myGroup;
        this.myRow;
        this.myCol;
        this.myCellNode;
        // Speichert ein für alle mal bei der Initialisierung
        // die beeinflussenden Zellen dieser Zelle
        this.myInfluencers = [];
        // Speichert die aktuell zulässigen Zahlen für diese Zelle
        this.myPermissibles =new SudokuSet();
        // Nummern, die Paar-Widersprüche erzeugen, wenn sie gesetzt würden.
        this.myIndirectInadmissibleNumbers = new SudokuSet();
        // Speichert, falls vorhanden notwendige Zahlen dieser Zelle. 
        // Mehr als eine bedeuten einen Widerspruch in der Lösung.
        this.myNecessarys = new SudokuSet();
    }
    initNecessarys() {
        this.myNecessarys = new SudokuSet();
    }



    clear() {
        this.initNecessarys();
        this.unsetNumber();
        this.unsetError();
        this.unsetRowError();
        this.unsetColError();
    }
    getNecessaryNumbers() {
        return this.myNecessarys;
    }
    setInfluencers(influencers) {
        this.myInfluencers = influencers;
    }

    setGroup(group) {
        this.myGroup = group;
    }
    setRow(row) {
        this.myRow = row;
    }
    setCol(col) {
        this.myCol = col;
    }
    setNumber(number, gamePhase) {
        this.privateSetNumber(number, gamePhase);

        this.myCellNode.classList.add('zoom-in');
        setTimeout(() => {
            this.myCellNode.classList.remove('zoom-in');
        }, 500);
    }

    massSetNumber(number, gamePhase) {
        //Wird augerufen für die Wiederherstellung
        this.privateSetNumber(number, gamePhase);
    }

    privateSetNumber(number, gamePhase) {
        this.myCellNode.setAttribute('data-value', number);
        //remove permissible numbers
        while (this.myCellNode.firstChild) {
            this.myCellNode.removeChild(this.myCellNode.lastChild);
        }
        // Lösche die 'nested'-Klassifizierung 
        this.myCellNode.classList.remove('nested')
        this.myCellNode.classList.remove('err');

        //Setze das data-value Attribut der Zelle
        this.myCellNode.setAttribute('data-value', number);
        // Setze das Zahlelement
        this.myCellNode.innerHTML = number;
        // Notiere den Modus im Wrapper
        this.myGamePhase = gamePhase;
        // Setze die Klassifizierung in der DOM-Zelle
        if (gamePhase == 'define') {
            this.myCellNode.classList.add('define');
            this.myCellNode.classList.remove('play');
        } else {
            this.myCellNode.classList.add('play');
            this.myCellNode.classList.remove('define');
        }
    }

    autoSetNumber(currentStep) {
        let number = currentStep.getValue();
        this.myCellNode.setAttribute('data-value', number);
        //remove permissible numbers
        while (this.myCellNode.firstChild) {
            this.myCellNode.removeChild(this.myCellNode.lastChild);
        }
        // Lösche die 'nested'-Klassifizierung 
        this.myCellNode.classList.remove('nested')
        this.myCellNode.classList.remove('err');
        this.myCellNode.classList.remove('auto-value');

        // Notiere den Modus im Wrapper
        this.myGamePhase = 'play';
        // Setze die Klassifizierung in der DOM-Zelle
        this.myCellNode.classList.add('play');
        this.myCellNode.classList.remove('define');

        //Setze das data-value Attribut der Zelle
        this.myCellNode.setAttribute('data-value', number);
        // Klassifizire die Zelle als 'auto-value'
        this.myCellNode.classList.add('auto-value');
        // Die step-Nummer, also die wievielte Nummer wird gesetzt, setzen
        let stepNumber = this.myGrid.countSolvedSteps() - this.myGrid.countDefSteps();
        let autoStepNumberElement = document.createElement('div');
        autoStepNumberElement.setAttribute('class', 'auto-step-number');
        autoStepNumberElement.innerHTML = stepNumber;

        this.myCellNode.appendChild(autoStepNumberElement);

        // Die gesetzte Nummer selbst
        let cellNumberElement = document.createElement('div');
        cellNumberElement.setAttribute('data-value', number);
        cellNumberElement.setAttribute('class', 'auto-value');
        cellNumberElement.innerHTML = number;

        // Die optionalen Elemente dieser Zelle
        let options = currentStep.options();
        let optionNode = document.createElement('div');
        optionNode.setAttribute('class', 'value-options');
        let optionLength = options.length;
        if (optionLength > 2) {
            let startIndex = optionLength - 2;
            // Lange Liste beginnt mit Sternchen
            let optionNumberElement = document.createElement('div');
            optionNumberElement.setAttribute('data-value', '*');
            optionNumberElement.innerHTML = '*';
            optionNumberElement.setAttribute('class', 'open');
            optionNode.appendChild(optionNumberElement);
            //Die zwei weiteren der Liste
            for (let i = startIndex; i < options.length; i++) {
                let option = options[i];
                let optionNumberElement = document.createElement('div');
                optionNumberElement.setAttribute('data-value', option.value);
                if (option.open) {
                    optionNumberElement.setAttribute('class', 'open');
                }
                optionNumberElement.innerHTML = option.value;
                optionNode.appendChild(optionNumberElement);
            }
        } else {
            for (let i = 0; i < options.length; i++) {
                let option = options[i];
                let optionNumberElement = document.createElement('div');
                optionNumberElement.setAttribute('data-value', option.value);
                if (option.open) {
                    optionNumberElement.setAttribute('class', 'open');
                }
                optionNumberElement.innerHTML = option.value;
                optionNode.appendChild(optionNumberElement);
            }
        }
        // Das Paar aus der Nummer und den möglchen Nummern
        let autoValuePair = document.createElement('div');
        autoValuePair.setAttribute('class', 'autoValuePair');
        autoValuePair.appendChild(cellNumberElement);
        if (optionLength > 1) {
            autoValuePair.appendChild(optionNode);
        }
        this.myCellNode.appendChild(autoValuePair);
        this.myCellNode.classList.add('zoom-in');
        setTimeout(() => {
            this.myCellNode.classList.remove('zoom-in');
        }, 500);

    }
    clearAutoExecInfo() {
        //remove options
        if (this.myGamePhase == 'play') {
            while (this.myCellNode.firstChild) {
                this.myCellNode.removeChild(this.myCellNode.lastChild);
            }
            this.myCellNode.classList.remove('auto-value');
            // Setze das Zahlelement
            this.myCellNode.innerHTML = this.myCellNode.getAttribute('data-value');
        }
    }

    unsetNumber() {
        // Setze das Value-Attribut im Knoten auf 0
        // Damit kann man leicht eine leere Zelle bestimmen
        this.myCellNode.setAttribute('data-value', '0');
        this.myCellNode.innerHTML = '';
        this.myGamePhase = '';
        // Lösche die gegebenfalls vorhandene Define-KLassifizierung
        this.myCellNode.classList.remove('define');
        this.myCellNode.classList.remove('play');
        this.myCellNode.classList.remove('auto-value');

        this.myCellNode.classList.add('zoom-in');
        setTimeout(() => {
            this.myCellNode.classList.remove('zoom-in');
        }, 500);

        // Hinweis: Die Neuberechnung der möglchen und notwendigen
        // Zahlen erfolgt auf Tabellenebene. 
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

    setRowError() {
        this.myCellNode.classList.add('row-err');
        this.myCellNode.classList.add('cell-err');
        setTimeout(() => {
            this.myCellNode.classList.remove('cell-err');
        }, 500);
    }

    unsetRowError() {
        this.myCellNode.classList.remove('row-err');
    }
    setColError() {
        this.myCellNode.classList.add('col-err');
        this.myCellNode.classList.add('cell-err');
        setTimeout(() => {
            this.myCellNode.classList.remove('cell-err');
        }, 500);
    }

    unsetColError() {
        this.myCellNode.classList.remove('col-err');
    }



    getPhase() {
        return this.myGamePhase;
    }

    select() {
        this.myCellNode.classList.add('selected');
        // this.myInfluencers.forEach(e => e.setSelected());
    }

    setSelected() {
        this.myCellNode.classList.add('hover');
    }

    deselect() {
        this.myCellNode.classList.remove('selected');
        // this.myInfluencers.forEach(e => e.unsetSelected());
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

    calculateDirectInadmissibleNumbers() {
        // Direkt unzulässige Nummern sind Nummern,
        // die in der Gruppe, Zeile oder Spalte der Zelle schon gesetzt sind 
        let inAdmissibles = new SudokuSet();
        this.myInfluencers.forEach(influenceCell => {
            let tmpValue = influenceCell.value();
            if (tmpValue !== '0') {
                // tmpValue ist eine gesetzte Nummer
                inAdmissibles.add(tmpValue);
            }
        })
        return inAdmissibles;
    }

    calculatePermissibleNumbers() {
        // Die zulässigen Zahlen einer Zelle sind die noch nicht gesetzten Nummern
        this.myPermissibles = new SudokuSet(['1', '2', '3', '4', '5', '6', '7', '8', '9'].filter(x =>
            !this.calculateDirectInadmissibleNumbers().has(x)));
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
        this.myPermissibles.forEach(e => {
            let permNumberElement = document.createElement('div');
            permNumberElement.setAttribute('data-value', e);
            permNumberElement.innerHTML = e;
            this.myCellNode.appendChild(permNumberElement);
        });
    }
    getPermissibleNumbers() {
        return this.myPermissibles;
    }

    getStrongPermissibleNumbers() {
        return this.myPermissibles.difference(this.myIndirectInadmissibleNumbers);
    }

    countMyPermissibleNumbers() {
        return this.myPermissibles.size;
    }

    countMyOpenInfluencers() {
        let tmpCount = 0;
        this.myInfluencers.forEach(influencer => {
            if (influencer.value() == '0') {
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
        this.myInfluencers.forEach(influencer => {
            if (influencer.value() == '0') {
                // Influencer mit geringer Größe werden bevorzugt
                summand = 9 - influencer.getStrongPermissibleNumbers().size;
            }
            tmpWeight = tmpWeight + summand;
        });
        return tmpWeight;
    }

    countMyInfluencersPermissibleNumbers() {
        let tmpCount = 0;
        this.myInfluencers.forEach(influencer => {
            if (influencer.value() == '0') {
                tmpCount = tmpCount + influencer.countMyPermissibleNumbers();
            }
        });
        return tmpCount;
    }


    setNecessary(permNr) {
        // Klassifiziere die Zahl permNr in der Menge der möglichen Zahlen
        // als notwendig
        this.myNecessarys.add(permNr);
        let permNodes = this.myCellNode.children;
        for (let i = 0; i < permNodes.length; i++) {
            if (permNodes[i].getAttribute('data-value') == permNr) {
                permNodes[i].classList.add('neccessary');
            }
        }
    }

    setIndirectInadmissibleNumber(permNr) {
        // Klassifiziere die Zahl permNr in der Menge der möglichen Zahlen
        // als notwendig
        this.myIndirectInadmissibleNumbers.add(permNr);
        let permNodes = this.myCellNode.children;
        for (let i = 0; i < permNodes.length; i++) {
            if (permNodes[i].getAttribute('data-value') == permNr) {
                permNodes[i].classList.add('inAdmissible');
            }
        }
    }

    unsetNecessary(permNr) {
        let permNodes = this.myCellNode.children;
        for (let i = 1; i < permNodes.length; i++) {
            if (permNodes[i].getAttribute('data-value') == permNr) {
                permNodes[i].classList.remove('neccessary');
            }
        }
        this.myNecessarys.delete(permNr);
    }

    unsetIndirectInadmissibleNumber(permNr) {
        let permNodes = this.myCellNode.children;
        for (let i = 1; i < permNodes.length; i++) {
            if (permNodes[i].getAttribute('data-value') == permNr) {
                permNodes[i].classList.remove('inAdmissible');
            }
        }
        this.myIndirectInadmissibleNumbers.delete(permNr);
    }

    clearIndirectInadmissibleNumbers() {
        this.myIndirectInadmissibleNumbers.forEach(e => this.unsetIndirectInadmissibleNumber(e));
        this.myIndirectInadmissibleNumbers = new SudokuSet();
    }

    clearNecessarys() {
        this.myNecessarys.forEach(e => this.unsetNecessary(e));
        this.myNecessarys = new SudokuSet();
    }

    delete() {
        this.unsetNumber();
    }
    isInsolvable() {
        return (
            // Für die nicht gesetzte Zelle ist die Anzahl notwendiger Nummern größer 1
            (this.myNecessarys.size > 1 && (this.value() == '0')) ||
            // Für die Zelle gibt es keine stark zulässige Nummer mehr.
            // Schwach zulässig: nicht direkt unzulässig
            // Stark zulässig: nicht direkt oder indirekt unzulässig
            this.getStrongPermissibleNumbers().size == 0 ||
            // Die Nummer der gesetzten Zelle ist nicht zulässig.
            !(this.value() == '0' || this.myPermissibles.has(this.value())));
    }
    getIndex() {
        return this.myIndex;
    }
}
class ComboBox {
    constructor(comboBoxNode) {
        // Der ComboBox Knoten
        this.myComboBoxNode = comboBoxNode;
        // 1. Kind: das Input-Feld der ComboBox
        this.theInput = comboBoxNode.firstElementChild;
        // 2. und letztes Kind: das Selektionsfeld der Options-Liste
        this.optionList = comboBoxNode.lastElementChild;

        // Mit der Erzeugung des Wrappers wird
        // auch der Eventhandler der ComboBox gesetzt
        this.optionList.addEventListener('change', (event) => {
            sudoApp.comboBoxNameSelected(this, event);
        });
    }
    getNode() {
        return this.myComboBoxNode;
    }
    getDialog() {
        return this.myDialog;
    }
    setInputField(name) {
        // Eine Selektion in der Optionsliste ruft diese Operation au
        // und überträgt die Auswahl in das Input-Feld (ComboBox)
        this.theInput.value = name;
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

        // Setze input initial
        if (optionListNew.length > 0) {
            this.theInput.value = optionListNew[0];
        } else {
            this.theInput.value = '';
        }
    }
    getSelectedName() {
        return this.theInput.value;
    }
}
class StorageSaveDialog {
    constructor() {
        this.winBox;
        this.myOpen = false;
        this.myComboBoxNode = document.getElementById("storageSaveComboBox");
        this.myComboBox = new ComboBox(this.myComboBoxNode);
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
        if (window.screen.availWidth < 421) {
            this.winBox = new WinBox("Zustand speichern unter ...", {
                x: "center",
                y: "center",
                width: "280px",
                height: "150üx",
                mount: document.getElementById("contentSaveDlg")
            });
        } else {
            this.winBox = new WinBox("Zustand speichern unter ...", {
                x: "center",
                y: "center",
                width: "370px",
                height: "180px",
                mount: document.getElementById("contentSaveDlg")
            });
        }
        this.myComboBox.init(nameList);
        this.myOpen = true;
    }

    close() {
        if (this.myOpen) {
            this.winBox.close();
            this.myOpen = false;
        }
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
        //this.storageRestoreDialog = document.getElementById("storageRestoreDialog");
        this.winBox;
        this.myOpen = false;
        this.myComboBox = new ComboBox(document.getElementById("storageRestoreComboBox"));
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
        if (window.screen.availWidth < 421) {
            this.winBox = new WinBox("Zustand wiederherstellen", {
                x: "center",
                y: "center",
                width: "280px",
                height: "150üx",
                mount: document.getElementById("contentRestoreDlg")
            });
        } else {
            this.winBox = new WinBox("Zustand wiederherstellen", {
                x: "center",
                y: "center",
                width: "370px",
                height: "180px",
                mount: document.getElementById("contentRestoreDlg")
            });
        }
        this.myComboBox.init(nameList);
        this.myOpen = true;
    }
    close() {
        if (this.myOpen) {
            this.winBox.close();
            this.myOpen = false;
        }
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
        this.winBox;
        this.myOpen = false;
        this.myComboBox = new ComboBox(document.getElementById("storageDeleteComboBox"));
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
        if (window.screen.availWidth < 421) {
            this.winBox = new WinBox("Zustand löschen", {
                x: "center",
                y: "center",
                width: "280px",
                height: "150üx",
                mount: document.getElementById("contentDeleteDlg")
            });
        } else {
            this.winBox = new WinBox("Zustand löschen", {
                x: "center",
                y: "center",
                width: "370px",
                height: "180px",
                mount: document.getElementById("contentDeleteDlg")
            });
        }
        this.myComboBox.init(nameList);
        this.myOpen = true;
    }

    close() {
        if (this.myOpen) {
            this.winBox.close();
            this.myOpen = false;
        }
    }
    init(nameList) {
        this.myComboBox.init(nameList);
    }
    getSelectedName() {
        return this.myComboBox.getSelectedName();
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
                height: "290px",
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
        if (storageObj.length > 1) {
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
    }
    getNameList() {
        // Hole den Speicher als ein Objekt
        let str_storageObj = localStorage.getItem("sudokuStorage");
        let storageObj = JSON.parse(str_storageObj);

        let nameList = [];
        for (let i = 0; i < storageObj.length; i++) {
            nameList.push(storageObj[i].name);
        }
        return nameList;
    }
    init() {

        // Hole den Speicher als ein Objekt

        if (localStorage.length == 0) {
            // Definiere neues NamedState
            let newNamedState = {
                name: 'example',
                state:
                    [{ "cellValue": "0", "cellPhase": "" },
                    { "cellValue": "0", "cellPhase": "" },
                    { "cellValue": "7", "cellPhase": "define" },
                    { "cellValue": "6", "cellPhase": "define" },
                    { "cellValue": "4", "cellPhase": "define" },
                    { "cellValue": "0", "cellPhase": "" },
                    { "cellValue": "0", "cellPhase": "" },
                    { "cellValue": "0", "cellPhase": "" },
                    { "cellValue": "2", "cellPhase": "define" },
                    { "cellValue": "1", "cellPhase": "define" },
                    { "cellValue": "0", "cellPhase": "" },
                    { "cellValue": "0", "cellPhase": "" },
                    { "cellValue": "0", "cellPhase": "" },
                    { "cellValue": "0", "cellPhase": "" },
                    { "cellValue": "2", "cellPhase": "define" },
                    { "cellValue": "0", "cellPhase": "" }, { "cellValue": "9", "cellPhase": "define" }, { "cellValue": "4", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "2", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "3", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "6", "cellPhase": "define" }, { "cellValue": "8", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "9", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "4", "cellPhase": "define" }, { "cellValue": "5", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "1", "cellPhase": "define" }, { "cellValue": "6", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "6", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "5", "cellPhase": "define" }, { "cellValue": "3", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "8", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "9", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "5", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "7", "cellPhase": "define" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "0", "cellPhase": "" }, { "cellValue": "9", "cellPhase": "define" },
                    { "cellValue": "0", "cellPhase": "" },
                    { "cellValue": "0", "cellPhase": "" }]
            }

            let storageObj = [];
            // Füge den namedState in  das Speicherobjekt ein
            storageObj.push(newNamedState);
            // Kreiere die JSON-Version des Speicherobjektes
            // und speichere sie.
            let updateStorageObj = JSON.stringify(storageObj);
            localStorage.setItem("sudokuStorage", updateStorageObj);
        }
    }

}
init();