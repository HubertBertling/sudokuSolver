function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomNumbers(numberOfrandoms, min, max) {
    let randoms = [];
    let currentRandom = 0;
    while (randoms.length < numberOfrandoms) {
        currentRandom = getRandomIntInclusive(min, max);
        if (currentRandom < max && !randoms.includes(currentRandom)) {
            randoms.push(currentRandom);
        }
    }
    return randoms;
}

class SudokuSet extends Set {
    // Die mathematische Menge ohne Wiederholungen
    // Intensiv genutzt für die Berechnung indirekt unzulässiger
    // Nummern in der Sudoku-Matrix.
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
        // console.log("Tiefe " + this.myLastBackTrackOptionStep.getDepth());
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
        this.myResult = '';
        this.suGrid = suGrid;
        this.myBackTracker;
        this.timer = false;
        this.execSpeed = 75;
        this.execSpeedLevel = 'very-fast';
        this.goneSteps = 0;
        this.levelOfDifficulty = 'Keine Angabe';
        this.countBackwards = 0;
        if (inMainApp) {
            this.progressBar = new ProgressBar();
        }
        this.autoDirection = 'forward';
        this.init();
    }

    init() {
        this.myResult = '';
        this.goneSteps = 0;
        this.countBackwards = 0;
        this.autoDirection = 'forward';
        this.levelOfDifficulty = 'Keine Angabe';
        // Der Stepper hat immer einen aktuellen BackTracker
        this.myBackTracker = new BackTracker();
        if (inMainApp) {
            this.displayStatus();
        }
    }

    displayStatus() {
        this.suGrid.displayBenchmark(this.countBackwards, this.levelOfDifficulty);
        this.displayAutoDirection();
        this.displayProgress();
        this.displayGoneSteps();
    }

    displayGoneSteps() {
        let goneStepsNode = document.getElementById("step-count");
        goneStepsNode.innerHTML = '<b>Schritte:</b> &nbsp' + this.goneSteps;
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


    displayProgress() {
        let countDef = this.suGrid.countDefSteps();
        let countTotal = this.suGrid.countSolvedSteps();
        this.progressBar.setValue(countDef, countTotal);
    }


    setAutoDirection(direction) {
        this.autoDirection = direction;
        if (inMainApp) {
            this.displayAutoDirection();
        }
    }

    getAutoDirection() {
        return this.autoDirection;
    }

    isRunning() {
        // Trickprogrammierung:
        return this.timer !== false;
    }

    startTimerLoop() {
        if (!this.isRunning()) {
            this.timer = window.setInterval(() => { sudoApp.stepper.triggerAutoStep('user'); }, this.execSpeed);
        }
    }

    stopTimer() {
        if (inMainApp) {
            // Die automatische Ausführung
            window.clearInterval(this.timer);
            this.timer = false;
        }
    }

    solverLoop() {
        while (this.myResult == '' || this.myResult == 'inProgress') {
            sudoApp.stepper.triggerAutoStep('system');
        }
    }

    triggerAutoStep() {
        this.myResult = this.autoStep();
        if (inMainApp) {
            this.displayStatus();
        }
        if (this.myResult == 'success') {
            if (this.isRunning()) {
                this.stopTimer();
            }
            this.suGrid.difficulty = this.levelOfDifficulty;
            this.suGrid.backTracks = this.countBackwards;
            this.suGrid.steps = this.goneSteps;
            if (inMainApp) {
                sudoApp.successDialog.open();
            }
        } else if (this.myResult == 'fail') {
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
        let currentStep = this.myBackTracker.getCurrentStep();
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
            // Aktion Fall 1: Der BackTracker steht auf einem echten Optionstep (nicht die Wurzel), 
            // d.h.die nächste Selektion ist die nächste Option dieses Schrittes
            if (currentStep instanceof BackTrackOptionStep &&
                currentStep.getCellIndex() !== -1) {
                // Lege einen neuen Step an mit der Nummer der nächsten Option
                let realStep = this.myBackTracker.getNextBackTrackRealStep();
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
                if (tmpSelection.indirectNecessaryOnes.length == 1) { tmpValue = tmpSelection.indirectNecessaryOnes[0]; }
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
            if (this.suGrid.sudoCells[currentStep.getCellIndex()].getValue() !== '0') {
                this.goneSteps++;
                this.suGrid.deleteSelected('play', false);
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
        let maxWeight = this.suGrid.sudoCells[maxIndex].countMyInfluencersWeight();
        // Kontexte mit einem größeren Entscheidungsgrad, also mit weniger zulässigen Nummern, zählen mehr.
        for (let i = 1; i < selectionList.length; i++) {
            let currentSelection = selectionList[i];
            let currentIndex = currentSelection.index;
            let currentWeight = this.suGrid.sudoCells[currentIndex].countMyInfluencersWeight();
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
            indirectNecessaryOnes: [],
            necessaryOnes: [],
            level_0_singles: []
        }
        return emptySelection;
    }

    calculateIndirectNeccesarySelectionFrom(selectionList) {
        // Berechnet Selektion von Zellen, die eine indirekt notwendige Nummer enthalten.
        for (let i = 0; i < selectionList.length; i++) {
            if (selectionList[i].indirectNecessaryOnes.length > 0) {
                return selectionList[i];
            }
        }
        // Falls es keine Zellen mit notwendigen Nummern gibt
        let emptySelection = {
            index: -1,
            options: [],
            indirectNecessaryOnes: [],
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
            indirectNecessaryOnes: [],
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
            indirectNecessaryOnes: [],
            necessaryOnes: [],
            level_0_singles: []
        }
        return emptySelection;
    }

    getOptionalSelections() {
        let selectionList = [];
        for (let i = 0; i < 81; i++) {
            if (this.suGrid.sudoCells[i].getValue() == '0') {
                let selection = {
                    index: i,
                    options: Array.from(this.suGrid.sudoCells[i].getTotalAdmissibles()),
                    indirectNecessaryOnes: Array.from(this.suGrid.sudoCells[i].getIndirectNecessarys()),
                    necessaryOnes: Array.from(this.suGrid.sudoCells[i].getNecessarys()),
                    level_0_singles: Array.from(this.suGrid.sudoCells[i].getSingles())
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
                indirectNecessaryOnes: [],
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
        //Bestimmt die nächste Zelle mit indirekt notwendiger Nummer unter den zulässigen Nummern
        let tmpIndirectNeccessary = this.calculateIndirectNeccesarySelectionFrom(optionList);
        if (tmpIndirectNeccessary.index !== -1) {
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
            return tmpIndirectNeccessary;
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
    // Abstrakte Klasse, deren konkrete Instanzen
    // eine Gruppe, Spalte oder Zeile der Matrix sind
    constructor(suTable) {
        // Die Collection kennt ihre Tabelle
        this.myGrid = suTable;
        this.myCells = [];
        // In jeder Gruppe, Spalte und Zeile müssen alle Zahlen 1..9 einmal vorkommen.
        // Für eine konkrete Gruppe, Spalte oder Zeile sind MissingNumbers Zahlen,
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
        // Wenn es eine Collection mit Conflicting Singles gibt, ist das Sudoku unlösbar.
        // Wenn es eine Collection mit Conflicting Pairs gibt, ist das Sudoku unlösbar.
        // Wenn es eine Collection gibt, in der nicht mehr alle Nummern vorkommen.
        // Wenn es eine Collection gibt, in der dieselbe Nummer mehrmals notwendig ist.
        return (
            this.withConflictingSingles() ||
            this.withPairConflict() ||
            this.withConflictingNecessaryNumbers() ||
            this.withMissingNumber());
    }

    withConflictingNecessaryNumbers() {
        let numberCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let found = false;
        for (let i = 0; i < 9; i++) {
            if (this.myCells[i].getValue() == '0') {
                // Wir betrachten nur offene Zellen
                let necessarys = this.myCells[i].getNecessarys();
                if (necessarys.size == 1) {
                    necessarys.forEach(nr => {
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

    withMissingNumber() {
        let myNumbers = new SudokuSet();
        this.myCells.forEach(cell => {
            if (cell.getValue() == '0') {
                myNumbers = myNumbers.union(cell.getTotalAdmissibles());
            } else {
                myNumbers.add(cell.getValue());
            }
        })
        return (myNumbers.size !== 9);
    }

    calculateHiddenPairs() {
        // Berechnet Subpaare in der Collection. Dies sind
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
            // Für jede Position in der Collection eine leere twin-nummernliste
            this.twinPosition.push([]);
        }
        // Iteriere über die Collection
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
        // Iteriere über die Collection
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
                cell1.myLevel_gt0_inAdmissibles =
                    cell1.myLevel_gt0_inAdmissibles.union(newInAdmissibles1);
                newInAdmissibles1.forEach(inAdNr => {
                    let inAdmissibleSubPairInfo = {
                        collection: this,
                        subPairCell1: this.myCells[hiddenPair.pos1],
                        subPairCell2: this.myCells[hiddenPair.pos2]
                    }
                    cell1.myLevel_gt0_inAdmissiblesFromHiddenPairs.set(inAdNr, inAdmissibleSubPairInfo)
                })
                inAdmissiblesAdded = true;
            }

            // Zweite Paar-Zelle bereinigen
            let cell2 = this.myCells[hiddenPair.pos2];
            let tmpAdmissibles2 = cell2.getTotalAdmissibles();
            let newInAdmissibles2 = tmpAdmissibles2.difference(new SudokuSet([hiddenPair.nr1, hiddenPair.nr2]));
            if (newInAdmissibles2.size > 0) {
                cell2.myLevel_gt0_inAdmissibles =
                    cell2.myLevel_gt0_inAdmissibles.union(newInAdmissibles2);
                newInAdmissibles2.forEach(inAdNr => {
                    let inAdmissibleSubPairInfo = {
                        collection: this,
                        subPairCell1: this.myCells[hiddenPair.pos1],
                        subPairCell2: this.myCells[hiddenPair.pos2]
                    }
                    cell2.myLevel_gt0_inAdmissiblesFromHiddenPairs.set(inAdNr, inAdmissibleSubPairInfo)
                })
                inAdmissiblesAdded = true;
            }
        }
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromEqualPairs() {
        this.calculateEqualPairs();
        let inAdmissiblesAdded = false;
        for (let i = 0; i < this.myPairInfos.length; i++) {
            if (this.myPairInfos[i].pairIndices.length == 2) {
                // Ein Paar, das zweimal in der Collection vorkommt
                let pair = this.myPairInfos[i].pairSet;
                // Prüfe, ob Nummern dieses Paar in den admissibles der Collection vorkommen
                for (let j = 0; j < 9; j++) {
                    if (this.myCells[j].getValue() == '0') {
                        if (this.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[0] &&
                            this.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[1]) {
                            // Zelle der Collection, die nicht Paar-Zelle ist
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
                                        pairCell1: sudoApp.suGrid.sudoCells[this.myPairInfos[i].pairIndices[0]],
                                        pairCell2: sudoApp.suGrid.sudoCells[this.myPairInfos[i].pairIndices[1]]
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


    /*
    derive_inAdmissiblesFromPairWing() {
        this.calculateEqualPairs();
        let inAdmissiblesAdded = false;
        for (let i = 0; i < this.myPairInfos.length; i++) {
            if (this.myPairInfos[i].pairIndices.length == 2 &&
                  sudoApp.suGrid.sudoCells[this.myPairInfos[i].pairIndices[0]].myGroup !== 
                  sudoApp.suGrid.sudoCells[this.myPairInfos[i].pairIndices[1]].myGroup) {
                // Ein Paar, das zweimal in der Collection vorkommt
                // Das Paar muss in verschieden Gruppen sein

                // Jetzt die SenkrechtCollections bestimmen
                let senkrecht1 = null;
                let senkrecht2 = null;
                let waagerecht = null;
                let senkrecht1PairWingCell = null;
                let senkrecht2PairWingCell = null;
                let pairWingNr = -1;

                if (sudoApp.suGrid.sudoCells[this.myPairInfos[i].pairIndices[0]].myRow == this) {
                    senkrecht1 = sudoApp.suGrid.sudoCells[this.myPairInfos[i].pairIndices[0]].myCol;
                } else {
                    senkrecht1 = this;
                }
                if (sudoApp.suGrid.sudoCells[this.myPairInfos[i].pairIndices[1]].myRow == this) {
                    senkrecht2 = sudoApp.suGrid.sudoCells[this.myPairInfos[i].pairIndices[1]].myCol;
                } else {
                    senkrecht2 = this;
                }

                // In einer der beiden Senkrechten muss es eine Wing-Nummer geben
                // Eine Wing-Nummer ist eine der beiden Paar-Nummern. 
                // In der Senkrechten darf sie nur genau einmal vorkommen. Die Paar-Zelle ausgenommen.
                // Die Wing-Senkrechte, Wing-Zelle und Wing-Nummer bestimmen

                let pair = this.myPairInfos[i].pairSet;
                let tmpWingCell = null;
                let tmpWingCellCount = 0;
                       
                // Die Wing-Cell für senkrecht1 bestimmen
                for (let j = 0; j < 9; j++) {
                    if (senkrecht1.myCells[j].getValue() == '0') {
                        if (senkrecht1.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[0] &&
                            senkrecht1.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[1]) {
                            // Zelle der Senkrechten, die nicht Paar-Zelle ist
                            let tmpAdmissibles = this.myCells[j].getTotalAdmissibles();
                            let tmpIntersection = tmpAdmissibles.intersection(pair);
                            let tmpWingCell = null;
                            if (tmpIntersection.size > 0) {
                                // Kandidat WingCell
                                tmpWingCell = this.myCells[j];
                                tmpWingCellCount++;
                            }
                        }
                    }
                }
                if (tmpWingCellCount == 1){
                    senkrecht1PairWingCell = tmpWingCell;        
                }
                // Falls es keine WingCell für senkrecht1 gibt WingCell für senkrecht2 bestimmen
                tmpWingCell = null;
                tmpWingCellCount = 0;
                
                for (let j = 0; j < 9; j++) {
                    if (senkrecht2.myCells[j].getValue() == '0') {
                        if (senkrecht2.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[0] &&
                            senkrecht2.myCells[j].getIndex() !== this.myPairInfos[i].pairIndices[1]) {
                            // Zelle der Senkrechten, die nicht Paar-Zelle ist
                            let tmpAdmissibles = this.myCells[j].getTotalAdmissibles();
                            let tmpIntersection = tmpAdmissibles.intersection(pair);
                            let tmpWingCell = null;
                            if (tmpIntersection.size > 0) {
                                // Kandidat WingCell
                                tmpWingCell = this.myCells[j];
                                tmpWingCellCount++;
                            }
                        }
                    }
                }
                if (tmpWingCellCount == 1){
                    senkrecht2PairWingCell = tmpWingCell;        
                }
                // Die Waagerechte der der WingCell bestimmen, falls es eine
                // Wingcell gibt
                if (senkrecht1PairWingCell !== null ) {
                    if (senkrecht1PairWingCell.myRow == senkrecht1) {
                        waagerecht = senkrecht1PairWingCell.myCol;
                    } else {
                        waagerecht = senkrecht1;
                    }    
                } else if (senkrecht2PairWingCell !== null) {
                    if (senkrecht2PairWingCell.myRow == senkrecht2) {
                        waagerecht = senkrecht2PairWingCell.myCol;
                    } else {
                        waagerecht = senkrecht2;
                    }  
                }

                // Die Kreuzgruppe bestimmen
            }
        }
        return inAdmissiblesAdded;
    }
*/


    calculateNecessaryForNextStep() {
        // Berechne für die NineCellCollection alle notwendigen Nummern.
        // Notwendige Nummern sind zulässige Nummern einer Zelle,
        // die in der Gruppe, Reihe oder Spalte der Zelle genau einmal vorkommen.
        let added = false;
        for (let i = 1; i < 10; i++) {
            let cellIndex = this.occursOnce(i);
            // Wenn die Nummer i genau einmal in der Collection vorkommt
            // trage sie ein in der Necessary-liste der Zelle
            if (cellIndex !== -1) {
                this.myCells[cellIndex].addNecessary(i.toString(), this);
                added = true;
                //      return added;
            }
        }
        return added;
    }

    calculateNecessarys() {
        // Notwendige Nummern sind zulässige Nummern einer Zelle,
        // die in der Gruppe, Reihe oder Spalte der Zelle genau einmal vorkommen.
        for (let i = 1; i < 10; i++) {
            let cellIndex = this.occursOnce(i);
            // Wenn die Nummer i genau einmal in der Collection vorkommt
            // trage sie ein in der Necessary-liste der Zelle
            if (cellIndex !== -1) {
                this.myCells[cellIndex].addNecessary(i.toString(), this);
            }
        }
    }

    calculateIndirectNecessaryForNextStep() {
        // Berechne für die NineCellCollection alle notwendigen Nummern.
        // Notwendige Nummern sind zulässige Nummern einer Zelle,
        // die in der Gruppe, Reihe oder Spalte der Zelle genau einmal vorkommen.
        let added = false;
        for (let i = 1; i < 10; i++) {
            let cellIndex = this.occursOnceInTotalAdmissibles(i);
            // Wenn die Nummer i genau einmal in der Collection vorkommt
            // trage sie ein in der Necessary-liste der Zelle
            if (cellIndex !== -1) {
                this.myCells[cellIndex].addIndirectNecessary(i.toString(), this);
                added = true;
                //      return added;
            }
        }
        return added;
    }

    calculateIndirectNecessarys() {
        // Indirekt notwendige Nummern sind zulässige Nummern einer Zelle,
        // die in der Gruppe, Reihe oder Spalte der Zelle total genau einmal vorkommen.
        // Also unter Berücksichtigung der indirekt unzulässigen Nummern.
        for (let i = 1; i < 10; i++) {
            let cellIndex = this.occursOnceInTotalAdmissibles(i);
            // Wenn die Nummer i genau einmal in der Collection vorkommt
            // trage sie ein in der Necessary-liste der Zelle
            if (cellIndex !== -1) {
                this.myCells[cellIndex].addIndirectNecessary(i.toString(), this);
            }
        }
    }

    occursOnce(permNr) {
        // Berechne, ob die Zahl permNr in möglichen Zahlen aller Zellen 
        // der Collection genau einmal vorkommt
        // Rücgabe: der Index der Zelle, die das einmalige Auftreten enthält
        // -1, falls die Nummer gar nicht auftaucht oder mehrmals
        let countOccurrences = 0;
        let lastCellNr = -1;

        // Iteriere über alle Zellen der Collection
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
        // der Collection genau einmal vorkommt
        // Rücgabe: der Index der Zelle, die das einmalige Auftreten enthält
        // -1, falls die Nummer gar nicht auftaucht oder mehrmals
        let countOccurrences = 0;
        let lastCellNr = -1;

        // Iteriere über alle Zellen der Collection
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
            if (this.myCells[i].getValue() == '0') {
                // Wir betrachten nur offene Zellen
                // Denn, wenn eine der Konfliktzellen geschlossen wäre, würde
                // die noch offene Zelle ohne zulässige Nummer sein. Eine offene Zelle
                // ohne zulässige Nummer fangen wir schon an anderer Stelle ab.
                let permNumbers = this.myCells[i].getTotalAdmissibles();
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

    withPairConflict() {
        // Pairs sind Zellen, die nur noch exakt zwei zulässige Nummern haben.
        // Ein Pair-Konflikt liegt vor, wenn eine Nummer aus einem Paar 
        // außerhalb des Paares einzeln oder als Paar ein weiteres mal vorkommt.
        this.calculateEqualPairs();
        let found = false;
        for (let i = 0; i < this.myPairInfos.length; i++) {
            if (this.myPairInfos[i].pairIndices.length > 2) {
                // Ein Paar, das dreimal oder mehr in der Collection vorkommt
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

class SudokuGroup extends NineCellCollection {
    constructor(suTable, groupIndex) {
        // Die Gruppe kennt ihre Tabelle und ihren Index
        super(suTable);
        this.myIndex = groupIndex;
        this.myGroupNode = null;
    }

    display(domGridNode) {
        let groupNode = document.createElement("div");
        groupNode.setAttribute("class", "sudoku-group");
        //Neue Gruppe in den Baum einhängen
        domGridNode.appendChild(groupNode);
        this.myGroupNode = groupNode;

        // Die Zellen der Gruppe werden angezeigt
        this.myCells.forEach(sudoCell => {
            sudoCell.display(groupNode);
        })
        let cellError = false;
        this.myCells.every(sudoCell => {
            if (sudoCell.isInsolvable()) {
                cellError = true;
                return false;
            }
            return true;
        });
        // Der Gruppen-Error wird angezeigt
        // Aber nur, wenn die Zellen selbst keinen Fehler aufweisen.      
        if (this.isInsolvable() && !cellError) {
            this.myGroupNode.classList.add('err');
            this.myGroupNode.classList.add('cell-err');
            setTimeout(() => {
                this.myGroupNode.classList.remove('cell-err');
            }, 500);
        } else {
            this.myGroupNode.classList.remove('err');
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

    setNode(groupNode) {
        this.myGroupNode = groupNode;
    }

    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setGroup(this);
    }
}
class SudokuRow extends NineCellCollection {
    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setRow(this);
    }

    display() {
        // Der Zeilen-Error wird in den Zellen angezeigt
        // Aber nur, wenn die Zellen selbst keinen Fehler aufweisen.
        let cellError = false;
        this.myCells.every(sudoCell => {
            if (sudoCell.isInsolvable()) {
                cellError = true;
                return false;
            }
            return true;
        });
        this.myCells.forEach(sudoCell => {
            if (!cellError) {
                sudoCell.displayRowError(this.isInsolvable());
            }
        })
    }
}

class SudokuCol extends NineCellCollection {
    addCell(sudoCell) {
        this.myCells.push(sudoCell);
        sudoCell.setCol(this);
    }
    display() {
        // Der Spalten-Error wid in den Zellen angezeigt
        // Aber nur, wenn die Zellen selbst keinen Fehler aufweisen.
        let cellError = false;
        this.myCells.every(sudoCell => {
            if (sudoCell.isInsolvable()) {
                cellError = true;
                return false;
            }
            return true;
        });
        this.myCells.forEach(sudoCell => {
            if (!cellError) {
                sudoCell.displayColError(this.isInsolvable());
            }
        })
    }
}

class SudokuGrid {
    // Speichert die Sudokuzellen in der Wrapper-Version
    constructor() {
        // Neue Puzzles sind noch nicht geladen, weil sie sich
        // noch nicht in der DB befinden. 
        // Sie besitzen daher auch noch keine Id.
        this.loadedPuzzleId = '';
        this.difficulty = 'Keine Angabe';
        this.steps = 0;
        this.backTracks = 0;
        this.sudoCells = [];
        this.sudoGroups = [];
        this.sudoRows = [];
        this.sudoCols = [];
        this.evalType = 'lazy';
        this.init();
    }

    init() {
        // Speichert die aktuell selektierte Zelle und ihren Index
        this.selectedCell = undefined;
        this.indexSelected = -1;
        this.loadedPuzzleId = '';
        this.steps = 0;
        this.difficulty = 'Keine Angabe';
        this.backTracks = 0;
        // Erzeuge die interne Tabelle
        this.createSudoGrid();
        this.evaluateMatrix();
        // Erzeuge den dazugehörigen DOM-Tree
        if (inMainApp) {
            this.display();
            this.displayPuzzle('', '');
        }
    }

    setEvalType(et) {
        this.evalType = et;
        this.evaluateMatrix();
        // Erzeuge den dazugehörigen DOM-Tree
        if (inMainApp) {
            this.display();
        }
    }

    evaluateMatrix() {
        if (this.evalType == 'lazy') this.evaluateGridLazy();
        if (this.evalType == 'strict-plus' || this.evalType == 'strict-minus') this.evaluateGridStrict();
    }

    removeAutoExecCellInfos() {
        for (let i = 0; i < 81; i++) {
            this.sudoCells[i].clearAutoExecInfo();
        }
        if (inMainApp) {
            this.display();
        }
    }

    solved() {
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() == '0') {
                return false;
            }
        }
        return true;
    }
    countSolvedSteps() {
        let tmp = 0;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() !== '0') {
                tmp++;
            }
        }
        return tmp;
    }

    countDefSteps() {
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
        this.refresh();
    }

    set() {
        // Alle in der Phase 'play' gesetzten Zahlen werden zur Definition
        // hinzugefügt.
        // Schritt 1: Die aktuelle Selektion wird zurückgesetzt
        this.initCurrentSelection();
        // Schritt 2: Play in define umwandeln und Ausführungs-Infos löschen.
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() !== '0') {
                if (this.sudoCells[i].getPhase() == 'play') {
                    this.sudoCells[i].clearAutoExecInfo();
                    this.sudoCells[i].setPhase('define');
                }
            }
        }
        this.refresh();
    }

    generatePuzzle() {
        // Initialisiere Tabelle
        sudoApp.stepper.stopTimer()
        sudoApp.stepper.init();
        sudoApp.setAutoExecOff();
        sudoApp.suGrid.deselect();
        sudoApp.suGrid.init();
        sudoApp.setGamePhase('define');

        // Setze in zufälliger Zelle eine zufällige Nummer
        let randomCellIndex = getRandomIntInclusive(0, 80);
        sudoApp.sudokuCellPressed(this.sudoCells[randomCellIndex], randomCellIndex);
        let randomCellContent = getRandomIntInclusive(1, 9).toString();
        sudoApp.handleNumberPressed(randomCellContent);

        // Löse dieses Sudoku
        sudoApp.autoExecRun();
        // Mache die gelösten Zellen define-Zellen
        this.set();
        // Setze das Puzzle in den Define-Mode
        sudoApp.setGamePhase('define')
        // Lösche in der Lösung Nummern, solange
        // wie das verbleibende Puzzle backtrack-frei bleibt.
        this.reduce();
        // Löse das generierte Puzzle, um seinen Schwierigkeitsgrad zu ermitteln.
        sudoApp.stepper.init();
        sudoApp.setAutoExecOff();
        sudoApp.suGrid.deselect();
        sudoApp.autoExecRun();
    }

    reduce() {
        let randomCellOrder = getRandomNumbers(81, 0, 81);
        for (let i = 0; i < 81; i++) {
            let k = randomCellOrder[i];
            if (this.sudoCells[k].getValue() !== '0') {
                // Selektiere Zelle mit gesetzter Nummer
                this.select(this.sudoCells[k], k);
                // Notiere die gesetzte Nummer
                let tmpNr = this.sudoCells[k].getValue();
                // Lösche die gesetzte Nummer
                this.deleteSelected('define', false);
                // Werte die verbliebene Matrix strikt aus.
                this.evaluateGridStrict();
                let neccessaryCondition = (this.sudoCells[k].getNecessarys().size == 1);
                let totalAdmissibleCondition = (this.sudoCells[k].getTotalAdmissibles().size == 1);
                if (neccessaryCondition || totalAdmissibleCondition) {
                    // Die gelöschte Zelle hat eine eindeutig zu wählende Nummer,
                    // Entweder eine notwendige Nummer oder eine Single-Nummer-
                    // D.h. die gelöschte Nummer ist eindeutig wiederherstellbar.
                } else {
                    // Die gelöschte Zelle weist keine eindeutig zu wählende Nummer aus
                    // Dann wird die Löschung zurückgenommen.
                    this.select(this.sudoCells[k], k);
                    this.sudoCells[k].manualSetValue(tmpNr, 'define');
                }
            }
        }
    }

    displayTechnique(tech) {
        if (inMainApp) {
            let evalNode = document.getElementById("technique");
            evalNode.innerHTML =
                '<b>Angewandte Technik:</b> &nbsp' + tech;
        }
    }


    displayBenchmark(countBackwards, levelOfDifficulty) {
        let evalNode = document.getElementById("evaluations");
        evalNode.innerHTML =
            '<b>Schwierigkeitsgrad:</b> &nbsp' + levelOfDifficulty + '; &nbsp'
            + '<b>Rückwärtsläufe:</b> &nbsp' + countBackwards;
    }

    getPlayedPuzzleDbElement() {
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
            if (this.sudoCells[i].getPhase() == 'define') {
                puzzleDbElement.defCount++;
                puzzleDbElement.puzzle[i] = this.sudoCells[i].getValue();
            } else {
                puzzleDbElement.puzzle[i] = '0';
            }
        }
        // Status setzen
        puzzleDbElement.level = this.difficulty;
        if (this.solved()) {
            puzzleDbElement.status = 'gelöst';
            if (this.evalType == 'lazy') {
                puzzleDbElement.stepsLazy = this.steps;
            } else {
                puzzleDbElement.stepsStrict = this.steps;
            }
            puzzleDbElement.backTracks = this.backTracks;
            for (let i = 0; i < 81; i++) {
                puzzleDbElement.solution[i] = this.sudoCells[i].getValue();
            }
            puzzleDbElement.date = (new Date()).toJSON();
        }
        return puzzleDbElement;
    }

    loadPuzzle(uid, puzzleDbElement) {
        this.loadedPuzzleId = uid;
        this.difficulty = puzzleDbElement.level;
        let puzzle = puzzleDbElement.puzzle;
        for (let i = 0; i < 81; i++) {
            if (puzzle[i] == '0') {
                this.sudoCells[i].manualSetValue(puzzle[i], '');
            } else {
                this.sudoCells[i].manualSetValue(puzzle[i], 'define');
            }
        }
        this.displayBenchmark(0, this.difficulty);
        this.displayPuzzle(uid, puzzleDbElement.name);
        this.refresh();
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
        this.sudoGroups = [];
        this.sudoRows = [];
        this.sudoCols = [];
        // Die 9 Gruppen anlegen
        for (let i = 0; i < 9; i++) {
            this.sudoGroups.push(new SudokuGroup(this, i));
        }
        // Die 81 Zellen anlegen und in ihre jeweilige Gruppe einfügen
        for (let i = 0; i < 81; i++) {
            let row = Math.floor(i / 9);
            let col = i % 9;
            let groupRow = Math.floor(row / 3);
            let groupCol = Math.floor(col / 3);
            let tmpGroupIndex = calcIndex(groupRow, groupCol);
            let tmpSudoCell = new SudokuCell(this, i);
            this.sudoCells.push(tmpSudoCell);
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
    displayPuzzle(uid, name) {
        if (uid == '') uid = ' - ';
        if (name == '') name = ' - ';
        let statusLineNode = document.getElementById('status-line');
        statusLineNode.innerHTML =
            '<b>Puzzle-Id:</b> &nbsp' + uid + '; &nbsp'
            + '<b>Puzzle-Name:</b> &nbsp' + name;
    }

    display() {
        // Das bisherige DOM-Modell löschen
        let domInputAreaNode = document.getElementById("gridArea");
        let old_domGridNode = document.getElementById("main-sudoku-grid");
        // Das neue DOM-Modell erzeugen
        let new_domGridNode = document.createElement('div');
        new_domGridNode.setAttribute('id', 'main-sudoku-grid');
        new_domGridNode.classList.add('main-sudoku-grid');
        domInputAreaNode.replaceChild(new_domGridNode, old_domGridNode);

        // Die 9 Gruppen anzeigen
        this.sudoGroups.forEach(sudoGroup => {
            sudoGroup.display(new_domGridNode);
        });
        this.sudoRows.forEach(sudoRow => {
            sudoRow.display();
        });
        this.sudoCols.forEach(sudoCol => {
            sudoCol.display();
        });
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
                (this.selectedCell.getValue() == '0') ||
                // Wenn die Zelle gefüllt ist, kann nur im gleichen Modus
                // eine Neusetzung erfolgen
                (this.selectedCell.getPhase() == currentPhase)
            ) {
                this.selectedCell.manualSetValue(btnNumber, currentPhase);
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
                (this.selectedCell.getValue() == '0') ||
                // Wenn die Zelle geüllt ist, kann nur im gleichen Modus
                // eine Neusetzung erfolgen
                (this.selectedCell.getPhase() == 'play')
            ) {
                this.selectedCell.autoSetValue(currentStep);
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
                this.selectedCell.clear();
                this.refresh();
                this.deselect();
            }
        }
    }

    evaluateGridLazy() {
        // Berechne das Grid nur soweit, 
        // dass der nächste eindeutige Schritt getan werden kann
        this.clearEvaluations();
        this.calculate_level_0_inAdmissibles();

        let inAdmissiblesAdded = true;
        while (inAdmissiblesAdded) {
            if (this.calculateNecessarysForNextStep()) return true;
            if (this.calculateSinglesForNextStep()) return true;
            if (this.calculateIndirectNecessarysForNextStep()) return true;

            inAdmissiblesAdded = false;

            // inAdmissiblesFromNecessarys kann es nicht mehr geben, 
            // weil die necessarys im ersten Teil der Schleife verbraucht werden

            // derive_inAdmissiblesFromSingles kann es nicht mehr geben,
            // aus dem gleichen Grund.

            if (this.derive_inAdmissiblesFromHiddenPairs()) {
                inAdmissiblesAdded = true;
            } else if (this.derive_inAdmissiblesFromEqualPairs()) {
                inAdmissiblesAdded = true;
            } else if (this.derive_inAdmissiblesFromOverlapping()) {
                inAdmissiblesAdded = true;
            }
        }
    }

    evaluateGridStrict() {
        this.clearEvaluations();
        this.calculate_level_0_inAdmissibles();

        this.calculateNecessarys();
        this.calculateIndirectNecessarys();

        let c1 = this.derive_inAdmissiblesFromNecessarys();
        let c2 = this.derive_inAdmissiblesFromSingles();
        let c3 = this.derive_inAdmissiblesFromHiddenPairs();
        let c4 = this.derive_inAdmissiblesFromEqualPairs();
        let c5 = this.derive_inAdmissiblesFromOverlapping();
        let inAdmissiblesAdded = c1 || c2 || c3 || c4 || c5;

        while (inAdmissiblesAdded) {
            let c1 = this.derive_inAdmissiblesFromNecessarys();
            let c2 = this.derive_inAdmissiblesFromSingles();
            let c3 = this.derive_inAdmissiblesFromHiddenPairs();
            let c4 = this.derive_inAdmissiblesFromEqualPairs();
            let c5 = this.derive_inAdmissiblesFromOverlapping();
            inAdmissiblesAdded = c1 || c2 || c3 || c4 || c5;
        }
    }

    clearEvaluations() {
        // Iteriere über die Gruppen
        for (let i = 0; i < 9; i++) {
            let tmpGroup = this.sudoGroups[i];
            tmpGroup.clearEvaluations();
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


    derive_inAdmissiblesFromNecessarys() {
        // Das zweite Auftreten einer notwendigen Nummer(indirekt oder direkt) ist indirekt unzulässig
        // Iteriere über alle Zellen

        let inAdmissiblesAdded = false;
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].getValue() == '0') {
                // Die Zelle ist ungesetzt
                let necessarysInContext = new SudokuSet();
                this.sudoCells[i].myInfluencers.forEach(cell => {
                    if (cell.getValue() == '0') {
                        necessarysInContext = necessarysInContext.union(cell.getNecessarys());
                        necessarysInContext = necessarysInContext.union(cell.getIndirectNecessarys());
                    }
                })
                let oldInAdmissibles = new SudokuSet(this.sudoCells[i].myLevel_gt0_inAdmissibles);
                // Nur zulässige können neu unzulässig werden.
                let tmpAdmissibles = this.sudoCells[i].getAdmissibles();
                let inAdmissiblesFromNecessarys = tmpAdmissibles.intersection(necessarysInContext);
                // Die indirekt unzulässigen werden neu gesetzt
                this.sudoCells[i].myLevel_gt0_inAdmissibles =
                    this.sudoCells[i].myLevel_gt0_inAdmissibles.union(inAdmissiblesFromNecessarys);

                let localAdded = !oldInAdmissibles.equals(this.sudoCells[i].myLevel_gt0_inAdmissibles);
                inAdmissiblesAdded = inAdmissiblesAdded || localAdded;
                if (localAdded) {
                    let newInAdmissibles =
                        this.sudoCells[i].myLevel_gt0_inAdmissibles.difference(oldInAdmissibles);
                    // Die Liste der indirekt unzulässigen verursacht von necessarys wird gesetzt
                    this.sudoCells[i].myLevel_gt0_inAdmissiblesFromNecessarys = newInAdmissibles;
                }
            }
        }
        return inAdmissiblesAdded;
    }

    calculateSinglesForNextStep() {
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
                    // Das ist die Situation: Dieselbe Single zweimal in einer Gruppe, Spalte oder Reihe.
                    // Also eine unlösbares Sudoku.
                    // Das weitere Ausrechnen bringt nichts, da die Unlösbarkeit
                    // bereits auf der Collection-Ebene festgestellt werden kann.
                    // Auch ist auf der Collection-Ebene die Unlösbarkeit für den Anwender leichter verständlich.
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

    derive_inAdmissiblesFromEqualPairs() {
        let c1 = false;
        let c2 = false;
        let c3 = false;
        // Iteriere über die Gruppen
        for (let i = 0; i < 9; i++) {
            let tmpGroup = this.sudoGroups[i];
            c1 = c1 || tmpGroup.derive_inAdmissiblesFromEqualPairs();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            c2 = c2 || tmpRow.derive_inAdmissiblesFromEqualPairs();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            c3 = c3 || tmpCol.derive_inAdmissiblesFromEqualPairs();
        }
        let inAdmissiblesAdded = c1 || c2 || c3;
        return inAdmissiblesAdded;
    }

    derive_inAdmissiblesFromHiddenPairs() {
        let c1 = false;
        let c2 = false;
        let c3 = false;
        // Iteriere über die Gruppen
        for (let i = 0; i < 9; i++) {
            let tmpGroup = this.sudoGroups[i];
            c1 = c1 || tmpGroup.derive_inAdmissiblesFromHiddenPairs();
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


    groupIndex_MatrixRow_2_GroupRow(matrixRow, groupIndex) {
        // GruppenIndex Matrixreihe auf Gruppenreihe
        switch (groupIndex) {
            case 0:
            case 1:
            case 2: {
                switch (matrixRow) {
                    case 0: return 0;
                    case 1: return 1;
                    case 2: return 2;
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8: return -1;
                }
            }
            case 3:
            case 4:
            case 5: {
                switch (matrixRow) {
                    case 0:
                    case 1:
                    case 2: return -1;
                    case 3: return 0;
                    case 4: return 1;
                    case 5: return 2;
                    case 6:
                    case 7:
                    case 8: return -1;
                }
            }
            case 6:
            case 7:
            case 8: {
                switch (matrixRow) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5: return -1;
                    case 6: return 0;
                    case 7: return 1;
                    case 8: return 2;
                }
            }
        }
    }

    groupIndex_MatrixCol_2_GroupCol(matrixCol, groupIndex) {
        // GruppenIndex Matrixreihe auf Gruppenreihe
        switch (groupIndex) {
            case 0:
            case 3:
            case 6: {
                switch (matrixCol) {
                    case 0: return 0;
                    case 1: return 1;
                    case 2: return 2;
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8: return -1;
                }
            }
            case 1:
            case 4:
            case 7: {
                switch (matrixCol) {
                    case 0:
                    case 1:
                    case 2: return -1;
                    case 3: return 0;
                    case 4: return 1;
                    case 5: return 2;
                    case 6:
                    case 7:
                    case 8: return -1;
                }
            }
            case 2:
            case 5:
            case 8: {
                switch (matrixCol) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5: return -1;
                    case 6: return 0;
                    case 7: return 1;
                    case 8: return 2;
                }
            }
        }
    }


    groupRow2MatrixRow(groupIndex, groupRow) {
        // Berechne für die aktuelle Gruppenzeile
        // die Matrixzeile
        switch (groupIndex) {
            case 0:
            case 1:
            case 2: {
                switch (groupRow) {
                    case 0: return 0;
                    case 1: return 1;
                    case 2: return 2;
                }
            }
            case 3:
            case 4:
            case 5: {
                switch (groupRow) {
                    case 0: return 3;
                    case 1: return 4;
                    case 2: return 5;
                }
            }
            case 6:
            case 7:
            case 8: {
                switch (groupRow) {
                    case 0: return 6;
                    case 1: return 7;
                    case 2: return 8;
                }
            }
        }
    }

    groupCol2MatrixCol(groupIndex, groupCol) {
        // Berechne für die Spalte in der aktuellen Gruppe
        // die Matrixspalte
        switch (groupIndex) {
            case 0:
            case 3:
            case 6: {
                switch (groupCol) {
                    case 0: return 0;
                    case 1: return 1;
                    case 2: return 2;
                }
            }
            case 1:
            case 4:
            case 7: {
                switch (groupCol) {
                    case 0: return 3;
                    case 1: return 4;
                    case 2: return 5;
                }
            }
            case 2:
            case 5:
            case 8: {
                switch (groupCol) {
                    case 0: return 6;
                    case 1: return 7;
                    case 2: return 8;
                }
            }
        }
    }

    cellOverlapInRowReduce(i, row, strongRow, strongNumbers) {
        let inAdmissiblesAdded = false;
        let matrixRow = this.groupRow2MatrixRow(i, row);
        for (let k = 0; k < 3; k++) {
            let colIndex = this.groupCol2MatrixCol(i, k);
            let tmpRow = this.sudoRows[matrixRow];
            let tmpCell = tmpRow.myCells[colIndex];

            if (tmpCell.getValue() == '0') {
                let oldInAdmissibles = new SudokuSet(tmpCell.myLevel_gt0_inAdmissibles);
                let tmpAdmissibles = tmpCell.getTotalAdmissibles();
                let inAdmissiblesFromOverlap = tmpAdmissibles.intersection(strongNumbers);

                if (inAdmissiblesFromOverlap.size > 0) {
                    tmpCell.myLevel_gt0_inAdmissibles =
                        tmpCell.myLevel_gt0_inAdmissibles.union(inAdmissiblesFromOverlap);
                    let localAdded = !oldInAdmissibles.equals(tmpCell.myLevel_gt0_inAdmissibles);
                    inAdmissiblesAdded = inAdmissiblesAdded || localAdded;
                    if (localAdded) {
                        let newInAdmissibles =
                            tmpCell.myLevel_gt0_inAdmissibles.difference(oldInAdmissibles);
                        // Die Liste der indirekt unzulässigen verursacht von overlap wird gesetzt
                        tmpCell.myLevel_gt0_inAdmissiblesFromOverlapping = newInAdmissibles;
                        let overlapInfo = {
                            group: this.sudoGroups[i],
                            rowCol: strongRow
                        }
                        tmpCell.myLevel_gt0_inAdmissiblesFromOverlappingInfo = overlapInfo;
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }





    cellOverlapInColReduce(i, col, strongCol, strongNumbers) {
        let inAdmissiblesAdded = false;
        let matrixCol = this.groupCol2MatrixCol(i, col);
        for (let k = 0; k < 3; k++) {
            let rowIndex = this.groupRow2MatrixRow(i, k);
            let tmpCol = this.sudoCols[matrixCol];
            let tmpCell = tmpCol.myCells[rowIndex];

            if (tmpCell.getValue() == '0') {
                let oldInAdmissibles = new SudokuSet(tmpCell.myLevel_gt0_inAdmissibles);
                let tmpAdmissibles = tmpCell.getTotalAdmissibles();
                let inAdmissiblesFromOverlap = tmpAdmissibles.intersection(strongNumbers);

                if (inAdmissiblesFromOverlap.size > 0) {

                    tmpCell.myLevel_gt0_inAdmissibles =
                        tmpCell.myLevel_gt0_inAdmissibles.union(inAdmissiblesFromOverlap);
                    let localAdded = !oldInAdmissibles.equals(tmpCell.myLevel_gt0_inAdmissibles);
                    inAdmissiblesAdded = inAdmissiblesAdded || localAdded;
                    if (localAdded) {
                        let newInAdmissibles =
                            tmpCell.myLevel_gt0_inAdmissibles.difference(oldInAdmissibles);
                        tmpCell.myLevel_gt0_inAdmissiblesFromOverlapping = newInAdmissibles;
                        let overlapInfo = {
                            group: this.sudoGroups[i],
                            rowCol: strongCol
                        };
                        tmpCell.myLevel_gt0_inAdmissiblesFromOverlappingInfo = overlapInfo;
                    }
                }
            }
        }
        return inAdmissiblesAdded;
    }



    derive_inAdmissiblesFromOverlapping() {
        // Iteriere über die Gruppen
        let tmpGroup = null;
        let tmpRow = null;
        let tmpCol = null;
        let inAdmissiblesAdded = false;

        for (let i = 0; i < 9; i++) {
            tmpGroup = this.sudoGroups[i];
            // Iteriere über die Zeilen der Gruppe
            for (let j = 0; j < 3; j++) {
                let z = this.groupRow2MatrixRow(i, j);
                let numbersInRowOutsideGroup = new SudokuSet();
                let numbersInRowInsideGroup = new SudokuSet();
                let strongNumbersInRowInsideGroup = new SudokuSet();
                // Iteriere über die Zellen der Reihe
                tmpRow = this.sudoRows[z];
                for (let k = 0; k < 9; k++) {
                    if (tmpRow.myCells[k].getValue() == '0') {
                        if (this.groupIndex_MatrixCol_2_GroupCol(k, i) >= 0 && this.groupIndex_MatrixCol_2_GroupCol(k, i) < 3) {
                            numbersInRowInsideGroup = numbersInRowInsideGroup.union(tmpRow.myCells[k].getTotalAdmissibles());
                        } else {
                            numbersInRowOutsideGroup = numbersInRowOutsideGroup.union(tmpRow.myCells[k].getTotalAdmissibles());
                        }
                    }
                    strongNumbersInRowInsideGroup = numbersInRowInsideGroup.difference(numbersInRowOutsideGroup);
                }
                // Die Gruppenzellen um die strengen Nummern reduzieren
                if (strongNumbersInRowInsideGroup.size > 0) {
                    // In 2 Reihen der Gruppe die strong nummern inadmissible setzen
                    let row1 = 0;
                    let row2 = 0;
                    switch (j) {
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
                    inAdmissiblesAdded = inAdmissiblesAdded || 
                        this.cellOverlapInRowReduce(i, row1, tmpRow, strongNumbersInRowInsideGroup);
                    inAdmissiblesAdded = inAdmissiblesAdded || 
                        this.cellOverlapInRowReduce(i, row2, tmpRow, strongNumbersInRowInsideGroup);
                }
            }
            // Iteriere über die Spalten der Gruppe
            for (let j = 0; j < 3; j++) {
                let colIndex = this.groupCol2MatrixCol(i, j);
                let numbersInColOutsideGroup = new SudokuSet();
                let numbersInColInsideGroup = new SudokuSet();
                let strongNumbersInColInsideGroup = new SudokuSet();
                // Iteriere über die Zellen der Reihe
                tmpCol = this.sudoCols[colIndex];
                for (let k = 0; k < 9; k++) {
                    if (tmpCol.myCells[k].getValue() == '0') {
                        if (this.groupIndex_MatrixRow_2_GroupRow(k, i) >= 0 && this.groupIndex_MatrixRow_2_GroupRow(k, i) < 3) {
                            numbersInColInsideGroup = numbersInColInsideGroup.union(tmpCol.myCells[k].getTotalAdmissibles());
                        } else {
                            numbersInColOutsideGroup = numbersInColOutsideGroup.union(tmpCol.myCells[k].getTotalAdmissibles());
                        }
                    }
                    strongNumbersInColInsideGroup = numbersInColInsideGroup.difference(numbersInColOutsideGroup);
                }
                // Die Gruppenzellen um die strengen Nummern reduzieren
                if (strongNumbersInColInsideGroup.size > 0) {
                    // In 2 Spalten der Gruppe die strong NUmmern inadmissible setzen
                    let col1 = 0;
                    let col2 = 0;
                    //
                    switch (j) {
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
                    inAdmissiblesAdded = inAdmissiblesAdded || 
                        this.cellOverlapInColReduce(i, col1, tmpCol, strongNumbersInColInsideGroup);
                    inAdmissiblesAdded = inAdmissiblesAdded || 
                        this.cellOverlapInColReduce(i, col2, tmpCol, strongNumbersInColInsideGroup)
                }
            }
        }
        return inAdmissiblesAdded;
    }


    refresh() {
        this.evaluateMatrix();
        if (inMainApp) {
            this.displayTechnique('&lt Selektiere Zelle mit roten Nummern &gt');
            this.display();
        }
    }

    deselect() {
        if (this.isCellSelected()) {
            // Deselektiere alle Zellen
            // Notwendig, weil die Überschneidung Selektionen zurücklässt
            for (let i = 0; i < 81; i++) {
                this.sudoCells[i].deselect();
            }    
            this.displayTechnique('&lt Selektiere Zelle mit roten Nummern &gt');
            // Lösche die Selektionsinformation der Tabelle
            this.selectedCell = undefined;
            this.indexSelected = -1;
        }
    }

    calculate_level_0_inAdmissibles() {
        // Berechne für jede nicht gesetzte Zelle 
        // die noch möglichen Nummern
        for (let i = 0; i < 81; i++) {
            let tmpCell = this.sudoCells[i];
            tmpCell.calculate_level_0_inAdmissibles();
        }
    }

    calculateNecessarysForNextStep() {
        // Berechne für jede nicht gesetzte Zelle
        // in der Menge ihrer möglichen Nummern die
        // notwendigen Nummern.

        // Iteriere über die Gruppen
        let added = false;
        for (let i = 0; i < 9; i++) {
            let tmpGroup = this.sudoGroups[i];
            if (tmpGroup.calculateNecessaryForNextStep()) {
                added = true;
                //      return added;
            }
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            if (tmpRow.calculateNecessaryForNextStep()) {
                added = true;
                //      return added;
            }
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            if (tmpCol.calculateNecessaryForNextStep()) {
                added = true;
                //      return added;
            }
        }

        return added;
    }

    calculateIndirectNecessarysForNextStep() {
        // Berechne für jede nicht gesetzte Zelle
        // in der Menge ihrer indirekt
        // notwendigen Nummern.

        // Iteriere über die Gruppen
        let added = false;
        for (let i = 0; i < 9; i++) {
            let tmpGroup = this.sudoGroups[i];
            if (tmpGroup.calculateIndirectNecessaryForNextStep()) {
                added = true;
                //      return added;
            }
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            if (tmpRow.calculateIndirectNecessaryForNextStep()) {
                added = true;
                //      return added;
            }
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            if (tmpCol.calculateIndirectNecessaryForNextStep()) {
                added = true;
                //      return added;
            }
        }

        return added;
    }

    calculateNecessarys() {
        // Berechne und setze für jede nicht gesetzte Zelle
        // in der Menge ihrer möglichen Nummern die
        // notwendigen Nummern
        // Iteriere über die Gruppen
        for (let i = 0; i < 9; i++) {
            let tmpGroup = this.sudoGroups[i];
            tmpGroup.calculateNecessarys();
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


    calculateIndirectNecessarys() {
        // Berechne und setze für jede nicht gesetzte Zelle
        // in der Menge ihrer möglichen Nummern die
        // notwendigen Nummern
        // Iteriere über die Gruppen
        for (let i = 0; i < 9; i++) {
            let tmpGroup = this.sudoGroups[i];
            tmpGroup.calculateIndirectNecessarys();
        }
        // Iteriere über die Reihen
        for (let i = 0; i < 9; i++) {
            let tmpRow = this.sudoRows[i];
            tmpRow.calculateIndirectNecessarys();
        }
        // Iteriere über die Spalten
        for (let i = 0; i < 9; i++) {
            let tmpCol = this.sudoCols[i];
            tmpCol.calculateIndirectNecessarys();
        }
    }

    select(sudoCell, index) {
        // Selektiere in der Tabelle eine Zelle
        // Parameter:
        //      cell: Wrapper der Zelle
        //      index: index der Zelle
        // 1. Lösche eine möglche alte Selektion
        this.deselect();
        // 2. Setze die neue Selektion in der slektierten Zelle
        sudoCell.select();
        // 3.Setze die information in der Tabelle 
        this.setCurrentSelection(sudoCell, index);
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

class SudokuCell {
    constructor(suTable, index) {
        // Die Zelle kennt ihre Tabelle und ihren Index
        this.myGrid = suTable;
        this.myIndex = index;
        // Die Zelle kennt ihre DOM-Version
        this.myCellNode = null;
        // Mit der Erzeugung des Wrappers wird
        // auch der Eventhandler der Zelle gesetzt
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
        // Die gesetzte Nummer dieser Zelle. 
        // Die Nummer '0' bedeutet ungesetzte Nummer.
        this.myValue = '0';
        // 'manual' oder 'auto'
        this.myValueType = 'manual';
        // Speichert die aktuell unzulässigen Zahlen für diese Zelle
        this.myLevel_0_inAdmissibles = new SudokuSet();
        this.myLevel_gt0_inAdmissibles = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromPairs = new Map();
        this.myLevel_gt0_inAdmissiblesFromHiddenPairs = new Map();
        this.myLevel_gt0_inAdmissiblesFromOverlapping = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromOverlappingInfo = null;

        this.myLevel_gt0_inAdmissiblesFromNecessarys = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromSingles = new SudokuSet();

        // Außer bei widerspruchsvollen Sudokus einelementig
        this.myNecessarys = new SudokuSet();
        this.myNecessaryCollections = new Map();

        // Außer bei widerspruchsvollen Sudokus einelementig
        this.myIndirectNecessarys = new SudokuSet();
        this.myIndirectNecessaryCollections = new Map();
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

    clear() {
        // Lösche Inhalt der Zelle
        this.myValue = '0';
        this.myValueType = 'manual';
        this.myGamePhase = '';
        this.clearEvaluations();
    }

    clearEvaluations() {
        this.myLevel_0_inAdmissibles = new SudokuSet();
        this.myLevel_gt0_inAdmissibles = new SudokuSet();
        this.myNecessarys = new SudokuSet();
        this.myIndirectNecessarys = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromPairs = new Map();
        this.myLevel_gt0_inAdmissiblesFromHiddenPairs = new Map();
        this.myLevel_gt0_inAdmissiblesFromOverlapping = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromOverlappingInfo = null;
        this.myLevel_gt0_inAdmissiblesFromNecessarys = new SudokuSet();
        this.myLevel_gt0_inAdmissiblesFromSingles = new SudokuSet();

    }

    calculate_level_0_inAdmissibles() {
        // Level 0 unzulässige Nummern dieser Zelle sind Nummern,
        // die an anderer Stelle in der Gruppe, Zeile oder Spalte dieser Zelle
        // gesetzt sind.Sie werden in der Zelle nicht mehr angezeigt
        this.myInfluencers.forEach(influenceCell => {
            if (influenceCell.getValue() !== '0') {
                // Die Einflusszelle ist gesetzt
                this.myLevel_0_inAdmissibles.add(influenceCell.getValue());
            }
        })
        return this.myLevel_0_inAdmissibles;
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
        // Die zulässigen Zahlen einer Zelle sind das Komplement der unzulässigen Zahlen
        return new SudokuSet(['1', '2', '3', '4', '5', '6', '7', '8', '9']).difference(
            this.getTotalInAdmissibles());
    }

    getNecessarys() {
        return new SudokuSet(this.myNecessarys);
    }
    getIndirectNecessarys() {
        return new SudokuSet(this.myIndirectNecessarys);
    }
    containsNecessaryNr() {
        return this.myNecessarys.size == 1;
    }
    containsIndirectNecessaryNr() {
        return this.myIndirectNecessarys.size == 1;
    }
    containsDirectSingle() {
        return this.myLevel_0_inAdmissibles.size == 8;
    }
    containsIndirectSingle() {
        return this.getTotalInAdmissibles().size == 8 &&
            !this.containsDirectSingle();
    }
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
    displayAdmissibles() {
        let inAdmissiblesVisible = (this.myGrid.evalType == 'lazy' || this.myGrid.evalType == 'strict-plus');
        if (inAdmissiblesVisible) {
            this.myCellNode.classList.add('nested');
            // Übertrage die berechneten Möglchen in das DOM
            this.getAdmissibles().forEach(e => {
                let admissibleNrElement = document.createElement('div');
                admissibleNrElement.setAttribute('data-value', e);
                admissibleNrElement.innerHTML = e;
                this.myCellNode.appendChild(admissibleNrElement);
            });
        } else {
            // Angezeigte inAdmissibles sind zunächst einmal Zulässige
            // und dürfen jetzt nicht mehr angezeigt werden
            this.myCellNode.classList.add('nested');
            // Übertrage die berechneten Möglichen in das DOM
            // In widerspruchsvollen Sudokus kann eine Nummer gleichzeitig
            // notwendig und unzulässig sein. Solche Nummern sollen sichtbar bleiben.
            this.getTotalAdmissibles().forEach(e => {
                let admissibleNrElement = document.createElement('div');
                admissibleNrElement.setAttribute('data-value', e);
                admissibleNrElement.innerHTML = e;
                this.myCellNode.appendChild(admissibleNrElement);
            });
        }
    }

    displayNecessary() {
        let admissibleNodes = this.myCellNode.children;
        for (let i = 0; i < admissibleNodes.length; i++) {
            if (this.myNecessarys.has(admissibleNodes[i].getAttribute('data-value'))) {
                admissibleNodes[i].classList.add('neccessary');
            } else if (this.myIndirectNecessarys.has(admissibleNodes[i].getAttribute('data-value'))) {
                // Jede direkt notwendige Nummer ist
                // auch eine indirekt notwendige Nummer
                // Nur wenn die notwendige Nummer echt indirekt notwendig ist,
                // folgt die folgende Zeile.
                admissibleNodes[i].classList.add('indirect-neccessary');
            }
        }
    }

    /*
    displayIndirectNecessary() {
        let admissibleNodes = this.myCellNode.children;
        for (let i = 0; i < admissibleNodes.length; i++) {
            if (this.myIndirectNecessarys.has(admissibleNodes[i].getAttribute('data-value'))) {
                admissibleNodes[i].classList.add('indirect-neccessary');
 
            }
 
        }
    }
    */

    displayLevel_gt0_inAdmissibles() {
        let admissibleNodes = this.myCellNode.children;
        for (let i = 0; i < admissibleNodes.length; i++) {
            if (this.myLevel_gt0_inAdmissibles.has(admissibleNodes[i].getAttribute('data-value'))) {
                admissibleNodes[i].classList.add('inAdmissible');
            }
        }
    }

    displayGamePhase() {
        if (this.myGamePhase == 'define') {
            this.myCellNode.classList.add('define');
            this.myCellNode.classList.remove('play');
        } else {
            this.myCellNode.classList.add('play');
            this.myCellNode.classList.remove('define');
        }
    }

    displayMainValueNode() {
        this.myCellNode.setAttribute('data-value', this.myValue);
        this.myCellNode.innerHTML = this.myValue;
    }

    displayAutoStepNumber(autoValueCellNode) {
        // Die step-Nummer, also die wievielte Nummer wird gesetzt
        let autoStepNumberElement = document.createElement('div');
        autoStepNumberElement.setAttribute('class', 'auto-step-number');
        autoStepNumberElement.innerHTML = this.myAutoStepNumber;
        autoValueCellNode.appendChild(autoStepNumberElement);
    }

    displaySubValueNode(autoValueCellNode) {
        // Die gesetzte Nummer im Tripel
        let cellNumberElement = document.createElement('div');
        cellNumberElement.setAttribute('class', 'auto-value-number');
        cellNumberElement.innerHTML = this.myValue;
        autoValueCellNode.appendChild(cellNumberElement);
    }

    displayOptions(autoValueCellNode) {
        // Die optionalen Elemente dieser Zelle

        //    let optionNode = document.createElement('div');
        //    optionNode.setAttribute('class', 'value-options');

        let optionLength = this.myOptions.length;

        if (optionLength > 2) {
            // 3 Optionen werden optisch dargestellt
            // Die erste Option
            let option = this.myOptions[0];
            let optionNumberElement = document.createElement('div');
            optionNumberElement.classList.add('auto-value-option1');
            if (option.open) {
                optionNumberElement.classList.add('open');
            }
            optionNumberElement.innerHTML = option.value;
            autoValueCellNode.appendChild(optionNumberElement);

            // Die zweite Option
            option = this.myOptions[1];
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
            let option = this.myOptions[0];
            let optionNumberElement = document.createElement('div');
            optionNumberElement.classList.add('auto-value-option1');
            if (option.open) {
                optionNumberElement.classList.add('open');
            }
            optionNumberElement.innerHTML = option.value;
            autoValueCellNode.appendChild(optionNumberElement);

            // Die zweite Option
            option = this.myOptions[1];
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
            let option = this.myOptions[0];
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
        this.myCellNode.setAttribute('data-value', this.myValue);
        // Automatisch gesetzte Nummer
        this.myCellNode.classList.add('auto-value');

        // Neuer Knotentyp für aut.values
        let autoValueCellNode = document.createElement("div");
        autoValueCellNode.setAttribute("class", "auto-value-cell");
        this.myCellNode.appendChild(autoValueCellNode);
        // Die Schrittnummer setzen
        this.displayAutoStepNumber(autoValueCellNode);
        // Die automatische Nummer setzen
        this.displaySubValueNode(autoValueCellNode);
        // Die Optionen
        this.displayOptions(autoValueCellNode);
    }

    displayManualValue() {
        this.displayMainValueNode();
    }

    display(groupNode) {
        // Die DOM-Version der Zelle wird erzeugt
        let cellNode = document.createElement("div");
        cellNode.setAttribute("class", "sudoku-grid-cell");
        // Neue Zelle in ihre Gruppe einhängen
        groupNode.appendChild(cellNode);
        this.myCellNode = cellNode;
        this.myCellNode.addEventListener('click', () => {
            sudoApp.sudokuCellPressed(this, this.myIndex);
        });
        return this.displayCellContent();
    }

    displayCellContent() {
        if (this.myValue == '0') {
            // Die Zelle ist noch nicht gesetzt
            this.displayAdmissibles();
            this.displayNecessary();
            // this.displayIndirectNecessary();
            this.displayLevel_gt0_inAdmissibles();
        } else {
            // Die Zelle ist mit einer Nummer belegt
            // Setze die Klassifizierung in der DOM-Zelle
            this.displayGamePhase();
            if (this.myValueType == 'auto') {
                this.displayAutoValue();
            } else {
                this.displayManualValue();
            }
        }
        return this.displayError();
    }


    manualSetValue(nr, gamePhase) {
        this.myValue = nr;
        this.myValueType = 'manual';
        this.myGamePhase = gamePhase;
        this.myAutoStepNumber = this.myGrid.countSolvedSteps() - this.myGrid.countDefSteps();
    }

    autoSetValue(currentStep) {
        let nr = currentStep.getValue();
        this.myValue = nr;
        this.myValueType = 'auto';
        this.myGamePhase = 'play';
        this.myAutoStepNumber = this.myGrid.countSolvedSteps() - this.myGrid.countDefSteps();
        this.myOptions = currentStep.options();
    }

    clearAutoExecInfo() {
        this.myValueType = 'manual';
        this.myAutoStepNumber = 0;
        this.myOptions = [];
    }


    displayError() {
        if (this.isInsolvable()) {
            this.myCellNode.classList.add('err');
            this.myCellNode.classList.add('cell-err');
            setTimeout(() => {
                this.myCellNode.classList.remove('cell-err');
            }, 500);
            return true;
        } else {
            this.myCellNode.classList.remove('err');
            return false;
        }
    }

    displayRowError(errorStatus) {
        if (errorStatus) {
            if (this.myGroup.myGroupNode.classList.contains('err')) {
                // Dann wird der Row-error nicht angezeigt.
            } else {
                this.myCellNode.classList.add('row-err');
                this.myCellNode.classList.add('cell-err');
                setTimeout(() => {
                    this.myCellNode.classList.remove('cell-err');
                }, 500);
            }
        } else {
            this.myCellNode.classList.remove('row-err');
        }
    }

    displayColError(errorStatus) {
        if (errorStatus) {
            if (this.myGroup.myGroupNode.classList.contains('err')) {
                // Dann wird der Row-error nicht angezeigt.
            } else {
                this.myCellNode.classList.add('col-err');
                this.myCellNode.classList.add('cell-err');
                setTimeout(() => {
                    this.myCellNode.classList.remove('cell-err');
                }, 500);
            }
        } else {
            this.myCellNode.classList.remove('col-err');
        }
    }

    getPhase() {
        return this.myGamePhase;
    }

    setPhase(phase) {
        this.myGamePhase = phase;
    }

    select() {
        if (inMainApp) {
            this.myCellNode.classList.add('selected');
        }
        if (sudoApp.suGrid.evalType == 'lazy') {
            // Wenn die selektierte Zelle eine notwendige Nummer hat, dann
            // wird die verursachende collection angezeigt.
            sudoApp.suGrid.displayTechnique('&lt Selektiere Zelle mit roten Nummern &gt');
     
            if (this.myNecessarys.size > 0) {
                let collection = this.myNecessaryCollections.get(Array.from(this.myNecessarys)[0]);
                collection.myCells.forEach(e => {
                    if (e !== this) {
                        e.setGreenSelected()
                    }
                });
                return;
            }
            if (this.myIndirectNecessarys.size > 0) {
                let collection = this.myIndirectNecessaryCollections.get(Array.from(this.myIndirectNecessarys)[0]);
                collection.myCells.forEach(e => {
                    if (e !== this) {
                        e.setGreenSelected()
                    }
                });
                return;
            }

            if (this.myLevel_gt0_inAdmissibles.size > 0 &&
                this.myLevel_gt0_inAdmissiblesFromNecessarys.size > 0) {
                // Wenn die selektierte Zelle eine rote Nummer enthält, die durch eine notwendige
                // Nummer verursacht ist, wird dies angezeigt.
                this.myLevel_gt0_inAdmissiblesFromNecessarys.forEach(nr => {
                    this.myInfluencers.forEach(cell => {
                        cell.setSelected();
                        if (cell.getNecessarys().has(nr)) {
                            cell.setRedSelected();
                        }
                    })
                })
            }

            if (this.myLevel_gt0_inAdmissibles.size > 0 &&
                this.myLevel_gt0_inAdmissiblesFromSingles.size > 0) {
                // Wenn die selektierte Zelle eine rote Nummer enthält, die durch eine Single
                // verursacht ist, wird dies angezeigt.
                this.myLevel_gt0_inAdmissiblesFromSingles.forEach(nr => {
                    this.myInfluencers.forEach(cell => {
                        cell.setSelected();
                        if (cell.getTotalSingles().has(nr)) {
                            cell.setRedSelected();
                        }
                    })
                })
            }


            if (this.myLevel_gt0_inAdmissibles.size > 0 &&
                this.myLevel_gt0_inAdmissiblesFromPairs.size > 0) {
                // Wenn für die selektierte Zelle kritische Paare gespeichert sind,
                // dann gibt es in der Zelle indirekt unzulässige Nummern, die durch sie
                // verursacht werden.
                // Die Gruppe, Spalte oder Zeile des Paares wird markiert.
                this.myLevel_gt0_inAdmissiblesFromPairs.forEach(pairInfo => {
                    pairInfo.collection.myCells.forEach(cell => {
                        if (cell !== this) {
                            cell.setSelected();
                        }
                    });
                    pairInfo.pairCell1.setRedSelected();
                    pairInfo.pairCell2.setRedSelected();
                })
                sudoApp.suGrid.displayTechnique('(Normales) Paar')
            }


            if (this.myLevel_gt0_inAdmissibles.size > 0 &&
                this.myLevel_gt0_inAdmissiblesFromHiddenPairs.size > 0) {
                // Für ein Subpaar muss nicht jede einzelne Nummer geprüft werden.
                // 
                const [pairInfo] = this.myLevel_gt0_inAdmissiblesFromHiddenPairs.values();
                pairInfo.collection.myCells.forEach(cell => {
                    if (cell == pairInfo.subPairCell1 || cell == pairInfo.subPairCell2) {
                        cell.setRedSelected();
                    } else {
                        cell.setSelected();
                    }
                });
                sudoApp.suGrid.displayTechnique('Verstecktes Paar')
            }

            if (this.myLevel_gt0_inAdmissibles.size > 0 &&
                this.myLevel_gt0_inAdmissiblesFromOverlapping.size > 0) {

                this.myLevel_gt0_inAdmissiblesFromOverlappingInfo.group.myCells.forEach(cell => {
                    cell.setSelected();
                });
                this.myLevel_gt0_inAdmissiblesFromOverlappingInfo.rowCol.myCells.forEach(cell => {
                    cell.setSelected();
                });

                sudoApp.suGrid.displayTechnique('Überschneidung');

            }
        }
    }

    setSelected() {
        if (inMainApp) {
            this.myCellNode.classList.add('hover');
        }
    }
    setRedSelected() {
        if (inMainApp) {
            this.myCellNode.classList.add('hover-red');
        }
    }

    setGreenSelected() {
        if (inMainApp) {
            this.myCellNode.classList.add('hover-green');
        }
    }

    deselect() {
        if (inMainApp) {
            this.myCellNode.classList.remove('selected');
            this.unsetSelected();
         //   this.myInfluencers.forEach(e => e.unsetSelected());
        }
    }
    unsetSelected() {
        if (inMainApp) {
            this.myCellNode.classList.remove('hover');
            this.myCellNode.classList.remove('hover-red');
            this.myCellNode.classList.remove('hover-green');
        }
    }
    getValue() {
        return this.myValue;
    }

    getCellNode() {
        return this.myCellNode;
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
                    summand = influencer.getTotalAdmissibles().size;
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

    addIndirectNecessary(nr, nineCellCollection) {
        this.myIndirectNecessarys.add(nr);
        this.myIndirectNecessaryCollections.set(nr, nineCellCollection);
    }


    isInsolvable() {
        return (
            // Für die nicht gesetzte Zelle ist die Anzahl notwendiger Nummern größer 1
            (this.getValue() == '0' && this.myNecessarys.size > 1) ||
            // Eine notwendige Nummer ist gleichzeitig unzulässig      
            // this.myLevel_0_inAdmissibles.union(this.myLevel_gt0_inAdmissibles).intersection(this.myNecessarys).size > 0 ||
            // Für die Zelle gibt es keine total zulässige Nummer mehr.
            this.getTotalAdmissibles().size == 0 ||
            // Die Nummer der gesetzten Zelle ist nicht zulässig.
            (this.getValue() !== '0' && this.myLevel_0_inAdmissibles.has(this.getValue())));
    }

    getIndex() {
        return this.myIndex;
    }
}
class SudokuPuzzleDB {
    constructor() {
        // Hole den Speicher als ein Objekt
        let str_puzzleDB = localStorage.getItem("localSudokuDB");
        if (str_puzzleDB == null) {
            // Falls der Local-Storage leer ist, wird ein erstes Puzzle angelegt.
            let puzzleDbElement = new SudokuPuzzle(
                "BeispielSchwer",
                26,
                'ungelöst',
                0,
                0,
                'Keine Angabe',
                0,
                (new Date()).toJSON(),
                [
                    "0", "0", "0", "3", "0", "0", "0", "0", "5",
                    "0", "2", "0", "0", "8", "9", "0", "0", "0",
                    "0", "0", "8", "0", "0", "6", "0", "0", "3",
                    "8", "0", "9", "0", "0", "1", "0", "3", "6",
                    "0", "0", "0", "9", "0", "3", "0", "5", "0",
                    "0", "0", "1", "7", "0", "0", "0", "0", "0",
                    "0", "0", "0", "0", "0", "0", "0", "7", "1",
                    "0", "8", "2", "0", "1", "0", "0", "0", "0",
                    "0", "1", "0", "0", "3", "4", "0", "0", "0"
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

            let puzzleMap = new Map();
            let uid = Date.now().toString(36) + Math.random().toString(36).substr(2);
            puzzleMap.set(uid, puzzleDbElement);
            // Kreiere die JSON-Version des Speicherobjektes
            // und speichere sie.
            let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
            localStorage.setItem("localSudokuDB", update_str_puzzleMap);
        }
        // Der Index wird auf jeden Fall auf das erste Puzzle gesetzt
        this.selectedIndex = 0;
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

        //Click-Event für die Spaltenköpfe
        document.getElementById('col-name').addEventListener('click', () => {
            this.sort('name');
        });
        document.getElementById('col-defCount').addEventListener('click', () => {
            this.sort('defCount');
        });
        document.getElementById('col-status').addEventListener('click', () => {
            this.sort('status');
        });
        document.getElementById('col-steps-lazy').addEventListener('click', () => {
            this.sort('steps-lazy');
        });
        document.getElementById('col-steps-strict').addEventListener('click', () => {
            this.sort('steps-strict');
        });
        document.getElementById('col-level').addEventListener('click', () => {
            this.sort('level');
        });
        document.getElementById('col-backTracks').addEventListener('click', () => {
            this.sort('backTracks');
        });
        document.getElementById('col-date').addEventListener('click', () => {
            this.sort('date');
        });
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
        // Hole den Speicher als ein Objekt
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let key = Array.from(puzzleMap.keys())[this.selectedIndex];
        if (this.selectedIndex > 0) {
            this.selectedIndex--;
        }
        if (puzzleMap.size > 1) {
            puzzleMap.delete(key);
            let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
            localStorage.setItem("localSudokuDB", update_str_puzzleMap);
            this.display();
        }
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
            // Eine Zeile bleibt erhalten
            tbNode.removeChild(tbNode.lastChild);
        }

        let i = 0;
        let selectedTr = null;
        for (let [key, pz] of puzzleMap) {
            let tr = document.createElement('tr');
            tr.setAttribute("onClick", "sudoApp.sudokuPuzzleDB.setSelected(this)");
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


    displayClear() {
        this.displayClearPZNr();
        this.displayClearTable('screen-puzzle');
        this.displayClearTable('solution');
    }


    displayCurrentPZ() {
        this.displayClear()
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
        let key = Array.from(puzzleMap.keys())[this.selectedIndex];
        let selectedPZ = puzzleMap.get(key);
        this.displayIdRow(key, selectedPZ.name, selectedPZ.level);
        this.displayTable('screen-puzzle', selectedPZ.puzzle);
        this.displayTable('solution', selectedPZ.solution);
        this.displayDefineCounter(selectedPZ);
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
                if (tableArray[k] == '0') {
                    let currentText = document.createTextNode('');
                    cellField.appendChild(currentText);
                } else {
                    let currentText = document.createTextNode(tableArray[k]);
                    cellField.appendChild(currentText);
                }
                cellField.style.border = "1px solid white";
                if (row === 2 || row === 5) {
                    cellField.style.borderBottom = "4px solid white";
                }
                if (col === 2 || col === 5) {
                    cellField.style.borderRight = "4px solid white";
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
                if (tableArray[k] == '0') {
                    let currentText = document.createTextNode('');
                    cellField.appendChild(currentText);
                } else {
                    let currentText = document.createTextNode(tableArray[k]);
                    cellField.appendChild(currentText);
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