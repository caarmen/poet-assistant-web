class Template {
    constructor() {
        this._progressIndicatorTemplate = undefined
        this._buttonTemplate = undefined
        this._i18n = new I18n()
    }
    loadTemplates() {
        return Promise.all(
            [
                this._i18n.load(),
                this.loadTemplate("app-bar").then(text =>
                    this._appBarTemplate = text
                ),
                this.loadTemplate("app-bar-action-item").then(text =>
                    this._appBarActionItemTemplate = text
                ),
                this.loadTemplate("progress-indicator").then(text =>
                    this._progressIndicatorTemplate = text
                ),
                this.loadTemplate("button").then(text =>
                    this._buttonTemplate = text
                ),
                this.loadTemplate("dialog").then(text =>
                    this._dialogTemplate = text
                ),
                this.loadTemplate("input-text").then(text =>
                    this._inputTextTemplate = text
                ),
                this.loadTemplate("list").then(text =>
                    this._listTemplate = text
                ),
                this.loadTemplate("dictionary-list-item").then(text =>
                    this._dictionaryListItemTemplate = text
                )
            ]
        )
    }
    createProgressIndicatorHtml() {
        return this._progressIndicatorTemplate
    }
    createButtonHtml(id, label) {
        return this._buttonTemplate.replace("__ID__", id).replace("__LABEL__", this._i18n.translate(label))
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
    createAppBarActionItemHtml(id, label, icon) {
        return this._appBarActionItemTemplate.replace("__ID__", id).replace("__LABEL__", label).replace("__ICON__", icon)
    }
    createAppBarHtml(id, title, actionItems) {
        return this._appBarTemplate.replace("__ID__", id).replace("__TITLE__", this._i18n.translate(title)).replace("__ACTION_ITEMS__",
            actionItems.map(item => this.createAppBarActionItemHtml(item["id"], this._i18n.translate(item["label"]), item["icon"])))
    }
    loadTemplate(templateName) {
        return new Promise((resolutionFunc) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'src/templates/' + templateName + '.template.html', true);
            xhr.responseType = 'text';
            xhr.onload = function (e) {
                resolutionFunc(this.response)
            }
            xhr.send();
        });
    }
}