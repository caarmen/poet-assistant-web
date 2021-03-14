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
class ListItem {
    constructor(style, isFavorite, text, ...args) {
        this.style = style
        this.isFavorite = isFavorite
        this.text = text
        this.args = args
    }
}
ListItem.header1 = (text, args) => new ListItem(ListItem.ListItemStyles.SUB_HEADER_1, false, text, args)
ListItem.header2 = (text, args) => new ListItem(ListItem.ListItemStyles.SUB_HEADER_2, false, text, args)
ListItem.word = (text, isFavorite) => new ListItem(ListItem.ListItemStyles.WORD, isFavorite, text)
ListItem.ListItemStyles = Object.freeze({ SUB_HEADER_1: 0, SUB_HEADER_2: 1, WORD: 2 })