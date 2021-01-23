class ListItem {
    static ListItemStyles = Object.freeze({SUB_HEADER_1: 0, SUB_HEADER_2: 1, WORD: 2})
    constructor(text, style) {
        this.text = text
        this.style = style
    }
}