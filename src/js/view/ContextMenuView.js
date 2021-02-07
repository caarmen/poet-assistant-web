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
class ContextMenuView {

    constructor(template) {
        this._elemPlaceholderContextMenu = document.querySelector("#placeholder-context-menu")
        this._template = template
        this.observer = (word, index) => { }
        this._mdcMenuState = ContextMenuView.MenuState.UNKNOWN
    }

    showContextMenu(anchorElement, word, items) {
        this._elemPlaceholderContextMenu.innerHTML = this._template.createContextMenuHtml(items, word)
        // Avoid showing another context menu if the user simply clicked away from
        // the previous context menu to close it
        if (this._mdcMenuState != ContextMenuView.MenuState.CLOSING) {
            const mdcMenu = new ContextMenuView.MDCMenu(this._elemPlaceholderContextMenu.querySelector(".mdc-menu"))
            mdcMenu.setAnchorCorner(ContextMenuView.MDCMenuCorner.BOTTOM_LEFT)
            mdcMenu.setAnchorElement(anchorElement)
            mdcMenu.setAnchorMargin({ left: 16 })
            mdcMenu.setFixedPosition(true)
            mdcMenu.open = true
            this._mdcMenuState = ContextMenuView.MenuState.OPENING
            mdcMenu.listen('MDCMenu:selected', (e) => {
                if (e.detail.index > 0) this.observer(word, e.detail.index - 1)
            })
            mdcMenu.listen('MDCMenuSurface:opened', (e) => {
                this._mdcMenuState = ContextMenuView.MenuState.OPENED
            })
            mdcMenu.listen('MDCMenuSurface:closing', (e) => {
                this._mdcMenuState = ContextMenuView.MenuState.CLOSING
            })
            mdcMenu.listen('MDCMenuSurface:closed', (e) => {
                this._mdcMenuState = ContextMenuView.MenuState.CLOSED
            })
        }
    }
}
ContextMenuView.MenuState = Object.freeze({ UNKNOWN: 0, OPENING: 1, OPENED: 2, CLOSING: 3, CLOSED: 4 })
ContextMenuView.MDCMenu = mdc.menu.MDCMenu
ContextMenuView.MDCMenuCorner = mdc.menu.Corner