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
importScripts("DbAccess.js")

var dbAccess = new DbAccess()

/**
 * Receives DbCommands as input, and posts DbResults as output
 */
onmessage = function (e) {
    const dbCommand = e.data
    if (dbCommand.commandType == DbCommand.CommandType.OPEN) {
        dbAccess
            .open((dbOpenProgress) => postMessage(DbResult.openProgress(dbCommand.id, dbOpenProgress)))
            .then(() => postMessage(DbResult.openComplete(dbCommand.id)))
    } else if (dbCommand.commandType == DbCommand.CommandType.QUERY) {
        var rows = dbAccess.querySync(dbCommand.statement, dbCommand.args)
        postMessage(DbResult.queryResult(dbCommand.id, rows))
    }
}
