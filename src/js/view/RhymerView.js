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
class RhymerView {

    constructor(i18n, template) {
        this._elemPlaceholderRhymesList = document.querySelector("#placeholder-rhymes-list")
        this._elemPlaceholderRhymesEmpty = document.querySelector("#placeholder-rhymes-empty")
        this._elemPlaceholderProgressIndicator = document.querySelector("#placeholder-rhymes .list-loading")
        this._elemPlaceholderDialog = document.querySelector("#placeholder-dialog")

        this._mdcCircularProgress
        this._i18n = i18n
        this._template = template
        this._listVisibility = new ListVisibility(this._template)

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
        this._mdcCircularProgress = new RhymerView.MDCCircularProgress(this._elemPlaceholderProgressIndicator.querySelector('.mdc-circular-progress'))
        this._mdcCircularProgress.determinate = false
    }

    setLoading = (isLoading) => this._listVisibility.setLoading(isLoading, this._mdcCircularProgress)

    searchAll() {
        this._viewSuggestions.hide()
        this._viewModel.fetchAll(this._mdcInputTextSearch.value)
    }

    showRhymes(rhymes) {
        this._elemPlaceholderRhymesList.innerHTML = this._template.createListHtml("list-rhymes", rhymes.word, rhymes.listItems)
        this._i18n.translateElement(this._elemPlaceholderRhymesList.querySelector(".list-header"))
        this._listVisibility.setListVisibility(rhymes.listItems, this._elemPlaceholderRhymesList, this._elemPlaceholderRhymesEmpty, "no_results_rhymes", rhymes.word)
        this._elemPlaceholderRhymesList.querySelector(".list-header-text").onclick = (e) => {
            this.wordClickedObserver(e.target)
        }
        this._elemPlaceholderRhymesList.querySelector(".list-header-copy").onclick = (e) => { this.shareClickedObserver() }
        this._elemPlaceholderRhymesList.querySelector(".list-header-settings").onclick = (e) => { this.settingsClickedObserver() }
        new RhymerView.MDCList(document.querySelector("#list-rhymes")).listen('click', (e) => {
            if (e.target.classList.contains("word-list-item")) this.wordClickedObserver(e.target)
        })
    }
    showSettings(switchItems) {
        const contentHtml = this._template.createSwitchesHtml(switchItems)
        this._elemPlaceholderDialog.innerHTML =
            this._template.createDialogHtml("settings_rhymer_title", contentHtml)
        const dialog = new RhymerView.MDCDialog(document.querySelector('.mdc-dialog'))
        dialog.listen('MDCDialog:opened', () => {
            switchItems.forEach((switchItem) => {
                const switchControl = new RhymerView.MDCSwitch(this._elemPlaceholderDialog.querySelector(`#${switchItem.id}mdc-switch`))
                switchControl.checked = switchItem.value
                switchControl.listen("change", (e) => this.settingToggledObserver(switchItem.id, switchControl.checked))
            })
        })
        dialog.open()
    }
}
RhymerView.MDCDialog = mdc.dialog.MDCDialog
RhymerView.MDCList = mdc.list.MDCList
RhymerView.MDCCircularProgress = mdc.circularProgress.MDCCircularProgress
RhymerView.MDCSwitch = mdc.switchControl.MDCSwitch