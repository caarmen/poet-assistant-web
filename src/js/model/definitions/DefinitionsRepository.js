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
class DefinitionsRepository {
    constructor(db) {
        this._db = db
    }
    async fetchDefinitions(word) {
        const stmt = `
            SELECT ${DefinitionsRepository.COL_PART_OF_SPEECH}, ${DefinitionsRepository.COL_DEFINITION} 
            FROM ${DefinitionsRepository.TABLE_DICTIONARY}
            WHERE ${DefinitionsRepository.COL_WORD}=? 
            ORDER BY ${DefinitionsRepository.COL_PART_OF_SPEECH}`

        return (await this._db.query(stmt, [word])).map((row) => {
            const wordTypeStr = row[DefinitionsRepository.COL_PART_OF_SPEECH]
            let wordType
            if (wordTypeStr == "a") wordType = WordType.ADJECTIVE
            else if (wordTypeStr == "r") wordType = WordType.ADVERB
            else if (wordTypeStr == "n") wordType = WordType.NOUN
            else if (wordTypeStr == "v") wordType = WordType.VERB
            return new DefinitionEntry(wordType, row[DefinitionsRepository.COL_DEFINITION])
        })
    }

    async getRandomWord() {
        const stmt = `
            SELECT ${DefinitionsRepository.COL_WORD}
            FROM ${DefinitionsRepository.TABLE_STEMS}
            WHERE ${DefinitionsRepository.COL_GOOGLE_NGRAM_FREQUENCY} > 1500
                AND ${DefinitionsRepository.COL_GOOGLE_NGRAM_FREQUENCY} < 25000
            ORDER BY RANDOM() LIMIT 1`
        return (await this._db.query(stmt, []))[0][DefinitionsRepository.COL_WORD]
    }
}
DefinitionsRepository.TABLE_STEMS = "stems"
DefinitionsRepository.COL_GOOGLE_NGRAM_FREQUENCY = "google_ngram_frequency"
DefinitionsRepository.TABLE_DICTIONARY = "dictionary"
DefinitionsRepository.COL_DEFINITION = "definition"
DefinitionsRepository.COL_PART_OF_SPEECH = "part_of_speech"
DefinitionsRepository.COL_WORD = "word"