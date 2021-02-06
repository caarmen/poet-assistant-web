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
class TabsView {

    constructor(template, tabDatas) {
        this._template = template
        this._tabDatas = tabDatas

        this._elemPlaceholderTabBar
        this._elemTabs
        this._elemContents
    }
    applyTemplates() {
        this._elemPlaceholderTabBar = document.querySelector("#placeholder-tab-bar")
        this._elemPlaceholderTabBar.innerHTML = this._template.createTabBarHtml("tab-bar", this._tabDatas)
    }

    initializeViews() {
        this._elemTabs = this._tabDatas.map(tabData => document.querySelector(`#${tabData.tabElemId}`))
        this._elemContents = this._tabDatas.map(tabData => document.querySelector(`#${tabData.contentElemId}`))
        var mdcTabBar = new TabsView.MDCTabBar(document.querySelector(".mdc-tab-bar"))
        mdcTabBar.listen("MDCTabBar:activated", (eventData) => {
            this.onTabActivated(eventData["detail"]["index"])
        })
    }

    hideTab = (tabIndex) => { this._elemTabs(tabIndex).style.display = "none" }

    switchToTab(tabIndex) {
        this._elemTabs[tabIndex].click()
    }
    onTabActivated(tabIndex) {
        this._elemContents.forEach((elemContent, index) => {
            if (index == tabIndex) {
                elemContent.style.display = "block"
            } else {
                elemContent.style.display = " none"
            }
        })
    }
}
TabsView.MDCTabBar = mdc.tabBar.MDCTabBar