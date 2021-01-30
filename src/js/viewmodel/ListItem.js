class ListItem {
    constructor(style, text, ...args) {
        this.style = style
        this.text = text
        this.args = args
    }
}
ListItem.ListItemStyles = Object.freeze({SUB_HEADER_1: 0, SUB_HEADER_2: 1, WORD: 2})