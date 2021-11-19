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
        this.suGrid = new SudokuGrid();

        //Die Buttons der App werden Event-Hhandler zugeordnet
        // Nummer-Buttons
        this.number_inputs = document.querySelectorAll('.number');
        // Hinweis: index + 1 = number on button
        this.number_inputs.forEach((e, index) => {

            e.addEventListener('click', () => {
                sudoApp.numberButtonPressed(index + 1)
            })

        });
        // Die beiden Mode-button 
        document.querySelector('#btn-define').addEventListener('click', () => {
            sudoApp.setMode('define');
        });
        document.querySelector('#btn-play').addEventListener('click', () => {
            sudoApp.setMode('play');
        });

        //Der Delete-Button
        document.querySelector('#btn-delete').addEventListener('click', () => {
            sudoApp.deleteButtonPressed();
        });

        // Der Initialisieren-Button
        document.querySelector('#btn-init').addEventListener('click', () => {
            sudoApp.initButtonPressed();
        });
        // Der Zurücksetzen-Button
        document.querySelector('#btn-reset').addEventListener('click', () => {
            sudoApp.resetBtnPressed();
        });
        // Der Speichern-Button
        document.querySelector('#btn-save').addEventListener('click', () => {
            sudoApp.saveBtnPressed();
        });
        // Der Wiederherstellen--Button
        document.querySelector('#btn-restore').addEventListener('click', () => {
            sudoApp.restoreBtnPressed();
        });

    }
    init() {
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

    numberButtonPressed(btnNumber) {
        this.suGrid.atCurrentSelectionSetNumber(btnNumber, this.currentMode);
    }
    deleteButtonPressed() {
        this.suGrid.deleteSelected(this.currentMode);
    }

    initButtonPressed() {
        this.suGrid.initGrid();
    }
    resetBtnPressed() {
        this.suGrid.reset();
    }
    saveBtnPressed() {
        this.pushCurrentState();
    }
    restoreBtnPressed() {
        this.popCurrentState();
    }
    sudokuCellPressed(cellNode, index) {
        this.suGrid.select(cellNode, index);
    }
    getMode() {
        return this.currentMode;
    }

    pushCurrentState() {
        let str_storageOBj = localStorage.getItem("sudokuStorage")
        let storageObj = JSON.parse(str_storageOBj);
        if (storageObj == null) {
            storageObj = [];
        }

        let currentState = this.suGrid.getCurrentState();
        storageObj.push(currentState);

        let updateStorageObj = JSON.stringify(storageObj);
        localStorage.setItem("sudokuStorage", updateStorageObj);
    }
    popCurrentState() {
        let str_storageOBj = localStorage.getItem("sudokuStorage")
        let storageObj = JSON.parse(str_storageOBj);

        let previousState = storageObj.pop();
        this.suGrid.setCurrentState(previousState);

        let updateStorageObj = JSON.stringify(storageObj);
        localStorage.setItem("sudokuStorage", updateStorageObj);
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
    }

    getCurrentState() {
        let tmpState = [];
        for (let i = 0; i < 81; i++) {
            let storedCell = {
                cellValue: this.sudoCells[i].value(),
                cellMode: this.sudoCells[i].getMode()
            };
            tmpState.push(storedCell);
        }
        return tmpState;
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
            // und im Arry sudoCells gespeicehrt
            let tmpSudoCell = new SudokuCell(this, i, this.cells[i]);
            this.sudoCells.push(tmpSudoCell);

            // Gleichzeitig werden die Wrapper-Zellen Grupprn gespeichert.
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
                (this.selectedCell.value() == 0) ||
                // Wenn die Zelle geüllt ist, kann nur im gleichen Modus
                // eine Neusetzung erfolgen
                (this.selectedCell.getMode() == currentMode)
                // 
            ) {
                this.selectedCell.setNumber(btnNumber, currentMode);
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

            if (currentGroup[i].value() == 0) {
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
    }

    recalculatePermissibleSets() {
        for (let i = 0; i < this.sudoCells.length; i++) {
            let tmpCell = this.sudoCells[i];
            tmpCell.calculatePermissibleNumbers();
            // Nur leere Zellen erhalten möglche Nummern
            if (tmpCell.value() == 0) {
                tmpCell.setPermissibleNumbers();
            }
        }
    }

    reCalculateErrorCells() {
        for (let i = 0; i < this.sudoCells.length; i++) {
            let tmpCell = this.sudoCells[i];
            tmpCell.unsetError();
            if (tmpCell.isContradictory()) {
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

    select(cellNode, index) {
        // Setze eine Zelle auf selektiert
        if (this.indexSelected !== -1) {
            // Löse eine potentiell bisher vorhandene Selektion
            this.selectedCell.deselect();
            this.indexSelected = -1;
        }
        // Setze die neue Selektion
        let tmpCell = this.cellOf(cellNode);
        tmpCell.select();
        this.indexSelected = index;
        this.selectedCell = tmpCell;
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
        // Speichert, falls vorhanden die notwendige Zahl dieser Zelle
        this.necessary = 0;
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
        this.privateSetNumber(number,mode);

        this.myCellNode.classList.add('zoom-in');
        setTimeout(() => {
            this.myCellNode.classList.remove('zoom-in');
        }, 500);
    }
    
    massSetNumber(number, mode) {
        //Wird augerufen für die Wiederherstellung
        this.privateSetNumber(number,mode);
    }

    privateSetNumber(number,mode) {
        this.myCellNode.setAttribute('data-value', number);
        //remove permissible numbers
        while (this.myCellNode.firstChild) {
            this.myCellNode.removeChild(this.myCellNode.lastChild);
        }
        // Lösche die 'nested'-Klassifizierung 
        this.myCellNode.classList.remove('nested')
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
        this.myCellNode.setAttribute('data-value', 0);
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
        this.myCellNode.setAttribute('data-value', 0);
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

    setNecessary(permNr) {
        // Klassifiziere die Zahl permNr in der Menge der möglichen Zahlen
        // als notwendig
        let permNodes = this.myCellNode.children;
        for (let i = 0; i < permNodes.length; i++) {
            if (permNodes[i].getAttribute('data-value') == permNr) {
                permNodes[i].classList.add('neccessary');
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

    }

    delete() {
        this.unsetNumber();
        this.calculatePermissibleNumbers();
        this.setPermissibleNumbers();
    }

    isContradictory() {
        let tmpValue = this.value();
        if (tmpValue == 0) {
            return false;
        } else {
            return !this.myPermissibles.has(tmpValue);
        }
    }
    getIndex() {
        return this.myIndex;
    }
}


init();