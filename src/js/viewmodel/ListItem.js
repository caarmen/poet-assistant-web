class ListItem {
    constructor(text, style) {
        this.text = text
        this.style = style
    }
}
ListItem.ListItemStyles = Object.freeze({ SUB_HEADER_1: 1, SUB_HEADER_2: 2, WORD: 3 })