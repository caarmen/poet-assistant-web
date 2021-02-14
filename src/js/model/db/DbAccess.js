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
importScripts("../../../../libs/sql-wasm-1.4.0.js")
importScripts("DbCommand.js")
importScripts("DbOpenProgress.js")
importScripts("DbResult.js")
class DbAccess {
    constructor() {
        this._db = undefined
    }
    async open(progressCallback) {
        const SQL = await initSqlJs({
            locateFile: filename => `../../../../libs/${filename}`
        })
        const response = await this._loadUrl(
            '../../../../src/resources/poet_assistant.db',
            progressCallback)
        const arrayBuffer = new Uint8Array(response)
        this._db = new SQL.Database(new Uint8Array(arrayBuffer))
    }

    querySync(statement, args) {
        const stmt = this._db.prepare(statement)
        stmt.bind(args)

        const rows = []
        while (stmt.step()) {
            rows.push(stmt.getAsObject())
        }
        return rows
    }

    _loadUrl = (url, progressCallback) =>
        new Promise((completionFunc) => {
            let xhr = new XMLHttpRequest()
            xhr.open("GET", url, true)
            xhr.responseType = 'arraybuffer'
            xhr.onprogress = event => {
                progressCallback(new DbOpenProgress(event.loaded, event.total))
            }
            xhr.onload = () => {
                completionFunc(xhr.response)
            }
            xhr.send()
        })

}
