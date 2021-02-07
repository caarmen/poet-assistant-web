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

        this._elemPlacholderInputTextSearch

        this._mdcLinearProgress
        this._mdcInputTextSearch

        this._elemActionItemAbout
        this._elemBtnSearch
        this._elemBtnPlay
        this._elemBtnPlayIcon

        this._template = new Template()
        this._template.loadTemplates().then(() => {
            this._viewContextMenu = new ContextMenuView(this._template)
            this._viewSuggestions = new SuggestionsView(this._template)
            this._viewRhymer = new RhymerView(this._template)
            this._viewThesaurus = new ThesaurusView(this._template)
            this._viewDefinitions = new DefinitionsView(this._template)
            this._viewReader = new ReaderView(this._template)
            this._viewVoiceSettings = new VoiceSettingsView(this._template)
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

        this._viewTabs.initializeViews()
    }

    bindViewModel() {
        // viewmodel -> view bindings
        this._viewModel.isLoading.observer = (isLoading) => { this.showLoading(isLoading && !this._template.isLoaded) }
        this._viewModel.searchTextDisabled.observer = (isDisabled) => this._mdcInputTextSearch.disabled = isDisabled
        this._viewModel.searchButtonDisabled.observer = (isDisabled) => this._elemBtnSearch.disabled = isDisabled
        this._viewModel.rhymes.observer = (newRhymes) => { this._viewRhymer.showRhymes(newRhymes) }
        this._viewModel.thesaurusEntries.observer = (newThesaurusEntries) => { this._viewThesaurus.showThesaurus(newThesaurusEntries) }
        this._viewModel.definitions.observer = (newDefinitions) => { this._viewDefinitions.showDefinitions(newDefinitions) }
        this._viewModel.suggestions.observer = (newSuggestions) => { this._viewSuggestions.showSuggestions(this._elemPlacholderInputTextSearch, newSuggestions) }
        this._viewModel.activeTab.observer = (newActiveTab) => { this._viewTabs.switchToTab(newActiveTab) }
        this._viewModel.loadingProgress.observer = (newLoadingProgress) => { this.updateLoadingProgress(newLoadingProgress) }
        this._viewModel.isSpeechPlaying.observer = (newIsSpeechPlaying) => { this._viewReader.updateSpeechPlayingState(newIsSpeechPlaying) }
        if (this._viewModel.voices.value != undefined) this._viewVoiceSettings.updateVoicesList(this._viewModel.voices.value)
        this._viewModel.voices.observer = (newVoices) => this._viewVoiceSettings.updateVoicesList(newVoices)
        if (!this._viewModel.isSpeechSynthesisSupported()) {
            this._viewTabs.hideTab(MainViewModel.TabIndex.READER)
        }

        // view -> viewmodel bindings
        this._viewTabs.observer = (tabIndex) => {
            if (tabIndex == MainViewModel.TabIndex.READER) this._viewVoiceSettings.layout()
        }
        this._mdcInputTextSearch.foundation.adapter.registerTextFieldInteractionHandler('keydown', ((evt) => {
            if (evt.keyCode == 13) this.searchAll()
        }))
        this._mdcInputTextSearch.foundation.adapter.registerTextFieldInteractionHandler('input', ((evt) => {
            this._viewModel.onSearchTextInput(this._mdcInputTextSearch.value)
        }))
        this._elemBtnSearch.onclick = () => { this.searchAll() }
        this._elemActionItemAbout.onclick = () => { this.showAbout() }
        this._viewContextMenu.observer = (word, index) => { this._viewModel.onContextMenuItemSelected(word, index) }
        this._viewSuggestions.observer = (word) => { this.onSuggestionSelected(word) }

        this._viewRhymer.wordClickedObserver = (wordElem) => { this.onWordElemClicked(wordElem) }
        this._viewThesaurus.wordClickedObserver = (wordElem) => { this.onWordElemClicked(wordElem) }
        this._viewDefinitions.wordClickedObserver = (wordElem) => { this.onWordElemClicked(wordElem) }
        this._viewReader.onPlayClickedObserver = (poemText, selectionStart, selectionEnd) => {
            this._viewModel.playText(poemText, selectionStart, selectionEnd)
        }
        this._viewVoiceSettings.voiceSelectonObserver = (selectedVoiceIndex) => { this._viewModel.selectVoice(selectedVoiceIndex) }
        this._viewVoiceSettings.pitchObserver = (pitchValue) => { this._viewModel.setVoicePitch(pitchValue) }
        this._viewVoiceSettings.speedObserver = (speedValue) => { this._viewModel.setVoiceSpeed(speedValue) }
        this._viewVoiceSettings.openedEmptyVoiceListObserver = () => { this._viewModel.requeryVoices() }
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

    showLoading(isLoading) {
        if (isLoading) {
            this._elemPlaceholderProgressIndicator.style.display = "block"
            this._mdcLinearProgress.open()
        } else {
            this._mdcLinearProgress.close()
            this._elemPlaceholderProgressIndicator.style.display = "none"
        }
    }
    updateLoadingProgress(loadingProgress) {
        this._mdcLinearProgress.progress = loadingProgress
    }
    showAbout() {
        var aboutHtml = this._template.createAboutHtml()
        this._elemPlaceholderDialog.innerHTML =
            this._template.createDialogHtml("about_title", aboutHtml)
        this._template._i18n.translateElement(this._elemPlaceholderDialog)
        const dialog = new MainView.MDCDialog(document.querySelector('.mdc-dialog'))
        dialog.open()
    }
}
MainView.MDCDialog = mdc.dialog.MDCDialog
MainView.MDCLinearProgress = mdc.linearProgress.MDCLinearProgress
MainView.MDCTextField = mdc.textField.MDCTextField
function main_view_init() {
    var mainView = new MainView()
}