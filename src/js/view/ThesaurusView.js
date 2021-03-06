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
        this._elemPlaceholderThesaurusList = document.querySelector("#placeholder-thesaurus-list")
        this._elemPlaceholderThesaurusEmpty = document.querySelector("#placeholder-thesaurus-empty")
        this._elemPlaceholderProgressIndicator = document.querySelector("#placeholder-thesaurus .list-loading")

        this._i18n = i18n
        this._template = template
        this._listVisibility = new ListVisibility(this._template)

        this.wordClickedObserver = (wordElem) => { }
        this.shareClickedObserver = () => { }
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
        this._elemPlaceholderThesaurusList.innerHTML = this._template.createListHtml("list-thesaurus", thesaurusEntries.word, thesaurusEntries.listItems)
        this._i18n.translateElement(this._elemPlaceholderThesaurusList.querySelector(".list-header"))
        this._listVisibility.setListVisibility(thesaurusEntries.listItems, this._elemPlaceholderThesaurusList, this._elemPlaceholderThesaurusEmpty, "no_results_thesaurus", thesaurusEntries.word)
        this._elemPlaceholderThesaurusList.querySelector(".list-header-text").onclick = (e) => {
            this.wordClickedObserver(e.target)
        }
        this._elemPlaceholderThesaurusList.querySelector(".list-header-copy").onclick = (e) => { this.shareClickedObserver() }
        new ThesaurusView.MDCList(document.querySelector("#list-thesaurus")).listen('click', (e) => {
            if (e.target.classList.contains("word-list-item")) this.wordClickedObserver(e.target)
        })
    }
}
ThesaurusView.MDCList = mdc.list.MDCList
ThesaurusView.MDCCircularProgress = mdc.circularProgress.MDCCircularProgress