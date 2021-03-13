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
    constructor(i18n, db, settings) {
        this._i18n = i18n
        this._thesaurusRepository = new ThesaurusRepository(db, settings)
        this._thesaurusRepository.settingsChangeObserver = () => this._refetchThesaurus()
        this.thesaurusEntries = new ObservableField()
        this.isThesaurusLoading = new ObservableField(false)
    }

    fetchThesaurus(word) {
        this.isThesaurusLoading.value = true
        this._thesaurusRepository.fetch(word).then(thesaurusEntries => {
            this.isThesaurusLoading.value = false
            let resultListItems = []
            thesaurusEntries.forEach(thesaurusEntry => {
                const wordTypeLabel = WordType.name(thesaurusEntry.wordType)
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
            this.thesaurusEntries.value = new ResultList(word, resultListItems)
        })
    }
    _refetchThesaurus() {
        if (this.thesaurusEntries.value != undefined) {
            this.fetchThesaurus(this.thesaurusEntries.value.word)
        }
    }
    getThesaurusSettingsSwitches = () => [
        new SwitchItem("setting-thesaurus-reverse-lookup", "setting_thesaurus_reverse_lookup_label", "setting_thesaurus_reverse_lookup_description", this._thesaurusRepository.getReverseLookupSetting())
    ]
    onThesaurusSettingToggled(id, value) {
        if (id == "setting-thesaurus-reverse-lookup") {
            this._thesaurusRepository.setReverseLookupSetting(value)
        }
    }

    getThesaurusShareText = () =>
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
