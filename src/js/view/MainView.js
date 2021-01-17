class MainView {
    constructor() {
        this.placeholderListRhymes = document.getElementById("placeholder-list-rhymes")
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

        document.querySelector("#action_item_about").onclick = () => { this.viewModel.onAboutClicked() }

        document.querySelector("#placeholder-tab-bar").innerHTML = this._template.createTabBarHtml("tab-bar",
            [
                new Tab("tab_rhymer", "tab_rhymer_title"),
                new Tab("tab_dictionary", "tab_dictionary_title")
            ])
        const MDCTabBar = mdc.tabBar.MDCTabBar;
        this.tabBar = new MDCTabBar(document.querySelector(".mdc-tab-bar"))
        this.tabBar.listen("MDCTabBar:activated", (eventData) => {
            this.onTabActivated(eventData["detail"]["index"])
        })

        document.querySelector("#placeholder-progress-indicator").innerHTML = this._template.createProgressIndicatorHtml()
        const MDCCircularProgress = mdc.circularProgress.MDCCircularProgress;
        this.circularProgress = new MDCCircularProgress(document.querySelector('.mdc-circular-progress'));
        this.circularProgress.determinate = false
        this.circularProgress.open()

        document.querySelector("#placeholder-btn-fetch-definitions").innerHTML = this._template.createButtonIconHtml("btn-fetch-definitions", "search", "btn_search_title")
        this.btnLoad = document.getElementById("btn-fetch-definitions")
        this.btnLoad.disabled = true

        const MDCTextField = mdc.textField.MDCTextField;
        document.querySelector("#placeholder-input-text-search").innerHTML = this._template.createInputTextHtml("input-text-search", "btn_search_title")
        this.inputTextSearch = new MDCTextField(document.querySelector("#input-text-search"))
        document.querySelector("#input-text-search input").onkeydown = (evt) => {
            if (evt.keyCode == 13) this.searchAll()
        }
    }

    bindViewModel() {
        // viewmodel -> view bindings
        this.viewModel.isLoading.observer = (isLoading) => { this.showLoading(isLoading && !this.template.isLoaded) }
        this.viewModel.rhymes.observer = (newRhymes) => { this.showRhymes(newRhymes) }
        this.viewModel.definitions.observer = (newDefinitions) => { this.showDefinitions(newDefinitions) }
        this.viewModel.dialog.observer = (newDialog) => { this.showDialog(newDialog) }
        this.viewModel.activeTab.observer = (newActiveTab) => { this.switchToTab(newActiveTab) }

        // view -> viewmodel bindings
        this.btnLoad.onclick = () => { this.searchAll() }
    }
    switchToTab(tabIndex) {
        if (tabIndex == this.viewModel.TAB_RHYMER) {
            document.querySelector("#tab_rhymer").click()
        } else if (tabIndex == this.viewModel.TAB_DICTIONARY) {
            document.querySelector("#tab_dictionary").click()
        }
    }
    onTabActivated(tabIndex) {
        if (tabIndex == this.viewModel.TAB_RHYMER) {
            this.placeholderListRhymes.style.display = "block"
            this.placeholderListDefinitions.style.display = "none"
        } else if (tabIndex == this.viewModel.TAB_DICTIONARY) {
            this.placeholderListRhymes.style.display = "none"
            this.placeholderListDefinitions.style.display = "block"
        }
    }
    searchAll() {
        this.searchRhymes()
        this.searchDefinitions()
    }
    searchRhymes() {
        this.viewModel.fetchRhymes(this.inputTextSearch.value)
    }
    searchDefinitions() {
        this.viewModel.fetchDefinitions(this.inputTextSearch.value)
    }
    showRhymes(rhymes) {
        this.placeholderListRhymes.innerHTML = this._template.createRhymesListHtml("list-rhymes", rhymes)
    }
    showDefinitions(definitions) {
        this.placeholderListDefinitions.innerHTML = this._template.createDictionaryListHtml("list-definitions", definitions)
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
    showDialog(newDialog) {
        document.querySelector("#placeholder-dialog").innerHTML =
            this._template.createDialogHtml(newDialog.title, newDialog.content)
        const MDCDialog = mdc.dialog.MDCDialog;
        const dialog = new MDCDialog(document.querySelector('.mdc-dialog'))
        dialog.open()
    }
}
function main_view_init() {
    var mainView = new MainView()
}