class MainViewModel {
    constructor() {
        this.definitions = new ObservableField()
        this.isLoading = new ObservableField()
        this.isLoading.value = true
        this._model = new MainModel()
        this._model.loadDb().then(() => {
            this.isLoading.value = false
        })
    }

    fetchDefinitions(word) {
        this._model.fetchDefinitions(word).then(definitions => {
            this.definitions.value = definitions
        })
    }
};