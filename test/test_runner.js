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

module.exports = function () {
    this.runTests = (tests) => {
        var passed = 0
        var failed = 0
        tests.forEach((test) => {
            console.log(test.name)
            try {
                test()
                passed++
            } catch (error) {
                console.log(`${test.name} failed with error ${error}`)
                failed++
            }
        })
        console.log(`Ran ${tests.length} tests: ${passed} passed. ${failed} failed.`)
        if (failed != 0) throw "Tests failed"
    }
}
