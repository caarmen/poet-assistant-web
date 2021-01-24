class MainModel {
    constructor() {
        this._db = undefined
    }
    async loadDb(progressCallback) {
        var config = {
            locateFile: filename => `libs/${filename}`
        }
        var SQL = await initSqlJs(config)
        var response = await this.loadUrl('src/resources/poet_assistant.db', progressCallback)
        var arrayBuffer = new Uint8Array(response)
        this._db = new SQL.Database(new Uint8Array(arrayBuffer))
        this._rhymerRepository = new RhymerRepository(this._db)
        this._thesaurusRepository = new ThesaurusRepository(this._db)
        this._dictionaryRepository = new DictionaryRepository(this._db)
    }

    loadUrl(url, progressCallback) {
        return new Promise((completionFunc) => {
            let xhr = new XMLHttpRequest()
            xhr.open("GET", url, true)
            xhr.responseType = 'arraybuffer'
            xhr.onprogress = event => {
                progressCallback(event.loaded, event.total)
            }
            xhr.onload = () => {
                completionFunc(xhr.response)
            }
            xhr.send()
        })
    }

    async fetchRhymes(word) {
        return this._rhymerRepository.fetchRhymes(word)
    }
    async fetchThesaurus(word) {
        return this._thesaurusRepository.fetch(word)
    }
    async fetchDefinitions(word) {
        return this._dictionaryRepository.fetchDefinitions(word)
    }
}
