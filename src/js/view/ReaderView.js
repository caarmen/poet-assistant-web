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
        this._elemPlaceholderReaderActions = document.querySelector("#placeholder-reader-actions")
        this._elemPlaceholderReaderInput = document.querySelector("#placeholder-reader-input")
        this._elemPlaceholderReaderSavedState

        this._elemBtnPlay
        this._elemBtnCopy
        this._elemBtnClear
        this._elemTextInput

        this._i18n = i18n
        this._template = template

        this._applyTemplates()
        this._initializeViews()

        this.onPlayClickedObserver = (poemText, selectionStart, selectionEnd) => { }
        this.onCopyClickedObserver = (poemText, selectionStart, selectionEnd) => { }
        this.onClearClickedObserver = () => { }
        this.onPoemTextObserver = (poemText) => { }
    }
    _applyTemplates() {
        this._elemPlaceholderReaderActions.innerHTML = this._template.createReaderActionsHtml("input-text-actions")
        this._elemPlaceholderReaderInput.innerHTML = this._template.createTextareaHtml("input-text-reader", "reader_hint")
        this._elemPlaceholderReaderSavedState = document.querySelector("#placeholder-reader-saved-state")

    }

    _initializeViews() {
        this._mdcInputTextReader = new ReaderView.MDCTextField(document.querySelector("#input-text-reader"))
        this._elemBtnPlay = document.querySelector("#btn-play")
        this._elemBtnCopy = document.querySelector("#btn-copy-text")
        this._elemBtnClear = document.querySelector("#btn-clear-text")

        this._elemTextInput = this._elemPlaceholderReaderInput.querySelector(".mdc-text-field__input")

        this._elemBtnPlay.disabled = true
        this._elemBtnCopy.disabled = true
        this._elemBtnClear.disabled = true
        this._mdcInputTextReader.foundation.adapter.registerTextFieldInteractionHandler('input', ((evt) => {
            this._updateButtonStates()
            this.onPoemTextObserver(this._mdcInputTextReader.value)
        }))
        this._elemBtnPlay.onclick = () => {
            this.onPlayClickedObserver(this._mdcInputTextReader.value, this._elemTextInput.selectionStart, this._elemTextInput.selectionEnd)
        }
        this._elemBtnCopy.onclick = () => {
            this.onCopyClickedObserver(this._mdcInputTextReader.value, this._elemTextInput.selectionStart, this._elemTextInput.selectionEnd)
        }
        this._elemBtnClear.onclick = () => {
            this.onClearClickedObserver()
        }
    }

    _updateButtonStates() {
        this._elemBtnPlay.disabled = this._mdcInputTextReader.value.length == 0
        this._elemBtnCopy.disabled = this._mdcInputTextReader.value.length == 0
        this._elemBtnClear.disabled = this._mdcInputTextReader.value.length == 0
    }
    setPoemText(text) {
        this._mdcInputTextReader.value = text
        this._updateButtonStates()
    }

    updateSpeechPlayingState(newIsSpeechPlaying) {
        if (newIsSpeechPlaying) {
            this._elemBtnPlay.innerText = "stop"
        } else {
            this._elemBtnPlay.innerText = "play_circle_filled"
        }
    }
    updatePoemSavedState(newSavedState) {
        this._elemPlaceholderReaderSavedState.innerText = this._i18n.translate(newSavedState)
    }
}
ReaderView.MDCTextField = mdc.textField.MDCTextField