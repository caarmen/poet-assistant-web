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

class SpeechEngine {
    constructor() {
        this._synth = window.speechSynthesis
        this.voices = new ObservableField([])
        this.populateVoiceList()
        if (this._synth && this._synth.onvoiceschanged !== undefined) {
            this._synth.onvoiceschanged = () => { this.populateVoiceList() }
        }
        this._selectedVoice
        this.isPlaying = new ObservableField(false)
    }
    selectVoice(id) {
        this._selectedVoice = this.voices.value.find((voice) => voice.voiceURI == id)
    }
    populateVoiceList() {
        this.voices.value = this._synth.getVoices()
        if (this.voices.value.length > 0) this._selectedVoice = this.voices.value[0]
    }
    isSpeechSynthesisSupported = () => this._synth != undefined

    playText(text) {
        if (this._synth.speaking) {
            this._synth.cancel()
        } else {
            var utterance = new SpeechSynthesisUtterance(text)
            utterance.voice = this._selectedVoice
            utterance.lang = this._selectedVoice.lang
            utterance.rate = 1
            utterance.pitch = 1
            utterance.onboundary = (evt) => { this.updateState() }
            utterance.onend = (evt) => { this.updateState() }
            utterance.onerror = (evt) => { this.updateState() }
            utterance.onpause = (evt) => { this.updateState() }
            utterance.onresume = (evt) => { this.updateState() }
            utterance.onstart = (evt) => { this.updateState() }
            this._synth.speak(utterance)
        }
    }

    updateState() {
        this.isPlaying.value = this._synth.speaking
    }
}