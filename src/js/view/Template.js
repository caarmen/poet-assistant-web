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
    constructor() {
        this._progressIndicatorTemplate = undefined
        this._buttonTemplate = undefined
        this._i18n = new I18n()
    }
    async loadTemplates() {
        await this._i18n.load()
        this._aboutTemplate = await this.loadTemplate("about")
        this._appBarTemplate = await this.loadTemplate("app-bar")
        this._appBarActionItemTemplate = await this.loadTemplate("app-bar-action-item")
        this._tabBarTemplate = await this.loadTemplate("tab-bar")
        this._tabTemplate = await this.loadTemplate("tab")
        this._progressIndicatorTemplate = await this.loadTemplate("progress-indicator")
        this._buttonIconTextTemplate = await this.loadTemplate("button-icon-text")
        this._buttonIconTemplate = await this.loadTemplate("button-icon")
        this._contextMenuTemplate = await this.loadTemplate("context-menu")
        this._contextMenuHeaderTemplate = await this.loadTemplate("context-menu-header")
        this._contextMenuItemTemplate = await this.loadTemplate("context-menu-item")
        this._contextMenuItemMaterialIconTemplate = await this.loadTemplate("context-menu-item-material-icon")
        this._contextMenuItemCustomIconTemplate = await this.loadTemplate("context-menu-item-custom-icon")
        this._dialogTemplate = await this.loadTemplate("dialog")
        this._inputTextTemplate = await this.loadTemplate("input-text")
        this._textareaTemplate = await this.loadTemplate("textarea")
        this._listTemplate = await this.loadTemplate("list")
        this._listEmptyTemplate = await this.loadTemplate("list-empty")
        this._dictionaryListItemTemplate = await this.loadTemplate("dictionary-list-item")
        this._listHeaderTemplate = await this.loadTemplate("list-header")
        this._listItemWordTemplate = await this.loadTemplate("list-item-word")
        this._listItemSubHeader1Template = await this.loadTemplate("list-item-sub-header-1")
        this._listItemSubHeader2Template = await this.loadTemplate("list-item-sub-header-2")
        this._sliderTemplate = await this.loadTemplate("slider")
        this._voiceSelectionHtml = await this.loadTemplate("voice-selection")
    }

    createAboutHtml = () => this._aboutTemplate

    createProgressIndicatorHtml = (text) => this._progressIndicatorTemplate.replace("__TEXT__", this._i18n.translate(text))

    createButtonIconTextHtml = (id, icon, label) =>
        this._buttonIconTextTemplate
            .replaceAll("__ID__", id)
            .replaceAll("__ICON__", icon)
            .replaceAll("__LABEL__", this._i18n.translate(label))

    createButtonIconHtml = (id, icon, label) =>
        this._buttonIconTemplate.replaceAll("__ID__", id).replace("__ICON__", icon).replace("__LABEL__", this._i18n.translate(label))

    createContextMenuHtml = (items, headerText) =>
        this._contextMenuTemplate.replace(
            "__ITEMS__",
            items.map((item) =>
                this._contextMenuItemTemplate
                    .replace("__ID__", item.id)
                    .replace("__ICON__", this.createContextMenuIconHtml(item.icon))
                    .replace("__LABEL__", this._i18n.translate(item.label))
            ).join("")
        ).replace("__HEADER__", this.createContextMenuHeader(headerText))

    createContextMenuHeader(headerText) {
        if (headerText) {
            return this._contextMenuHeaderTemplate.replace("__TITLE__", headerText)
        } else {
            return ""
        }
    }

    createContextMenuIconHtml(menuItemIcon) {
        if (menuItemIcon) {
            if (menuItemIcon.type == MenuItemIcon.IconSource.MATERIAL) {
                return this._contextMenuItemMaterialIconTemplate.replace("__ICON__", menuItemIcon.name)
            } else {
                return this._contextMenuItemCustomIconTemplate.replace("__ICON__", menuItemIcon.name)
            }
        } else {
            return ""
        }
    }

    createDialogHtml = (title, content) =>
        this._dialogTemplate.replace("__TITLE__", this._i18n.translate(title), this._i18n.translate(content)).replace("__CONTENT__", this._i18n.translate(content))

    createInputTextHtml = (id, label) =>
        this._inputTextTemplate.replace("__ID__", id).replace("__HINT__", this._i18n.translate(label))

    createTextareaHtml = (id, label) =>
        this._textareaTemplate.replace("__ID__", id).replace("__HINT__", this._i18n.translate(label))

    createDictionaryListHtml = (id, word, dictionaryListItems) =>
        this._listHeaderTemplate.replace("__TEXT__", word) +
        this._listTemplate.replace("__ID__", id).replace("__ITEMS__",
            dictionaryListItems.map(item =>
                this.createDictionaryListItemHtml(item)
            ).join("")
        )

    createDictionaryListItemHtml = (dictionaryListItem) =>
        this._dictionaryListItemTemplate
            .replace("__WORD_TYPE__", this._i18n.translate(dictionaryListItem.wordTypeLabel))
            .replace("__DEFINITION__", dictionaryListItem.definition)

    createListEmptyHtml = (emptyText, word) => this._listEmptyTemplate.replace("__TEXT__", this._i18n.translate(emptyText, word))

    createListHtml = (id, word, items) =>
        this._listHeaderTemplate.replace("__TEXT__", word) +
        this._listTemplate.replace("__ID__", id).replace("__ITEMS__",
            items.map(item =>
                this.createListItemHtml(item.style, item.text, item.args)
            ).join("")
        )


    createListItemHtml(style, text, args) {
        if (style == ListItem.ListItemStyles.SUB_HEADER_1) {
            return this._listItemSubHeader1Template.replace("__TEXT__", this._i18n.translate(text, args))
        } else if (style == ListItem.ListItemStyles.SUB_HEADER_2) {
            return this._listItemSubHeader2Template.replace("__TEXT__", this._i18n.translate(text, args))
        } else if (style == ListItem.ListItemStyles.WORD) {
            return this._listItemWordTemplate.replace("__WORD__", text)
        }
    }
    createAppBarActionItemHtml = (id, label, icon) =>
        this._appBarActionItemTemplate.replace("__ID__", id).replace("__LABEL__", label).replace("__ICON__", icon)

    createAppBarHtml = (id, title, actionItems) =>
        this._appBarTemplate.replace("__ID__", id).replace("__TITLE__", this._i18n.translate(title)).replace("__ACTION_ITEMS__",
            actionItems.map(item =>
                this.createAppBarActionItemHtml(item.id, this._i18n.translate(item.label), item.icon)
            ).join(""))

    createTabBarHtml = (id, tabs) =>
        this._tabBarTemplate.replace("__ID__", id)
            .replace("__TABS__",
                tabs.map(tab =>
                    this.createTabHtml(
                        tab.tabElemId,
                        this._i18n.translate(tab.tabLabel)))
                    .join(""))

    createTabHtml = (id, label) =>
        this._tabTemplate.replace("__ID__", id)
            .replace("__LABEL__", label)

    createSliderHtml = (sliderData) =>
        this._sliderTemplate.replace("__ID__", sliderData.id)
            .replace("__LABEL__", this._i18n.translate(sliderData.label))
            .replace("__MIN__", sliderData.min)
            .replace("__MAX__", sliderData.max)
            .replace("__VALUE__", sliderData.value)

    createVoiceSelectionHtml = (pitchSliderData, speedSliderData) =>
        this._voiceSelectionHtml
            .replace("__SLIDER_PITCH__", this.createSliderHtml(pitchSliderData))
            .replace("__SLIDER_SPEED__", this.createSliderHtml(speedSliderData))

    async loadTemplate(templateName) {
        return (await fetch(`src/templates/${templateName}.template.html`)).text()
    }
}