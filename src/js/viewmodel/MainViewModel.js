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
        this.rhymes = new ObservableField()
        this.searchTextDisabled = new ObservableField(true)
        this.searchButtonDisabled = new ObservableField(true)
        this.clearSearchTextButtonVisible = new ObservableField(false)
        this.thesaurusEntries = new ObservableField()
        this.definitions = new ObservableField()
        this.suggestions = new ObservableField()
        this.voices = new ObservableField([])
        this.selectedVoiceLabel = new ObservableField()
        this.voicePitch = new ObservableField()
        this.voiceSpeed = new ObservableField()
        this.isReaderTabVisible = new ObservableField(false)
        this.isLoading = new ObservableField()
        this.isRhymerLoading = new ObservableField(false)
        this.isThesaurusLoading = new ObservableField(false)
        this.isDefinitionsLoading = new ObservableField(false)
        this.poemSavedStateLabel = new ObservableField()
        this.activeTab = new ObservableField(MainViewModel.TabIndex.RHYMER)
        this.loadingProgress = new ObservableField(0)
        this.isLoading.value = true
        this._model = new MainModel()
        this.poemText = this._model.poemText
        this._model.rhymerSettingsChangedObserver = () => this._refetchRhymes()
        this.isSpeechPlaying = this._model.isSpeechPlaying
        this.contextMenuItems = this._createContextMenuItems(false)
        this.snackbarText = new ObservableField()
        this.appBarMenuItems = [
            new MenuItem("menu-about", "app_bar_menu_about_title", new MenuItemIcon("info", MenuItemIcon.IconSource.MATERIAL)),
            new MenuItem("menu-random", "app_bar_menu_random_title", new MenuItemIcon("casino", MenuItemIcon.IconSource.MATERIAL)),
        ]
        this.dialogInfo = new ObservableField()
        this._model._speechEngine.voices.observer = (newVoices) => this.updateVoices(newVoices)
        this._model._speechEngine.selectedVoice.observer = (newVoice) => this.selectedVoiceLabel.value = this._getVoiceLabel(newVoice)
        this._model._speechEngine.speed.observer = (newSpeed) => this.voiceSpeed.value = newSpeed
        this._model._speechEngine.pitch.observer = (newPitch) => this.voicePitch.value = newPitch
        this._model._poemRepository.savedState.observer = (newSavedState) => this.poemSavedStateLabel.value = this._getSavedStateLabel(newSavedState)
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
            this.isRhymerLoading.value = true
            const searchTerm = this._cleanSearchTerm(word)
            this._model.fetchRhymes(searchTerm).then(wordRhymes => {
                this.isRhymerLoading.value = false
                this.rhymes.value = new ResultList(searchTerm, [
                    this._createRhymeListItems(wordRhymes.stressRhymes, "stress_syllables"),
                    this._createRhymeListItems(wordRhymes.lastThreeSyllableRhymes, "last_three_syllables"),
                    this._createRhymeListItems(wordRhymes.lastTwoSyllablesRhymes, "last_two_syllables"),
                    this._createRhymeListItems(wordRhymes.lastSyllableRhymes, "last_syllable")
                ].flat())
            })
        }
    }
    _refetchRhymes() {
        if (this.rhymes.value != undefined) {
            this.fetchRhymes(this.rhymes.value.word)
        }
    }

    _createRhymeListItems = (syllableRhymes, syllableTypeLabel) =>
        (syllableRhymes || []).flatMap((item) =>
            [
                new ListItem(ListItem.ListItemStyles.SUB_HEADER_1, syllableTypeLabel, item.syllables)
            ].concat(
                item.rhymes.map(rhyme => new ListItem(ListItem.ListItemStyles.WORD, rhyme))
            )
        )
    onShareRhymes() {
        this._model.copyText(this._getRhymesShareText())
        this.snackbarText.value = "snackbar_copied_rhymes"
    }
    _getRhymesShareText = () =>
        this.i18n.translate("share_rhymes_title", this.rhymes.value.word) +
        this.rhymes.value.listItems.map((listItem) => {
            if (listItem.style == ListItem.ListItemStyles.SUB_HEADER_1) {
                return this.i18n.translate("share_rhymes_subtitle", this.i18n.translate(listItem.text, listItem.args))
            } else {
                return this.i18n.translate("share_rhymes_word", listItem.text)
            }
        }
        ).join("")

    getRhymerSettingsSwitches = () => [
        new SwitchItem("setting-rhymer-aor-ao", "setting_rhymer_aor_ao_label", "setting_rhymer_aor_ao_description", this._model.getRhymerSettingAorAo()),
        new SwitchItem("setting-rhymer-ao-aa", "setting_rhymer_ao_aa_label", "setting_rhymer_ao_aa_description", this._model.getRhymerSettingAoAa())
    ]
    onRhymerSettingToggled(id, value) {
        if (id == "setting-rhymer-aor-ao") {
            this._model.setRhymerSettingAorAo(value)
        } else if (id == "setting-rhymer-ao-aa") {
            this._model.setRhymerSettingAoAa(value)
        }
    }

    fetchThesaurus(word) {
        if (!this.isLoading.value) {
            this.isThesaurusLoading.value = true
            const searchTerm = this._cleanSearchTerm(word)
            this._model.fetchThesaurus(searchTerm).then(thesaurusEntries => {
                this.isThesaurusLoading.value = false
                let resultListItems = []
                thesaurusEntries.forEach(thesaurusEntry => {
                    const wordTypeLabel = this._getWordTypeLabel(thesaurusEntry.wordType)
                    resultListItems.push(new ListItem(ListItem.ListItemStyles.SUB_HEADER_1, `part_of_speech_${wordTypeLabel}`))
                    if (thesaurusEntry.synonyms.length > 0) {
                        resultListItems.push(new ListItem(ListItem.ListItemStyles.SUB_HEADER_2, "synonyms"))
                        resultListItems = resultListItems.concat(thesaurusEntry.synonyms.map(synonym => new ListItem(ListItem.ListItemStyles.WORD, synonym)))
                    }
                    if (thesaurusEntry.antonyms.length > 0) {
                        resultListItems.push(new ListItem(ListItem.ListItemStyles.SUB_HEADER_2, "antonyms"))
                        resultListItems = resultListItems.concat(thesaurusEntry.antonyms.map(antonym => new ListItem(ListItem.ListItemStyles.WORD, antonym)))
                    }
                })
                this.thesaurusEntries.value = new ResultList(searchTerm, resultListItems)
            })
        }
    }
    onShareThesaurus() {
        this._model.copyText(this._getThesaurusShareText())
        this.snackbarText.value = "snackbar_copied_thesaurus"
    }
    _getThesaurusShareText = () =>
        this.i18n.translate("share_thesaurus_title", this.thesaurusEntries.value.word) +
        this.thesaurusEntries.value.listItems.map((listItem) => {
            if (listItem.style == ListItem.ListItemStyles.SUB_HEADER_1) {
                return this.i18n.translate("share_thesaurus_sub_header_1", this.i18n.translate(listItem.text, listItem.args))
            } else if (listItem.style == ListItem.ListItemStyles.SUB_HEADER_2) {
                return this.i18n.translate("share_thesaurus_sub_header_2", this.i18n.translate(listItem.text, listItem.args))
            } else {
                return this.i18n.translate("share_thesaurus_word", listItem.text)
            }
        }
        ).join("")

    fetchDefinitions(word) {
        if (!this.isLoading.value) {
            this.isDefinitionsLoading.value = true
            const searchTerm = this._cleanSearchTerm(word)
            this._model.fetchDefinitions(searchTerm).then(definitions => {
                this.isDefinitionsLoading.value = false
                this.definitions.value = new DictionaryResultList(
                    searchTerm,
                    definitions.map(dictionaryEntry => {
                        const wordTypeLabel = this._getWordTypeLabel(dictionaryEntry.wordType)
                        return new DictionaryListItem(`part_of_speech_${wordTypeLabel}_short`, dictionaryEntry.definition)
                    })
                )
            })
        }
    }
    onShareDefinitions() {
        this._model.copyText(this._getDefinitionsShareText())
        this.snackbarText.value = "snackbar_copied_definitions"
    }
    _getDefinitionsShareText = () =>
        this.i18n.translate("share_dictionary_title", this.definitions.value.word) +
        this.definitions.value.listItems.map((dictionaryListItem) =>
            this.i18n.translate("share_dictionary_definition", this.i18n.translate(dictionaryListItem.wordTypeLabel), dictionaryListItem.definition)
        ).join("")

    onSearchTextInput(text) {
        this.fetchSuggestions(text)
        this.searchButtonDisabled.value = text.length == 0
        this.clearSearchTextButtonVisible.value = text.length > 0
    }

    /**
     * @return true if the suggestion is a "real" suggestion (not the item "clear search history")
     */
    onSuggestionSelected(word) {
        if (word == "clear_search_history") {
            this.dialogInfo.value = DialogInfo.prompt(
                "clear_search_history_dialog_title",
                "clear_search_history_dialog_message",
                () => { this._model.clearSearchHistory() }
            )
            return false
        } else {
            this.clearSearchTextButtonVisible.value = word.length > 0
            return true
        }
    }
    fetchSuggestions(word, includeResultsForEmptyWord) {
        if (!this.isLoading.value) {
            const searchTerm = this._cleanSearchTerm(word)
            this._model.fetchSuggestions(searchTerm, includeResultsForEmptyWord).then(suggestions => {
                let suggestionsMenuItems = suggestions.map((suggestion) =>
                    new MenuItem(suggestion.word, suggestion.word, new MenuItemIcon(
                        suggestion.type == Suggestion.SuggestionType.HISTORY ? "history" : "search",
                        MenuItemIcon.IconSource.MATERIAL
                    ))
                )
                if (suggestions.find((suggestion) => suggestion.type == Suggestion.SuggestionType.HISTORY)) {
                    suggestionsMenuItems.unshift(
                        new MenuItem("clear_search_history", "clear_search_history",
                            new MenuItemIcon("delete", MenuItemIcon.IconSource.MATERIAL)
                        )
                    )
                }
                this.suggestions.value = suggestionsMenuItems
            })
        }
    }

    _getWordTypeLabel(wordType) {
        let wordTypeLabel
        if (wordType == WordType.ADJECTIVE) wordTypeLabel = "adjective"
        else if (wordType == WordType.ADVERB) wordTypeLabel = "adverb"
        else if (wordType == WordType.NOUN) wordTypeLabel = "noun"
        else if (wordType == WordType.VERB) wordTypeLabel = "verb"
        return wordTypeLabel
    }

    _cleanSearchTerm = (text) => text.toLowerCase().trim()

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
            this.fetchRhymes(word)
            this.activeTab.value = MainViewModel.TabIndex.RHYMER
        } else if (selectedMenuId == "menu-thesaurus") {
            this.fetchThesaurus(word)
            this.activeTab.value = MainViewModel.TabIndex.THESAURUS
        } else if (selectedMenuId == "menu-dictionary") {
            this.fetchDefinitions(word)
            this.activeTab.value = MainViewModel.TabIndex.DICTIONARY
        }
    }

    selectVoice = (index) => this._model.selectVoice(this.voices.value[index].id)
    setVoicePitch = (pitchValue) => this._model.setVoicePitch(pitchValue)
    setVoiceSpeed = (speedValue) => this._model.setVoiceSpeed(speedValue)

    playText = (text, start, end) => this._model.playText(text, start, end)
    copyPoemText(text, start, value) {
        this._model.copyText(text, start, value)
        this.snackbarText.value = "snackbar_copied_poem"
    }
    onClearClicked() {
        this.dialogInfo.value = DialogInfo.prompt(
            "reader_clear_poem_dialog_title",
            "reader_clear_poem_dialog_message",
            () => { this.setPoemText("", true) }
        )
    }

    updateVoices(newVoices) {
        this.voices.value = newVoices.sort((a, b) => {
            const languageA = a.lang.substring(0, 2)
            const languageB = b.lang.substring(0, 2)
            if (languageA == languageB) {
                return a.name.localeCompare(b.name)
            } else if (languageA == "en") {
                return -1
            } else if (languageB == "en") {
                return 1
            } else {
                return languageA.localeCompare(languageB)
            }
        }).map((voice) => new MenuItem(voice.voiceURI, this._getVoiceLabel(voice)))

        this.isReaderTabVisible.value = this.voices.value.length > 0

        this.contextMenuItems = this._createContextMenuItems(newVoices.length > 0)
    }
    _getVoiceLabel = (voice) => `${voice.name} - ${voice.lang}`

    _createContextMenuItems = (isSpeechEnabled) => [
        new MenuItem("menu-copy", "menu_copy_title", new MenuItemIcon("content_copy", MenuItemIcon.IconSource.MATERIAL)),
        new MenuItem("menu-speak", "menu_speak_title", new MenuItemIcon("record_voice_over", MenuItemIcon.IconSource.MATERIAL)),
        new MenuItem("menu-rhymer", "tab_rhymer_title", new MenuItemIcon("ic_rhymer", MenuItemIcon.IconSource.CUSTOM)),
        new MenuItem("menu-thesaurus", "tab_thesaurus_title", new MenuItemIcon("ic_thesaurus", MenuItemIcon.IconSource.CUSTOM)),
        new MenuItem("menu-dictionary", "tab_dictionary_title", new MenuItemIcon("ic_dictionary", MenuItemIcon.IconSource.CUSTOM)),
    ].filter((item) => item.id != "menu-speak" || isSpeechEnabled)

    setPoemText = (text, writeNow) => this._model.setPoemText(text, writeNow)
    readFile = (file) => this._model.readFile(file)
    writeFile = (text) => this._model.writeFile(text)
    _getSavedStateLabel(savedState) {
        if (savedState == PoemRepository.SaveState.SAVING) return "poem_saved_state_label_saving"
        else if (savedState == PoemRepository.SaveState.SAVED) return "poem_saved_state_label_saved"
        else if (savedState == PoemRepository.SaveState.WAITING) return "poem_saved_state_label_waiting"
    }

}
MainViewModel.TabIndex = Object.freeze({ RHYMER: 0, THESAURUS: 1, DICTIONARY: 2, READER: 3 })