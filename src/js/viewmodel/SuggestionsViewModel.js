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
class SuggestionsViewModel {
    constructor(model) {
        this._model = model
        this.suggestions = new ObservableField()
        this.dialogInfo = new ObservableField()
    }

    /**
     * @return true if the suggestion is a "real" suggestion (not the item "clear search history")
     */
    onSuggestionSelected(word) {
        if (word == "clear_search_history") {
            this.dialogInfo.value = DialogInfo.prompt(
                "clear_search_history_dialog_title",
                "clear_search_history_dialog_message",
                () => { this._model.clearSearchHistory() }
            )
            return false
        } else {
            return true
        }
    }
    fetchSuggestions(word, includeResultsForEmptyWord) {
        const searchTerm = this._model.cleanSearchTerm(word)
        this._model.fetchSuggestions(searchTerm, includeResultsForEmptyWord).then(suggestions => {
            let suggestionsMenuItems = suggestions.map((suggestion) =>
                new MenuItem(suggestion.word, suggestion.word, new MenuItemIcon(
                    suggestion.type == Suggestion.SuggestionType.HISTORY ? "history" : "search",
                    MenuItemIcon.IconSource.MATERIAL
                ))
            )
            // If the suggestions contain any search history, also include an option to clear search history
            if (suggestions.find((suggestion) => suggestion.type == Suggestion.SuggestionType.HISTORY)) {
                suggestionsMenuItems.push(
                    new MenuItem("clear_search_history", "clear_search_history",
                        new MenuItemIcon("delete", MenuItemIcon.IconSource.MATERIAL)
                    )
                )
            }
            this.suggestions.value = suggestionsMenuItems
        })
    }
}
