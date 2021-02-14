/**
Copyright (c) 2021 - present Carmen Alvarez

This file is part of Poet Assistant.

Poet Assistant is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Poet Assistant is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Poet Assistant.  If not, see <http://www.gnu.org/licenses/>.
*/
class RhymerRepository {
    constructor(db) {
        this._db = db
    }
    async fetchRhymes(word) {
        const stressSyllableRhymes = await this.getStressSyllablesRhymes(word)
        const lastThreeSyllableRhymes = await this.getLastThreeSyllablesRhymes(word)
        const lastTwoSyllableRhymes = await this.getLastTwoSyllablesRhymes(word)
        const lastSyllableRhymes = await this.getLastSyllableRhymes(word)
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

    getSyllableRhymes(syllableColumn, excludeSyllableColumns, word) {
        return new Promise((completionFunc) => {
            // A word may have multiple pronunciations. 
            // Example: "dove":
            // "dove" has two variants of "stress_syllables": "AHV" and "OWV"
            this.getSyllables(syllableColumn, word).then((syllablesVariants) => {

                if (syllablesVariants.length == 0) {
                    completionFunc(undefined)
                    return
                }
                let excludeClause = excludeSyllableColumns.map(excludeColumn => {
                    const excludeSyllables = this.getSyllables(excludeColumn, word)
                    return excludeSyllables && `${excludeColumn} <> '${excludeSyllables}'`
                }).filter(clause => clause != undefined)
                    .join(" AND ")
                if (excludeClause.length > 0) excludeClause = ` AND ${excludeClause}`

                const syllableRhymes = []

                Promise.all(syllablesVariants.map((syllables) => {
                    let rhymes = []
                    const stmt = `
                        SELECT DISTINCT ${RhymerRepository.COL_WORD} 
                        FROM ${RhymerRepository.TABLE_WORD_VARIANTS} 
                        WHERE ${syllableColumn}=? 
                            AND ${RhymerRepository.COL_WORD} != ? 
                            AND ${RhymerRepository.COL_HAS_DEFINITION}=1 ${excludeClause} 
                        ORDER BY ${RhymerRepository.COL_WORD}
                        LIMIT ${RhymerRepository.LIMIT}`
                    return this._db.query(stmt, [syllables, word]).then((rows) => {
                        rhymes = rows.map((row) => row[RhymerRepository.COL_WORD])
                        if (rhymes.length > 0) syllableRhymes.push(new SyllableRhymes(syllables, rhymes))
                    })
                })).then(() => {
                    if (syllableRhymes.length > 0) completionFunc(syllableRhymes)
                    else return completionFunc(undefined)
                })
            })
        })
    }

    async getSyllables(syllablesColumn, word) {
        const stmt = `
            SELECT DISTINCT ${syllablesColumn} 
            FROM ${RhymerRepository.TABLE_WORD_VARIANTS} 
            WHERE ${RhymerRepository.COL_WORD} =? 
                AND ${RhymerRepository.COL_HAS_DEFINITION}=1
            ORDER BY ${RhymerRepository.COL_VARIANT_NUMBER}`

        return (await this._db.query(stmt, [word])).map((row) => row[syllablesColumn])
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