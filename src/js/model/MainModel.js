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
        this._settings = new Settings()
        this._speechEngine = new SpeechEngine(this._settings)
        this._poemRepository = new PoemRepository(this._settings)
        this.isSpeechPlaying = this._speechEngine.isPlaying
        this.poemText = this._poemRepository.poemText
        this.rhymerSettingsChangedObserver = () => { }
        this.thesaurusSettingsChangedObserver = () => { }
    }
    async loadDb(progressCallback) {
        const db = new Db()
        await db.open(progressCallback)
        this._rhymerRepository = new RhymerRepository(db, this._settings)
        this._rhymerRepository.settingsChangeObserver = () => this.rhymerSettingsChangedObserver()
        this._thesaurusRepository = new ThesaurusRepository(db, this._settings)
        this._thesaurusRepository.settingsChangeObserver = () => this.thesaurusSettingsChangedObserver()
        this._dictionaryRepository = new DictionaryRepository(db)
        this._suggestionsRepository = new SuggestionsRepository(db, this._settings)
    }

    isDesktop = () => globalThis.desktop && globalThis.desktop.desktop

    async loadFiles(fileReaderInputs) {
        return new FilesReader().loadFiles(fileReaderInputs)
    }

    async getRandomWord() {
        return this._dictionaryRepository.getRandomWord()
    }

    async fetchRhymes(word) {
        this._suggestionsRepository.addSearchedWord(word)
        return this._rhymerRepository.fetchRhymes(word)
    }
    getRhymerSettingAorAo = () => this._rhymerRepository.getAorAoSetting()
    getRhymerSettingAoAa = () => this._rhymerRepository.getAoAaSetting()
    setRhymerSettingAorAo = (value) => this._rhymerRepository.setAorAoSetting(value)
    setRhymerSettingAoAa = (value) => this._rhymerRepository.setAoAaSetting(value)

    async fetchThesaurus(word) {
        this._suggestionsRepository.addSearchedWord(word)
        return this._thesaurusRepository.fetch(word)
    }
    getThesaurusSettingReverseLookup = () => this._thesaurusRepository.getReverseLookupSetting()
    setThesaurusSettingReverseLookup = (value) => this._thesaurusRepository.setReverseLookupSetting(value)

    async fetchDefinitions(word) {
        this._suggestionsRepository.addSearchedWord(word)
        return this._dictionaryRepository.fetchDefinitions(word)
    }
    async fetchSuggestions(word, includeResultsForEmptyWord) {
        return this._suggestionsRepository.fetchSuggestions(word, includeResultsForEmptyWord)
    }

    clearSearchHistory = () => this._suggestionsRepository.clearSearchHisotry()

    selectVoice = (id) => this._speechEngine.selectVoice(id)
    setVoicePitch = (pitchValue) => this._speechEngine.setVoicePitch(pitchValue)
    setVoiceSpeed = (speedValue) => this._speechEngine.setVoiceSpeed(speedValue)

    playText = (text, start, end) => this._speechEngine.playText(text, start, end)

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

    setPoemText = (text, writeNow) => this._poemRepository.setPoemText(text, writeNow)
    readFile(file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            this.setPoemText(e.target.result, true)
        }
        reader.readAsText(file)
    }
    writeFile(text) {
        // https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link
        const file = new File([text], { type: "application/octet-stream" })
        const blobUrl = URL.createObjectURL(file)
        const tempElemA = document.createElement("a")
        tempElemA.href = blobUrl
        tempElemA.setAttribute("download", "poem.txt")
        document.body.appendChild(tempElemA)
        tempElemA.click()
        document.body.removeChild(tempElemA)
        URL.revokeObjectURL(blobUrl)
    }

}
