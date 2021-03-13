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
    constructor(i18n, db, settings) {
        this._i18n = i18n
        this._rhymerRepository = new RhymerRepository(db, settings)
        this._rhymerRepository.settingsChangeObserver = () => this._refetchRhymes()
        this.rhymes = new ObservableField()
        this.isRhymerLoading = new ObservableField(false)
    }

    fetchRhymes(word) {
        this.isRhymerLoading.value = true
        this._rhymerRepository.fetchRhymes(word).then(wordRhymes => {
            this.isRhymerLoading.value = false
            this.rhymes.value = new ResultList(word, [
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
    getRhymesShareText = () =>
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
        new SwitchItem("setting-rhymer-aor-ao", "setting_rhymer_aor_ao_label", "setting_rhymer_aor_ao_description", this._rhymerRepository.getAorAoSetting()),
        new SwitchItem("setting-rhymer-ao-aa", "setting_rhymer_ao_aa_label", "setting_rhymer_ao_aa_description", this._rhymerRepository.getAoAaSetting())
    ]
    onRhymerSettingToggled(id, value) {
        if (id == "setting-rhymer-aor-ao") {
            this._rhymerRepository.setAorAoSetting(value)
        } else if (id == "setting-rhymer-ao-aa") {
            this._rhymerRepository.setAoAaSetting(value)
        }
    }
}
