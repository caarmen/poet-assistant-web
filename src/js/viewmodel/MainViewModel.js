class MainViewModel {
    constructor() {
        this.rhymes = new ObservableField()
        this.thesaurusEntries = new ObservableField()
        this.definitions = new ObservableField()
        this.isLoading = new ObservableField()
        this.dialog = new ObservableField()
        this.activeTab = new ObservableField(MainViewModel.TabIndex.RHYMER)
        this.loadingProgress = new ObservableField(0)
        this.isLoading.value = true
        this._model = new MainModel()
        this._model.loadDb((loaded, total) => {
            this.loadingProgress.value = loaded / total
        }).then(() => {
            this.isLoading.value = false
            this.activeTab.value = MainViewModel.TabIndex.RHYMER
        })
    }

    fetchRhymes(word) {
        if (!this.isLoading.value) {
            this._model.fetchRhymes(this.cleanSearchTerm(word)).then(rhymes => {
                var resultListItems = []
                rhymes.forEach(wordVariant => {
                    resultListItems = resultListItems.concat(this.createRhymeListItems(wordVariant.stressRhymes, "stress_syllables"))
                    resultListItems = resultListItems.concat(this.createRhymeListItems(wordVariant.lastThreeSyllableRhymes, "last_three_syllables"))
                    resultListItems = resultListItems.concat(this.createRhymeListItems(wordVariant.lastTwoSyllablesRhymes, "last_two_syllables"))
                    resultListItems = resultListItems.concat(this.createRhymeListItems(wordVariant.lastSyllableRhymes, "last_syllable"))
                })
                this.rhymes.value = new ResultList(word, resultListItems)
            })
        }
    }

    createRhymeListItems(rhymes, syllableType) {
        var result = []
        if (rhymes != undefined) {
            result.push(new ListItem(syllableType, ListItem.ListItemStyles.SUB_HEADER_1))
            result = result.concat(new ListItem(rhymes.syllables, ListItem.ListItemStyles.SUB_HEADER_2))
            result = result.concat(rhymes.rhymes.map(rhyme => new ListItem(rhyme, ListItem.ListItemStyles.WORD)))
        }
        return result
    }

    fetchThesaurus(word) {
        if (!this.isLoading.value) {
            this._model.fetchThesaurus(this.cleanSearchTerm(word)).then(thesaurusEntries => {
                var resultListItems = []
                thesaurusEntries.forEach(thesaurusEntry => {
                    var wordTypeLabel
                    if (thesaurusEntry.wordType == ThesaurusEntry.WordType.ADJECTIVE) wordTypeLabel = "adjective"
                    else if (thesaurusEntry.wordType == ThesaurusEntry.WordType.ADVERB) wordTypeLabel = "adverb"
                    else if (thesaurusEntry.wordType == ThesaurusEntry.WordType.NOUN) wordTypeLabel = "noun"
                    else if (thesaurusEntry.wordType == ThesaurusEntry.WordType.VERB) wordTypeLabel = "verb"
                    resultListItems.push(new ListItem(`part_of_speech_${wordTypeLabel}`, ListItem.ListItemStyles.SUB_HEADER_1))
                    if (thesaurusEntry.synonyms.length > 0) {
                        resultListItems.push(new ListItem("synonyms", ListItem.ListItemStyles.SUB_HEADER_2))
                        resultListItems = resultListItems.concat(thesaurusEntry.synonyms.map(synonym => new ListItem(synonym, ListItem.ListItemStyles.WORD)))
                    }
                    if (thesaurusEntry.antonyms.length > 0) {
                        resultListItems.push(new ListItem("antonyms", ListItem.ListItemStyles.SUB_HEADER_2))
                        resultListItems = resultListItems.concat(thesaurusEntry.antonyms.map(antonym => new ListItem(antonym, ListItem.ListItemStyles.WORD)))
                    }
                })
                this.thesaurusEntries.value = new ResultList(word, resultListItems)
            })
        }
    }

    fetchDefinitions(word) {
        if (!this.isLoading.value) {
            this._model.fetchDefinitions(this.cleanSearchTerm(word)).then(definitions => {
                this.definitions.value = definitions
            })
        }
    }

    cleanSearchTerm = (text) => text.toLowerCase().trim()

    onAboutClicked = () =>
        this.dialog.value = new DialogInfo("dialog_about_title", "dialog_about_content")
}
MainViewModel.TabIndex = Object.freeze({ RHYMER: 0, THESAURUS: 1, DICTIONARY: 2 })