'use strict';
class MainView {

    constructor() {
        this._elemPlaceholderAppBar = document.querySelector("#placeholder-app-bar")
        this._elemPlaceholderProgressIndicator = document.querySelector("#placeholder-progress-indicator")
        this._elemPlaceholderContextMenu = document.querySelector("#placeholder-context-menu")
        this._elemPlaceholderDialog = document.querySelector("#placeholder-dialog")
        this._elemPlaceholderListRhymes = document.querySelector("#placeholder-list-rhymes")
        this._elemPlaceholderListThesaurus = document.querySelector("#placeholder-list-thesaurus")
        this._elemPlaceholderListDefinitions = document.querySelector("#placeholder-list-definitions")

        this._elemPlaceholderTabBar
        this._elemPlacholderInputTextSearch
        this._elemPlaceholderBtnSearch

        this._mdcListRhymes
        this._mdcListThesaurus
        this._mdcLinearProgress
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
        this._elemPlaceholderTabBar = document.querySelector("#placeholder-tab-bar")

        this._elemPlaceholderTabBar.innerHTML = this._template.createTabBarHtml("tab-bar",
            [
                new TabData("tab_rhymer", "tab_rhymer_title"),
                new TabData("tab_thesaurus", "tab_thesaurus_title"),
                new TabData("tab_dictionary", "tab_dictionary_title")
            ])
        this._elemPlacholderInputTextSearch = document.querySelector("#placeholder-input-text-search")
        this._elemPlaceholderBtnSearch = document.querySelector("#placeholder-btn-fetch-definitions")

        this._elemPlaceholderProgressIndicator.innerHTML = this._template.createProgressIndicatorHtml("progressbar_label")
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
        this._elemTabThesaurus = document.querySelector("#tab_thesaurus")
        this._elemTabDictionary = document.querySelector("#tab_dictionary")

        this._mdcLinearProgress = new MainView.MDCLinearProgress(document.querySelector('.mdc-linear-progress'))
        this._mdcLinearProgress.determinate = true
        this._mdcLinearProgress.progress = 0
        this._mdcLinearProgress.open()

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
        this._viewModel.thesaurusEntries.observer = (newThesaurusEntries) => { this.showThesaurus(newThesaurusEntries) }
        this._viewModel.definitions.observer = (newDefinitions) => { this.showDefinitions(newDefinitions) }
        this._viewModel.dialog.observer = (newDialog) => { this.showDialog(newDialog) }
        this._viewModel.activeTab.observer = (newActiveTab) => { this.switchToTab(newActiveTab) }
        this._viewModel.loadingProgress.observer = (newLoadingProgress) => { this.updateLoadingProgress(newLoadingProgress) }

        // view -> viewmodel bindings
        this._elemBtnSearch.onclick = () => { this.searchAll() }
        this._elemActionItemAbout.onclick = () => { this._viewModel.onAboutClicked() }
    }
    switchToTab(tabIndex) {
        if (tabIndex == MainViewModel.TabIndex.RHYMER) {
            this._elemTabRhymer.click()
        } else if (tabIndex == MainViewModel.TabIndex.THESAURUS) {
            this._elemTabThesaurus.click()
        } else if (tabIndex == MainViewModel.TabIndex.DICTIONARY) {
            this._elemTabDictionary.click()
        }
    }
    onTabActivated(tabIndex) {
        if (tabIndex == MainViewModel.TabIndex.RHYMER) {
            this._elemPlaceholderListRhymes.style.display = "block"
            this._elemPlaceholderListThesaurus.style.display = "none"
            this._elemPlaceholderListDefinitions.style.display = "none"
        } else if (tabIndex == MainViewModel.TabIndex.THESAURUS) {
            this._elemPlaceholderListRhymes.style.display = "none"
            this._elemPlaceholderListThesaurus.style.display = "block"
            this._elemPlaceholderListDefinitions.style.display = "none"
        } else if (tabIndex == MainViewModel.TabIndex.DICTIONARY) {
            this._elemPlaceholderListRhymes.style.display = "none"
            this._elemPlaceholderListThesaurus.style.display = "none"
            this._elemPlaceholderListDefinitions.style.display = "block"
        }
    }
    searchAll() {
        var word = this._mdcInputTextSearch.value
        this.searchRhymes(word)
        this.searchThesaurus(word)
        this.searchDefinitions(word)
    }
    searchRhymes = (word) => this._viewModel.fetchRhymes(word)

