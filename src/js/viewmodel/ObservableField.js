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
class ObservableField {
    constructor(intialValue) {
        this._value = intialValue
        this._observer = (newValue) => { }
    }
    get value() {
        return this._value
    }
    set value(newValue) {
        this._value = newValue
        this._observer(this._value)
    }
    set observer(newObserver) {
        this._observer = newObserver
        if (this._value != undefined) this._observer(this._value)
    }
}