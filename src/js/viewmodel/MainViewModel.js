class MainViewModel {
    constructor() {
        this.definitions = new ObservableField()
        this.rhymes = new ObservableField()
        this.isLoading = new ObservableField()
        this.dialog = new ObservableField()
        this.activeTab = new ObservableField(MainViewModel.TabIndex.RHYMER)
        this.isLoading.value = true
        this._model = new MainModel()
        this._model.loadDb().then(() => {
            this.isLoading.value = false
            this.activeTab.value = MainViewModel.TabIndex.RHYMER
        })
    }

    fetchRhymes(word) {
        if (!this.isLoading.value) {
            this._model.fetchRhymes(word).then(rhymes => {
                var result = []
                rhymes.forEach(wordVariant => {
                    result = result.concat(this.createListItems(wordVariant.stressRhymes, "stress_syllables"))
                    result = result.concat(this.createListItems(wordVariant.lastThreeSyllableRhymes, "last_three_syllables"))
                    result = result.concat(this.createListItems(wordVariant.lastTwoSyllablesRhymes, "last_two_syllables"))
                    result = result.concat(this.createListItems(wordVariant.lastyllableRhymes, "last_syllable"))
                })
                this.rhymes.value = result
            })
        }
    }

    createListItems(rhymes, syllableType) {
        var result = []
        if (rhymes != undefined) {
            result.push(new ListItem(syllableType, ListItem.ListItemStyles.SUB_HEADER_1))
            result = result.concat(new ListItem(rhymes.syllables, ListItem.ListItemStyles.SUB_HEADER_2))
            result = result.concat(rhymes.rhymes.map(rhyme => new ListItem(rhyme, ListItem.ListItemStyles.WORD)))
        }
        return result
    }

    fetchDefinitions(word) {
        if (!this.isLoading.value) {
            this._model.fetchDefinitions(word).then(definitions => {
                this.definitions.value = definitions
            })
        }
    }
    onAboutClicked() {
        this.dialog.value = new DialogInfo("dialog_about_title", "dialog_about_content")
    }
};
MainViewModel.TabIndex = Object.freeze({ RHYMER: 0, DICTIONARY: 1 })