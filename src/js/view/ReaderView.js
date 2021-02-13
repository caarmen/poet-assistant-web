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
class ReaderView {

    constructor(i18n, template) {
        this._elemPlaceholderReaderInput = document.querySelector("#placeholder-reader-input")
        this._elemPlaceholderReaderPlayButton = document.querySelector("#placeholder-reader-play-button")

        this._elemBtnPlay
        this._elemBtnPlayIcon
        this._elemBtnPlayLabel
        this._elemTextInput

        this._i18n = i18n
        this._template = template

        this.applyTemplates()
        this.initializeViews()

        this.onPlayClickedObserver = (poemText, selectionStart, selectionEnd) => { }
    }
    applyTemplates() {
        this._elemPlaceholderReaderInput.innerHTML = this._template.createTextareaHtml("input-text-reader", "reader_hint")
        this._elemPlaceholderReaderPlayButton.innerHTML = this._template.createButtonIconTextHtml("btn-play", "play_circle_filled", "btn_play_title")
    }

    initializeViews() {
        this._mdcInputTextReader = new ReaderView.MDCTextField(document.querySelector("#input-text-reader"))
        this._elemBtnPlay = document.querySelector("#btn-play")
        this._elemBtnPlayIcon = document.querySelector("#btn-play-icon")
        this._elemBtnPlayLabel = document.querySelector("#btn-play-label")

        this._elemTextInput = this._elemPlaceholderReaderInput.querySelector(".mdc-text-field__input")

        this._elemBtnPlay.disabled = true
        this._mdcInputTextReader.foundation.adapter.registerTextFieldInteractionHandler('input', ((evt) => {
            this._elemBtnPlay.disabled = this._mdcInputTextReader.value.length == 0
        }))
        this._elemBtnPlay.onclick = () => {
            this.onPlayClickedObserver(this._mdcInputTextReader.value, this._elemTextInput.selectionStart, this._elemTextInput.selectionEnd)
        }
    }

    updateSpeechPlayingState(newIsSpeechPlaying) {
        if (newIsSpeechPlaying) {
            this._elemBtnPlayIcon.innerText = "stop"
            this._elemBtnPlayLabel.innerText = this._i18n.translate("btn_stop_title")

        } else {
            this._elemBtnPlayIcon.innerText = "play_circle_filled"
            this._elemBtnPlayLabel.innerText = this._i18n.translate("btn_play_title")
        }
    }
}
ReaderView.MDCTextField = mdc.textField.MDCTextField