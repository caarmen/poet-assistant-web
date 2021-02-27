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
    constructor(settings) {
        this._settings = settings
        this._synth = window.speechSynthesis
        this.voices = new ObservableField([])
        this.selectedVoice = new ObservableField()
        this._populateVoiceList(false)
        if (this._synth && this._synth.onvoiceschanged !== undefined) {
            this._synth.onvoiceschanged = () => { this._populateVoiceList(true) }
        }
        this.isPlaying = new ObservableField(false)
        this._pitch = 1
        this._speed = 1
    }
    selectVoice(id) {
        this.selectedVoice.value = this.voices.value.find((voice) => voice.voiceURI == id)
        this._settings.setSetting(SpeechEngine.SETTING_KEY_VOICE, id)
    }
    setVoicePitch = (pitchValue) => {
        this._pitch = pitchValue
    }

    setVoiceSpeed = (speedValue) => {
        this._speed = speedValue
    }

    _populateVoiceList(onVoiceChangeEvent) {
        this.voices.value = this._synth.getVoices()
        if (this.voices.value.length > 0) {

            this._settings.removeSetting(SpeechEngine.SETTING_KEY_HAS_RELOADED)
            const savedVoiceUri = this._settings.getSetting(SpeechEngine.SETTING_KEY_VOICE, this.voices.value[0].voiceURI)
            const savedVoice = this.voices.value.find((voice) => voice.voiceURI == savedVoiceUri)
            this.selectedVoice.value = (savedVoice != undefined) ? savedVoice : this.voices.value[0]
        } else if (onVoiceChangeEvent && window.localStorage) {
            // Unfortunate hack to work around bug in linux where
            // a reload is required for voices to be present
            // https://github.com/electron/electron/issues/22844
            if (!window.localStorage.getItem(SpeechEngine.SETTING_KEY_HAS_RELOADED)) {
                this._settings.setSetting(SpeechEngine.SETTING_KEY_HAS_RELOADED, true)
                if (document.readyState == "complete") {
                    location.reload()
                } else {
                    window.addEventListener("load", () => {
                        location.reload()
                    })
                }
            } else {
                this._settings.removeSetting(SpeechEngine.SETTING_KEY_HAS_RELOADED)
            }
        }
    }

    playText(text, start, end) {
        let selection = text
        if (start < end) {
            selection = text.substring(start, end)
        } else if (start == end && start < text.length) {
            selection = text.substring(start)
        }
        if (this._synth.speaking) {
            this._synth.cancel()
        } else {
            const utterance = new SpeechSynthesisUtterance(selection)
            utterance.voice = this.selectedVoice.value
            utterance.lang = this.selectedVoice.value.lang
            utterance.pitch = this._pitch
            utterance.rate = this._speed
            utterance.onboundary = (evt) => { this._updateState() }
            utterance.onend = (evt) => { this._updateState() }
            utterance.onerror = (evt) => { this._updateState() }
            utterance.onpause = (evt) => { this._updateState() }
            utterance.onresume = (evt) => { this._updateState() }
            utterance.onstart = (evt) => { this._updateState() }
            this._synth.speak(utterance)
        }
    }

    _updateState() {
        this.isPlaying.value = this._synth.speaking
    }
}
SpeechEngine.SETTING_KEY_HAS_RELOADED = "has_reloaded"
SpeechEngine.SETTING_KEY_VOICE = "voice"