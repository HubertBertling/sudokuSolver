let sudoApp;

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
        document.querySelector('#btn-redo').addEventListener('click', () => {
            sudoApp.historyStepForward();
        });
        document.querySelector('#btn-undo').addEventListener('click', () => {
            sudoApp.historyStepBackward();
        });

        // Automatische Ausführung: vollautomatisch
        document.querySelector('#btn-run').addEventListener('click', () => {
            sudoApp.automatedRun();
        });
        // Automatische Ausführung: schrittweise
        document.querySelector('#btn-autoStep').addEventListener('click', () => {
            sudoApp.autoStep();
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
        this.suGrid.autoStep(this.currentMode);
    }

    numberButtonPressed(btnNumber) {
        this.suGrid.atCurrentSelectionSetNumber(btnNumber, this.currentMode);
    }
    deleteCellButtonPressed() {
        this.suGrid.deleteSelected(this.currentMode);
    }

    initButtonPressed() {
        this.suGrid.initGrid();
    }
    resetBtnPressed() {
        this.suGrid.reset();
    }

    saveBtnPressed() {
        // Zustand soll gespeichert werden
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
            //Lösche aktuelle Selektio
            this.suGrid.deselect();
            // Setze den aus dem Speicher geholten Zustand
            this.suGrid.setCurrentState(tmpState);
            // Berechne die möglichen Inhalte der Zellen
            this.suGrid.recalculatePermissibleSets();
            // Berechne potentiell vorhandene Konflikte
            this.suGrid.reCalculateErrorCells();
            // Berechne die notwendigen Zellinhalte
            this.suGrid.reEvaluateUniquePerms();
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
        // Die autoselected number ist eine von 1...9
        this.autoSelected = '0';
        //Backtracking
        this.backTrackStack = [];
        // Ermöglicht schrittweises Vor- und Zurückgehen in der Lösung
        // this.actionHistory = [];
    }


    autoStep(currentMode) {
        // Führt abwechselnd select- und Nummernsetzoprationen durch
        // Kein Deadlock bisher
        if (!this.deadlockReached()) {
            // Eine Selektion ist gesetzt
            if (parseInt(this.autoSelected) > 0) {
                this.atCurrentSelectionSetNumber(this.autoSelected, currentMode)
            } else {
                //Eine Selektion wird gesetzt
                this.autoSelect(currentMode);
            }

        } else {
            // Deadlock reached
            // Back track ...
        }
    }
    autoSelect(currentMode) {
        for (let i = 0; i < 81; i++) {
            // Die Zelle ist noch nicht gesetzt
            if (this.sudoCells[i].value() == '0') {
                let tmpNr = this.sudoCells[i].hasUniqueSolution();
                let tmpNrInt = parseInt(tmpNr);
                // tmpNr is indeed a unque number
                if (tmpNrInt > 0) {
                    // Set selection
                    this.selectCell(this.sudoCells[i], tmpNr);
                    this.autoSelected = tmpNr;
                    return tmpNr;
                }
            }
        }
    }
    /*
       stepBackward() {
          //Lösche die zuletzt gesetzte Zelle
          if (this.actionHistory.length > '0') {
              let action = this.actionHistory.pop();
              if (action.op === "setNumber") {
                  this.select(this.currentMode, action.cellIndex);
                  this.suGrid.deleteSelected(this.currentMode);
              } 
          }
      }
      */




    deadlockReached() {
        // Deadlock ist erreicht, wenn es eine unlösbare Zelle gibt
        for (let i = 0; i < 81; i++) {
            if (this.sudoCells[i].isInsolvable()) {
                return true;
            }
        }
        return false;
    }

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
        this.reEvaluateUniquePerms();
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

    initGrid() {
        // Die Tabelle wird initialisert
        // Schritt 1: Die aktuelle Zellenselektion wird zurückgesetzt
        this.selectedCell = undefined;
        this.indexSelected = -1;
        this.autoSelected = '0';
        //this.actionHistory = [];
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

    reset() {
        // Alle im Mode 'play' gesetzten Zahlen werden gelöscht
        // Die Zellen der Aufgabenstellung bleiben erhalten
        // Schritt 1: Die aktuelle Selektion wird zurückgesetzt
        this.selectedCell = undefined;
        this.indexSelected = -1;
        this.autoSelected = '0';
        //this.actionHistory = [];
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
        this.reEvaluateUniquePerms();
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

    atCurrentSelectionSetNumber(btnNumber, currentMode) {
        // Setze Nummer in einer Zelle
        if ( // Das geht nur, wenn eine Zelle selektiert ist
            this.indexSelected !== -1) {
            if (// Wenn die Zelle leer ist, kein Problem
                (this.selectedCell.value() == '0') ||
                // Wenn die Zelle geüllt ist, kann nur im gleichen Modus
                // eine Neusetzung erfolgen
                (this.selectedCell.getMode() == currentMode)

            ) {
                this.selectedCell.setNumber(btnNumber, currentMode);
                // Setze action in der action history
                //let action = { op: "setNumber", cellIndex: this.indexSelected };
                //this.actionHistory.push(action);
                // Berechne die jetzt noch möglichen Inhalte der Zellen
                this.recalculatePermissibleSets();
                // Berechne potentiell jetzt vorhandene Konflikte
                this.reCalculateErrorCells();
                // Berechne die jetzt notwendigen Zellinhalte
                this.reEvaluateUniquePerms();
                // Nehme die aktuelle Selektion zurück
                this.deselect();
            }
        }
    }

    reEvaluateUniquePerms() {
        // Bestimme für alle 9 Gruppen der Tabelle 
        // ob es eine Ziffer gibt, die in der Gruppe
        // nur genau einmal vorkommt. 
        // Dann ist sie notwendig.
        for (let i = 0; i < 9; i++) {
            this.checkUniquesInGroup(i);
        }
    }

    checkUniquesInGroup(groupNr) {
        for (let i = 1; i < 10; i++) {
            let cellIndex = this.isNrUniqueInGroupInCell(groupNr, i);
            if (cellIndex !== -1) {
                this.sudoCells[cellIndex].setNecessary(i);
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
        this.selectedCell.deselect();
        // Lösche die aktuelle Selektionsinformation in der Tabelle
        this.selectedCell = undefined;
        this.indexSelected = -1;
        this.autoSelected = '0';
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

    deleteSelected(currentMode) {
        // Lösche die selektierte Zelle
        if (this.indexSelected !== -1) {
            // Das Löschen kann nur im gleichen Modus
            // eine Neusetzung erfolgen
            if (this.selectedCell.getMode() == currentMode) {
                this.selectedCell.delete();
                //let action = { op: "deleteNumber", cell: this.indexSelected };
                //this.actionHistory.push(action);
                // Berechne die jetzt noch möglichen Inhalte der Zellen
                this.recalculatePermissibleSets();
                // Berechne potentiell jetzt (nicht mehr) vorhandene Konflikte
                this.reCalculateErrorCells();
                // Berechne die jetzt (nicht mehr) notwendigen Zellinhalte
                this.reEvaluateUniquePerms();
                // Nehme die aktuelle Selektion zurück
                this.deselect();
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
        // Setze eine Zelle auf selektiert
        if (this.indexSelected !== -1) {
            // Löse eine potentiell bisher vorhandene Selektion
            this.selectedCell.deselect();
            this.indexSelected = -1;
            this.autoSelected = '0';
        }
        // Setze die neue Selektion
        cell.select();
        this.indexSelected = index;
        this.selectedCell = cell;
    }

    select(cellNode, index) {
        // Setze eine Zelle auf selektiert
        let tmpCell = this.cellOf(cellNode);
        this.selectCell(tmpCell, index);
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
        this.calculatePermissibleNumbers();
        this.setPermissibleNumbers();
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
            return (this.necessary.length > 1 || this.myPermissibles.size == 0);
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