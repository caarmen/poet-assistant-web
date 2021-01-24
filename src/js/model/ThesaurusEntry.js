class ThesaurusEntry {
    constructor(wordType, synonyms, antonyms) {
        this.wordType = wordType
        this.synonyms = synonyms
        this.antonyms = antonyms
    }
}
ThesaurusEntry.WordType = Object.freeze({ ADJECTIVE: 0, ADVERB: 1, NOUN: 2, VERB: 3 })