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
        this._speechEngine = new SpeechEngine()
        this.isSpeechPlaying = this._speechEngine.isPlaying
    }
    async loadDb(progressCallback) {
        var db = new Db()
        await db.open(progressCallback)
        this._rhymerRepository = new RhymerRepository(db)
        this._thesaurusRepository = new ThesaurusRepository(db)
        this._dictionaryRepository = new DictionaryRepository(db)
        this._suggestionsRepository = new SuggestionsRepository(db)
    }

    async loadFiles(fileReaderInputs) {
        return new FilesReader().loadFiles(fileReaderInputs)
    }

    async getRandomWord() {
        return this._dictionaryRepository.getRandomWord()
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
    async fetchSuggestions(word) {
        return this._suggestionsRepository.fetchSuggestions(word)
    }

    selectVoice = (id) => this._speechEngine.selectVoice(id)
    setVoicePitch = (pitchValue) => this._speechEngine.setVoicePitch(pitchValue)
    setVoiceSpeed = (speedValue) => this._speechEngine.setVoiceSpeed(speedValue)

    playText = (text, start, end) => this._speechEngine.playText(text, start, end)

    copyText(text) {
        if (navigator.permissions == undefined) {
            navigator.clipboard.writeText(text)
        } else {
            navigator.permissions.query({ name: "clipboard-write" })
                .then(result => {
                    if (result.state == "granted" || result.state == "prompt") {
                        navigator.clipboard.writeText(text)
                    }
                })
                .catch(err => {
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=1560373
                    // On firefox, it doesn't recognize the permission "clipboard-write".
                    // The write works without a permission.
                    navigator.clipboard.writeText(text)
                })
        }
    }

}
