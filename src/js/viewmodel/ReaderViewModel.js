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
class ReaderViewModel {
    constructor(settings) {
        this._speechEngine = new SpeechEngine(settings)
        this._poemRepository = new PoemRepository(settings)
        this.poemText = this._poemRepository.poemText
        this.isSpeechPlaying = this._speechEngine.isPlaying
        this.voices = new ObservableField([])
        this.selectedVoiceLabel = new ObservableField()
        this.voicePitch = new ObservableField()
        this.voiceSpeed = new ObservableField()
        this.poemSavedStateLabel = new ObservableField()
        this.dialogInfo = new ObservableField()
        this._speechEngine.voices.observer = (newVoices) => this.updateVoices(newVoices)
        this._speechEngine.selectedVoice.observer = (newVoice) => this.selectedVoiceLabel.value = this._getVoiceLabel(newVoice)
        this._speechEngine.speed.observer = (newSpeed) => this.voiceSpeed.value = newSpeed
        this._speechEngine.pitch.observer = (newPitch) => this.voicePitch.value = newPitch
        this._poemRepository.savedState.observer = (newSavedState) => this.poemSavedStateLabel.value = this._getSavedStateLabel(newSavedState)
    }

    selectVoice = (index) => this._speechEngine.selectVoice(this.voices.value[index].id)
    setVoicePitch = (pitchValue) => this._speechEngine.setVoicePitch(pitchValue)
    setVoiceSpeed = (speedValue) => this._speechEngine.setVoiceSpeed(speedValue)

    playText = (text, start, end) => this._speechEngine.playText(text, start, end)

    onClearClicked() {
        this.dialogInfo.value = DialogInfo.prompt(
            "reader_clear_poem_dialog_title",
            "reader_clear_poem_dialog_message",
            () => { this.setPoemText("", true) }
        )
    }

    updateVoices(newVoices) {
        this.voices.value = newVoices.sort((a, b) => {
            const languageA = a.lang.substring(0, 2)
            const languageB = b.lang.substring(0, 2)
            if (languageA == languageB) {
                return a.name.localeCompare(b.name)
            } else if (languageA == "en") {
                return -1
            } else if (languageB == "en") {
                return 1
            } else {
                return languageA.localeCompare(languageB)
            }
        }).map((voice) => new MenuItem(voice.voiceURI, this._getVoiceLabel(voice)))
    }
    _getVoiceLabel = (voice) => `${voice.name} - ${voice.lang}`

    setPoemText = (text, writeNow) => this._poemRepository.setPoemText(text, writeNow)
    _getSavedStateLabel(savedState) {
        if (savedState == PoemRepository.SaveState.SAVING) return "poem_saved_state_label_saving"
        else if (savedState == PoemRepository.SaveState.SAVED) return "poem_saved_state_label_saved"
        else if (savedState == PoemRepository.SaveState.WAITING) return "poem_saved_state_label_waiting"
    }

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
