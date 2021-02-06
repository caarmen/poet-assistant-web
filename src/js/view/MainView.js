/**
Copyright (c) 2021 - present Carmen Alvarez

This file is part of Poet Assistant.

Poet Assistant is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Poet Assistant is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Poet Assistant.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';
class MainView {

    constructor() {
        this._elemPlaceholderAppBar = document.querySelector("#placeholder-app-bar")
        this._elemPlaceholderProgressIndicator = document.querySelector("#placeholder-progress-indicator")
        this._elemPlaceholderSuggestions = document.querySelector("#placeholder-suggestions")
        this._elemPlaceholderDialog = document.querySelector("#placeholder-dialog")

        this._elemPlaceholderRhymes = document.querySelector("#placeholder-rhymes")
        this._elemPlaceholderRhymesList = document.querySelector("#placeholder-rhymes-list")
        this._elemPlaceholderRhymesEmpty = document.querySelector("#placeholder-rhymes-empty")

        this._elemPlaceholderThesaurus = document.querySelector("#placeholder-thesaurus")
        this._elemPlaceholderThesaurusList = document.querySelector("#placeholder-thesaurus-list")
        this._elemPlaceholderThesaurusEmpty = document.querySelector("#placeholder-thesaurus-empty")

        this._elemPlaceholderDefinitions = document.querySelector("#placeholder-definitions")
        this._elemPlaceholderDefinitionsList = document.querySelector("#placeholder-definitions-list")
        this._elemPlaceholderDefinitionsEmpty = document.querySelector("#placeholder-definitions-empty")

        this._elemPlaceholderReader = document.querySelector("#placeholder-reader")
        this._elemPlaceholderReaderInput = document.querySelector("#placeholder-reader-input")
        this._elemPlaceholderReaderPlayButton = document.querySelector("#placeholder-reader-play-button")
        this._elemPlaceholderReaderVoices = document.querySelector("#placeholder-reader-voices")

        this._elemPlaceholderTabBar
        this._elemPlacholderInputTextSearch

        this._mdcListRhymes
        this._mdcListThesaurus
        this._mdcLinearProgress
        this._mdcInputTextSearch
        this._mdcMenuVoices

        this._elemActionItemAbout
        this._elemTabRhymer
        this._elemTabDictionary
        this._elemTabReader
        this._elemBtnSearch
        this._elemBtnPlay
        this._elemBtnPlayIcon
        this._elemReaderVoices
        this._elemReaderSelectedVoice

        this._template = new Template()
        this._template.loadTemplates().then(() => {
            this._viewContextMenu = new ContextMenuView(this._template)
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
                new TabData("tab_dictionary", "tab_dictionary_title"),
                new TabData("tab_reader", "tab_reader_title")
            ])
        this._elemPlacholderInputTextSearch = document.querySelector("#placeholder-input-text-search")
        this._elemPlaceholderBtnSearch = document.querySelector("#placeholder-btn-search")

        this._elemPlaceholderProgressIndicator.innerHTML = this._template.createProgressIndicatorHtml("progressbar_label")
        this._elemPlacholderInputTextSearch.innerHTML = this._template.createInputTextHtml("input-text-search", "btn_search_title")
        this._elemPlaceholderBtnSearch.innerHTML = this._template.createButtonIconHtml("btn-search", "search", "btn_search_title")

        this._elemPlaceholderReaderInput.innerHTML = this._template.createTextareaHtml("input-text-reader", "reader_hint")
        this._elemPlaceholderReaderPlayButton.innerHTML = this._template.createButtonIconHtml("btn-play", "play_circle_filled", "btn_play_title")
        this._elemPlaceholderReaderVoices.innerHTML = this._template.createVoiceSelectionHtml()
        this._template._i18n.translateElement(this._elemPlaceholderReaderVoices)
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
        this._elemTabReader = document.querySelector("#tab_reader")

        this._mdcLinearProgress = new MainView.MDCLinearProgress(document.querySelector('.mdc-linear-progress'))
        this._mdcLinearProgress.determinate = true
        this._mdcLinearProgress.progress = 0
        this._mdcLinearProgress.open()

        this._mdcInputTextSearch = new MainView.MDCTextField(document.querySelector("#input-text-search"))
        this._elemBtnSearch = document.querySelector("#btn-search")
        this._elemBtnSearch.disabled = true

        this._mdcInputTextReader = new MainView.MDCTextField(document.querySelector("#input-text-reader"))
        this._elemBtnPlay = document.querySelector("#btn-play")
        this._elemBtnPlayIcon = document.querySelector("#btn-play-icon")
        this._elemReaderVoices = document.querySelector("#placeholder-reader-voices #voices-menu")
        this._elemReaderSelectedVoice = document.querySelector("#placeholder-reader-voices #selected-voice")
    }

    bindViewModel() {
        // viewmodel -> view bindings
        this._viewModel.isLoading.observer = (isLoading) => { this.showLoading(isLoading && !this._template.isLoaded) }
        this._viewModel.rhymes.observer = (newRhymes) => { this.showRhymes(newRhymes) }
        this._viewModel.thesaurusEntries.observer = (newThesaurusEntries) => { this.showThesaurus(newThesaurusEntries) }
        this._viewModel.definitions.observer = (newDefinitions) => { this.showDefinitions(newDefinitions) }
        this._viewModel.suggestions.observer = (newSuggestions) => { this.showSuggestions(newSuggestions) }
        this._viewModel.activeTab.observer = (newActiveTab) => { this.switchToTab(newActiveTab) }
        this._viewModel.loadingProgress.observer = (newLoadingProgress) => { this.updateLoadingProgress(newLoadingProgress) }
        this._viewModel.isSpeechPlaying.observer = (newIsSpeechPlaying) => { this.updateSpeechPlayingState(newIsSpeechPlaying) }
        if (this._viewModel.voices.value != undefined) this.updateVoicesList(this._viewModel.voices.value)
        this._viewModel.voices.observer = (newVoices) => this.updateVoicesList(newVoices)
        if (!this._viewModel.isSpeechSynthesisSupported()) {
            this._elemTabReader.style.display = "none"
        }

        // view -> viewmodel bindings
        this._mdcInputTextSearch.foundation.adapter.registerTextFieldInteractionHandler('keydown', ((evt) => {
            if (evt.keyCode == 13) this.searchAll()
        }))
        this._mdcInputTextSearch.foundation.adapter.registerTextFieldInteractionHandler('input', ((evt) => {
            this._viewModel.fetchSuggestions(this._mdcInputTextSearch.value)
        }))
        this._mdcInputTextReader.foundation.adapter.registerTextFieldInteractionHandler('input', ((evt) => {
            this._elemBtnPlay.disabled = this._mdcInputTextReader.value.length == 0
        }))
        this._elemBtnSearch.onclick = () => { this.searchAll() }
        this._elemActionItemAbout.onclick = () => { this.showAbout() }
        this._elemBtnPlay.disabled = true
        this._elemBtnPlay.onclick = () => { this.readPoem() }
        this._viewContextMenu.observer = (word, index) => { this._viewModel.onContextMenuItemSelected(word, index) }
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
            this._elemPlaceholderRhymes.style.display = "block"
            this._elemPlaceholderThesaurus.style.display = "none"
            this._elemPlaceholderDefinitions.style.display = "none"
            this._elemPlaceholderReader.style.display = "none"
        } else if (tabIndex == MainViewModel.TabIndex.THESAURUS) {
            this._elemPlaceholderRhymes.style.display = "none"
            this._elemPlaceholderThesaurus.style.display = "block"
            this._elemPlaceholderDefinitions.style.display = "none"
            this._elemPlaceholderReader.style.display = "none"
        } else if (tabIndex == MainViewModel.TabIndex.DICTIONARY) {
            this._elemPlaceholderRhymes.style.display = "none"
            this._elemPlaceholderThesaurus.style.display = "none"
            this._elemPlaceholderDefinitions.style.display = "block"
            this._elemPlaceholderReader.style.display = "none"
        } else if (tabIndex == MainViewModel.TabIndex.READER) {
            this._elemPlaceholderRhymes.style.display = "none"
            this._elemPlaceholderThesaurus.style.display = "none"
            this._elemPlaceholderDefinitions.style.display = "none"
            this._elemPlaceholderReader.style.display = "block"
        }
    }
    searchAll() {
        this._elemPlaceholderSuggestions.style.display = "none"
        this._viewModel.fetchAll(this._mdcInputTextSearch.value)
    }

    showRhymes(rhymes) {
        this._elemPlaceholderRhymesList.innerHTML = this._template.createListHtml("list-rhymes", rhymes.word, rhymes.listItems)
        this.setListVisibility(rhymes.listItems, this._elemPlaceholderRhymesList, this._elemPlaceholderRhymesEmpty, "no_results_rhymes", rhymes.word)
        this._mdcListRhymes = new MainView.MDCList(document.querySelector("#list-rhymes"))
        this.listenForListItemWordClicks(this._mdcListRhymes)
    }

    showThesaurus(thesaurusEntries) {
        this._elemPlaceholderThesaurusList.innerHTML = this._template.createListHtml("list-thesaurus", thesaurusEntries.word, thesaurusEntries.listItems)
        this.setListVisibility(thesaurusEntries.listItems, this._elemPlaceholderThesaurusList, this._elemPlaceholderThesaurusEmpty, "no_results_thesaurus", thesaurusEntries.word)
        this._mdcListThesaurus = new MainView.MDCList(document.querySelector("#list-thesaurus"))
        this.listenForListItemWordClicks(this._mdcListThesaurus)
    }

    listenForListItemWordClicks(mdcList) {
        mdcList.listen('click', (e) => {
            if (e.target.classList.contains("word-list-item")) {
                this._viewContextMenu.showContextMenu(e.target, e.target.innerText, this._viewModel.contextMenuItems)
            }
        })
    }

    showDefinitions(definitions) {
        this._elemPlaceholderDefinitionsList.innerHTML = this._template.createDictionaryListHtml("list-definitions", definitions.word, definitions.listItems)
        this.setListVisibility(definitions.listItems, this._elemPlaceholderDefinitionsList, this._elemPlaceholderDefinitionsEmpty, "no_results_definitions", definitions.word)
    }

    showSuggestions(suggestions) {
        if (suggestions.length > 0) {
            this._elemPlaceholderSuggestions.innerHTML = this._template.createContextMenuHtml(suggestions)
            this._elemPlaceholderSuggestions.style.display = "block"
            const mdcMenu = new MainView.MDCMenu(this._elemPlaceholderSuggestions.querySelector(".mdc-menu"))
            mdcMenu.setAnchorCorner(MainView.MDCMenuCorner.BOTTOM_LEFT)
            mdcMenu.setAnchorElement(this._elemPlacholderInputTextSearch)
            mdcMenu.setFixedPosition(true)
            mdcMenu.setDefaultFocusState(MainView.DefaultFocusState.NONE)
            mdcMenu.quickOpen = true
            mdcMenu.open = true
            mdcMenu.listen('MDCMenu:selected', (e) => {
                this._mdcInputTextSearch.value = suggestions[e.detail.index].label
                this._elemBtnSearch.click()
            })
        } else {
            this._elemPlaceholderSuggestions.style.display = "none"
        }
    }

    setListVisibility(listData, elemList, elemEmpty, emptyText, word) {
        if (listData && listData.length > 0) {
            elemList.style.display = "block"
            elemEmpty.style.display = "none"
            elemEmpty.innerHTML = ""
        } else {
            elemEmpty.innerHTML = this._template.createListEmptyHtml(emptyText, word)
            elemList.style.display = "none"
            elemEmpty.style.display = "block"
        }
    }

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
    updateSpeechPlayingState(newIsSpeechPlaying) {
        if (newIsSpeechPlaying) {
            this._elemBtnPlayIcon.innerText = "stop"
        } else {
            this._elemBtnPlayIcon.innerText = "play_circle_filled"
        }
    }
    showAbout() {
        var aboutHtml = this._template.createAboutHtml()
        this._elemPlaceholderDialog.innerHTML =
            this._template.createDialogHtml("about_title", aboutHtml)
        this._template._i18n.translateElement(this._elemPlaceholderDialog)
        const dialog = new MainView.MDCDialog(document.querySelector('.mdc-dialog'))
        dialog.open()
    }
    readPoem() {
        var textInput = this._elemPlaceholderReaderInput.querySelector(".mdc-text-field__input")
        this._viewModel.playText(this._mdcInputTextReader.value, textInput.selectionStart, textInput.selectionEnd)
    }
    updateVoicesList(voices) {
        this._elemReaderVoices.innerHTML = this._template.createContextMenuHtml(voices)
        this.mdcMenuVoices = new MainView.MDCMenu(this._elemReaderVoices.querySelector(".mdc-menu"))
        this.mdcMenuVoices.setAnchorCorner(MainView.MDCMenuCorner.BOTTOM_LEFT)
        this.mdcMenuVoices.setAnchorElement(this._elemReaderSelectedVoice)
        this.mdcMenuVoices.setFixedPosition(true)
        this.mdcMenuVoices.listen('MDCMenu:selected', (e) => {
            this._viewModel.selectVoice(e.detail.index)
            this._elemReaderSelectedVoice.innerText = voices[e.detail.index].label
        })
        if (voices.length > 0) {
            this._elemReaderSelectedVoice.innerText = voices[0].label
            this._viewModel.selectVoice(0)
        }
        this._elemReaderSelectedVoice.onclick = () => {
            this.mdcMenuVoices.open = true
        }
    }
}
MainView.MDCDialog = mdc.dialog.MDCDialog
MainView.MDCLinearProgress = mdc.linearProgress.MDCLinearProgress
MainView.MDCList = mdc.list.MDCList
MainView.MDCMenu = mdc.menu.MDCMenu
MainView.MDCMenuCorner = mdc.menu.Corner
MainView.DefaultFocusState = mdc.menu.DefaultFocusState
MainView.MDCTabBar = mdc.tabBar.MDCTabBar
MainView.MDCTextField = mdc.textField.MDCTextField
function main_view_init() {
    var mainView = new MainView()
}