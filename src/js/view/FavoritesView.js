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
class FavoritesView {

    constructor(i18n, template) {
        this._elemPlaceholderFavoritesList = document.querySelector("#placeholder-favorites__list")
        this._elemPlaceholderFavoritesEmpty = document.querySelector("#placeholder-favorites__empty")

        this._i18n = i18n
        this._template = template
        this._listVisibility = new ListVisibility(this._template)

        this.favoriteToggledObserver = (word, isFavorite) => { }
        this.wordClickedObserver = (wordElem) => { }
        this.shareClickedObserver = () => { }
        this.deleteClickedObserver = () => { }
    }

    showFavorites(favorites) {
        this._elemPlaceholderFavoritesList.innerHTML = this._template.createFavoritesListHtml("list-favorites", favorites)
        this._i18n.translateElement(this._elemPlaceholderFavoritesList.querySelector(".list-header"))
        this._listVisibility.setListVisibility(favorites, this._elemPlaceholderFavoritesList, this._elemPlaceholderFavoritesEmpty, "no_results_favorites")
        ListWordClickActions.listenWordClickEvents(this._elemPlaceholderFavoritesList, (elem) => this.wordClickedObserver(elem))
        ListFavoriteActions.listenFavoriteToggleEventsListItems(this._elemPlaceholderFavoritesList, (word, isFavorite) => this.favoriteToggledObserver(word, isFavorite))
        this._elemPlaceholderFavoritesList.querySelector(".list-header__delete").onclick = (e) => { this.deleteClickedObserver() }
        this._elemPlaceholderFavoritesList.querySelector(".list-header__copy").onclick = (e) => { this.shareClickedObserver() }
    }
}