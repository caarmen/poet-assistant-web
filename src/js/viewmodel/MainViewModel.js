class MainViewModel {
    static TAB_RHYMER = 0
    static TAB_DICTIONARY = 1
    constructor() {
        this.definitions = new ObservableField()
        this.rhymes = new ObservableField()
        this.isLoading = new ObservableField()
        this.dialog = new ObservableField()
        this.activeTab = new ObservableField(MainViewModel.TAB_RHYMER)
        this.isLoading.value = true
        this._model = new MainModel()
        this._model.loadDb().then(() => {
            this.isLoading.value = false
            this.activeTab.value = MainViewModel.TAB_RHYMER
        })
    }

    fetchRhymes(word) {
        if (!this.isLoading.value) {
            this._model.fetchRhymes(word).then(rhymes => {
                this.rhymes.value = rhymes
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