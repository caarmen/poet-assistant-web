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
class ListFavoriteActions {
}
ListFavoriteActions.listenFavoriteToggleEvents = (elemList, word, callback) => {
    ListFavoriteActions.listenFavoriteToggleEventsListHeader(elemList, word, callback)
    ListFavoriteActions.listenFavoriteToggleEventsListItems(elemList, callback)
}
ListFavoriteActions.listenFavoriteToggleEventsListHeader = (elemList, word, callback) => {
    new ListFavoriteActions.MDCIconButtonToggle(elemList.querySelector(".list-header__favorite"))
        .listen("MDCIconButtonToggle:change", (e) => {
            callback(word, e.detail.isOn)
        })
}
ListFavoriteActions.listenFavoriteToggleEventsListItems = (elemList, callback) => {
    elemList.querySelectorAll(".word-list-item").forEach((wordListItem) => {
        const word = wordListItem.querySelector(".word-list-item__text").innerText.trim()
        new ListFavoriteActions.MDCIconButtonToggle(wordListItem.querySelector(".word-list-item__favorite")).listen("MDCIconButtonToggle:change", (e) => {
            callback(word, e.detail.isOn)
        })
    })
}
ListFavoriteActions.MDCIconButtonToggle = mdc.iconButton.MDCIconButtonToggle