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
class VoicesListView {

    constructor(template) {
        this.voiceSelectonObserver = (selectedVoiceIndex) => { }
        this.pitchObserver = (pitchValue) => { }
        this.speedObserver = (speedValue) => { }
        this._elemPlaceholderReaderVoices = document.querySelector("#placeholder-reader-voices")

        this._mdcMenuVoices
        this._mdcSliderPitch
        this._mdcSliderSpeed

        this._elemReaderVoices
        this._elemReaderSelectedVoice

        this._template = template
        this.applyTemplates()
        this.initializeViews()
    }
    applyTemplates() {
        this._elemPlaceholderReaderVoices.innerHTML = this._template.createVoiceSelectionHtml(
            new SliderData("voice-pitch", "voice-pitch", 0.0, 2.0, 1.0),
            new SliderData("voice-speed", "voice-speed", 0.5, 2.0, 1.0)
        )
        this._template._i18n.translateElement(this._elemPlaceholderReaderVoices)
    }

    initializeViews() {
        this._elemReaderVoices = document.querySelector("#placeholder-reader-voices #voices-menu")
        this._elemReaderSelectedVoice = document.querySelector("#placeholder-reader-voices #selected-voice")
        this._mdcSliderPitch = new VoicesListView.MDCSlider(document.querySelector("#voice-pitch"))
        this._mdcSliderSpeed = new VoicesListView.MDCSlider(document.querySelector("#voice-speed"))
        this._mdcSliderPitch.listen('MDCSlider:change', (e) => this.pitchObserver(e.detail.value))
        this._mdcSliderSpeed.listen('MDCSlider:change', (e) => this.speedObserver(e.detail.value))
    }

    updateVoicesList(voices) {
        this._elemReaderVoices.innerHTML = this._template.createContextMenuHtml(voices)
        this._mdcMenuVoices = new VoicesListView.MDCMenu(this._elemReaderVoices.querySelector(".mdc-menu"))
        this._mdcMenuVoices.setAnchorCorner(VoicesListView.MDCMenuCorner.BOTTOM_LEFT)
        this._mdcMenuVoices.setAnchorElement(this._elemReaderSelectedVoice)
        this._mdcMenuVoices.setFixedPosition(true)
        this._mdcMenuVoices.listen('MDCMenu:selected', (e) => {
            this.voiceSelectonObserver(e.detail.index)
            this._elemReaderSelectedVoice.innerText = voices[e.detail.index].label
        })
        if (voices.length > 0) {
            this.voiceSelectonObserver(0)
            this._elemReaderSelectedVoice.innerText = voices[0].label
        }
        this._elemReaderSelectedVoice.onclick = () => {
            this._mdcMenuVoices.open = true
        }
    }
}
VoicesListView.MDCMenu = mdc.menu.MDCMenu
VoicesListView.MDCMenuCorner = mdc.menu.Corner
VoicesListView.MDCSlider = mdc.slider.MDCSlider