// The Web Worker imports the common code
importScripts('./sudokuCommon.js');

let sudoApp;
function start() {
    //A worker app is assigned to the variable "sudoApp".
    sudoApp = new SudokuWorkerApp();
    sudoApp.init();
}

// Launch and initialize the worker app
start();