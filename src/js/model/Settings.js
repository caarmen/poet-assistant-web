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
class Settings {
    constructor() {
        this._storage = window.localStorage
        this._isAvailable = this.isStorageAvailable()
        this._observers = []
        this._lastCommandId = 0
        this._worker = new Worker("src/js/model/SettingsWorker.js")
        // Maintain a map of callbacks per settings command id.
        // When we receive a message from the worker, invoke the
        // callback with the SettingsResult
        this._callbacks = new Map()
        this._worker.onmessage = (event) => {
            const settingsResult = event.data
            const callback = this._callbacks.get(settingsResult.commandId)
            callback(settingsResult)
        }
    }

    addObserver = (observer) => this._observers.push(observer)
    removeObserver(observer) {
        this._observers = this._observers.splice(this._observers.findIndex(observer), 1)
    }

    getSetting(key, defaultValue) {
        if (this._isAvailable) {
            return new Promise((completionFunc) => {
                const readCommandId = this._getNextCommandId()
                this._callbacks.set(readCommandId, (settingsResult) => {
                    completionFunc(settingsResult.settingsValue)
                    this._callbacks.delete(readCommandId)

                })
                this._worker.postMessage(SettingsCommand.read(readCommandId, key, defaultValue))
            })
        } else {
            return undefined
        }
    }

    setSetting(key, value) {
        if (this._isAvailable) {
            const writeCommandId = this._getNextCommandId()
            this._worker.postMessage(SettingsCommand.write(writeCommandId, key, value))
        }
    }

    removeSetting(key) {
        if (this._isAvailable) {
            const deleteCommandId = this._getNextCommandId()
            this._worker.postMessage(SettingsCommand.remove(deleteCommandId, key))
        }
    }

    //https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#testing_for_availability
    isStorageAvailable() {
        try {
            const x = '__storage_test__'
            this._storage.setItem(x, x)
            this._storage.removeItem(x)
            return true
        }
        catch (e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                (this._storage && this._storage.length !== 0)
        }
    }
    _getNextCommandId = () => ++this._lastCommandId
}
