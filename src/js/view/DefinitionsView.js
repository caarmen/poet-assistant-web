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
class DefinitionsView {

    constructor(i18n, template) {
        this._elemPlaceholderDefinitionsList = document.querySelector("#placeholder-definitions__list")
        this._elemPlaceholderDefinitionsEmpty = document.querySelector("#placeholder-definitions__empty")
        this._elemPlaceholderProgressIndicator = document.querySelector("#placeholder-definitions .list-loading")

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
        this._mdcCircularProgress = new DefinitionsView.MDCCircularProgress(this._elemPlaceholderProgressIndicator.querySelector('.mdc-circular-progress'))
        this._mdcCircularProgress.determinate = false
    }

    setLoading = (isLoading) => this._listVisibility.setLoading(isLoading, this._mdcCircularProgress)

    showDefinitions(definitions) {
        this._elemPlaceholderDefinitionsList.innerHTML = this._template.createDefinitionsListHtml("list-definitions", definitions.word, definitions.listItems)
        this._i18n.translateElement(this._elemPlaceholderDefinitionsList.querySelector(".list-header"))
        this._listVisibility.setListVisibility(definitions.listItems, this._elemPlaceholderDefinitionsList, this._elemPlaceholderDefinitionsEmpty, "no_results_definitions", definitions.word)
        this._elemPlaceholderDefinitionsList.querySelector(".list-header__text").onclick = (e) => {
            this.wordClickedObserver(e.target)
        }
        this._elemPlaceholderDefinitionsList.querySelector(".list-header__copy").onclick = (e) => { this.shareClickedObserver() }
    }
}
DefinitionsView.MDCCircularProgress = mdc.circularProgress.MDCCircularProgress