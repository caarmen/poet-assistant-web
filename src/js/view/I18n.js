class I18n {
    constructor() {
    }

    translate(text, ...args) {
        var result = this._strings[text] || text
        args.forEach((arg, position) => {
            result = result.replace(new RegExp(`\\{${position}\\}`, "gm"), arg)
        })
        return result
    }

    async load() {
        var response = await fetch("src/i18n/en.json")
        this._strings = JSON.parse(await response.text())
    }
}
