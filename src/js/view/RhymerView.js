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

    constructor(template) {
        this._elemPlaceholderRhymesList = document.querySelector("#placeholder-rhymes-list")
        this._elemPlaceholderRhymesEmpty = document.querySelector("#placeholder-rhymes-empty")

        this._template = template
        this._listVisibility = new ListVisibility(this._template)

        this.wordClickedObserver = (wordElem) => { }
    }

    searchAll() {
        this._viewSuggestions.hide()
        this._viewModel.fetchAll(this._mdcInputTextSearch.value)
    }

    showRhymes(rhymes) {
        this._elemPlaceholderRhymesList.innerHTML = this._template.createListHtml("list-rhymes", rhymes.word, rhymes.listItems)
        this._listVisibility.setListVisibility(rhymes.listItems, this._elemPlaceholderRhymesList, this._elemPlaceholderRhymesEmpty, "no_results_rhymes", rhymes.word)
        this._elemPlaceholderRhymesList.querySelector(".list-header").onclick = (e) => {
            this.wordClickedObserver(e.target)
        }
        new RhymerView.MDCList(document.querySelector("#list-rhymes")).listen('click', (e) => {
            if (e.target.classList.contains("word-list-item")) this.wordClickedObserver(e.target)
        })
    }
}
RhymerView.MDCList = mdc.list.MDCList