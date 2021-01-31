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
        this._voices
        this.populateVoiceList()
        if (this._synth && this._synth.onvoiceschanged !== undefined) {
            this._synth.onvoiceschanged = () => { this.populateVoiceList() }
        }
        this._selectedVoice
        this.isPlaying = new ObservableField(false)
    }
    populateVoiceList() {
        this._voices = this._synth.getVoices()
        if (this._voices.length > 1) this._selectedVoice = this._voices[1]
        // TODO we need a voice picker: the default voice doesn't work :(
    }
    isSpeechSynthesisSupported = () => this._synth != undefined

    playText(text) {
        if (this._synth.speaking) {
            this._synth.cancel()
        } else {
            var utterThis = new SpeechSynthesisUtterance(text)
            utterThis.voice = this._selectedVoice
            utterThis.rate = 1
            utterThis.pitch = 1
            utterThis.onboundary = (evt) => { this.updateState() }
            utterThis.onend = (evt) => { this.updateState() }
            utterThis.onerror = (evt) => { this.updateState() }
            utterThis.onpause = (evt) => { this.updateState() }
            utterThis.onresume = (evt) => { this.updateState() }
            utterThis.onstart = (evt) => { this.updateState() }
            this._synth.speak(utterThis)
        }
    }

    updateState() {
        this.isPlaying.value = this._synth.speaking
    }
}