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
        this.favorites = new ObservableField()
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
        this._model.thesaurusSettingsChangedObserver = () => this._refetchThesaurus()
        this.isSpeechPlaying = this._model.isSpeechPlaying
        this.contextMenuItems = this._createContextMenuItems(false)
        this.snackbarText = new ObservableField()
        this.appBarMenuItems = [
            new MenuItem("menu-about", "app_bar_menu_about_title", new Icon("info", Icon.IconSource.MATERIAL)),
            new MenuItem("menu-random", "app_bar_menu_random_title", new Icon("casino", Icon.IconSource.MATERIAL)),
        ]
        this.dialogInfo = new ObservableField()
        this._model._speechEngine.voices.observer = (newVoices) => this.updateVoices(newVoices)
        this._model._speechEngine.selectedVoice.observer = (newVoice) => this.selectedVoiceLabel.value = this._getVoiceLabel(newVoice)
        this._model._speechEngine.speed.observer = (newSpeed) => this.voiceSpeed.value = newSpeed
        this._model._speechEngine.pitch.observer = (newPitch) => this.voicePitch.value = newPitch
        this._model._poemRepository.savedState.observer = (newSavedState) => this.poemSavedStateLabel.value = this._getSavedStateLabel(newSavedState)
        this._model.favoritesObserver = (newFavorites) => this._onFavoritesChanged(newFavorites)
        this._onFavoritesChanged(this._model.getFavorites())
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

    loadTemplates = (templateNames) => this._model.loadFiles(
        templateNames.map((templateName) => new FileReaderInput(templateName, `../../../templates/${templateName}.template.html`)))

    fetchAll(word) {
        this.fetchRhymes(word)
        this.fetchThesaurus(word)
        this.fetchDefinitions(word)
        if (this.activeTab.value == MainViewModel.TabIndex.READER || this.activeTab.value == MainViewModel.TabIndex.FAVORITES) {
            this.activeTab.value = MainViewModel.TabIndex.DEFINITIONS
        }
    }

    fetchRhymes(word) {
        if (!this.isLoading.value) {
            this.isRhymerLoading.value = true
            const searchTerm = this._cleanSearchTerm(word)
            this._model.fetchRhymes(searchTerm).then(wordRhymes => {
                const favorites = this._model.getFavorites()
                this.isRhymerLoading.value = false
                this.rhymes.value = new ResultList(searchTerm, favorites.includes(searchTerm), [
                    this._createRhymeListItems(wordRhymes.stressRhymes, "stress_syllables", favorites),
                    this._createRhymeListItems(wordRhymes.lastThreeSyllableRhymes, "last_three_syllables", favorites),
                    this._createRhymeListItems(wordRhymes.lastTwoSyllablesRhymes, "last_two_syllables", favorites),
                    this._createRhymeListItems(wordRhymes.lastSyllableRhymes, "last_syllable", favorites)
                ].flat())
            })
        }
    }
    _refetchRhymes() {
        if (this.rhymes.value != undefined) {
            this.fetchRhymes(this.rhymes.value.word)
        }
    }

    _createRhymeListItems = (syllableRhymes, syllableTypeLabel, favorites) =>
        (syllableRhymes || []).flatMap((item) =>
            [
                ListItem.header1(syllableTypeLabel, item.syllables)
            ].concat(
                item.rhymes.map(rhyme => ListItem.word(rhyme, favorites.includes(rhyme)))
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
                const favorites = this._model.getFavorites()
                this.isThesaurusLoading.value = false
                let resultListItems = []
                thesaurusEntries.forEach(thesaurusEntry => {
                    const wordTypeLabel = this._getWordTypeLabel(thesaurusEntry.wordType)
                    resultListItems.push(ListItem.header1(`part_of_speech_${wordTypeLabel}`))
                    if (thesaurusEntry.synonyms.length > 0) {
                        resultListItems.push(ListItem.header2("synonyms"))
                        resultListItems = resultListItems.concat(thesaurusEntry.synonyms.map(synonym => ListItem.word(synonym, favorites.includes(synonym))))
                    }
                    if (thesaurusEntry.antonyms.length > 0) {
                        resultListItems.push(ListItem.header2("antonyms"))
                        resultListItems = resultListItems.concat(thesaurusEntry.antonyms.map(antonym => ListItem.word(antonym, favorites.includes(antonym))))
                    }
                })
                this.thesaurusEntries.value = new ResultList(searchTerm, favorites.includes(searchTerm), resultListItems)
            })
        }
    }
    _refetchThesaurus() {
        if (this.thesaurusEntries.value != undefined) {
            this.fetchThesaurus(this.thesaurusEntries.value.word)
        }
    }
    getThesaurusSettingsSwitches = () => [
        new SwitchItem("setting-thesaurus-reverse-lookup", "setting_thesaurus_reverse_lookup_label", "setting_thesaurus_reverse_lookup_description", this._model.getThesaurusSettingReverseLookup())
    ]
    onThesaurusSettingToggled(id, value) {
        if (id == "setting-thesaurus-reverse-lookup") {
            this._model.setThesaurusSettingReverseLookup(value)
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
                const favorites = this._model.getFavorites()
                this.isDefinitionsLoading.value = false
                this.definitions.value = new DefinitionsResultList(
                    searchTerm,
                    favorites.includes(searchTerm),
                    definitions.map(definitionsEntry => {
                        const wordTypeLabel = this._getWordTypeLabel(definitionsEntry.wordType)
                        return new DefinitionsListItem(`part_of_speech_${wordTypeLabel}_short`, definitionsEntry.definition)
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
        this.i18n.translate("share_definitions_title", this.definitions.value.word) +
        this.definitions.value.listItems.map((definitionsListItem) =>
            this.i18n.translate("share_definitions_definition", this.i18n.translate(definitionsListItem.wordTypeLabel), definitionsListItem.definition)
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
                    new MenuItem(suggestion.word, suggestion.word, new Icon(
                        suggestion.type == Suggestion.SuggestionType.HISTORY ? "history" : "search",
                        Icon.IconSource.MATERIAL
                    ))
                )
                // If the suggestions contain any search history, also include an option to clear search history
                if (suggestions.find((suggestion) => suggestion.type == Suggestion.SuggestionType.HISTORY)) {
                    suggestionsMenuItems.push(
                        new MenuItem("clear_search_history", "clear_search_history",
                            new Icon("delete", Icon.IconSource.MATERIAL)
                        )
                    )
                }
                this.suggestions.value = suggestionsMenuItems
            })
        }
    }

    setFavorite = (word, isFavorite) => this._model.setFavorite(word, isFavorite)
    _onFavoritesChanged(newFavorites) {
        this.favorites.value = newFavorites
            .sort()
            .map((favorite) => ListItem.word(favorite, true))
        this._updateResultListFavorites(this.rhymes, newFavorites)
        this._updateResultListFavorites(this.thesaurusEntries, newFavorites)
        if (this.definitions.value != undefined) {
            this.definitions.value = new DefinitionsResultList(this.definitions.value.word, newFavorites.includes(this.definitions.value.word), this.definitions.value.listItems)
        }
    }
    _updateResultListFavorites(resultListObservableField, newFavorites) {
        if (resultListObservableField.value != undefined) {
            resultListObservableField.value = new ResultList(resultListObservableField.value.word, newFavorites.includes(resultListObservableField.value.word),
                resultListObservableField.value.listItems.map((item) =>
                    item.style == ListItem.ListItemStyles.WORD ?
                        ListItem.word(item.text, newFavorites.includes(item.text)) :
                        item
                ))
        }
    }

    onClearFavorites() {
        this.dialogInfo.value = DialogInfo.prompt(
            "favorites_delete_dialog_title",
            "favorites_delete_dialog_message",
            () => { this._model.clearFavorites() }
        )
    }
    onShareFavorites() {
        this._model.copyText(this._getFavoritesShareText())
        this.snackbarText.value = "snackbar_copied_favorites"
    }
    _getFavoritesShareText = () =>
        this.i18n.translate("share_favorites_title") +
        this._model.getFavorites().map((word) => this.i18n.translate("share_favorites_word", word))
            .join("")

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
            this._model.getRandomWord().then((word) => {
                this.fetchAll(word)
                this.activeTab.value = MainViewModel.TabIndex.DEFINITIONS
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
        } else if (selectedMenuId == "menu-definitions") {
            this.fetchDefinitions(word)
            this.activeTab.value = MainViewModel.TabIndex.DEFINITIONS
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
        new MenuItem("menu-copy", "menu_copy_title", new Icon("content_copy", Icon.IconSource.MATERIAL)),
        new MenuItem("menu-speak", "menu_speak_title", new Icon("record_voice_over", Icon.IconSource.MATERIAL)),
        new MenuItem("menu-rhymer", "tab_rhymer_title", new Icon("ic_rhymer.svg", Icon.IconSource.CUSTOM)),
        new MenuItem("menu-thesaurus", "tab_thesaurus_title", new Icon("ic_thesaurus.svg", Icon.IconSource.CUSTOM)),
        new MenuItem("menu-definitions", "tab_definitions_title", new Icon("ic_definitions.svg", Icon.IconSource.CUSTOM)),
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
MainViewModel.TabIndex = Object.freeze({ RHYMER: 0, THESAURUS: 1, DEFINITIONS: 2, READER: 3, FAVORITES: 4 })
