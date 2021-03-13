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
class RhymerViewModel {
    constructor(i18n, model) {
        this._i18n = i18n
        this._model = model
        this.rhymes = new ObservableField()
        this.isRhymerLoading = new ObservableField(false)
        this.snackbarText = new ObservableField()
        this._model.rhymerSettingsChangedObserver = () => this._refetchRhymes()
    }

    fetchRhymes(word) {
        this.isRhymerLoading.value = true
        const searchTerm = this._model.cleanSearchTerm(word)
        this._model.fetchRhymes(searchTerm).then(wordRhymes => {
            this.isRhymerLoading.value = false
            this.rhymes.value = new ResultList(searchTerm, [
                this._createRhymeListItems(wordRhymes.stressRhymes, "stress_syllables"),
                this._createRhymeListItems(wordRhymes.lastThreeSyllableRhymes, "last_three_syllables"),
                this._createRhymeListItems(wordRhymes.lastTwoSyllablesRhymes, "last_two_syllables"),
                this._createRhymeListItems(wordRhymes.lastSyllableRhymes, "last_syllable")
            ].flat())
        })
    }
    _refetchRhymes() {
        if (this.rhymes.value != undefined) {
            this.fetchRhymes(this.rhymes.value.word)
        }
    }

    _createRhymeListItems = (syllableRhymes, syllableTypeLabel) =>
        (syllableRhymes || []).flatMap((item) =>
            [
                new ListItem(ListItem.ListItemStyles.SUB_HEADER_1, syllableTypeLabel, item.syllables)
            ].concat(
                item.rhymes.map(rhyme => new ListItem(ListItem.ListItemStyles.WORD, rhyme))
            )
        )
    onShareRhymes() {
        this._model.copyText(this._getRhymesShareText())
        this.snackbarText.value = "snackbar_copied_rhymes"
    }
    _getRhymesShareText = () =>
        this._i18n.translate("share_rhymes_title", this.rhymes.value.word) +
        this.rhymes.value.listItems.map((listItem) => {
            if (listItem.style == ListItem.ListItemStyles.SUB_HEADER_1) {
                return this._i18n.translate("share_rhymes_subtitle", this._i18n.translate(listItem.text, listItem.args))
            } else {
                return this._i18n.translate("share_rhymes_word", listItem.text)
            }
        }
        ).join("")

    getRhymerSettingsSwitches = () => [
        new SwitchItem("setting-rhymer-aor-ao", "setting_rhymer_aor_ao_label", "setting_rhymer_aor_ao_description", this._model.getRhymerSettingAorAo()),
        new SwitchItem("setting-rhymer-ao-aa", "setting_rhymer_ao_aa_label", "setting_rhymer_ao_aa_description", this._model.getRhymerSettingAoAa())
    ]
    onRhymerSettingToggled(id, value) {
        if (id == "setting-rhymer-aor-ao") {
            this._model.setRhymerSettingAorAo(value)
        } else if (id == "setting-rhymer-ao-aa") {
            this._model.setRhymerSettingAoAa(value)
        }
    }
}
