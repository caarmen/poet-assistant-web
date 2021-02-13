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
class AppBarMenuView {

    constructor(anchorElement, template) {
        this._anchorElement = anchorElement
        this._elemPlaceholderAppBarMenu = document.querySelector("#placeholder-app-bar-menu")
        this._template = template
        this.observer = (index) => { }
    }

    showAppBarMenu(items) {
        this._elemPlaceholderAppBarMenu.innerHTML = this._template.createAppBarMenuHtml(items)
        const mdcMenu = new AppBarMenuView.MDCMenu(this._elemPlaceholderAppBarMenu.querySelector(".mdc-menu"))
        mdcMenu.setAnchorCorner(AppBarMenuView.MDCMenuCorner.BOTTOM_LEFT)
        mdcMenu.setAnchorElement(this._anchorElement)
        mdcMenu.setAnchorMargin({ left: 16 })
        mdcMenu.setFixedPosition(true)
        mdcMenu.open = true
        mdcMenu.listen('MDCMenu:selected', (e) => this.observer(e.detail.index))
    }
}
AppBarMenuView.MDCMenu = mdc.menu.MDCMenu
AppBarMenuView.MDCMenuCorner = mdc.menu.Corner