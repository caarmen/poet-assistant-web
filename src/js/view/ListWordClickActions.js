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
class ListWordClickActions {
}
ListWordClickActions.listenWordClickEvents = (elemList, callback) => {
    ListWordClickActions.listenWordClickEventsListHeader(elemList, callback)
    ListWordClickActions.listenWordClickEventsListItems(elemList, callback)
}
ListWordClickActions.listenWordClickEventsListHeader = (elemList, callback) => {
    elemList.querySelector(".list-header__text").onclick = (e) => callback(e.target)
}
ListWordClickActions.listenWordClickEventsListItems = (elemList, callback) => {
    new ListWordClickActions.MDCList(elemList).listen('click', (e) => {
        if (e.target.classList.contains("word-list-item")) callback(e.target.querySelector(".word-list-item__text"))
    })
}
ListWordClickActions.MDCList = mdc.list.MDCList