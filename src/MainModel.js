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
                    resolutionFunc()
                }
                xhr.send();
            })
        })
    }
    fetchDefinitions(word) {
        return new Promise((resolutionFunc) => {
            var stmt = this._db.prepare("SELECT definition FROM dictionary where word=?")
            stmt.bind([word])
            var definitions = []

            while (stmt.step()) {
                var row = stmt.getAsObject();
                var definition = row["definition"]
                definitions.push(definition)
            }
            resolutionFunc(definitions)
        })
    }
}
