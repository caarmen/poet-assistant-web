class MainModel {
    constructor() {
        this._db = undefined
    }
    async loadDb() {
        var config = {
            locateFile: filename => `libs/${filename}`
        }
        var SQL = await initSqlJs(config)
        var response = await fetch('src/resources/poet_assistant.db')
        var arrayBuffer = await response.arrayBuffer()
        this._db = new SQL.Database(new Uint8Array(arrayBuffer))
        this._dictionaryRepository = new DictionaryRepository(this._db)
    }

    async fetchDefinitions(word) {
        return this._dictionaryRepository.fetchDefinitions(word)
    }
}
