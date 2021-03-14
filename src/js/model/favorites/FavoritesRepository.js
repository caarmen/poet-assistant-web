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
class FavoritesRepository {
    constructor(settings) {
        this._settings = settings
        this.observer = (newFavorites) => { }
    }
    setFavorite(word, isFavorite) {
        const favorites = this.getFavorites()
        if (isFavorite) favorites.add(word)
        else favorites.delete(word)
        const newFavorites = Array.from(favorites.values())
        this._settings.setSetting(FavoritesRepository.SETTINGS_KEY_FAVORITES,
            JSON.stringify(newFavorites)
        )
        this.observer(newFavorites)
    }

    clearFavorites() {
        this._settings.removeSetting(FavoritesRepository.SETTINGS_KEY_FAVORITES)
        this.observer([])
    }

    getFavorites = () => new Set(
        JSON.parse(
            this._settings.getSetting(FavoritesRepository.SETTINGS_KEY_FAVORITES, "[]")
        )
    )

}
FavoritesRepository.SETTINGS_KEY_FAVORITES = "favorites"
