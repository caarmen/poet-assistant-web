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
class ListVisibility {

    constructor(template) {
        this._template = template
    }

    setLoading(isLoading, mdcCircularProgress) {
        if (isLoading) {
            mdcCircularProgress.root.parentNode.style.display = "block"
            mdcCircularProgress.open()
        } else {
            mdcCircularProgress.close()
            mdcCircularProgress.root.parentNode.style.display = "none"
        }
    }
    setNoQuery(elemList, elemEmpty, emptyText) {
        elemEmpty.innerHTML = this._template.createListEmptyHtml(emptyText)
        elemList.style.display = "none"
        elemEmpty.style.display = "block"
    }
    setListVisibility(listData, elemList, elemEmpty, emptyText, word) {
        if (listData && listData.length > 0) {
            elemList.style.display = "block"
            elemEmpty.style.display = "none"
            elemEmpty.innerHTML = ""
        } else {
            elemEmpty.innerHTML = this._template.createListEmptyHtml(emptyText, word)
            elemList.style.display = "none"
            elemEmpty.style.display = "block"
        }
    }

}