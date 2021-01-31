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
