class I18n {
    constructor() {
    }

    translate = (text, ...args) => args.reduce(
        (previousResult, arg, position) => previousResult.replace(new RegExp(`\\{${position}\\}`, "gm"), arg),
        this._strings[text] || text
    )

    async load() {
        var response = await fetch("src/i18n/en.json")
        this._strings = JSON.parse(await response.text())
    }
}
