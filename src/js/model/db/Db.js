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
class Db {
    constructor() {
        this._worker = new Worker("src/js/model/db/DbWorker.js")
        this._lastCommandId = 0

        // Maintain a map of callbacks per db command id.
        // When we receive a message from the worker, invoke the
        // callback with the DbResult
        this._callbacks = new Map()
        this._worker.onmessage = (event) => {
            const dbResult = event.data
            const callback = this._callbacks.get(dbResult.commandId)
            callback(dbResult)
        }
    }

    getNextCommandId = () => ++this._lastCommandId

    open = (progressCallback) => new Promise((completionFunc) => {
        const openCommandId = this.getNextCommandId()
        this._callbacks.set(openCommandId, (dbResult) => {
            if (dbResult.resultType == DbResult.ResultType.OPEN_PROGRESS) {
                progressCallback(dbResult.result)
            } else /* ResultType.OPEN_COMPLETE */ {
                completionFunc()
                this._callbacks.delete(openCommandId)
            }
        })
        this._worker.postMessage(DbCommand.open(openCommandId))
    })

    query = (statement, args) => new Promise((resultCallback) => {
        const queryCommandId = this.getNextCommandId()
        this._callbacks.set(queryCommandId, (dbResult) => {
            resultCallback(dbResult.result)
            this._callbacks.delete(queryCommandId)
        })
        this._worker.postMessage(DbCommand.query(queryCommandId, statement, args))
    })
}