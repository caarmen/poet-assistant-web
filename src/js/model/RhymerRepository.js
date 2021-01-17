class RhymerRepository {
    constructor(db) {
        this._db = db
    }
    async fetchRhymes(word) {
        return this.getStressSyllablesRhymes(word.toLowerCase())
    }

    async getStressSyllablesRhymes(word) {
        return this.getRhymes("stress_syllables", word)
    }

    async getRhymes(syllableColumn, word) {
        var syllables = this.getSyllables(syllableColumn, word)
        var rhymes = []
        if (syllables == undefined) return rhymes

        var stmt = this._db.prepare("SELECT distinct word FROM word_variants where " + syllableColumn + "=? AND word != ? AND has_definition=1 ORDER BY word")
        stmt.bind([syllables, word])
        while (stmt.step()) {
            var row = stmt.getAsObject();
            rhymes.push(row["word"])
        }
        return rhymes
    }

    getSyllables(syllablesColumn, word) {
        var stmt = this._db.prepare("SELECT " + syllablesColumn + " FROM word_variants where word=?")
        stmt.bind([word])
        if (stmt.step()) {
            var row = stmt.getAsObject()
            return row["stress_syllables"]
        }
        return undefined
    }
}