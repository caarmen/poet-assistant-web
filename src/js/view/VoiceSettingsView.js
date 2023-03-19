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
class VoiceSettingsView {

    constructor(i18n, template) {
        this.voiceSelectonObserver = (selectedVoiceIndex) => { }
        this.pitchObserver = (pitchValue) => { }
        this.speedObserver = (speedValue) => { }
        this._elemPlaceholderReaderVoices = document.querySelector("#placeholder-reader__controls__voices")

        this._mdcMenuVoices
        this._mdcSliderPitch
        this._mdcSliderSpeed

        this._elemReaderVoices
        this._elemReaderSelectedVoice

        this._i18n = i18n
        this._template = template
        this._applyTemplates()
        this._initializeViews()
        this._voices = new Map()
    }
    _applyTemplates() {
        this._elemPlaceholderReaderVoices.innerHTML = this._template.createVoiceSelectionHtml(
            new SliderData("voice-pitch", "voice-pitch", 0.0, 2.0, 1.0),
            new SliderData("voice-speed", "voice-speed", 0.5, 2.0, 1.0)
        )
        this._i18n.translateElement(this._elemPlaceholderReaderVoices)
    }

    _initializeViews() {
        this._elemRoot = document.querySelector(".voice-settings")
        this._elemReaderLocales = document.querySelector("#placeholder-reader__controls__voices #voice-settings__locale__locales-menu")
        this._elemReaderSelectedLocale = document.querySelector("#placeholder-reader__controls__voices #voice-settings__locale__name")
        this._elemReaderVoices = document.querySelector("#placeholder-reader__controls__voices #voice-settings__voice__voices-menu")
        this._elemReaderSelectedVoice = document.querySelector("#placeholder-reader__controls__voices #voice-settings__voice__name")
        this._mdcSliderPitch = new VoiceSettingsView.MDCSlider(document.querySelector("#voice-pitch"))
        this._mdcSliderSpeed = new VoiceSettingsView.MDCSlider(document.querySelector("#voice-speed"))
        this._mdcSliderPitch.listen('MDCSlider:change', (e) => this.pitchObserver(e.detail.value))
        this._mdcSliderSpeed.listen('MDCSlider:change', (e) => this.speedObserver(e.detail.value))
    }

    updateVisibility(isVisible) {
        this._elemRoot.style.display = isVisible ? "block" : "none"
    }

    layout() {
        setTimeout(() => {
            this._mdcSliderPitch.layout()
            this._mdcSliderSpeed.layout()
        }, 1000)
    }
    updateSelectedVoiceLabel(selectedVoiceLabel) {
        this._elemReaderSelectedVoice.innerText = selectedVoiceLabel
    }
    updateLocalesList(voices) {
        this.voices = voices
        const locales = Array.from(voices.keys())
        this._elemReaderLocales.innerHTML = this._template.createContextMenuHtml(locales)
        this._mdcMenuLocales = new VoiceSettingsView.MDCMenu(this._elemReaderLocales.querySelector(".mdc-menu"))
        this._mdcMenuLocales.setAnchorCorner(VoiceSettingsView.MDCMenuCorner.BOTTOM_LEFT)
        this._mdcMenuLocales.setAnchorElement(this._elemReaderSelectedLocale)
        this._mdcMenuLocales.setFixedPosition(true)
        this._mdcMenuLocales.listen('MDCMenu:selected', (e) => {
            const locale = locales[e.detail.index]
            this.updateVoicesList(voices.get(locale))
            this._elemReaderSelectedLocale.innerText = locale
        })
    }
    updateVoicesList(voices) {
        this._elemReaderVoices.innerHTML = this._template.createContextMenuHtml(voices)
        this._mdcMenuVoices = new VoiceSettingsView.MDCMenu(this._elemReaderVoices.querySelector(".mdc-menu"))
        this._mdcMenuVoices.setAnchorCorner(VoiceSettingsView.MDCMenuCorner.BOTTOM_LEFT)
        this._mdcMenuVoices.setAnchorElement(this._elemReaderSelectedVoice)
        this._mdcMenuVoices.setFixedPosition(true)
        this._mdcMenuVoices.listen('MDCMenu:selected', (e) => {
            this.voiceSelectonObserver(e.detail.index)
            this._elemReaderSelectedVoice.innerText = voices[e.detail.index].label
        })
        this._elemReaderSelectedVoice.onclick = () => {
            this._mdcMenuVoices.open = true
        }
    }
    updatePitch = (newPitch) => this._mdcSliderPitch.setValue(newPitch)
    updateSpeed = (newSpeed) => this._mdcSliderSpeed.setValue(newSpeed)
}
VoiceSettingsView.MDCMenu = mdc.menu.MDCMenu
VoiceSettingsView.MDCMenuCorner = mdc.menu.Corner
VoiceSettingsView.MDCSlider = mdc.slider.MDCSlider