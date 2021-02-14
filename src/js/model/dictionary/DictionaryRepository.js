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
class DictionaryRepository {
    constructor(db) {
        this._db = db
    }
    async fetchDefinitions(word) {
        var stmt = `
            SELECT ${DictionaryRepository.COL_PART_OF_SPEECH}, ${DictionaryRepository.COL_DEFINITION} 
            FROM ${DictionaryRepository.TABLE_DICTIONARY}
            WHERE ${DictionaryRepository.COL_WORD}=? 
            ORDER BY ${DictionaryRepository.COL_PART_OF_SPEECH}`

        return (await this._db.query(stmt, [word])).map((row) => {
            var wordTypeStr = row[DictionaryRepository.COL_PART_OF_SPEECH]
            var wordType
            if (wordTypeStr == "a") wordType = WordType.ADJECTIVE
            else if (wordTypeStr == "r") wordType = WordType.ADVERB
            else if (wordTypeStr == "n") wordType = WordType.NOUN
            else if (wordTypeStr == "v") wordType = WordType.VERB
            return new DictionaryEntry(wordType, row[DictionaryRepository.COL_DEFINITION])
        })
    }

    async getRandomWord() {
        var stmt = `
            SELECT ${DictionaryRepository.COL_WORD}
            FROM ${DictionaryRepository.TABLE_STEMS}
            WHERE ${DictionaryRepository.COL_GOOGLE_NGRAM_FREQUENCY} > 1500
                AND ${DictionaryRepository.COL_GOOGLE_NGRAM_FREQUENCY} < 25000
            ORDER BY RANDOM() LIMIT 1`
        return (await this._db.query(stmt, []))[0][DictionaryRepository.COL_WORD]
    }
}
DictionaryRepository.TABLE_STEMS = "stems"
DictionaryRepository.COL_GOOGLE_NGRAM_FREQUENCY = "google_ngram_frequency"
DictionaryRepository.TABLE_DICTIONARY = "dictionary"
DictionaryRepository.COL_DEFINITION = "definition"
DictionaryRepository.COL_PART_OF_SPEECH = "part_of_speech"
DictionaryRepository.COL_WORD = "word"