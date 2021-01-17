class MainModel {
    constructor() {
        this._db = undefined
    }
    loadDb() {
        return new Promise((resolutionFunc) => {
            var config = {
                locateFile: filename => `libs/${filename}`
            }
            initSqlJs(config).then((SQL) => {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'src/resources/poet_assistant.db', true);
                xhr.responseType = 'arraybuffer';
                var model = this
                xhr.onload = function (e) {
                    var uInt8Array = new Uint8Array(this.response);
                    model._db = new SQL.Database(uInt8Array);
                    model._dictionaryRepository = new DictionaryRepository(model._db)
                    resolutionFunc()
                }
                xhr.send();
            })
        })
    }

    async fetchDefinitions(word) {
        return this._dictionaryRepository.fetchDefinitions(word)
    }
}
