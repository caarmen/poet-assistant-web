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
        this.populateVoiceList(false)
        if (this._synth && this._synth.onvoiceschanged !== undefined) {
            this._synth.onvoiceschanged = () => { this.populateVoiceList(true) }
        }
        this._selectedVoice
        this.isPlaying = new ObservableField(false)
        this._pitch = 1
        this._speed = 1
    }
    selectVoice(id) {
        this._selectedVoice = this.voices.value.find((voice) => voice.voiceURI == id)
    }
    setVoicePitch = (pitchValue) => {
        this._pitch = pitchValue
    }

    setVoiceSpeed = (speedValue) => {
        this._speed = speedValue
    }

    populateVoiceList(onVoiceChangeEvent) {
        this.voices.value = this._synth.getVoices()
        const KEY_STORAGE_HAS_RELOADED = "has_reloaded"
        if (this.voices.value.length > 0) {
            this._selectedVoice = this.voices.value[0]
            window.localStorage && window.localStorage.removeItem(KEY_STORAGE_HAS_RELOADED)
        } else if (onVoiceChangeEvent && window.localStorage) {
            if (!window.localStorage.getItem(KEY_STORAGE_HAS_RELOADED)) {
                window.localStorage[KEY_STORAGE_HAS_RELOADED] = true
                if (document.readyState == "complete") {
                    location.reload()
                } else {
                    window.addEventListener("load", () => {
                        location.reload()
                    })
                }
            } else {
                window.localStorage.removeItem(KEY_STORAGE_HAS_RELOADED)
            }
        }
    }

    playText(text, start, end) {
        var selection = text
        if (start < end) {
            selection = text.substring(start, end)
        } else if (start == end && start < text.length) {
            selection = text.substring(start)
        }
        if (this._synth.speaking) {
            this._synth.cancel()
        } else {
            var utterance = new SpeechSynthesisUtterance(selection)
            utterance.voice = this._selectedVoice
            utterance.lang = this._selectedVoice.lang
            utterance.pitch = this._pitch
            utterance.rate = this._speed
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