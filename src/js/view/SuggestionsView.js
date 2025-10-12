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
class SuggestionsView {

    constructor(template) {
        this._elemPlaceholderSuggestions = document.querySelector("#placeholder-suggestions")
        this._template = template
        this.observer = (word) => { }
    }

    showSuggestions(anchorElement, suggestions) {
        if (!this._elemPlaceholderSuggestions) {
            this._elemPlaceholderSuggestions = document.querySelector("#placeholder-suggestions")
        }
        if (suggestions.length > 0) {
            this._elemPlaceholderSuggestions.innerHTML = this._template.createContextMenuHtml(suggestions)
            this._elemPlaceholderSuggestions.style.display = "block"
            const mdcMenu = new SuggestionsView.MDCMenu(this._elemPlaceholderSuggestions.querySelector(".mdc-menu"))
            mdcMenu.setAnchorCorner(SuggestionsView.MDCMenuCorner.BOTTOM_LEFT)
            mdcMenu.setAnchorElement(anchorElement)
            mdcMenu.setFixedPosition(true)
            mdcMenu.setDefaultFocusState(SuggestionsView.DefaultFocusState.NONE)
            mdcMenu.quickOpen = true
            mdcMenu.open = true
            mdcMenu.listen('MDCMenu:selected', (e) => {
                this.observer(suggestions[e.detail.index].label)
            })
        } else {
            this._elemPlaceholderSuggestions.style.display = "none"
        }
    }
    hide() {
        this._elemPlaceholderSuggestions.style.display = "none"
    }

}
SuggestionsView.MDCMenu = mdc.menu.MDCMenu
SuggestionsView.MDCMenuCorner = mdc.menu.Corner
SuggestionsView.DefaultFocusState = mdc.menu.DefaultFocusState