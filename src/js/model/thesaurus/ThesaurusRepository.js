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
class ThesaurusRepository {
    constructor(db, settings) {
        this._db = db
        this._settings = settings
        this.settingsChangeObserver = () => { }
        this._settings.addObserver((key, newValue) => this._onSettingsChanged(key))
    }
    _onSettingsChanged(key) {
        if (key == ThesaurusRepository.SETTINGS_KEY_REVERSE_LOOKUP) {
            this.settingsChangeObserver()
        }
    }
    async fetch(word) {
        const stmt = `
            SELECT ${ThesaurusRepository.COL_WORD_TYPE}, ${ThesaurusRepository.COL_SYNONYMS}, ${ThesaurusRepository.COL_ANTONYMS} 
            FROM ${ThesaurusRepository.TABLE_THESAURUS}
            WHERE ${ThesaurusRepository.COL_WORD}=? 
            ORDER BY ${ThesaurusRepository.COL_WORD_TYPE}`

        const forwardMatches = (await this._db.query(stmt, [word])).map((row) => {
            const wordType = this._toWordType(row[ThesaurusRepository.COL_WORD_TYPE])

            const synonyms = (row[ThesaurusRepository.COL_SYNONYMS] || "").split(",").filter(item => item != "").sort()
            const antonyms = (row[ThesaurusRepository.COL_ANTONYMS] || "").split(",").filter(item => item != "").sort()

            return new ThesaurusEntry(
                wordType,
                synonyms,
                antonyms
            )
        })

        let reverseMatches = []
        if (this.getReverseLookupSetting()) {
            const reverseSynonyms = (await this._lookupReverseRelatedWords(
                word,
                ThesaurusRepository.COL_SYNONYMS,
                forwardMatches.map((result) => result.synonyms).flat()
            ))
            const reverseAntonyms = (await this._lookupReverseRelatedWords(
                word,
                ThesaurusRepository.COL_ANTONYMS,
                forwardMatches.map((result) => result.antonyms).flat()
            ))

            reverseMatches = Object.values(WordType).map((wordType) =>
                new ThesaurusEntry(wordType,
                    Array.from(reverseSynonyms.get(wordType) || new Set()),
                    Array.from(reverseAntonyms.get(wordType) || new Set())
                )
            ).filter((entry) => entry.synonyms.length > 0 || entry.antonyms.length > 0)
        }
        return [forwardMatches, reverseMatches].flat()
    }

    /**
     * @returns a Map of WordType to words for the synonyms (or antonyms) of the given word
     */
    async _lookupReverseRelatedWords(word, relationshipColumn, excludeWords) {
        const stmt = `
            SELECT 
                ${ThesaurusRepository.COL_WORD},
                ${ThesaurusRepository.COL_WORD_TYPE}
            FROM ${ThesaurusRepository.TABLE_THESAURUS}
            WHERE 
                ${relationshipColumn}=? 
                OR ${relationshipColumn} LIKE ?
                OR ${relationshipColumn} LIKE ?
                OR ${relationshipColumn} LIKE ?
            ORDER BY ${ThesaurusRepository.COL_WORD_TYPE}`
        const args = [
            word, // only related word
            `${word},%`, // first related word
            `%,${word}`, // last related word
            `%,${word},%` // somewhere in the list of related words
        ]
        return (await this._db.query(stmt, args)).reduce(
            (previousResult, row) => {
                const word = row[ThesaurusRepository.COL_WORD]
                if (excludeWords.includes(word)) {
                    return previousResult
                } else {
                    const wordType = this._toWordType(row[ThesaurusRepository.COL_WORD_TYPE])
                    const wordsForWordType = (previousResult.get(wordType) || new Set()).add(word)
                    return previousResult.set(wordType, wordsForWordType)
                }
            },
            new Map())
    }

    _toWordType(wordTypeStr) {
        if (wordTypeStr == "ADJ") return WordType.ADJECTIVE
        else if (wordTypeStr == "ADV") return WordType.ADVERB
        else if (wordTypeStr == "NOUN") return WordType.NOUN
        else if (wordTypeStr == "VERB") return WordType.VERB
    }
    getReverseLookupSetting = () => (this._settings.getSetting(ThesaurusRepository.SETTINGS_KEY_REVERSE_LOOKUP, false)) == "true"
    setReverseLookupSetting = (value) => this._settings.setSetting(ThesaurusRepository.SETTINGS_KEY_REVERSE_LOOKUP, value)
}
ThesaurusRepository.TABLE_THESAURUS = "thesaurus"
ThesaurusRepository.COL_SYNONYMS = "synonyms"
ThesaurusRepository.COL_ANTONYMS = "antonyms"
ThesaurusRepository.COL_WORD = "word"
ThesaurusRepository.COL_WORD_TYPE = "word_type"
ThesaurusRepository.SETTINGS_KEY_REVERSE_LOOKUP = "thesaurus_reverse_lookup"