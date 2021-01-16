class I18n {
    constructor() {
    }
    translate(text) {
        return this._strings[text]
    }
    load() {
        new Promise((resolutionFunc) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'i18n/en.json', true);
            xhr.responseType = 'text';
            xhr.onload = function (e) {
                resolutionFunc(this.responseText)
            }
            xhr.send();
        }).then((stringsText) => {
            this._strings = JSON.parse(stringsText)
        });
    }
}