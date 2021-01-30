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

    getWordTypeLabel(wordType) {
        var wordTypeLabel
        if (wordType == WordType.ADJECTIVE) wordTypeLabel = "adjective"
        else if (wordType == WordType.ADVERB) wordTypeLabel = "adverb"
        else if (wordType == WordType.NOUN) wordTypeLabel = "noun"
        else if (wordType == WordType.VERB) wordTypeLabel = "verb"
        return wordTypeLabel
    }

    cleanSearchTerm = (text) => text.toLowerCase().trim()

    onAboutClicked = () =>
        this.dialog.value = new DialogInfo("dialog_about_title", "dialog_about_content")
}
MainViewModel.TabIndex = Object.freeze({ RHYMER: 0, THESAURUS: 1, DICTIONARY: 2 })