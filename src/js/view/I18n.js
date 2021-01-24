class I18n {
    constructor() {
    }
    translate(text) {
        return this._strings[text] || text
    }
    async load() {
        var response = await fetch("src/i18n/en.json")
        this._strings = JSON.parse(await response.text())
    }
}
