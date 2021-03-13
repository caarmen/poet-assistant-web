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
class DefinitionsViewModel {
    constructor(i18n, model) {
        this._i18n = i18n
        this._model = model
        this.definitions = new ObservableField()
        this.isDefinitionsLoading = new ObservableField(false)
        this.snackbarText = new ObservableField()
    }

    fetchDefinitions(word) {
        this.isDefinitionsLoading.value = true
        const searchTerm = this._model.cleanSearchTerm(word)
        this._model.fetchDefinitions(searchTerm).then(definitions => {
            this.isDefinitionsLoading.value = false
            this.definitions.value = new DictionaryResultList(
                searchTerm,
                definitions.map(dictionaryEntry => {
                    const wordTypeLabel = this._model.getWordTypeLabel(dictionaryEntry.wordType)
                    return new DictionaryListItem(`part_of_speech_${wordTypeLabel}_short`, dictionaryEntry.definition)
                })
            )
        })
    }
    onShareDefinitions() {
        this._model.copyText(this._getDefinitionsShareText())
        this.snackbarText.value = "snackbar_copied_definitions"
    }
    _getDefinitionsShareText = () =>
        this._i18n.translate("share_dictionary_title", this.definitions.value.word) +
        this.definitions.value.listItems.map((dictionaryListItem) =>
            this._i18n.translate("share_dictionary_definition", this._i18n.translate(dictionaryListItem.wordTypeLabel), dictionaryListItem.definition)
        ).join("")


}
