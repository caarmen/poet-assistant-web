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
        this._progressIndicatorTemplate = await this.loadTemplate("progress-indicator")
        this._buttonTemplate = await this.loadTemplate("button")
        this._buttonIconTemplate = await this.loadTemplate("button-icon")
        this._dialogTemplate = await this.loadTemplate("dialog")
        this._inputTextTemplate = await this.loadTemplate("input-text")
        this._listTemplate = await this.loadTemplate("list")
        this._dictionaryListItemTemplate = await this.loadTemplate("dictionary-list-item")
        this._rhymesListItemTemplate = await this.loadTemplate("rhymes-list-item")
    }

    createProgressIndicatorHtml() {
        return this._progressIndicatorTemplate
    }
    createButtonHtml(id, label) {
        return this._buttonTemplate.replace("__ID__", id).replace("__LABEL__", this._i18n.translate(label))
    }
    createButtonIconHtml(id, icon, label) {
        return this._buttonIconTemplate.replace("__ID__", id).replace("__ICON__", icon).replace("__LABEL__", this._i18n.translate(label))
    }
    createDialogHtml(title, content) {
        return this._dialogTemplate.replace("__TITLE__", this._i18n.translate(title), this._i18n.translate(content))
            .replace("__CONTENT__", this._i18n.translate(content))
    }
    createInputTextHtml(id, label) {
        return this._inputTextTemplate.replace("__ID__", id).replace("__HINT__", this._i18n.translate(label))
    }
    createDictionaryListHtml(id, dictionaryListItems) {
        return this._listTemplate.replace("__ID__", id).replace("__ITEMS__",
            dictionaryListItems.map(item =>
                this.createDictionaryListItemHtml(item)
            ).join("")
        )
    }
    createDictionaryListItemHtml(dictionaryListItem) {
        return this._dictionaryListItemTemplate.replace("__WORD_TYPE__", dictionaryListItem.wordType).replace("__DEFINITION__", dictionaryListItem.definition)
    }
    createRhymesListHtml(id, rhymes) {
        return this._listTemplate.replace("__ID__", id).replace("__ITEMS__",
            rhymes.map(item =>
                this.createRhymesListItemHtml(item)
            ).join("")
        )
    }
    createRhymesListItemHtml(rhyme) {
        return this._rhymesListItemTemplate.replace("__WORD__", rhyme)
    }
    createAppBarActionItemHtml(id, label, icon) {
        return this._appBarActionItemTemplate.replace("__ID__", id).replace("__LABEL__", label).replace("__ICON__", icon)
    }
    createAppBarHtml(id, title, actionItems) {
        return this._appBarTemplate.replace("__ID__", id).replace("__TITLE__", this._i18n.translate(title)).replace("__ACTION_ITEMS__",
            actionItems.map(item => this.createAppBarActionItemHtml(item["id"], this._i18n.translate(item["label"]), item["icon"])))
    }
    async loadTemplate(templateName) {
        return (await fetch('src/templates/' + templateName + '.template.html')).text()
    }
}