class RhymerRepository {
    constructor(db) {
        this._db = db
    }
    async fetchRhymes(word) {
        var stressSyllableRhymes = await this.getStressSyllablesRhymes(word)
        var lastThreeSyllableRhymes = await this.getLastThreeSyllablesRhymes(word)
        var lastTwoSyllableRhymes = await this.getLastTwoSyllablesRhymes(word)
        var lastSyllableRhymes = await this.getLastSyllableRhymes(word)
        return new WordRhymes(stressSyllableRhymes, lastThreeSyllableRhymes, lastTwoSyllableRhymes, lastSyllableRhymes)
    }

    async getStressSyllablesRhymes(word) {
        return this.getSyllableRhymes(RhymerRepository.COL_STRESS_SYLLABLES, [], word)
    }
    async getLastThreeSyllablesRhymes(word) {
        return this.getSyllableRhymes(RhymerRepository.COL_LAST_THREE_SYLLABLES, [RhymerRepository.COL_STRESS_SYLLABLES], word)
    }
    async getLastTwoSyllablesRhymes(word) {
        return this.getSyllableRhymes(RhymerRepository.COL_LAST_TWO_SYLLABLES, [RhymerRepository.COL_STRESS_SYLLABLES, RhymerRepository.COL_LAST_THREE_SYLLABLES], word)
    }
    async getLastSyllableRhymes(word) {
        return this.getSyllableRhymes(RhymerRepository.COL_LAST_SYLLABLE, [RhymerRepository.COL_STRESS_SYLLABLES, RhymerRepository.COL_LAST_THREE_SYLLABLES, RhymerRepository.COL_LAST_TWO_SYLLABLES], word)
    }

    async getSyllableRhymes(syllableColumn, excludeSyllableColumns, word) {
        // A word may have multiple pronunciations. 
        // Example: "dove":
        // "dove" has two variants of "stress_syllables": "AHV" and "OWV"
        var syllablesVariants = this.getSyllables(syllableColumn, word)
        if (syllablesVariants.length == 0) return undefined
        var excludeClause = excludeSyllableColumns.map(excludeColumn => {
            var excludeSyllables = this.getSyllables(excludeColumn, word)
            return excludeSyllables && `${excludeColumn} <> '${excludeSyllables}'`
        }).filter(clause => clause != undefined)
            .join(" AND ")
        if (excludeClause.length > 0) excludeClause = ` AND ${excludeClause}`

        var syllableRhymes = []
        syllablesVariants.forEach((syllables) => {
            var rhymes = []
            var stmt = this._db.prepare(`
                SELECT DISTINCT ${RhymerRepository.COL_WORD} 
                FROM ${RhymerRepository.TABLE_WORD_VARIANTS} 
                WHERE ${syllableColumn}=? 
                    AND ${RhymerRepository.COL_WORD} != ? 
                    AND ${RhymerRepository.COL_HAS_DEFINITION}=1 ${excludeClause} 
                ORDER BY ${RhymerRepository.COL_WORD}
                LIMIT ${RhymerRepository.LIMIT}`)
            stmt.bind([syllables, word])
            while (stmt.step()) {
                var row = stmt.getAsObject();
                rhymes.push(row["word"])
            }
            if (rhymes.length > 0) syllableRhymes.push(new SyllableRhymes(syllables, rhymes))
        })
        if (syllableRhymes.length > 0) return syllableRhymes
        else return undefined
    }

    getSyllables(syllablesColumn, word) {
        var stmt = this._db.prepare(`
            SELECT DISTINCT ${syllablesColumn} 
            FROM ${RhymerRepository.TABLE_WORD_VARIANTS} 
            WHERE ${RhymerRepository.COL_WORD} =? 
                AND ${RhymerRepository.COL_HAS_DEFINITION}=1
            ORDER BY ${RhymerRepository.COL_VARIANT_NUMBER}`)
        stmt.bind([word])
        var syllables = []
        while (stmt.step()) {
            var row = stmt.getAsObject()
            syllables.push(row[syllablesColumn])
        }
        return syllables
    }
}
RhymerRepository.TABLE_WORD_VARIANTS = "word_variants"
RhymerRepository.LIMIT = 500
RhymerRepository.COL_HAS_DEFINITION = "has_definition"
RhymerRepository.COL_STRESS_SYLLABLES = "stress_syllables"
RhymerRepository.COL_LAST_THREE_SYLLABLES = "last_three_syllables"
RhymerRepository.COL_LAST_TWO_SYLLABLES = "last_two_syllables"
RhymerRepository.COL_LAST_SYLLABLE = "last_syllable"
RhymerRepository.COL_WORD = "word"
RhymerRepository.COL_VARIANT_NUMBER = "variant_number"