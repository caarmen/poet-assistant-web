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

class WordCounter {
}
// The following will each be considered as one word: good-hearted, don't, variable_name
WordCounter._NON_SPLITTING_PUNCTUATION = "-'’_"
WordCounter._REGEX_STRIP = new RegExp(`[${WordCounter._NON_SPLITTING_PUNCTUATION}]`)
WordCounter._REGEX_SPLIT = new RegExp(`[^${WordCounter._NON_SPLITTING_PUNCTUATION}\\p{L}0-9]`, "u")
WordCounter.countWords = (text) => {
    if (!text || text == "") return 0
    const tokens = text.replace(WordCounter._REGEX_STRIP, "")
        .split(WordCounter._REGEX_SPLIT)
        .filter((token) => token != "")
    return tokens.length
}
WordCounter.countCharacters = (text) => text ? text.length : 0

if (typeof module != 'undefined') {
    module.exports = WordCounter
}