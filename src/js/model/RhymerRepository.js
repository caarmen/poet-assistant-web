class RhymerRepository {
    constructor(db) {
        this._db = db
    }
    async fetchRhymes(word) {
        var rhymes = []
        var variantNumbers = this.getVariantNumbers(word)
        for (const [index, variantNumber] of variantNumbers.entries()) {
            var stressSyllableRhymes = await this.getStressSyllablesRhymes(word.toLowerCase(), variantNumber)
            var lastThreeSyllableRhymes = await this.getLastThreeSyllablesRhymes(word.toLowerCase(), variantNumber)
            var lastTwoSyllableRhymes = await this.getLastTwoSyllablesRhymes(word.toLowerCase(), variantNumber)
            var lastSyllablRhymee = await this.getLastSyllableRhymes(word.toLowerCase(), variantNumber)
            rhymes = rhymes.concat(new WordVariant(variantNumber, stressSyllableRhymes, lastThreeSyllableRhymes, lastTwoSyllableRhymes, lastSyllablRhymee))
        }
        return rhymes
    }

    async getStressSyllablesRhymes(word, variantNumber) {
        return this.getRhymes("stress_syllables", [], word, variantNumber)
    }
    async getLastThreeSyllablesRhymes(word, variantNumber) {
        return this.getRhymes("last_three_syllables", ["stress_syllables"], word, variantNumber)
    }
    async getLastTwoSyllablesRhymes(word, variantNumber) {
        return this.getRhymes("last_two_syllables", ["stress_syllables", "last_three_syllables"], word, variantNumber)
    }
    async getLastSyllableRhymes(word, variantNumber) {
        return this.getRhymes("last_syllable", ["stress_syllables", "last_three_syllables", "last_two_syllables"], word, variantNumber)
    }

    async getRhymes(syllableColumn, excludeSyllableColumns, word, variantNumber) {
        var syllables = this.getSyllables(syllableColumn, word, variantNumber)
        if (syllables == undefined) return undefined
        var excludeClause = excludeSyllableColumns.map(excludeColumn => {
            var excludeSyllables = this.getSyllables(excludeColumn, word, variantNumber)
            if (excludeSyllables != undefined) {
                return excludeColumn + " <> '" + excludeSyllables + "'"
            }
        }).filter(clause => clause != undefined)
            .join(" AND ")
        if (excludeClause.length > 0) excludeClause = " AND " + excludeClause

        var stmt = this._db.prepare("SELECT DISTINCT word FROM word_variants WHERE " + syllableColumn + "=? AND word != ? AND has_definition=1 " + excludeClause + "ORDER BY word")
        stmt.bind([syllables, word])
        var rhymes = []
        while (stmt.step()) {
            var row = stmt.getAsObject();
            rhymes.push(row["word"])
        }
        if (rhymes.length > 0) return new Rhymes(syllables, rhymes)
        else return undefined
    }

    getSyllables(syllablesColumn, word, variantNumber) {
        var stmt = this._db.prepare("SELECT " + syllablesColumn + " FROM word_variants WHERE word=? AND variant_number=?")
        stmt.bind([word, variantNumber])
        if (stmt.step()) {
            var row = stmt.getAsObject()
            return row[syllablesColumn]
        }
        return undefined
    }
    getVariantNumbers(word) {
        var stmt = this._db.prepare("SELECT variant_number FROM word_variants WHERE word=? ORDER BY variant_number")
        stmt.bind([word])
        var variantNumbers = []
        while (stmt.step()) {
            var row = stmt.getAsObject()
            variantNumbers.push(row["variant_number"])
        }
        return variantNumbers
    }
}