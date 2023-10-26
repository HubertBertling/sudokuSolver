
// Change this to your repository name
var GHPATH = '/sudokuSolver';

// Choose a different app prefix name
var APP_PREFIX = 'sudo_';

// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…). 
// If you don't change the version, the service worker will give your
// users the old files!
var VERSION = 'version_09';

// The files to make available for offline use. make sure to add 
// others to this list
var URLS = [    
  `${GHPATH}/`,
  `${GHPATH}/index.html`,
  `${GHPATH}/sudokuMainApp.js`,
  `${GHPATH}/fastSolverApp.js`,
  `${GHPATH}/generatorApp.js`,
  `${GHPATH}/sudokuCommon.js`,
  `${GHPATH}/widescreen.css`,
  `${GHPATH}/smallscreen.css`,
  `${GHPATH}/verysmallscreen.css`,
  `${GHPATH}/print.css`,
  `${GHPATH}/images/icon.png`,
  `${GHPATH}/README.md`,
  `${GHPATH}/help.md`,
  `${GHPATH}/_config.yml`,
  `${GHPATH}/dist/winbox.bundle.js`
]