let sudoApp;
let VERSION = 203;

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
        let filePuzzleMap = new Map(JSON.parse(strFilePuzzleMap));
 
        let str_puzzleMap = localStorage.getItem("localSudokuDB");
        let puzzleMap = new Map(JSON.parse(str_puzzleMap));
 
        filePuzzleMap.forEach((value, key) => {
            // console.log('key: ' + key + ', value: ' + value);
            if (!puzzleMap.has(key)) {
                puzzleMap.set(key, value);
            }
        })
         // Kreiere die JSON-Version des Speicherobjektes
        // und speichere sie.
        let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
        localStorage.setItem("localSudokuDB", update_str_puzzleMap);
        
        sudoApp.mySolverController.openDBBtnPressed();
        //console.log(`${file.name} handled`);
    }
}

async function chooseAFile() {
    if (!window.showOpenFilePicker){
        alert("Your current device does not support the File System API. Try again on desktop Chrome!");
    }
    else {
      //here you specify the type of files you want to allow
      let options = {
        types: [{
          description: "Sudoku", 
          accept: {
              "text/*": [".sudoku"],
          },
        }],
        excludeAcceptAllOption: true,
        multiple: false,
      };
      
      // Open file picker and choose a file
      let fileHandle = await window.showOpenFilePicker(options);
      if (!fileHandle[0]){return;}
      
      // get the content of the file
      let blob = await fileHandle[0].getFile();
      blob.handle = fileHandle[0];
      let strFilePuzzleMap = await blob.text();
      let filePuzzleMap = new Map(JSON.parse(strFilePuzzleMap));
  
      let str_puzzleMap = localStorage.getItem("localSudokuDB");
      let puzzleMap = new Map(JSON.parse(str_puzzleMap));
  
      filePuzzleMap.forEach((value, key) => {
          // console.log('key: ' + key + ', value: ' + value);
          if (!puzzleMap.has(key)) {
              puzzleMap.set(key, value);
          }
      })
       // Kreiere die JSON-Version des Speicherobjektes
      // und speichere sie.
      let update_str_puzzleMap = JSON.stringify(Array.from(puzzleMap.entries()));
      localStorage.setItem("localSudokuDB", update_str_puzzleMap);
      
      sudoApp.mySolverController.openDBBtnPressed();
      //console.log(`${file.name} handled`);  
    }
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

const back23 =   ["0","3","0","0","1","0","0","0","9",
            "0","0","6","0","0","0","5","0","0",
            "1","0","0","0","0","0","0","4","0",
            "4","0","0","0","0","3","2","0","0",
            "0","9","0","0","7","0","0","0","8",
            "0","0","5","6","0","0","0","0","0",
            "8","0","0","0","0","2","0","0","3",
            "0","0","0","0","9","0","0","7","0",
            "0","0","0","4","0","0","1","0","0"];

const back9  =   ["1","4","0","0","0","6","8","0","0",
            "0","0","0","0","5","0","0","0","2",
            "0","0","0","0","9","4","0","6","0",
            "0","0","4","0","0","0","0","0","0",
            "0","0","0","0","0","8","0","3","6",
            "7","5","0","0","0","1","9","0","0",
            "0","0","0","3","0","0","0","1","0",
            "0","9","0","0","0","0","0","0","5",
            "8","0","0","0","0","0","7","0","0"];


// Launch and initialize the app
start();