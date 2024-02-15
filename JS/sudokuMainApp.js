let sudoApp;
let VERSION = 281;

if (window.File && window.FileReader
    && window.FileList && window.Blob) {
    // Dateiverarbeitung 
    window.onload = function () {
        const asText = document.getElementById('asText');
        asText.addEventListener('change', function (e) {
            const file = asText.files[0];
            const textType = /text.*/;
            if (file.type.match(textType)) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    let strFilePuzzleMap = reader.result;
                    sudoApp.myPuzzleDB.upLoadPuzzle(strFilePuzzleMap);
                }
                reader.readAsText(file);
            } else {
                alert('Dateityp nicht unterstützt!');
            }
        });
    }    
} else {
    alert('Dieser Browser unterstützt den Zugriff auf lokale Dateien nicht');
}

let shareButton = document.getElementById('share-button');
if (navigator.share && navigator.canShare) {
    // Web Share API ist Verfügbar!
    shareButton.addEventListener("click", async () => {
        let file = sudoApp.myPuzzleDB.getCurrentPuzzleFile();
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: 'Puzzle teilen',
                text: 'Puzzle',
            })
                .then(() => console.log('Share was successful.'))
                .catch((error) => console.log('Sharing failed', error));
        } else {
            console.log(`Your system doesn't support sharing files.`);
        }
    });
} else {
    console.log(`Web Share API not supported.`);
}

// file handling

if ('launchQueue' in window) {
    console.log('File Handling API is supported!');

    launchQueue.setConsumer(launchParams => {
        handleFiles(launchParams.files);
    });
} else {
    console.error('File Handling API is not supported!');
}

async function handleFiles(files) {
    for (const file of files) {
        const blob = await file.getFile();
        blob.handle = file;
        let strFilePuzzleMap = await blob.text();
        sudoApp.myPuzzleDB.upLoadPuzzle(strFilePuzzleMap);       
    }
}

let btn = document.getElementById('share-app-btn');
const resultPara = document.querySelector(".result");
if (navigator.share && navigator.canShare) {
    // Web Share API ist Verfügbar!
    btn.addEventListener("click", async () => {
       
        if (navigator.canShare) {
            navigator.share(
                {
                    title: "Sudoku-Trainer",
                    text: "Üben und Lösen von Puzzles mit der Sudoku-Trainer-App",
                    url: "https://hubertbertling.github.io/sudokuSolver",
                }
            )
                .then(() => resultPara.textContent = "Sudoku-Trainer shared successfully")
                .catch((error) => resultPara.textContent = 'Sharing failed:'+ error);
        } else {
            resultPara.textContent = `Your system doesn't support sharing.`;
        }
    });
} else {
    resultPara.textContent = `Web Share API not supported.`;
}


function start() {
    sudoApp = new SudokuMainApp();
    sudoApp.init();
}
class SudokuMainApp {
    constructor() {
        // ==============================================================
        // Components of the app
        // ==============================================================
        // 1. The solver component
        this.mySolver = new SudokuSolver();
        this.mySolverView = new SudokuSolverView(this.mySolver);
        this.mySolverController = new SudokuSolverController(this.mySolver);
        // A true MVC pattern exists only for the solver. 
        // The other model and view classes are only subcomponents of the solver classes. 
        // They do not realize any own observer relationship.
        this.mySolver.attach(this.mySolverView);
        this.mySolver.setMyView(this.mySolverView);

        // 2. The database component
        this.myPuzzleDB = new SudokuPuzzleDB();
        this.myPuzzleDBController = new SudokuPuzzleDBController(this.myPuzzleDB);

        this.myNewPuzzleStore = new NewPuzzleStore();
        this.myNavBar = new NavigationBar();
        // There are two play-modes 'training' and 'solving'.
        this.playMode = 'solving';

        this.myConfirmDlg = new ConfirmDialog();
   
    }

    init() {
        //this.myPuzzleDB.migratePuzzleDB()
        this.mySolver.init();
        this.mySolver.notify();
        this.myPuzzleDB.init();
        this.myPuzzleDB.importBackRunPuzzle(back23, 'Backtrack_23', 'lqwgzcback23g2ak');
        this.myPuzzleDB.importBackRunPuzzle(back9, 'Backtrack_9', 'lqgwgzcback9hpfg2ak');

        this.myNewPuzzleStore.init();
        this.myNavBar.init();
        this.displayAppVersion();
    }
    displayAppVersion() {
        let versionNode = document.getElementById('appVersion');
        versionNode.innerHTML =
            '<b>AppVersion:</b> &nbsp' + VERSION;
    }

    helpFunktion() {
        window.open('./help.html');
    }
}

// Example puzzle with 23 back tracks

const back23 = ["0", "3", "0", "0", "1", "0", "0", "0", "9",
    "0", "0", "6", "0", "0", "0", "5", "0", "0",
    "1", "0", "0", "0", "0", "0", "0", "4", "0",
    "4", "0", "0", "0", "0", "3", "2", "0", "0",
    "0", "9", "0", "0", "7", "0", "0", "0", "8",
    "0", "0", "5", "6", "0", "0", "0", "0", "0",
    "8", "0", "0", "0", "0", "2", "0", "0", "3",
    "0", "0", "0", "0", "9", "0", "0", "7", "0",
    "0", "0", "0", "4", "0", "0", "1", "0", "0"];

const back9 = ["1", "4", "0", "0", "0", "6", "8", "0", "0",
    "0", "0", "0", "0", "5", "0", "0", "0", "2",
    "0", "0", "0", "0", "9", "4", "0", "6", "0",
    "0", "0", "4", "0", "0", "0", "0", "0", "0",
    "0", "0", "0", "0", "0", "8", "0", "3", "6",
    "7", "5", "0", "0", "0", "1", "9", "0", "0",
    "0", "0", "0", "3", "0", "0", "0", "1", "0",
    "0", "9", "0", "0", "0", "0", "0", "0", "5",
    "8", "0", "0", "0", "0", "0", "7", "0", "0"];


// Launch and initialize the app
start();