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
        this.pitch = new ObservableField(1)
        this.speed = new ObservableField(1)
        this._populateVoiceList(false)
        if (this._synth && this._synth.onvoiceschanged !== undefined) {
            this._synth.onvoiceschanged = () => { this._populateVoiceList(true) }
        }
        this.isPlaying = new ObservableField(false)
        this._timeoutId = undefined
        this._utterancesToSpeak = []
    }
    selectVoice(id) {
        this.selectedVoice.value = this.voices.value.find((voice) => voice.voiceURI == id)
        this._settings.setSetting(SpeechEngine.SETTING_KEY_VOICE, id)
    }
    setVoicePitch = (pitchValue) => {
        this.pitch.value = pitchValue
        this._settings.setSetting(SpeechEngine.SETTING_KEY_PITCH, pitchValue)
    }

    setVoiceSpeed = (speedValue) => {
        this.speed.value = speedValue
        this._settings.setSetting(SpeechEngine.SETTING_KEY_SPEED, speedValue)
    }

    _populateVoiceList(onVoiceChangeEvent) {
        this.voices.value = this._synth.getVoices()
        if (this.voices.value.length > 0) {

            this._settings.removeSetting(SpeechEngine.SETTING_KEY_HAS_RELOADED)
            const savedVoiceUri = this._settings.getSetting(SpeechEngine.SETTING_KEY_VOICE, this.voices.value[0].voiceURI)
            const savedVoice = this.voices.value.find((voice) => voice.voiceURI == savedVoiceUri)
            this.selectedVoice.value = (savedVoice != undefined) ? savedVoice : this.voices.value[0]
            this.speed.value = this._settings.getSetting(SpeechEngine.SETTING_KEY_SPEED, this.speed.value)
            this.pitch.value = this._settings.getSetting(SpeechEngine.SETTING_KEY_PITCH, this.pitch.value)
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
        if (this._isSpeaking()) {
            this._stopSpeaking()
        } else {
            let selection = text
            if (start < end) {
                selection = text.substring(start, end)
            } else if (start == end && start < text.length) {
                selection = text.substring(start)
            }
            this._utterancesToSpeak = UtteranceSplitter.splitText(selection)
            this._playNextUtterance()
        }
        this._updateState()
    }

    _playNextUtterance() {
        const nextUtterance = this._utterancesToSpeak.shift()
        if (nextUtterance == undefined) {
            this._timeoutId = undefined
        } else {
            this._playUtterance(nextUtterance)
        }
    }
    _playUtterance(utterance) {
        if (this._timeoutId != undefined) clearTimeout(this._timeoutId)
        const speechSynthesisUtterance = new SpeechSynthesisUtterance(utterance.text)
        speechSynthesisUtterance.voice = this.selectedVoice.value
        speechSynthesisUtterance.lang = this.selectedVoice.value.lang
        speechSynthesisUtterance.pitch = this.pitch.value
        speechSynthesisUtterance.rate = this.speed.value
        speechSynthesisUtterance.onboundary = (evt) => { this._updateState() }
        speechSynthesisUtterance.onend = (evt) => {
            this._playNextUtterance()
            this._updateState()
        }
        speechSynthesisUtterance.onerror = (evt) => { this._updateState() }
        speechSynthesisUtterance.onpause = (evt) => { this._updateState() }
        speechSynthesisUtterance.onresume = (evt) => { this._updateState() }
        speechSynthesisUtterance.onstart = (evt) => { this._updateState() }
        this._timeoutId = setTimeout(() => {
            this._synth.speak(speechSynthesisUtterance)
        }, utterance.preDelayS * 1000)
    }

    _updateState() {
        this.isPlaying.value = this._isSpeaking()
    }

    _isSpeaking = () => this._synth.speaking || this._timeoutId != undefined

    _stopSpeaking() {
        this._synth.cancel()
        this._utterancesToSpeak = []
        clearTimeout(this._timeoutId)
        this._timeoutId = undefined
    }
}
SpeechEngine.SETTING_KEY_HAS_RELOADED = "has_reloaded"
SpeechEngine.SETTING_KEY_VOICE = "voice"
SpeechEngine.SETTING_KEY_PITCH = "pitch"
SpeechEngine.SETTING_KEY_SPEED = "speed"