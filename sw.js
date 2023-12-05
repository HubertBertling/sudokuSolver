
// Change this to your repository name
var GHPATH = 'https://hubertbertling.github.io/sudokuSolver';

// Choose a different app prefix name
var APP_PREFIX = 'sudo_';

// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…). 
// If you don't change the version, the service worker will give your
// users the old files!
var VERSION = 'version_83';

// The files to make available for offline use. make sure to add 
// others to this list
var URLS = [    
  `${GHPATH}/`,
  `${GHPATH}/index.html`,
  `${GHPATH}/help.html`,
  `${GHPATH}/sudokuMainApp.js`,
  `${GHPATH}/fastSolverApp.js`,
  `${GHPATH}/generatorApp.js`,
  `${GHPATH}/sudokuCommon.js`,
  `${GHPATH}/widescreen.css`,
  `${GHPATH}/smallscreenNew.css`,
  `${GHPATH}/verysmallscreenNew.css`,
  `${GHPATH}/print.css`,
  `${GHPATH}/images/sudoku.png`,
  `${GHPATH}/images/ok.png`,
  `${GHPATH}/images/fail.png`,
  `${GHPATH}/images/pfeilrueckwaerts.png`,
  `${GHPATH}/images/pfeilvorwaerts.png`,
  `${GHPATH}/images/play-96.png`,
  `${GHPATH}/images/pause-96.png`,
  `${GHPATH}/images/stop-96.png`,
  `${GHPATH}/images/step-96.png`,
  `${GHPATH}/images/save.png`,
  `${GHPATH}/images/oeffnen.png`,
  `${GHPATH}/images/gueckwunsch.jfif`,
  `${GHPATH}/images/upload.png`,
  `${GHPATH}/images/rename.png`,
  `${GHPATH}/images/questionMark.png`,
  `${GHPATH}/images/drucker.png`
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