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
Utterance = require("../src/js/model/speech/Utterance.js")
UtteranceSplitter = require("../src/js/model/speech/UtteranceSplitter.js")

_testSplit = (input, expectedUtterances) => {
    let actualUtterances = UtteranceSplitter.splitText(input)
    assertEquals(expectedUtterances.length, actualUtterances.length)
    if (expectedUtterances.length == actualUtterances.length) {
        for (let i = 0; i < expectedUtterances.length; i++) {
            assertEquals(expectedUtterances[i].text, actualUtterances[i].text)
            assertEquals(expectedUtterances[i].preDelayS, actualUtterances[i].preDelayS)
        }
    }
}

const tests = [
    testSplit1 = () => {
        _testSplit("To be or not to be", [new Utterance("To be or not to be", 0)])
    },
    testSplit2 = () => {
        _testSplit("To be or not to be.. that is the question", [new Utterance("To be or not to be. that is the question", 0)])
    },
    testSplit3 = () => {
        let expectedUtterance1 = new Utterance("To be or not to be", 0)
        let expectedUtterance2 = new Utterance(" that is the question", 0.5)
        _testSplit("To be or not to be... that is the question", [expectedUtterance1, expectedUtterance2])
    },
    testSplit4 = () => {
        let expectedUtterance1 = new Utterance("To be or not to be", 0)
        let expectedUtterance2 = new Utterance(" that is the question", 1.0)
        _testSplit("To be or not to be.... that is the question", [expectedUtterance1, expectedUtterance2])
    },
    testSplit5 = () => {
        let expectedUtterance1 = new Utterance("To be or not to be", 0)
        let expectedUtterance2 = new Utterance(" that is the question", 1.5)
        _testSplit("To be or not to be..... that is the question", [expectedUtterance1, expectedUtterance2])
    },
    testSplit6 = () => {
        let expectedUtterance1 = new Utterance("To be or not to be", 0)
        let expectedUtterance2 = new Utterance(" that is the question", 2.0)
        expectedUtterance2.preUtteranceDelay = 2.0
        _testSplit("To be or not to be...... that is the question", [expectedUtterance1, expectedUtterance2])
    },
    testSplit7 = () => {
        let expectedUtterance1 = new Utterance("To be  ", 0)
        let expectedUtterance2 = new Utterance(" or not to be", 0.5)
        let expectedUtterance3 = new Utterance(" that is the question", 0.5)
        _testSplit("To be  ... or not to be... that is the question", [expectedUtterance1, expectedUtterance2, expectedUtterance3])
    },
    testSplit8 = () => {
        _testSplit("To be or not to be. That is the question", [new Utterance("To be or not to be. That is the question", 0)])
    },
    testSplit9 = () => {
        _testSplit("To be or not to be. That. is. the. question", [new Utterance("To be or not to be. That. is. the. question", 0)])
    },
    testSplit10 = () => {
        _testSplit("To be or not to be.. That.. is.. the.. question", [new Utterance("To be or not to be. That. is. the. question", 0)])
    },
    testSplit11 = () => {
        _testSplit("To be or not to be.\nThat..\nis.\n the\nquestion", [new Utterance("To be or not to be.\nThat.\nis.\n the\nquestion", 0)])
    },
    testSplit12 = () => {
        _testSplit("To be or not to be.\nThat....\nis.\n the\nquestion", [new Utterance("To be or not to be.\nThat", 0), new Utterance("\nis.\n the\nquestion", 1)])
    },
    testSplitDotsOnly1 = () => {
        _testSplit(".", [])
    },
    testSplitDotsOnly2 = () => {
        _testSplit("..", [])
    },
    testSplitDotsOnly3 = () => {
        _testSplit("...", [])
    },
    testSplitDotsOnly4 = () => {
        _testSplit("....", [])
    },
    testEmpty = () => {
        _testSplit("", [])
    }
]

runTests(tests)
