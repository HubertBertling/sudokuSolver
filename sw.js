
// Change this to your repository name
var GHPATH = 'https://hubertbertling.github.io/sudokuSolver';
// var GHPATH = 'http://localhost:8080/sudokuSolver';

// Choose a different app prefix name
var APP_PREFIX = 'sudo_';

// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…). 
// If you don't change the version, the service worker will give your
// users the old files!
var VERSION = 'version_222';

// The files to make available for offline use. make sure to add 
// others to this list
var URLS = [    
  `${GHPATH}/`,
  `${GHPATH}/CSS/widescreen.css`,
  `${GHPATH}/CSS/smallscreenNew.css`,
  `${GHPATH}/CSS/verysmallscreenNew.css`,
  `${GHPATH}/CSS/print.css`,
  `${GHPATH}/index.html`,
  `${GHPATH}/manifest.json`,
  `${GHPATH}/help.html`,
  `${GHPATH}/JS/sudokuMainApp.js`,
  `${GHPATH}/JS/fastSolverWorker.js`,
  `${GHPATH}/JS/generatorWorker.js`,
  `${GHPATH}/JS/sudokuCommon.js`,
  `${GHPATH}/images/sudoku.png`,
  `${GHPATH}/images/ok.png`,
  `${GHPATH}/images/fail.png`,
  `${GHPATH}/images/info.png`,
  `${GHPATH}/images/pfeilrueckwaerts.png`,
  `${GHPATH}/images/pfeilvorwaerts.png`,
  `${GHPATH}/images/play-96.png`,
  `${GHPATH}/images/pause-96.png`,
  `${GHPATH}/images/stop-96.png`,
  `${GHPATH}/images/step-96.png`,
  `${GHPATH}/images/save.png`,
  `${GHPATH}/images/redo.png`,
  `${GHPATH}/images/undo.png`,
  `${GHPATH}/images/oeffnen.png`,
  `${GHPATH}/images/gueckwunsch.jfif`,
  `${GHPATH}/images/upload.png`,
  `${GHPATH}/images/rename.png`,
  `${GHPATH}/images/questionMark.png`,
  `${GHPATH}/images/drucker.png`,
  `${GHPATH}/images/no-caret.png`,
  `${GHPATH}/images/caret-down.png`
  ]

const CACHE_NAME = APP_PREFIX + VERSION
self.addEventListener('fetch', function (e) {
  console.log('Fetch request : ' + e.request.url);
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) {
        console.log('Responding with cache : ' + e.request.url);
        return request
      } else {
        console.log('File is not cached, fetching : ' + e.request.url);
        return fetch(e.request)
      }
    })
  )
})

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('Installing cache : ' + CACHE_NAME);
      return cache.addAll(URLS)
    })
  )
})

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      var cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX)
      })
      cacheWhitelist.push(CACHE_NAME);
      return Promise.all(keyList.map(function (key, i) {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log('Deleting cache : ' + keyList[i]);
          return caches.delete(keyList[i])
        }
      }))
    })
  )
})