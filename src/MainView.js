class MainView {
    constructor() {
        this.placeholderListDefinitions = document.getElementById("placeholder-list-definitions")
        this._template = new Template()
        this._template.loadTemplates().then(() => {
            this.applyTemplates()
            this.viewModel = new MainViewModel()
            this.bindViewModel()
        })
    }
    applyTemplates() {
        document.querySelector("#placeholder-app-bar").innerHTML = this._template.createAppBarHtml("app-bar", "app_name",
            [{ "id": "action_item_about", "label": "action_item_label_about", "icon": "info" }])
        const MDCTopAppBar = mdc.topAppBar.MDCTopAppBar;
        this.topAppBar = new MDCTopAppBar(document.querySelector("#app-bar"))

        document.querySelector("#action_item_about").onclick = () => { alert("About demo app") }

        document.querySelector("#placeholder-progress-indicator").innerHTML = this._template.createProgressIndicatorHtml()
        const MDCCircularProgress = mdc.circularProgress.MDCCircularProgress;
        this.circularProgress = new MDCCircularProgress(document.querySelector('.mdc-circular-progress'));
        this.circularProgress.determinate = false
        this.circularProgress.open()

        document.querySelector("#placeholder-btn-fetch-definitions").innerHTML = this._template.createButtonHtml("btn-fetch-definitions", "btn_search_title")
        this.btnLoad = document.getElementById("btn-fetch-definitions")
        this.btnLoad.disabled = true

        const MDCTextField = mdc.textField.MDCTextField;
        document.querySelector("#placeholder-input-text-search").innerHTML = this._template.createInputTextHtml("input-text-search", "btn_search_title")
        this.inputTextSearch = new MDCTextField(document.querySelector("#input-text-search"))
        document.querySelector("#input-text-search input").onkeydown = (evt) => {
            if (evt.keyCode == 13) this.searchDefinitions()
        }
    }

    bindViewModel() {
        // viewmodel -> view bindings
        this.viewModel.isLoading.observer = (isLoading) => { this.showLoading(isLoading && !this.template.isLoaded) }
        this.viewModel.definitions.observer = (newDefinitions) => { this.showDefinitions(newDefinitions) }

        // view -> viewmodel bindings
        this.btnLoad.onclick = () => { this.searchDefinitions() }
    }
    searchDefinitions() {
        this.viewModel.fetchDefinitions(this.inputTextSearch.value)
    }
    showDefinitions(definitions) {
        this.placeholderListDefinitions.innerHTML = this._template.createListHtml("list-definitions", definitions)
    }
    showLoading(isLoading) {
        if (isLoading) {
            this.circularProgress.open()
            this.btnLoad.disabled = true
        } else {
            this.circularProgress.close()
            this.btnLoad.disabled = false
        }
    }
}
function main_view_init() {
    var mainView = new MainView()
}