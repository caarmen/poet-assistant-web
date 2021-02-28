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
    constructor(db, settings) {
        this._db = db
        this._settings = settings
        this.settingsChangeObserver = () => { }
        this._settings.addObserver((key, newValue) => this._onSettingsChanged(key))
    }
    _onSettingsChanged(key) {
        if (key == RhymerRepository.SETTINGS_KEY_AOR_AO || key == RhymerRepository.SETTINGS_KEY_AO_AA) {
            this.settingsChangeObserver()
        }
    }
    async fetchRhymes(word) {
        const stressSyllableRhymes = await this._getStressSyllablesRhymes(word)
        const lastThreeSyllableRhymes = await this._getLastThreeSyllablesRhymes(word)
        const lastTwoSyllableRhymes = await this._getLastTwoSyllablesRhymes(word)
        const lastSyllableRhymes = await this._getLastSyllableRhymes(word)
        return new WordRhymes(stressSyllableRhymes, lastThreeSyllableRhymes, lastTwoSyllableRhymes, lastSyllableRhymes)
    }

    async _getStressSyllablesRhymes(word) {
        return this._getSyllableRhymes(RhymerRepository.COL_STRESS_SYLLABLES, [], word)
    }
    async _getLastThreeSyllablesRhymes(word) {
        return this._getSyllableRhymes(RhymerRepository.COL_LAST_THREE_SYLLABLES, [RhymerRepository.COL_STRESS_SYLLABLES], word)
    }
    async _getLastTwoSyllablesRhymes(word) {
        return this._getSyllableRhymes(RhymerRepository.COL_LAST_TWO_SYLLABLES, [RhymerRepository.COL_STRESS_SYLLABLES, RhymerRepository.COL_LAST_THREE_SYLLABLES], word)
    }
    async _getLastSyllableRhymes(word) {
        return this._getSyllableRhymes(RhymerRepository.COL_LAST_SYLLABLE, [RhymerRepository.COL_STRESS_SYLLABLES, RhymerRepository.COL_LAST_THREE_SYLLABLES, RhymerRepository.COL_LAST_TWO_SYLLABLES], word)
    }

    _getSyllableRhymes(syllableColumn, excludeSyllableColumns, word) {
        return new Promise((completionFunc) => {
            // A word may have multiple pronunciations. 
            // Example: "dove":
            // "dove" has two variants of "stress_syllables": "AHV" and "OWV"
            this._getSyllables(syllableColumn, word).then((syllablesVariants) => {

                if (syllablesVariants.length == 0) {
                    completionFunc(undefined)
                    return
                }
                let excludeClause = excludeSyllableColumns.map(excludeColumn => {
                    const excludeSyllables = this._getSyllables(excludeColumn, word)
                    return excludeSyllables && `${excludeColumn} <> '${excludeSyllables}'`
                }).filter(clause => clause != undefined)
                    .join(" AND ")
                if (excludeClause.length > 0) excludeClause = ` AND ${excludeClause}`

                const syllableRhymes = []

                Promise.all(syllablesVariants.map((syllables) => {

                    let rhymes = []
                    let transformedSyllableColumn = syllableColumn
                    let transformedSyllables = syllables
                    if (this.getAorAoSetting() && (syllables.includes("AOR") || syllables.includes("AO"))) {
                        transformedSyllables = transformedSyllables.replaceAll("AOR", "AO")
                        transformedSyllableColumn = `REPLACE(${transformedSyllableColumn}, 'AOR', 'AO')`
                    }
                    if (this.getAoAaSetting() && (syllables.includes("AO") || syllables.includes("AA"))) {
                        transformedSyllables = transformedSyllables.replaceAll("AO", "AA")
                        transformedSyllableColumn = `REPLACE(${transformedSyllableColumn}, 'AO', 'AA')`
                    }
                    const stmt = `
                        SELECT DISTINCT ${RhymerRepository.COL_WORD} 
                        FROM ${RhymerRepository.TABLE_WORD_VARIANTS} 
                        WHERE ${transformedSyllableColumn} =?
                            AND ${RhymerRepository.COL_WORD} != ?
                            AND ${RhymerRepository.COL_HAS_DEFINITION}=1 ${excludeClause} 
                        ORDER BY ${RhymerRepository.COL_WORD}
                        LIMIT ${RhymerRepository.LIMIT}`
                    return this._db.query(stmt, [transformedSyllables, word]).then((rows) => {
                        rhymes = rows.map((row) => row[RhymerRepository.COL_WORD])
                        if (rhymes.length > 0) syllableRhymes.push(new SyllableRhymes(transformedSyllables, rhymes))
                    })
                })).then(() => {
                    if (syllableRhymes.length > 0) completionFunc(syllableRhymes)
                    else return completionFunc(undefined)
                })
            })
        })
    }

    async _getSyllables(syllablesColumn, word) {
        const stmt = `
            SELECT DISTINCT ${syllablesColumn} 
            FROM ${RhymerRepository.TABLE_WORD_VARIANTS} 
            WHERE ${RhymerRepository.COL_WORD} =? 
                AND ${RhymerRepository.COL_HAS_DEFINITION}=1
            ORDER BY ${RhymerRepository.COL_VARIANT_NUMBER}`

        return (await this._db.query(stmt, [word])).map((row) => row[syllablesColumn]).filter((syllable) => syllable != null)
    }
    getAorAoSetting = () => (this._settings.getSetting(RhymerRepository.SETTINGS_KEY_AOR_AO, false)) == "true"
    getAoAaSetting = () => (this._settings.getSetting(RhymerRepository.SETTINGS_KEY_AO_AA, false)) == "true"
    setAorAoSetting = (value) => this._settings.setSetting(RhymerRepository.SETTINGS_KEY_AOR_AO, value)
    setAoAaSetting = (value) => this._settings.setSetting(RhymerRepository.SETTINGS_KEY_AO_AA, value)
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
RhymerRepository.SETTINGS_KEY_AOR_AO = "rhymer_aor_ao"
RhymerRepository.SETTINGS_KEY_AO_AA = "rhymer_ao_aa"