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
class MainModel {
    constructor() {
    }
    async loadDb(progressCallback) {
        const db = new Db()
        await db.open(progressCallback)
        return db
    }

    isDesktop = () => globalThis.desktop && globalThis.desktop.desktop

    async loadFiles(fileReaderInputs) {
        return new FilesReader().loadFiles(fileReaderInputs)
    }

    cleanSearchTerm = (text) => text.toLowerCase().trim()

    copyText(text, start, end) {
        let selection = text
        if (start != undefined && end != undefined && start < end) {
            selection = text.substring(start, end)
        } else if (start != undefined && end != undefined && start == end && start < text.length) {
            selection = text.substring(start)
        }
        if (navigator.permissions == undefined) {
            navigator.clipboard.writeText(selection)
        } else {
            navigator.permissions.query({ name: "clipboard-write" })
                .then(result => {
                    if (result.state == "granted" || result.state == "prompt") {
                        navigator.clipboard.writeText(selection)
                    }
                })
                .catch(err => {
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=1560373
                    // On firefox, it doesn't recognize the permission "clipboard-write".
                    // The write works without a permission.
                    navigator.clipboard.writeText(selection)
                })
        }
    }

}
