// Der Web Worker importiert den gemeinsamen Code
importScripts('./sudokuCommon.js');

let sudoApp;
function start() {
    sudoApp = new SudokuWorkerApp();
    sudoApp.init();
}

// Starte und initialisiere die App
start();