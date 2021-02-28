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

class PoemRepository {
    constructor(settings) {
        this._settings = settings
        this.savedState = new ObservableField(PoemRepository.SaveState.WAITING)
        this._timeoutId
    }

    getPoemText = () => this._settings.getSetting(PoemRepository.SETTINGS_KEY_POEM_TEXT, "")

    setPoemText(text) {
        if (this._timeoutId != undefined) clearTimeout(this._timeoutId)
        this.savedState.value = PoemRepository.SaveState.WAITING
        this._timeoutId = setTimeout(() => {
            this.savedState.value = PoemRepository.SaveState.SAVING
            this._settings.setSetting(PoemRepository.SETTINGS_KEY_POEM_TEXT, text)
            this.savedState.value = PoemRepository.SaveState.SAVED
        }, 2000)
    }

}
PoemRepository.SETTINGS_KEY_POEM_TEXT
PoemRepository.SaveState = Object.freeze({ WAITING: 0, SAVING: 1, SAVED: 2 })