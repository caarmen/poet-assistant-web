class DictionaryRepository {
    constructor(db) {
        this._db = db
    }
    async fetchDefinitions(word) {
        var stmt = this._db.prepare("SELECT part_of_speech, definition FROM dictionary where word=? ORDER BY part_of_speech")
        stmt.bind([word])
        var definitions = []

        while (stmt.step()) {
            var row = stmt.getAsObject();
            var definition = new DictionaryListItem(row["part_of_speech"], row["definition"])
            definitions.push(definition)
        }
        return definitions
    }
}