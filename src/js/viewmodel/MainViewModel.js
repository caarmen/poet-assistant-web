class MainViewModel {
    static TabIndex = Object.freeze({RHYMER: 0, DICTIONARY: 1})
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
                rhymes.forEach(wordVariant =>{
                    if (wordVariant.stressRhymes.length > 0) {
                        result.push(new ListItem("stress_syllables", ListItem.ListItemStyles.SUB_HEADER_1))
                        result = result.concat(wordVariant.stressRhymes.map(rhyme => new ListItem(rhyme, ListItem.ListItemStyles.WORD)))
                    }
                    if (wordVariant.lastThreeSyllablesRhymes.length > 0) {
                        result.push(new ListItem("last_three_syllables", ListItem.ListItemStyles.SUB_HEADER_1))
                        result = result.concat(wordVariant.lastThreeSyllablesRhymes.map(rhyme => new ListItem(rhyme, ListItem.ListItemStyles.WORD)))
                    }
                    if (wordVariant.lastTwoSyllablesRhymes.length > 0) {
                        result.push(new ListItem("last_two_syllables", ListItem.ListItemStyles.SUB_HEADER_1))
                        result = result.concat(wordVariant.lastTwoSyllablesRhymes.map(rhyme => new ListItem(rhyme, ListItem.ListItemStyles.WORD)))
                    }
                    if (wordVariant.lastSyllableRhymes.length > 0) {
                        result.push(new ListItem("last_syllable", ListItem.ListItemStyles.SUB_HEADER_1))
                        result = result.concat(wordVariant.lastSyllableRhymes.map(rhyme => new ListItem(rhyme, ListItem.ListItemStyles.WORD)))
                    }
                })
                this.rhymes.value = result
            })
        }
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