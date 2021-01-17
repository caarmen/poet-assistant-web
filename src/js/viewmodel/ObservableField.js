class ObservableField {
    constructor() {
        this.observer = (newValue) => { }
    }
    get value() {
        return this._value
    }
    set value(newValue) {
        this._value = newValue
        this.observer(this._value)
    }
}