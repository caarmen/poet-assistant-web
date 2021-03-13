/**
Copyright (c) 2021 - present Carmen Alvarez

This file is part of Poet Assistant.

Poet Assistant is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Poet Assistant is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Poet Assistant.  If not, see <http://www.gnu.org/licenses/>.
*/
class MainViewModel {
    constructor() {
        this.i18n = new I18n()

        this.searchTextDisabled = new ObservableField(true)
        this.searchButtonDisabled = new ObservableField(true)
        this.clearSearchTextButtonVisible = new ObservableField(false)
        this.isReaderTabVisible = new ObservableField(false)
        this.isLoading = new ObservableField()
        this.activeTab = new ObservableField(MainViewModel.TabIndex.RHYMER)
        this.loadingProgress = new ObservableField(0)
        this.isLoading.value = true

        this.dialogInfo = new ObservableField()
        this.snackbarText = new ObservableField()
        this.contextMenuItems = this._createContextMenuItems(false)

        this.appBarMenuItems = [
            new MenuItem("menu-about", "app_bar_menu_about_title", new MenuItemIcon("info", MenuItemIcon.IconSource.MATERIAL)),
            new MenuItem("menu-random", "app_bar_menu_random_title", new MenuItemIcon("casino", MenuItemIcon.IconSource.MATERIAL)),
        ]

        this._model = new MainModel()

        this._rhymerViewModel = new RhymerViewModel(this.i18n, this._model)
        this.rhymes = this._rhymerViewModel.rhymes
        this.isRhymerLoading = this._rhymerViewModel.isRhymerLoading
        this._rhymerViewModel.snackbarText.observer = (text) => this.snackbarText.value = text

        this._thesaurusViewModel = new ThesaurusViewModel(this.i18n, this._model)
        this.thesaurusEntries = this._thesaurusViewModel.thesaurusEntries
        this.isThesaurusLoading = this._thesaurusViewModel.isThesaurusLoading
        this._thesaurusViewModel.snackbarText.observer = (text) => this.snackbarText.value = text

        this._definitionsViewModel = new DefinitionsViewModel(this.i18n, this._model)
        this.definitions = this._definitionsViewModel.definitions
        this.isDefinitionsLoading = this._definitionsViewModel.isDefinitionsLoading
        this._definitionsViewModel.snackbarText.observer = (text) => this.snackbarText.value = text

        this._suggestionsViewModel = new SuggestionsViewModel(this._model)
        this.suggestions = this._suggestionsViewModel.suggestions
        this._suggestionsViewModel.dialogInfo.observer = (value) => this.dialogInfo.value = value 

        this._readerViewModel = new ReaderViewModel(this._model)
        this.voices = new ObservableField()
        this.poemText = this._readerViewModel.poemText
        this.isSpeechPlaying = this._readerViewModel.isSpeechPlaying
        this._readerViewModel.snackbarText.observer = (text) => this.snackbarText.value = text
        this._readerViewModel.voices.observer = (newVoices) => this.updateVoices(newVoices)
        this.poemSavedStateLabel = this._readerViewModel.poemSavedStateLabel
        this.voicePitch = this._readerViewModel.voicePitch
        this.voiceSpeed = this._readerViewModel.voiceSpeed
        this.selectedVoiceLabel = this._readerViewModel.selectedVoiceLabel
        this._readerViewModel.dialogInfo.observer = (value) => this.dialogInfo.value = value 
    }

    loadTranslations = () => this.i18n.load()

    loadDb() {
        this._model.loadDb((dbOpenProgress) => {
            this.loadingProgress.value = dbOpenProgress.loaded / dbOpenProgress.total
        }).then(() => {
            this.isLoading.value = false
            this.searchTextDisabled.value = false
            this.activeTab.value = MainViewModel.TabIndex.RHYMER
        })
    }

    loadTemplates = () => this._model.loadFiles(
        [
            "about",
            "app-bar",
            "button-icon-text",
            "circular-progress-indicator",
            "context-menu",
            "context-menu-header",
            "context-menu-item",
            "context-menu-item-custom-icon",
            "context-menu-item-material-icon",
            "dialog",
            "dialog-simple-message",
            "dictionary-list-item",
            "input-text",
            "linear-progress-indicator",
            "list",
            "list-empty",
            "list-header",
            "list-item-sub-header-1",
            "list-item-sub-header-2",
            "list-item-word",
            "reader-actions",
            "reader-play",
            "slider",
            "snackbar",
            "switch",
            "tab",
            "tab-bar",
            "textarea",
            "voice-selection"
        ].map((templateName) => new FileReaderInput(templateName, `../../../templates/${templateName}.template.html`)))

    fetchAll(word) {
        this.fetchRhymes(word)
        this.fetchThesaurus(word)
        this.fetchDefinitions(word)
        if (this.activeTab.value == MainViewModel.TabIndex.READER) {
            this.activeTab.value = MainViewModel.TabIndex.DICTIONARY
        }
    }

    fetchRhymes(word) {
        if (!this.isLoading.value) {
            this._rhymerViewModel.fetchRhymes(word)
        }
    }
    onShareRhymes = () => this._rhymerViewModel.onShareRhymes()
    getRhymerSettingsSwitches = () => this._rhymerViewModel.getRhymerSettingsSwitches()
    onRhymerSettingToggled = (id, value) => this._rhymerViewModel.onRhymerSettingToggled(id, value)

