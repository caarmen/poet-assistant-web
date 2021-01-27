class Template {
    constructor() {
        this._progressIndicatorTemplate = undefined
        this._buttonTemplate = undefined
        this._i18n = new I18n()
    }
    async loadTemplates() {
        await this._i18n.load()
        this._appBarTemplate = await this.loadTemplate("app-bar")
        this._appBarActionItemTemplate = await this.loadTemplate("app-bar-action-item")
        this._tabBarTemplate = await this.loadTemplate("tab-bar")
        this._tabTemplate = await this.loadTemplate("tab")
        this._progressIndicatorTemplate = await this.loadTemplate("progress-indicator")
        this._buttonTemplate = await this.loadTemplate("button")
        this._buttonIconTemplate = await this.loadTemplate("button-icon")
        this._dialogTemplate = await this.loadTemplate("dialog")
        this._inputTextTemplate = await this.loadTemplate("input-text")
        this._listTemplate = await this.loadTemplate("list")
        this._dictionaryListItemTemplate = await this.loadTemplate("dictionary-list-item")
        this._listHeaderTemplate = await this.loadTemplate("list-header")
        this._listItemWordTemplate = await this.loadTemplate("list-item-word")
        this._listItemSubHeader1Template = await this.loadTemplate("list-item-sub-header-1")
        this._listItemSubHeader2Template = await this.loadTemplate("list-item-sub-header-2")
    }

    createProgressIndicatorHtml = (text) => this._progressIndicatorTemplate.replace("__TEXT__", this._i18n.translate(text))

    createButtonHtml = (id, label) =>
        this._buttonTemplate.replace("__ID__", id).replace("__LABEL__", this._i18n.translate(label))

    createButtonIconHtml = (id, icon, label) =>
        this._buttonIconTemplate.replace("__ID__", id).replace("__ICON__", icon).replace("__LABEL__", this._i18n.translate(label))

    createDialogHtml = (title, content) =>
        this._dialogTemplate.replace("__TITLE__", this._i18n.translate(title), this._i18n.translate(content)).replace("__CONTENT__", this._i18n.translate(content))

    createInputTextHtml = (id, label) =>
        this._inputTextTemplate.replace("__ID__", id).replace("__HINT__", this._i18n.translate(label))

    createDictionaryListHtml = (id, dictionaryListItems) =>
        this._listTemplate.replace("__ID__", id).replace("__ITEMS__",
            dictionaryListItems.map(item =>
                this.createDictionaryListItemHtml(item)
            ).join("")
        )

    createDictionaryListItemHtml = (dictionaryListItem) =>
        this._dictionaryListItemTemplate.replace("__WORD_TYPE__", dictionaryListItem.wordType).replace("__DEFINITION__", dictionaryListItem.definition)

    createListHtml = (id, word, items) =>
        this._listHeaderTemplate.replace("__TEXT__", word) +
        this._listTemplate.replace("__ID__", id).replace("__ITEMS__",
            items.map(item =>
                this.createListItemHtml(item.text, item.style)
            ).join("")
        )

    createListItemHtml(text, style) {
        if (style == ListItem.ListItemStyles.SUB_HEADER_1) {
            return this._listItemSubHeader1Template.replace("__TEXT__", this._i18n.translate(text))
        } else if (style == ListItem.ListItemStyles.SUB_HEADER_2) {
            return this._listItemSubHeader2Template.replace("__TEXT__", this._i18n.translate(text))
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
                        tab.id,
                        this._i18n.translate(tab.label)))
                    .join(""))

    createTabHtml = (id, label) =>
        this._tabTemplate.replace("__ID__", id)
            .replace("__LABEL__", label)

    async loadTemplate(templateName) {
        return (await fetch(`src/templates/${templateName}.template.html`)).text()
    }
}