    searchThesaurus = (word) => this._viewModel.fetchThesaurus(word)

    searchDefinitions = (word) => this._viewModel.fetchDefinitions(word)

    showRhymes(rhymes) {
        this._elemPlaceholderListRhymes.innerHTML = this._template.createListHtml("list-rhymes", rhymes.word, rhymes.listItems)
        this._mdcListRhymes = new MainView.MDCList(document.querySelector("#list-rhymes"))
        this.listenForListItemWordClicks(this._mdcListRhymes)
    }

    showThesaurus(thesaurusEntries) {
        this._elemPlaceholderListThesaurus.innerHTML = this._template.createListHtml("list-thesaurus", thesaurusEntries.word, thesaurusEntries.listItems)
        this._mdcListThesaurus = new MainView.MDCList(document.querySelector("#list-thesaurus"))
        this.listenForListItemWordClicks(this._mdcListThesaurus)
    }

    listenForListItemWordClicks(mdcList) {
        mdcList.listen('click', (e) => {
            if (e.target.classList.contains("word-list-item")) {
                this.showContextMenu(e.pageX, e.pageY, e.target.innerText)
            }
        })
    }

    showDefinitions = (definitions) =>
        this._elemPlaceholderListDefinitions.innerHTML = this._template.createDictionaryListHtml("list-definitions", definitions.word, definitions.listItems)

    showLoading(isLoading) {
        if (isLoading) {
            this._elemPlaceholderProgressIndicator.style.display = "block"
            this._mdcLinearProgress.open()
            this._elemBtnSearch.disabled = true
        } else {
            this._mdcLinearProgress.close()
            this._elemBtnSearch.disabled = false
            this._elemPlaceholderProgressIndicator.style.display = "none"
        }
    }
    updateLoadingProgress(loadingProgress) {
        this._mdcLinearProgress.progress = loadingProgress
    }
    showDialog(newDialog) {
        this._elemPlaceholderDialog.innerHTML =
            this._template.createDialogHtml(newDialog.title, newDialog.content)
        const dialog = new MainView.MDCDialog(document.querySelector('.mdc-dialog'))
        dialog.open()
    }
    showContextMenu(x, y, word) {
        this._elemPlaceholderContextMenu.innerHTML = this._template.createContextMenuHtml(
            [
                new MenuItem("menu-rhymer", "tab_rhymer_title"),
                new MenuItem("menu-thesaurus", "tab_thesaurus_title"),
                new MenuItem("menu-dictionary", "tab_dictionary_title"),
            ]
        )
        const mdcMenu = new MainView.MDCMenu(document.querySelector(".mdc-menu"))
        mdcMenu.setAbsolutePosition(x, y)
        mdcMenu.open = true
        mdcMenu.listen('click', (e) =>{
            var selectedTab = this.contextMenuItemIdToTab(e.target.id)
            if (selectedTab == MainViewModel.TabIndex.RHYMER) {
                this.searchRhymes(word)
            } else if (selectedTab == MainViewModel.TabIndex.THESAURUS) {
                this.searchThesaurus(word)
            } else if (selectedTab == MainViewModel.TabIndex.DICTIONARY) {
                this.searchDefinitions(word)
            }
            if (selectedTab != undefined) this.switchToTab(selectedTab)
        })
    }
    contextMenuItemIdToTab(contextMenuItemId) {
        if (contextMenuItemId == "menu-rhymer") return MainViewModel.TabIndex.RHYMER
        else if (contextMenuItemId == "menu-thesaurus") return MainViewModel.TabIndex.THESAURUS
        else if (contextMenuItemId == "menu-dictionary") return MainViewModel.TabIndex.DICTIONARY
        else return undefined
    }
}
MainView.MDCDialog = mdc.dialog.MDCDialog
MainView.MDCLinearProgress = mdc.linearProgress.MDCLinearProgress
MainView.MDCList = mdc.list.MDCList
MainView.MDCMenu = mdc.menu.MDCMenu
MainView.MDCTabBar = mdc.tabBar.MDCTabBar
MainView.MDCTextField = mdc.textField.MDCTextField
function main_view_init() {
    var mainView = new MainView()
}