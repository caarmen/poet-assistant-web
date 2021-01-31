class I18n {
    constructor() {
    }

    translate = (text, ...args) => args.reduce(
        (previousResult, arg, position) => previousResult.replace(new RegExp(`\\{${position}\\}`, "gm"), arg),
        this._strings[text] || text
    )

    translateElement(element) {
        element.querySelectorAll("[string-key]").forEach(translatableElem => {
            var stringKey = translatableElem.getAttribute("string-key")
            translatableElem.innerText = this.translate(stringKey)
        })
    }

    async load() {
        var response = await fetch("src/i18n/en.json")
        this._strings = JSON.parse(await response.text())
    }
}
