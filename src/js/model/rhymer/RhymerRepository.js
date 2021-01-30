class RhymerRepository {
    constructor(db) {
        this._db = db
    }
    async fetchRhymes(word) {
        var rhymes = []
        var variantNumbers = this.getVariantNumbers(word)
        for (const [index, variantNumber] of variantNumbers.entries()) {
            var stressSyllableRhymes = await this.getStressSyllablesRhymes(word, variantNumber)
            var lastThreeSyllableRhymes = await this.getLastThreeSyllablesRhymes(word, variantNumber)
            var lastTwoSyllableRhymes = await this.getLastTwoSyllablesRhymes(word, variantNumber)
            var lastSyllableRhymes = await this.getLastSyllableRhymes(word, variantNumber)
            rhymes = rhymes.concat(new WordVariant(variantNumber, stressSyllableRhymes, lastThreeSyllableRhymes, lastTwoSyllableRhymes, lastSyllableRhymes))
        }
        return rhymes
    }

    async getStressSyllablesRhymes(word, variantNumber) {
        return this.getRhymes(RhymerRepository.COL_STRESS_SYLLABLES, [], word, variantNumber)
    }
    async getLastThreeSyllablesRhymes(word, variantNumber) {
        return this.getRhymes(RhymerRepository.COL_LAST_THREE_SYLLABLES, [RhymerRepository.COL_STRESS_SYLLABLES], word, variantNumber)
    }
    async getLastTwoSyllablesRhymes(word, variantNumber) {
        return this.getRhymes(RhymerRepository.COL_LAST_TWO_SYLLABLES, [RhymerRepository.COL_STRESS_SYLLABLES, RhymerRepository.COL_LAST_THREE_SYLLABLES], word, variantNumber)
    }
    async getLastSyllableRhymes(word, variantNumber) {
        return this.getRhymes(RhymerRepository.COL_LAST_SYLLABLE, [RhymerRepository.COL_STRESS_SYLLABLES, RhymerRepository.COL_LAST_THREE_SYLLABLES, RhymerRepository.COL_LAST_TWO_SYLLABLES], word, variantNumber)
    }

    async getRhymes(syllableColumn, excludeSyllableColumns, word, variantNumber) {
        var syllables = this.getSyllables(syllableColumn, word, variantNumber)
        if (syllables == undefined) return undefined
        var excludeClause = excludeSyllableColumns.map(excludeColumn => {
            var excludeSyllables = this.getSyllables(excludeColumn, word, variantNumber)
            return excludeSyllables && `${excludeColumn} <> '${excludeSyllables}'`
        }).filter(clause => clause != undefined)
            .join(" AND ")
        if (excludeClause.length > 0) excludeClause = ` AND ${excludeClause}`

        var stmt = this._db.prepare(`
            SELECT DISTINCT ${RhymerRepository.COL_WORD} 
            FROM ${RhymerRepository.TABLE_WORD_VARIANTS} 
            WHERE ${syllableColumn}=? 
                AND ${RhymerRepository.COL_WORD} != ? 
                AND ${RhymerRepository.COL_HAS_DEFINITION}=1 ${excludeClause} 
            ORDER BY ${RhymerRepository.COL_WORD}`)
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
        var stmt = this._db.prepare(`
            SELECT ${syllablesColumn} 
            FROM ${RhymerRepository.TABLE_WORD_VARIANTS} 
            WHERE ${RhymerRepository.COL_WORD} =? 
                AND ${RhymerRepository.COL_VARIANT_NUMBER}=?`)
        stmt.bind([word, variantNumber])
        if (stmt.step()) {
            var row = stmt.getAsObject()
            return row[syllablesColumn]
        }
        return undefined
    }
    getVariantNumbers(word) {
        var stmt = this._db.prepare(`
            SELECT ${RhymerRepository.COL_VARIANT_NUMBER} 
            FROM ${RhymerRepository.TABLE_WORD_VARIANTS} 
            WHERE ${RhymerRepository.COL_WORD} =? 
            ORDER BY ${RhymerRepository.COL_VARIANT_NUMBER}`)
        stmt.bind([word])
        var variantNumbers = []
        while (stmt.step()) {
            var row = stmt.getAsObject()
            variantNumbers.push(row[RhymerRepository.COL_VARIANT_NUMBER])
        }
        return variantNumbers
    }
}
RhymerRepository.TABLE_WORD_VARIANTS = "word_variants"
RhymerRepository.COL_HAS_DEFINITION = "has_definition"
RhymerRepository.COL_STRESS_SYLLABLES = "stress_syllables"
RhymerRepository.COL_LAST_THREE_SYLLABLES = "last_three_syllables"
RhymerRepository.COL_LAST_TWO_SYLLABLES = "last_two_syllables"
RhymerRepository.COL_LAST_SYLLABLE = "last_syllable"
RhymerRepository.COL_WORD = "word"
RhymerRepository.COL_VARIANT_NUMBER = "variant_number"