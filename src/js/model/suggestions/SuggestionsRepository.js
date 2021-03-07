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
class SuggestionsRepository {
    constructor(db, settings) {
        this._db = db
        this._settings = settings
    }
    addSearchedWord(word) {
        this._settings.setSetting(SuggestionsRepository.SETTINGS_KEY_SEARCHED_WORDS,
            JSON.stringify(
                Array.from(
                    this._fetchSearchedWords()
                        .add(word)
                        .values()
                )
            )
        )
    }

    clearSearchHisotry = () => this._settings.setSetting(SuggestionsRepository.SETTINGS_KEY_SEARCHED_WORDS, "[]")

    async fetchSuggestions(word, includeResultsForEmptyWord) {
        if (word.length == 0 && !includeResultsForEmptyWord) {
            return []
        }
        return [
            this._fetchSuggestionsFromHistory(word).map((searchedWord) => new Suggestion(Suggestion.SuggestionType.HISTORY, searchedWord)),
            (await this._fetchSuggestionsFromDictionary(word)).map((dictionaryWord) => new Suggestion(Suggestion.SuggestionType.DICTIONARY, dictionaryWord))
        ].flat()
    }

    _fetchSearchedWords = () => new Set(
        JSON.parse(
            this._settings.getSetting(SuggestionsRepository.SETTINGS_KEY_SEARCHED_WORDS, "[]")
        )
    )

    _fetchSuggestionsFromHistory = (word) => Array.from(this._fetchSearchedWords().values())
        .filter((searchedWord) => searchedWord.startsWith(word)).sort()

    async _fetchSuggestionsFromDictionary(word) {
        if (word.length == 0) {
            return []
        }
        const query = `
                SELECT DISTINCT ${SuggestionsRepository.COL_WORD}
                FROM ${SuggestionsRepository.TABLE_WORD_VARIANTS}
                WHERE ${SuggestionsRepository.COL_WORD} LIKE ?
                    AND ${SuggestionsRepository.COL_WORD} != ?
                    AND ${SuggestionsRepository.COL_HAS_DEFINITION}=1
                ORDER BY ${SuggestionsRepository.COL_WORD}
                LIMIT ${SuggestionsRepository.LIMIT}`

        return (await this._db.query(query, [`${word}%`, word]))
            .map((row) => row[SuggestionsRepository.COL_WORD])
    }
}
SuggestionsRepository.LIMIT = 10
SuggestionsRepository.TABLE_WORD_VARIANTS = "word_variants"
SuggestionsRepository.COL_HAS_DEFINITION = "has_definition"
SuggestionsRepository.COL_WORD = "word"
SuggestionsRepository.SETTINGS_KEY_SEARCHED_WORDS = "searched_words"