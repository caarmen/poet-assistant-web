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
        this._timeoutId
    }
    addSearchedWord(word) {
        this._cancelFetch()
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

    _cancelFetch() {
        if (this._timeoutId != undefined) clearTimeout(this._timeoutId)
        this._timeoutId = 0
    }
    clearSearchHisotry = () => this._settings.removeSetting(SuggestionsRepository.SETTINGS_KEY_SEARCHED_WORDS)

    fetchSuggestions(word, includeResultsForEmptyWord) {
        if (word.length == 0 && !includeResultsForEmptyWord) {
            return Promise.resolve([])
        }
        return new Promise((completionFunc) => {
            this._cancelFetch()
            // In the case where the user clicked on the search input text, search immediately
            // Otherwise if the user is typing, don't search too often to not hang the ui thread
            let timeout = includeResultsForEmptyWord ? 0 : 200
            this._timeoutId = setTimeout(() => {
                const promiseHistory = this._fetchSuggestionsFromHistory(word)
                    .then((historyWords) =>
                        historyWords.map((historyWord) =>
                            new Suggestion(Suggestion.SuggestionType.HISTORY, historyWord)))
                const promiseDictionary = this._fetchSuggestionsFromDictionary(word)
                    .then((dictionaryWords) =>
                        dictionaryWords.map((dictionaryWord) =>
                            new Suggestion(Suggestion.SuggestionType.DICTIONARY, dictionaryWord)))
                Promise.all([promiseHistory, promiseDictionary]).then((suggestions) => {
                    if (this._timeoutId != 0) {
                        completionFunc(suggestions.flat())
                    }
                })
            }, timeout)
        })
    }

    _fetchSearchedWords = () => new Set(
        JSON.parse(
            this._settings.getSetting(SuggestionsRepository.SETTINGS_KEY_SEARCHED_WORDS, "[]")
        )
    )

    _fetchSuggestionsFromHistory = (word) => Promise.resolve(
        Array.from(this._fetchSearchedWords().values())
            .filter((searchedWord) => searchedWord.startsWith(word))
            .sort()
    )

    async _fetchSuggestionsFromDictionary(word) {
        if (word.length == 0) {
            return []
        } else {
            const query = `
                SELECT DISTINCT ${SuggestionsRepository.COL_WORD}
                FROM ${SuggestionsRepository.TABLE_WORD_VARIANTS}
                WHERE ${SuggestionsRepository.COL_WORD} LIKE ?
                    AND ${SuggestionsRepository.COL_HAS_DEFINITION}=1
                ORDER BY ${SuggestionsRepository.COL_WORD}
                LIMIT ${SuggestionsRepository.LIMIT}`
            return (await this._db.query(query, [`${word}%`])).map((row) =>
                row[SuggestionsRepository.COL_WORD]
            )
        }
    }
}
SuggestionsRepository.LIMIT = 10
SuggestionsRepository.TABLE_WORD_VARIANTS = "word_variants"
SuggestionsRepository.COL_HAS_DEFINITION = "has_definition"
SuggestionsRepository.COL_WORD = "word"
SuggestionsRepository.SETTINGS_KEY_SEARCHED_WORDS = "searched_words"
