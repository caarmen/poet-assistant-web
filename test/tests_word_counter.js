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

require("./test_apis.js")()
require("./test_runner.js")()
WordCounter = require("../src/js/model/poem/WordCounter.js")

_testWordCounter = (input, expectedWordCount, expectedCharacterCount) => {
    let actualWordCount = WordCounter.countWords(input)
    let actualCharacterCount = WordCounter.countCharacters(input)
    assertEquals(expectedWordCount, actualWordCount)
    assertEquals(expectedCharacterCount, actualCharacterCount)
}

const tests = [
    testEmpty = () => {
        _testWordCounter("", 0, 0)
    },
    testSimpleSentence = () => {
        _testWordCounter("See spot run.", 3, 13)
    },
    testApostrophe = () => {
        _testWordCounter("I can't even", 3, 12)
    },
    testTaleOfTwoCities = () => {
        _testWordCounter("we had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way— in short, the period was so far like the present period, that some of its noisiest authorities insisted on its being received, for good or for evil, in the superlative degree of comparison only.",
            59,
            325
        )
    },
    testHuckleberryFinn = () => {
        _testWordCounter("“Did I give you the letter?”\n" +
            "“What letter?”\n" +
            "“The one I got yesterday out of the post-office.”\n" +
            "“No, you didn’t give me no letter.”\n" +
            "“Well, I must a forgot it.”",
            30,
            157
        )
    },
    testWarAndPeace = () => {
        _testWordCounter("The count came waddling in to see his wife with a rather guilty look as usual.\n" +
            "“Well, little countess? What a sauté of game au madère we are to have, my dear! I tasted it. The thousand rubles I paid for Tarás were not ill-spent. He is worth it!”",
            49,
            245
        )
    },
    testShakespeare = () => {
        _testWordCounter("Where wasteful Time debateth with decay\n" +
            "To change your day of youth to sullied night,\n" +
            "   And all in war with Time for love of you,\n" +
            "   As he takes from you, I engraft you new.\n",
            34,
            175)
    },
    testDracula = () => {
        _testWordCounter("Algernon.  And, speaking of the science of Life, have you got the cucumber sandwiches cut for Lady Bracknell?\n" +
            "\n" +
            "Lane.  Yes, sir.  [Hands them on a salver.]",
            26,
            154
        )
    },
    testDate1 = () => {
        _testWordCounter("On the 5th of November, I wrote this test.",
            9,
            42
        )
    },
    testDate2 = () => {
        _testWordCounter("On 11/5/2017, I wrote this test.", 8, 32)
    }
]

runTests(tests)
