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

class UtteranceSplitter {
}
UtteranceSplitter.splitText = (text) => {
    const result = []
    // In a sequence of dots, we want to skip the first two.
    let skippedDots = 0
    let pause = 0.0
    let prevUtterance = null
    text.split(".").forEach((token) => {
        // The current token is a dot. It may or may not be used to pause.
        if (token == "") {
            // We've skipped at least two consecutive dots. We can now start adding all dots as
            // pause tokens.
            if (skippedDots >= 1) {
                pause += UtteranceSplitter.PAUSE_DURATION_S
                prevUtterance = null
            }
            // Beginning of a dot sequence. We have to skip the first two dots.
            else {
                skippedDots += 1
            }
        }
        // The current token is actual text to speak.
        else {
            let utterance = null
            // This is either the first text token of the entire input, or a text token after a pause token.
            // We simply add it to the list.
            if (prevUtterance == null || prevUtterance.text == "") {
                utterance = new Utterance(token, pause)
                result.push(utterance)
            }
            // The previous token was also actual text.
            // Concatenate the previous token with this one, separating by a single period.
            // This optimization allows us to minimize the number of tokens we'll return, and to rely
            // on the sentence pausing of the TTS engine when less than 3 dots separate two sentences.
            else {
                utterance = new Utterance(`${prevUtterance.text}.${token}`, prevUtterance.preDelayS)
                result[result.length - 1] = utterance
            }
            prevUtterance = utterance
            pause = 0
            skippedDots = 0
        }
    })

    return result
}

UtteranceSplitter.PAUSE_DURATION_S = 0.5
if(typeof module != 'undefined') {
    module.exports = UtteranceSplitter
}
