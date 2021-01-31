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
        this._db = undefined
    }
    async loadDb(progressCallback) {
        var config = {
            locateFile: filename => `libs/${filename}`
        }
        var SQL = await initSqlJs(config)
        var response = await this.loadUrl('src/resources/poet_assistant.db', progressCallback)
        var arrayBuffer = new Uint8Array(response)
        this._db = new SQL.Database(new Uint8Array(arrayBuffer))
        this._rhymerRepository = new RhymerRepository(this._db)
        this._thesaurusRepository = new ThesaurusRepository(this._db)
        this._dictionaryRepository = new DictionaryRepository(this._db)
    }

    loadUrl(url, progressCallback) {
        return new Promise((completionFunc) => {
            let xhr = new XMLHttpRequest()
            xhr.open("GET", url, true)
            xhr.responseType = 'arraybuffer'
            xhr.onprogress = event => {
                progressCallback(event.loaded, event.total)
            }
            xhr.onload = () => {
                completionFunc(xhr.response)
            }
            xhr.send()
        })
    }

    async fetchRhymes(word) {
        return this._rhymerRepository.fetchRhymes(word)
    }
    async fetchThesaurus(word) {
        return this._thesaurusRepository.fetch(word)
    }
    async fetchDefinitions(word) {
        return this._dictionaryRepository.fetchDefinitions(word)
    }
}
