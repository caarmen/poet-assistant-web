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
    constructor(db) {
        this._db = db
    }
    async fetch(word) {
        const stmt = `
            SELECT ${ThesaurusRepository.COL_WORD_TYPE}, ${ThesaurusRepository.COL_SYNONYMS}, ${ThesaurusRepository.COL_ANTONYMS} 
            FROM ${ThesaurusRepository.TABLE_THESAURUS}
            WHERE ${ThesaurusRepository.COL_WORD}=? 
            ORDER BY ${ThesaurusRepository.COL_WORD_TYPE}`

        return (await this._db.query(stmt, [word])).map((row) => {
            const wordTypeStr = row[ThesaurusRepository.COL_WORD_TYPE]

            let wordType
            if (wordTypeStr == "ADJ") wordType = WordType.ADJECTIVE
            else if (wordTypeStr == "ADV") wordType = WordType.ADVERB
            else if (wordTypeStr == "NOUN") wordType = WordType.NOUN
            else if (wordTypeStr == "VERB") wordType = WordType.VERB

            const synonyms = (row[ThesaurusRepository.COL_SYNONYMS] || "").split(",").filter(item => item != "").sort()
            const antonyms = (row[ThesaurusRepository.COL_ANTONYMS] || "").split(",").filter(item => item != "").sort()

            return new ThesaurusEntry(
                wordType,
                synonyms,
                antonyms
            )
        })
    }
}
ThesaurusRepository.TABLE_THESAURUS = "thesaurus"
ThesaurusRepository.COL_SYNONYMS = "synonyms"
ThesaurusRepository.COL_ANTONYMS = "antonyms"
ThesaurusRepository.COL_WORD = "word"
ThesaurusRepository.COL_WORD_TYPE = "word_type"