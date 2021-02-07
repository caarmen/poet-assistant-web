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
        this.rhymes = new ObservableField()
        this.searchTextDisabled = new ObservableField(true)
        this.searchButtonDisabled = new ObservableField(true)
        this.thesaurusEntries = new ObservableField()
        this.definitions = new ObservableField()
        this.suggestions = new ObservableField()
        this.voices = new ObservableField([])
        this.isReaderTabVisible = new ObservableField(false)
        this.isLoading = new ObservableField()
        this.activeTab = new ObservableField(MainViewModel.TabIndex.RHYMER)
        this.loadingProgress = new ObservableField(0)
        this.isLoading.value = true
        this._model = new MainModel()
        this.isSpeechPlaying = this._model.isSpeechPlaying
        this._model.loadDb((loaded, total) => {
            this.loadingProgress.value = loaded / total
        }).then(() => {
            this.isLoading.value = false
            this.searchTextDisabled.value = false
            this.activeTab.value = MainViewModel.TabIndex.RHYMER
        })
        if (this._model._speechEngine.voices.value != undefined) this.updateVoices(this._model._speechEngine.voices.value)
        this._model._speechEngine.voices.observer = (newVoices) => this.updateVoices(newVoices)
        this.contextMenuItems = [
            new MenuItem("menu-copy", "menu_copy_title", new MenuItemIcon("content_copy", MenuItemIcon.IconSource.MATERIAL)),
            new MenuItem("menu-speak", "menu_speak_title", new MenuItemIcon("record_voice_over", MenuItemIcon.IconSource.MATERIAL)),
            new MenuItem("menu-rhymer", "tab_rhymer_title", new MenuItemIcon("ic_rhymer", MenuItemIcon.IconSource.CUSTOM)),
            new MenuItem("menu-thesaurus", "tab_thesaurus_title", new MenuItemIcon("ic_thesaurus", MenuItemIcon.IconSource.CUSTOM)),
            new MenuItem("menu-dictionary", "tab_dictionary_title", new MenuItemIcon("ic_dictionary", MenuItemIcon.IconSource.CUSTOM)),
        ]
    }

    fetchAll(word) {
        this.fetchRhymes(word)
        this.fetchThesaurus(word)
        this.fetchDefinitions(word)
    }

    fetchRhymes(word) {
        if (!this.isLoading.value) {
            var searchTerm = this.cleanSearchTerm(word)
            this._model.fetchRhymes(searchTerm).then(wordRhymes => {
                this.rhymes.value = new ResultList(searchTerm, [
                    this.createRhymeListItems(wordRhymes.stressRhymes, "stress_syllables"),
                    this.createRhymeListItems(wordRhymes.lastThreeSyllableRhymes, "last_three_syllables"),
                    this.createRhymeListItems(wordRhymes.lastTwoSyllablesRhymes, "last_two_syllables"),
                    this.createRhymeListItems(wordRhymes.lastSyllableRhymes, "last_syllable")
                ].flat())
            })
        }
    }

    createRhymeListItems = (syllableRhymes, syllableTypeLabel) =>
        (syllableRhymes || []).flatMap((item) =>
            [
                new ListItem(ListItem.ListItemStyles.SUB_HEADER_1, syllableTypeLabel, item.syllables)
            ].concat(
                item.rhymes.map(rhyme => new ListItem(ListItem.ListItemStyles.WORD, rhyme))
            )
        )

    fetchThesaurus(word) {
        if (!this.isLoading.value) {
            var searchTerm = this.cleanSearchTerm(word)
            this._model.fetchThesaurus(searchTerm).then(thesaurusEntries => {
                var resultListItems = []
                thesaurusEntries.forEach(thesaurusEntry => {
                    var wordTypeLabel = this.getWordTypeLabel(thesaurusEntry.wordType)
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

    fetchDefinitions(word) {
        if (!this.isLoading.value) {
            var searchTerm = this.cleanSearchTerm(word)
            this._model.fetchDefinitions(searchTerm).then(definitions => {
                this.definitions.value = new DictionaryResultList(
                    searchTerm,
                    definitions.map(dictionaryEntry => {
                        var wordTypeLabel = this.getWordTypeLabel(dictionaryEntry.wordType)
                        return new DictionaryListItem(`part_of_speech_${wordTypeLabel}_short`, dictionaryEntry.definition)
                    })
                )
            })
        }
    }

    onSearchTextInput(text) {
        this.fetchSuggestions(text)
        this.searchButtonDisabled.value = text.length == 0
    }
    fetchSuggestions(word) {
        if (!this.isLoading.value) {
            var searchTerm = this.cleanSearchTerm(word)
            this._model.fetchSuggestions(searchTerm).then(suggestions => {
                this.suggestions.value = suggestions.map((suggestion) => new MenuItem(suggestion, suggestion))
            })
        }
    }

    getWordTypeLabel(wordType) {
        var wordTypeLabel
        if (wordType == WordType.ADJECTIVE) wordTypeLabel = "adjective"
        else if (wordType == WordType.ADVERB) wordTypeLabel = "adverb"
        else if (wordType == WordType.NOUN) wordTypeLabel = "noun"
        else if (wordType == WordType.VERB) wordTypeLabel = "verb"
        return wordTypeLabel
    }

    cleanSearchTerm = (text) => text.toLowerCase().trim()

    onContextMenuItemSelected(word, index) {
        var selectedMenuId = this.contextMenuItems[index].id
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
    requeryVoices = () => this._model.requeryVoices()

    playText = (text, start, end) => this._model.playText(text, start, end)

    updateVoices(newVoices) {
        this.voices.value = newVoices.sort((a, b) => {
            var languageA = a.lang.substring(0, 2)
            var languageB = b.lang.substring(0, 2)
            if (languageA == languageB) {
                return a.name.localeCompare(b.name)
            } else if (languageA == "en") {
                return -1
            } else if (languageB == "en") {
                return 1
            } else {
                return languageA.localeCompare(languageB)
            }
        }).map((voice) => new MenuItem(voice.voiceURI, `${voice.name} - ${voice.lang}`))
        this.isReaderTabVisible.value = this.voices.value.length > 0
    }

}
MainViewModel.TabIndex = Object.freeze({ RHYMER: 0, THESAURUS: 1, DICTIONARY: 2, READER: 3 })