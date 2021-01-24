class ThesaurusRepository {
    constructor(db) {
        this._db = db
    }
    async fetch(word) {
        var stmt = this._db.prepare(`
            SELECT ${ThesaurusRepository.COL_WORD_TYPE}, ${ThesaurusRepository.COL_SYNONYMS}, ${ThesaurusRepository.COL_ANTONYMS} 
            FROM ${ThesaurusRepository.TABLE_THESAURUS}
            WHERE ${ThesaurusRepository.COL_WORD}=? 
            ORDER BY ${ThesaurusRepository.COL_WORD_TYPE}`)
        stmt.bind([word])
        var result = []

        while (stmt.step()) {
            var row = stmt.getAsObject();
            var wordTypeStr = row[ThesaurusRepository.COL_WORD_TYPE]

            var wordType
            if (wordTypeStr == "ADJ") wordType = ThesaurusEntry.WordType.ADJECTIVE
            else if (wordTypeStr == "ADV") wordType = ThesaurusEntry.WordType.ADVERB
            else if (wordTypeStr == "NOUN") wordType = ThesaurusEntry.WordType.NOUN
            else if (wordTypeStr == "VERB") wordType = ThesaurusEntry.WordType.VERB

            var synonyms = (row[ThesaurusRepository.COL_SYNONYMS] || "").split(",").filter(item => item != "").sort()
            var antonyms = (row[ThesaurusRepository.COL_ANTONYMS] || "").split(",").filter(item => item != "").sort()

            var thesaurusEntry = new ThesaurusEntry(
                wordType,
                synonyms,
                antonyms
            )
            result.push(thesaurusEntry)
        }
        return result
    }
}
ThesaurusRepository.TABLE_THESAURUS = "thesaurus"
ThesaurusRepository.COL_SYNONYMS = "synonyms"
ThesaurusRepository.COL_ANTONYMS = "antonyms"
ThesaurusRepository.COL_WORD = "word"
ThesaurusRepository.COL_WORD_TYPE = "word_type"