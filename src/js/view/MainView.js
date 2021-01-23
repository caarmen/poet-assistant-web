class MainView {
    static MDCTabBar = mdc.tabBar.MDCTabBar
    static MDCCircularProgress = mdc.circularProgress.MDCCircularProgress
    static MDCDialog = mdc.dialog.MDCDialog
    static MDCTextField = mdc.textField.MDCTextField

    constructor() {
        this._elemPlaceholderAppBar = document.querySelector("#placeholder-app-bar")
        this._elemPlaceholderTabBar = document.querySelector("#placeholder-tab-bar")
        this._elemPlaceholderProgressIndicator = document.querySelector("#placeholder-progress-indicator")
        this._elemPlaceholderDialog = document.querySelector("#placeholder-dialog")
        this._elemPlacholderInputTextSearch = document.querySelector("#placeholder-input-text-search")
        this._elemPlaceholderBtnSearch = document.querySelector("#placeholder-btn-fetch-definitions")
        this._elemPlaceholderListRhymes = document.querySelector("#placeholder-list-rhymes")
        this._elemPlaceholderListDefinitions = document.querySelector("#placeholder-list-definitions")

        this._mdcCircularProgress
        this._mdcInputTextSearch

        this._elemActionItemAbout
        this._elemTabRhymer
        this._elemTabDictionary
        this._elemBtnSearch

        this._template = new Template()
        this._template.loadTemplates().then(() => {
            this.applyTemplates()
            this.initializeViews()
            this._viewModel = new MainViewModel()
            this.bindViewModel()
        })
    }
    applyTemplates() {
        this._elemPlaceholderAppBar.innerHTML = this._template.createAppBarHtml("app-bar", "app_name",
            [new AppBarActionItem("action_item_about", "action_item_label_about", "info")])
        this._elemPlaceholderTabBar.innerHTML = this._template.createTabBarHtml("tab-bar",
            [
                new Tab("tab_rhymer", "tab_rhymer_title"),
                new Tab("tab_dictionary", "tab_dictionary_title")
            ])
        this._elemPlaceholderProgressIndicator.innerHTML = this._template.createProgressIndicatorHtml()
        this._elemPlacholderInputTextSearch.innerHTML = this._template.createInputTextHtml("input-text-search", "btn_search_title")
        this._elemPlaceholderBtnSearch.innerHTML = this._template.createButtonIconHtml("btn-fetch-definitions", "search", "btn_search_title")
    }

    initializeViews() {
        var mdcTabBar = new MainView.MDCTabBar(document.querySelector(".mdc-tab-bar"))
        mdcTabBar.listen("MDCTabBar:activated", (eventData) => {
            this.onTabActivated(eventData["detail"]["index"])
        })

        this._elemActionItemAbout = document.querySelector("#action_item_about")
        this._elemTabRhymer = document.querySelector("#tab_rhymer")
        this._elemTabDictionary = document.querySelector("#tab_dictionary")

        this._mdcCircularProgress = new MainView.MDCCircularProgress(document.querySelector('.mdc-circular-progress'))
        this._mdcCircularProgress.determinate = false
        this._mdcCircularProgress.open()

        this._mdcInputTextSearch = new MainView.MDCTextField(document.querySelector("#input-text-search"))
        document.querySelector("#input-text-search input").onkeydown = (evt) => {
            if (evt.keyCode == 13) this.searchAll()
        }

        this._elemBtnSearch = document.querySelector("#btn-fetch-definitions")
        this._elemBtnSearch.disabled = true
    }

    bindViewModel() {
        // viewmodel -> view bindings
        this._viewModel.isLoading.observer = (isLoading) => { this.showLoading(isLoading && !this.template.isLoaded) }
        this._viewModel.rhymes.observer = (newRhymes) => { this.showRhymes(newRhymes) }
        this._viewModel.definitions.observer = (newDefinitions) => { this.showDefinitions(newDefinitions) }
        this._viewModel.dialog.observer = (newDialog) => { this.showDialog(newDialog) }
        this._viewModel.activeTab.observer = (newActiveTab) => { this.switchToTab(newActiveTab) }

        // view -> viewmodel bindings
        this._elemBtnSearch.onclick = () => { this.searchAll() }
        this._elemActionItemAbout.onclick = () => { this._viewModel.onAboutClicked() }
    }
    switchToTab(tabIndex) {
        if (tabIndex == MainViewModel.TabEnum.RHYMER) {
            this._elemTabRhymer.click()
        } else if (tabIndex == MainViewModel.TabEnum.DICTIONARY) {
            this._elemTabDictionary.click()
        }
    }
    onTabActivated(tabIndex) {
        if (tabIndex == MainViewModel.TabEnum.RHYMER) {
            this._elemPlaceholderListRhymes.style.display = "block"
            this._elemPlaceholderListDefinitions.style.display = "none"
        } else if (tabIndex == MainViewModel.TabEnum.DICTIONARY) {
            this._elemPlaceholderListRhymes.style.display = "none"
            this._elemPlaceholderListDefinitions.style.display = "block"
        }
    }
    searchAll() {
        this.searchRhymes()
        this.searchDefinitions()
    }
    searchRhymes() {
        this._viewModel.fetchRhymes(this._mdcInputTextSearch.value)
    }
    searchDefinitions() {
        this._viewModel.fetchDefinitions(this._mdcInputTextSearch.value)
    }
    showRhymes(rhymes) {
        this._elemPlaceholderListRhymes.innerHTML = this._template.createRhymesListHtml("list-rhymes", rhymes)
    }
    showDefinitions(definitions) {
        this._elemPlaceholderListDefinitions.innerHTML = this._template.createDictionaryListHtml("list-definitions", definitions)
    }
    showLoading(isLoading) {
        if (isLoading) {
            this._mdcCircularProgress.open()
            this._elemBtnSearch.disabled = true
        } else {
            this._mdcCircularProgress.close()
            this._elemBtnSearch.disabled = false
        }
    }
    showDialog(newDialog) {
        this._elemPlaceholderDialog.innerHTML =
            this._template.createDialogHtml(newDialog.title, newDialog.content)
        const dialog = new MainView.MDCDialog(document.querySelector('.mdc-dialog'))
        dialog.open()
    }
}
function main_view_init() {
    var mainView = new MainView()
}