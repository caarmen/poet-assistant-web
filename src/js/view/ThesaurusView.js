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
class ThesaurusView {

    constructor(i18n, template) {
        this._elemPlaceholderThesaurusList = document.querySelector("#placeholder-thesaurus__list")
        this._elemPlaceholderThesaurusEmpty = document.querySelector("#placeholder-thesaurus__empty")
        this._elemPlaceholderProgressIndicator = document.querySelector("#placeholder-thesaurus .list-loading")
        this._elemPlaceholderDialog = document.querySelector("#placeholder-dialog")

        this._i18n = i18n
        this._template = template
        this._listVisibility = new ListVisibility(this._template)

        this.favoriteToggledObserver = (word, isFavorite) => { }
        this.wordClickedObserver = (wordElem) => { }
        this.shareClickedObserver = () => { }
        this.settingsClickedObserver = () => {}
        this.settingToggledObserver = (id, value) => { }
        this._applyTemplates()
        this._initializeViews()
    }

    _applyTemplates() {
        this._elemPlaceholderProgressIndicator.innerHTML = this._template.createCircularProgressIndicatorHtml()
    }

    _initializeViews() {
        this._mdcCircularProgress = new ThesaurusView.MDCCircularProgress(this._elemPlaceholderProgressIndicator.querySelector('.mdc-circular-progress'))
        this._mdcCircularProgress.determinate = false
    }

    setLoading = (isLoading) => this._listVisibility.setLoading(isLoading, this._mdcCircularProgress)

    showThesaurus(thesaurusEntries) {
        this._elemPlaceholderThesaurusList.innerHTML = this._template.createListHtml("list-thesaurus", thesaurusEntries.word, thesaurusEntries.isWordFavorite, thesaurusEntries.listItems)
        this._i18n.translateElement(this._elemPlaceholderThesaurusList.querySelector(".list-header"))
        this._listVisibility.setListVisibility(thesaurusEntries.listItems, this._elemPlaceholderThesaurusList, this._elemPlaceholderThesaurusEmpty, "no_results_thesaurus", thesaurusEntries.word)
        ListWordClickActions.listenWordClickEvents(this._elemPlaceholderThesaurusList, (elem) => this.wordClickedObserver(elem))
        ListFavoriteActions.listenFavoriteToggleEvents(this._elemPlaceholderThesaurusList, thesaurusEntries.word, (word, isFavorite) => this.favoriteToggledObserver(word, isFavorite))
        this._elemPlaceholderThesaurusList.querySelector(".list-header__copy").onclick = (e) => { this.shareClickedObserver() }
        this._elemPlaceholderThesaurusList.querySelector(".list-header__settings").onclick = (e) => { this.settingsClickedObserver() }
    }
    showSettings(switchItems) {
        const contentHtml = this._template.createSwitchesHtml(switchItems)
        this._elemPlaceholderDialog.innerHTML =
            this._template.createDialogHtml("settings_thesaurus_title", contentHtml)
        const dialog = new ThesaurusView.MDCDialog(document.querySelector('.mdc-dialog'))
        dialog.listen('MDCDialog:opened', () => {
            switchItems.forEach((switchItem) => {
                const switchControl = new ThesaurusView.MDCSwitch(this._elemPlaceholderDialog.querySelector(`#${switchItem.id}mdc-switch`))
                switchControl.checked = switchItem.value
                switchControl.listen("change", (e) => this.settingToggledObserver(switchItem.id, switchControl.checked))
            })
        })
        dialog.open()
    }
}
ThesaurusView.MDCDialog = mdc.dialog.MDCDialog
ThesaurusView.MDCCircularProgress = mdc.circularProgress.MDCCircularProgress
ThesaurusView.MDCSwitch = mdc.switchControl.MDCSwitch