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
        this._elemPlaceholderDialog = document.querySelector("#placeholder-dialog")

        this._elemPlaceholderDefinitionsList = document.querySelector("#placeholder-definitions-list")
        this._elemPlaceholderDefinitionsEmpty = document.querySelector("#placeholder-definitions-empty")

        this._elemPlaceholderReaderInput = document.querySelector("#placeholder-reader-input")
        this._elemPlaceholderReaderPlayButton = document.querySelector("#placeholder-reader-play-button")

        this._elemPlacholderInputTextSearch

        this._mdcLinearProgress
        this._mdcInputTextSearch

        this._elemActionItemAbout
        this._elemBtnSearch
        this._elemBtnPlay
        this._elemBtnPlayIcon

        this._listVisibility

        this._template = new Template()
        this._template.loadTemplates().then(() => {
            this._listVisibility = new ListVisibility(this._template)
            this._viewContextMenu = new ContextMenuView(this._template)
            this._viewSuggestions = new SuggestionsView(this._template)
            this._viewRhymer = new RhymerView(this._template)
            this._viewThesaurus = new ThesaurusView(this._template)
            this._viewVoicesList = new VoicesListView(this._template)
            this._viewTabs = new TabsView(this._template,
                [
                    new TabData("tab_rhymer", "tab_rhymer_title", "placeholder-rhymes"),
                    new TabData("tab_thesaurus", "tab_thesaurus_title", "placeholder-thesaurus"),
                    new TabData("tab_dictionary", "tab_dictionary_title", "placeholder-definitions"),
                    new TabData("tab_reader", "tab_reader_title", "placeholder-reader")
                ])
            this.applyTemplates()
            this.initializeViews()
            this._viewModel = new MainViewModel()
            this.bindViewModel()
        })
    }
    applyTemplates() {
        this._elemPlaceholderAppBar.innerHTML = this._template.createAppBarHtml("app-bar", "app_name",
            [new AppBarActionItem("action_item_about", "action_item_label_about", "info")])
        this._elemPlacholderInputTextSearch = document.querySelector("#placeholder-input-text-search")
        this._elemPlaceholderBtnSearch = document.querySelector("#placeholder-btn-search")

        this._elemPlaceholderProgressIndicator.innerHTML = this._template.createProgressIndicatorHtml("progressbar_label")
        this._elemPlacholderInputTextSearch.innerHTML = this._template.createInputTextHtml("input-text-search", "btn_search_title")
        this._elemPlaceholderBtnSearch.innerHTML = this._template.createButtonIconHtml("btn-search", "search", "btn_search_title")

        this._elemPlaceholderReaderInput.innerHTML = this._template.createTextareaHtml("input-text-reader", "reader_hint")
        this._elemPlaceholderReaderPlayButton.innerHTML = this._template.createButtonIconHtml("btn-play", "play_circle_filled", "btn_play_title")
        this._viewTabs.applyTemplates()
    }

    initializeViews() {
        this._elemActionItemAbout = document.querySelector("#action_item_about")

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
        this._viewTabs.initializeViews()
    }

    bindViewModel() {
        // viewmodel -> view bindings
        this._viewModel.isLoading.observer = (isLoading) => { this.showLoading(isLoading && !this._template.isLoaded) }
        this._viewModel.rhymes.observer = (newRhymes) => { this._viewRhymer.showRhymes(newRhymes) }
        this._viewModel.thesaurusEntries.observer = (newThesaurusEntries) => { this._viewThesaurus.showThesaurus(newThesaurusEntries) }
        this._viewModel.definitions.observer = (newDefinitions) => { this.showDefinitions(newDefinitions) }
        this._viewModel.suggestions.observer = (newSuggestions) => { this._viewSuggestions.showSuggestions(this._elemPlacholderInputTextSearch, newSuggestions) }
        this._viewModel.activeTab.observer = (newActiveTab) => { this._viewTabs.switchToTab(newActiveTab) }
        this._viewModel.loadingProgress.observer = (newLoadingProgress) => { this.updateLoadingProgress(newLoadingProgress) }
        this._viewModel.isSpeechPlaying.observer = (newIsSpeechPlaying) => { this.updateSpeechPlayingState(newIsSpeechPlaying) }
        if (this._viewModel.voices.value != undefined) this._viewVoicesList.updateVoicesList(this._viewModel.voices.value)
        this._viewModel.voices.observer = (newVoices) => this._viewVoicesList.updateVoicesList(newVoices)
        if (!this._viewModel.isSpeechSynthesisSupported()) {
            this._viewTabs.hideTab(MainViewModel.TabIndex.READER)
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
        this._viewSuggestions.observer = (word) => { this.onSuggestionSelected(word) }
        this._viewRhymer.wordClickedObserver = (wordElem) => { this.onWordElemClicked(wordElem) }
        this._viewThesaurus.wordClickedObserver = (wordElem) => { this.onWordElemClicked(wordElem) }
        this._viewVoicesList.observer = (selectedVoiceIndex) => { this._viewModel.selectVoice(selectedVoiceIndex) }
    }

    searchAll() {
        this._viewSuggestions.hide()
        this._viewModel.fetchAll(this._mdcInputTextSearch.value)
    }

    onSuggestionSelected(word) {
        this._mdcInputTextSearch.value = word
        this._elemBtnSearch.click()
    }

    onWordElemClicked(wordElem) {
        this._viewContextMenu.showContextMenu(wordElem, wordElem.innerText, this._viewModel.contextMenuItems)
    }
    listenForListItemWordClicks(elemListId) {
        var mdcList = new MainView.MDCList(document.querySelector(elemListId))
        mdcList.listen('click', (e) => {
            if (e.target.classList.contains("word-list-item")) {
                this._viewContextMenu.showContextMenu(e.target, e.target.innerText, this._viewModel.contextMenuItems)
            }
        })
    }

    showDefinitions(definitions) {
        this._elemPlaceholderDefinitionsList.innerHTML = this._template.createDictionaryListHtml("list-definitions", definitions.word, definitions.listItems)
        this._listVisibility.setListVisibility(definitions.listItems, this._elemPlaceholderDefinitionsList, this._elemPlaceholderDefinitionsEmpty, "no_results_definitions", definitions.word)
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
}
MainView.MDCDialog = mdc.dialog.MDCDialog
MainView.MDCLinearProgress = mdc.linearProgress.MDCLinearProgress
MainView.MDCList = mdc.list.MDCList
MainView.MDCTextField = mdc.textField.MDCTextField
function main_view_init() {
    var mainView = new MainView()
}