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
class ThesaurusViewModel {
    constructor(i18n, model) {
        this._i18n = i18n
        this._model = model
        this.thesaurusEntries = new ObservableField()
        this.isThesaurusLoading = new ObservableField(false)
        this.snackbarText = new ObservableField()
        this._model.thesaurusSettingsChangedObserver = () => this._refetchThesaurus()
    }

    fetchThesaurus(word) {
        this.isThesaurusLoading.value = true
        const searchTerm = this._model.cleanSearchTerm(word)
        this._model.fetchThesaurus(searchTerm).then(thesaurusEntries => {
            this.isThesaurusLoading.value = false
            let resultListItems = []
            thesaurusEntries.forEach(thesaurusEntry => {
                const wordTypeLabel = this._model.getWordTypeLabel(thesaurusEntry.wordType)
                resultListItems.push(new ListItem(ListItem.ListItemStyles.SUB_HEADER_1, `part_of_speech_${wordTypeLabel}`))
                if (thesaurusEntry.synonyms.length > 0) {
                    resultListItems.push(new ListItem(ListItem.ListItemStyles.SUB_HEADER_2, "synonyms"))
                    resultListItems = resultListItems.concat(thesaurusEntry.synonyms.map(synonym => new ListItem(ListItem.ListItemStyles.WORD, synonym)))
                }
                if (thesaurusEntry.antonyms.length > 0) {
                    resultListItems.push(new ListItem(ListItem.ListItemStyles.SUB_HEADER_2, "antonyms"))
                    resultListItems = resultListItems.concat(thesaurusEntry.antonyms.map(antonym => new ListItem(ListItem.ListItemStyles.WORD, antonym)))
                }
            })
            this.thesaurusEntries.value = new ResultList(searchTerm, resultListItems)
        })
    }
    _refetchThesaurus() {
        if (this.thesaurusEntries.value != undefined) {
            this.fetchThesaurus(this.thesaurusEntries.value.word)
        }
    }
    getThesaurusSettingsSwitches = () => [
        new SwitchItem("setting-thesaurus-reverse-lookup", "setting_thesaurus_reverse_lookup_label", "setting_thesaurus_reverse_lookup_description", this._model.getThesaurusSettingReverseLookup())
    ]
    onThesaurusSettingToggled(id, value) {
        if (id == "setting-thesaurus-reverse-lookup") {
            this._model.setThesaurusSettingReverseLookup(value)
        }
    }

    onShareThesaurus() {
        this._model.copyText(this._getThesaurusShareText())
        this.snackbarText.value = "snackbar_copied_thesaurus"
    }
    _getThesaurusShareText = () =>
        this._i18n.translate("share_thesaurus_title", this.thesaurusEntries.value.word) +
        this.thesaurusEntries.value.listItems.map((listItem) => {
            if (listItem.style == ListItem.ListItemStyles.SUB_HEADER_1) {
                return this._i18n.translate("share_thesaurus_sub_header_1", this._i18n.translate(listItem.text, listItem.args))
            } else if (listItem.style == ListItem.ListItemStyles.SUB_HEADER_2) {
                return this._i18n.translate("share_thesaurus_sub_header_2", this._i18n.translate(listItem.text, listItem.args))
            } else {
                return this._i18n.translate("share_thesaurus_word", listItem.text)
            }
        }
        ).join("")

}
