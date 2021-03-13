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
class Template {
    constructor(i18n, templates) {
        this._i18n = i18n
        this._templates = templates
    }

    createHtml(templateId, templateParameters) {
        let result = this._templates.get(templateId)
        templateParameters && templateParameters.forEach((value, key) => {
            result = result.replaceAll(key, value)
        })
        return result
    }

    createLinearProgressIndicatorHtml = () => this._templates.get("linear-progress-indicator")

    createCircularProgressIndicatorHtml = () => this._templates.get("circular-progress-indicator")

    createButtonIconTextHtml = (id, icon, label) =>
        this._templates.get("button-icon-text")
            .replaceAll("__ID__", id)
            .replaceAll("__ICON__", icon)
            .replaceAll("__LABEL__", this._i18n.translate(label))

    createAppBarMenuHtml = (items) =>
        this._templates.get("context-menu").replace(
            "__ITEMS__",
            items.map((item) =>
                this._templates.get("context-menu-item")
                    .replace("__ID__", item.id)
                    .replace("__ICON__", this.createContextMenuIconHtml(item.icon))
                    .replace("__LABEL__", this._i18n.translate(item.label))
            ).join(""))
            .replace("__HEADER__", "")

    createContextMenuHtml = (items, headerText) =>
        this._templates.get("context-menu").replace(
            "__ITEMS__",
            items.map((item) =>
                this._templates.get("context-menu-item")
                    .replace("__ID__", item.id)
                    .replace("__ICON__", this.createContextMenuIconHtml(item.icon))
                    .replace("__LABEL__", this._i18n.translate(item.label))
            ).join("")
        ).replace("__HEADER__", this.createContextMenuHeader(headerText))

    createContextMenuHeader(headerText) {
        if (headerText) {
            return this._templates.get("context-menu-header").replace("__TITLE__", headerText)
        } else {
            return ""
        }
    }

    createContextMenuIconHtml(menuItemIcon) {
        if (menuItemIcon) {
            if (menuItemIcon.type == MenuItemIcon.IconSource.MATERIAL) {
                return this._templates.get("context-menu-item-material-icon").replace("__ICON__", menuItemIcon.name)
            } else {
                return this._templates.get("context-menu-item-custom-icon").replace("__ICON__", menuItemIcon.name)
            }
        } else {
            return ""
        }
    }

    createSwitchesHtml = (switches) => switches.map((item) => {
        return this._templates.get("switch")
            .replaceAll("__ID__", item.id)
            .replaceAll("__LABEL__", this._i18n.translate(item.label))
            .replaceAll("__DESCRIPTION__", this._i18n.translate(item.description))
            .replace("__VALUE__", item.value)
    }).join("")

    createDialogHtml = (title, content) =>
        this._templates.get("dialog").replace("__TITLE__", this._i18n.translate(title), this._i18n.translate(content)).replace("__CONTENT__", this._i18n.translate(content))

    createInputTextHtml = (id, label) =>
        this._templates.get("input-text").replace("__ID__", id).replace("__HINT__", this._i18n.translate(label))

    createTextareaHtml = (id, label) =>
        this._templates.get("textarea").replace("__ID__", id).replace("__HINT__", this._i18n.translate(label))

    createDictionaryListHtml = (id, word, dictionaryListItems) =>
        this._templates.get("list-header").replace("__TEXT__", word) +
        this._templates.get("list").replace("__ID__", id).replace("__ITEMS__",
            dictionaryListItems.map(item =>
                this.createDictionaryListItemHtml(item)
            ).join("")
        )

    createDictionaryListItemHtml = (dictionaryListItem) =>
        this._templates.get("dictionary-list-item")
            .replace("__WORD_TYPE__", this._i18n.translate(dictionaryListItem.wordTypeLabel))
            .replace("__DEFINITION__", dictionaryListItem.definition)

    createListEmptyHtml = (emptyText, word) => this._templates.get("list-empty").replace("__TEXT__", this._i18n.translate(emptyText, word))

    createListHtml = (id, word, items) =>
        this._templates.get("list-header").replace("__TEXT__", word) +
        this._templates.get("list").replace("__ID__", id).replace("__ITEMS__",
            items.map(item =>
                this.createListItemHtml(item.style, item.text, item.args)
            ).join("")
        )


    createListItemHtml(style, text, args) {
        if (style == ListItem.ListItemStyles.SUB_HEADER_1) {
            return this._templates.get("list-item-sub-header-1").replace("__TEXT__", this._i18n.translate(text, args))
        } else if (style == ListItem.ListItemStyles.SUB_HEADER_2) {
            return this._templates.get("list-item-sub-header-2").replace("__TEXT__", this._i18n.translate(text, args))
        } else if (style == ListItem.ListItemStyles.WORD) {
            return this._templates.get("list-item-word").replace("__WORD__", text)
        }
    }

    createAppBarHtml = (id, title) =>
        this._templates.get("app-bar").replace("__ID__", id).replace("__TITLE__", this._i18n.translate(title))

    createTabBarHtml = (id, tabs) =>
        this._templates.get("tab-bar").replace("__ID__", id)
            .replace("__TABS__",
                tabs.map(tab =>
                    this.createTabHtml(
                        tab.tabElemId,
                        this._i18n.translate(tab.tabLabel)))
                    .join(""))

    createTabHtml = (id, label) =>
        this._templates.get("tab").replace("__ID__", id)
            .replace("__LABEL__", label)

    createSliderHtml = (sliderData) =>
        this._templates.get("slider").replace("__ID__", sliderData.id)
            .replace("__LABEL__", this._i18n.translate(sliderData.label))
            .replace("__MIN__", sliderData.min)
            .replace("__MAX__", sliderData.max)
            .replace("__VALUE__", sliderData.value)

    createVoiceSelectionHtml = (pitchSliderData, speedSliderData) =>
        this._templates.get("voice-selection")
            .replace("__SLIDER_PITCH__", this.createSliderHtml(pitchSliderData))
            .replace("__SLIDER_SPEED__", this.createSliderHtml(speedSliderData))

    createSnackbarHtml = (text) => this._templates.get("snackbar").replace("__TEXT__", this._i18n.translate(text))
    createReaderPlayHtml = () => this._templates.get("reader-play")
    createReaderActionsHtml = () => this._templates.get("reader-actions")

}

// Workaround for Samsung Internet browser which doesn't have String.replaceAll
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (expr, replacement) {
        let result = this.replace(expr, replacement)
        while (result.includes(expr)) {
            result = result.replace(expr, replacement)
        }
        return result
    }
}