    fetchThesaurus(word) {
        if (!this.isLoading.value) {
            this._thesaurusViewModel.fetchThesaurus(word)
        }
    }
    onShareThesaurus = () => this._thesaurusViewModel.onShareThesaurus()
    getThesaurusSettingsSwitches = () => this._thesaurusViewModel.getThesaurusSettingsSwitches()
    onThesaurusSettingToggled = (id, value) => this._thesaurusViewModel.onThesaurusSettingToggled(id, value)

    fetchDefinitions(word) {
        if (!this.isLoading.value) {
            this._definitionsViewModel.fetchDefinitions(word)
        }
    }
    onShareDefinitions = () => this._definitionsViewModel.onShareDefinitions()

    onSearchTextInput(text) {
        this.fetchSuggestions(text)
        this.searchButtonDisabled.value = text.length == 0
        this.clearSearchTextButtonVisible.value = text.length > 0
    }

    /**
     * @return true if the suggestion is a "real" suggestion (not the item "clear search history")
     */
    onSuggestionSelected(word) {
        const isWordSuggestion = this._suggestionsViewModel.onSuggestionSelected(word)
        if(isWordSuggestion) this.clearSearchTextButtonVisible.value = word.length > 0 
        return isWordSuggestion
    }
    fetchSuggestions(word, includeResultsForEmptyWord) {
        if (!this.isLoading.value) {
            this._suggestionsViewModel.fetchSuggestions(word, includeResultsForEmptyWord)
        }
    }

    onAppMenuItemSelected(index) {
        const selectedMenuId = this.appBarMenuItems[index].id
        if (selectedMenuId == "menu-about") {
            let privacyPolicyFile = this._model.isDesktop() ? "PRIVACY-desktop.md" : "PRIVACY-web.md"
            this.dialogInfo.value = DialogInfo.custom("about_title", "about", new Map([["__PRIVACY_POLICY_FILE__", privacyPolicyFile]]))
        } else if (selectedMenuId == "menu-random") {
            const randomWord = this._model.getRandomWord().then((word) => {
                this.fetchAll(word)
                this.activeTab.value = MainViewModel.TabIndex.DICTIONARY
            })
        }
    }

    onContextMenuItemSelected(word, index) {
        const selectedMenuId = this.contextMenuItems[index].id
        if (selectedMenuId == "menu-copy") {
            this._model.copyText(word)
        } else if (selectedMenuId == "menu-speak") {
            this.playText(word, 0, word.length)
        } else if (selectedMenuId == "menu-rhymer") {
            this._rhymerViewModel.fetchRhymes(word)
            this.activeTab.value = MainViewModel.TabIndex.RHYMER
        } else if (selectedMenuId == "menu-thesaurus") {
            this.fetchThesaurus(word)
            this.activeTab.value = MainViewModel.TabIndex.THESAURUS
        } else if (selectedMenuId == "menu-dictionary") {
            this.fetchDefinitions(word)
            this.activeTab.value = MainViewModel.TabIndex.DICTIONARY
        }
    }

    selectVoice = (index) => this._readerViewModel.selectVoice(index)
    setVoicePitch = (pitchValue) => this._readerViewModel.setVoicePitch(pitchValue)
    setVoiceSpeed = (speedValue) => this._readerViewModel.setVoiceSpeed(speedValue)

    playText = (text, start, end) => this._readerViewModel.playText(text, start, end)
    copyPoemText = (text, start, value) => this._readerViewModel.copyPoemText(text, start, value)
    onClearClicked = () => this._readerViewModel.onClearClicked()
    setPoemText = (text, writeNow) => this._readerViewModel.setPoemText(text, writeNow)
    readFile = (file) => this._readerViewModel.readFile(file)
    writeFile = (text) => this._readerViewModel.writeFile(text)

    updateVoices(newVoices) {
        this.isReaderTabVisible.value = newVoices.length > 0
        this.contextMenuItems = this._createContextMenuItems(newVoices.length > 0)
        this.voices.value = newVoices
    }

    _createContextMenuItems = (isSpeechEnabled) => [
        new MenuItem("menu-copy", "menu_copy_title", new MenuItemIcon("content_copy", MenuItemIcon.IconSource.MATERIAL)),
        new MenuItem("menu-speak", "menu_speak_title", new MenuItemIcon("record_voice_over", MenuItemIcon.IconSource.MATERIAL)),
        new MenuItem("menu-rhymer", "tab_rhymer_title", new MenuItemIcon("ic_rhymer", MenuItemIcon.IconSource.CUSTOM)),
        new MenuItem("menu-thesaurus", "tab_thesaurus_title", new MenuItemIcon("ic_thesaurus", MenuItemIcon.IconSource.CUSTOM)),
        new MenuItem("menu-dictionary", "tab_dictionary_title", new MenuItemIcon("ic_dictionary", MenuItemIcon.IconSource.CUSTOM)),
    ].filter((item) => item.id != "menu-speak" || isSpeechEnabled)
}
MainViewModel.TabIndex = Object.freeze({ RHYMER: 0, THESAURUS: 1, DICTIONARY: 2, READER: 3 })
