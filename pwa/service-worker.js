//https://web.dev/offline-fallback-page/
/*
Copyright 2015, 2019, 2020, 2021 Google LLC. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

const OFFLINE_VERSION = 118;

const CACHE_NAME = 'offline';

const contentToCache = [
  "/index.html",
  "/src/css/voice-settings.css",
  "/src/css/reader.css",
  "/src/css/download.css",
  "/src/css/settings.css",
  "/src/css/main.css",
  "/src/css/app-bar.css",
  "/src/css/about.css",
  "/src/css/search-results.css",
  "/src/js/viewmodel/DefinitionsListItem.js",
  "/src/js/viewmodel/SwitchItem.js",
  "/src/js/viewmodel/ObservableField.js",
  "/src/js/viewmodel/DialogInfo.js",
  "/src/js/viewmodel/ListItem.js",
  "/src/js/viewmodel/Icon.js",
  "/src/js/viewmodel/TabData.js",
  "/src/js/viewmodel/ResultList.js",
  "/src/js/viewmodel/DefinitionsResultList.js",
  "/src/js/viewmodel/MenuItem.js",
  "/src/js/viewmodel/Voice.js",
  "/src/js/viewmodel/I18n.js",
  "/src/js/viewmodel/MainViewModel.js",
  "/src/js/model/thesaurus/ThesaurusEntry.js",
  "/src/js/model/thesaurus/ThesaurusRepository.js",
  "/src/js/model/WordType.js",
  "/src/js/model/file/FilesReader.js",
  "/src/js/model/file/FileReaderOutput.js",
  "/src/js/model/file/FilesReaderWorker.js",
  "/src/js/model/file/FileReaderInput.js",
  "/src/js/model/favorites/FavoritesRepository.js",
  "/src/js/model/speech/Utterance.js",
  "/src/js/model/speech/UtteranceSplitter.js",
  "/src/js/model/speech/SpeechEngine.js",
  "/src/js/model/MainModel.js",
  "/src/js/model/db/DbCommand.js",
  "/src/js/model/db/DbAccess.js",
  "/src/js/model/db/Db.js",
  "/src/js/model/db/DbWorker.js",
  "/src/js/model/db/DbResult.js",
  "/src/js/model/db/DbOpenProgress.js",
  "/src/js/model/rhymer/SyllableRhymes.js",
  "/src/js/model/rhymer/RhymerRepository.js",
  "/src/js/model/rhymer/WordRhymes.js",
  "/src/js/model/suggestions/Suggestion.js",
  "/src/js/model/suggestions/SuggestionsRepository.js",
  "/src/js/model/definitions/DefinitionsEntry.js",
  "/src/js/model/definitions/DefinitionsRepository.js",
  "/src/js/model/Settings.js",
  "/src/js/model/poem/PoemRepository.js",
  "/src/js/model/poem/WordCounter.js",
  "/src/js/view/VoiceSettingsView.js",
  "/src/js/view/AppBarMenuView.js",
  "/src/js/view/ListWordClickActions.js",
  "/src/js/view/ListFavoriteActions.js",
  "/src/js/view/AppBarActionItem.js",
  "/src/js/view/MainView.js",
  "/src/js/view/FavoritesView.js",
  "/src/js/view/SliderData.js",
  "/src/js/view/ContextMenuView.js",
  "/src/js/view/RhymerView.js",
  "/src/js/view/ListVisibility.js",
  "/src/js/view/SuggestionsView.js",
  "/src/js/view/TabsView.js",
  "/src/js/view/DefinitionsView.js",
  "/src/js/view/ReaderView.js",
  "/src/js/view/Template.js",
  "/src/js/view/ThesaurusView.js",
  "/src/resources/.DS_Store",
  "/src/resources/images/github-badge.png",
  "/src/resources/images/ic_definitions.svg",
  "/src/resources/images/fdroid-badge.png",
  "/src/resources/images/google-play-badge.png",
  "/src/resources/images/ic_rhymer.svg",
  "/src/resources/images/ic_thesaurus.svg",
  "/src/resources/images/apple-badge.svg",
  "/src/resources/poet_assistant.db",
  "/src/templates/voice-selection.template.html",
  "/src/templates/list-item-word.template.html",
  "/src/templates/switch.template.html",
  "/src/templates/list-item-sub-header-2.template.html",
  "/src/templates/tab-custom-icon.template.html",
  "/src/templates/list-item-sub-header-1.template.html",
  "/src/templates/reader-actions.template.html",
  "/src/templates/input-text.template.html",
  "/src/templates/list-empty.template.html",
  "/src/templates/slider.template.html",
  "/src/templates/about.template.html",
  "/src/templates/dialog-simple-message.template.html",
  "/src/templates/context-menu-item-material-icon.template.html",
  "/src/templates/tab.template.html",
  "/src/templates/textarea.template.html",
  "/src/templates/linear-progress-indicator.template.html",
  "/src/templates/button-icon-text.template.html",
  "/src/templates/app-bar.template.html",
  "/src/templates/snackbar.template.html",
  "/src/templates/tab-material-icon.template.html",
  "/src/templates/favorites-list-header.template.html",
  "/src/templates/list.template.html",
  "/src/templates/definitions-list-item.template.html",
  "/src/templates/tab-bar.template.html",
  "/src/templates/context-menu.template.html",
  "/src/templates/dialog.template.html",
  "/src/templates/circular-progress-indicator.template.html",
  "/src/templates/context-menu-header.template.html",
  "/src/templates/reader-play.template.html",
  "/src/templates/list-header.template.html",
  "/src/templates/context-menu-item-custom-icon.template.html",
  "/src/templates/context-menu-item.template.html",
  "/src/i18n/en.json",
  "/libs/material-icons.css",
  "/libs/sql-wasm-1.4.0.js",
  "/libs/material-components-web-10.0.0.min.js",
  "/libs/material-components-web-10.0.0.min.css.map",
  "/libs/material-components-web-10.0.0.min.css",
  "/libs/material-icons.ttf",
  "/libs/sql-wasm.wasm"
]
self.addEventListener('install', function (event) {
  console.log('[ServiceWorker] Install');

  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Setting {cache: 'reload'} in the new request will ensure that the response
    // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
    await cache.addAll(contentToCache)
  })());

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil((async () => {
    // Enable navigation preload if it's supported.
    // See https://developers.google.com/web/updates/2017/02/navigation-preload
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  })());

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  console.log(`[ServiceWorker] Fetch ${event.request.url}`);
  // console.log('[Service Worker] Fetch', event.request.url);
  event.respondWith((async () => {
    try {
      const preloadResponse = await event.preloadResponse;
      if (preloadResponse) {
        return preloadResponse;
      }

      const networkResponse = await fetch(event.request);
      return networkResponse;
    } catch (error) {
      console.log('[Service Worker] Fetch failed; returning offline page instead.', error);

      const cache = await caches.open(CACHE_NAME);
      const path = new URL(event.request.url).pathname
      console.log(`looking up ${path} in cache`)
      const cachedResponse = await cache.match(path)
      console.log(`cached response: ${cachedResponse}`)
      return cachedResponse;
    }
  })());
});
