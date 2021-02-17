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
        this._elemPlaceholderAppProgressIndicator = document.querySelector("#placeholder-app-progress-indicator")
        this._elemPlaceholderDialog = document.querySelector("#placeholder-dialog")

        this._elemPlacholderInputTextSearch

        this._mdcLinearProgress
        this._mdcInputTextSearch

        this._elemProgressBarLabel
        this._elemActionItemMenu
        this._elemBtnSearch
        this._elemBtnClearSearchText
        this._elemBtnPlay
        this._elemBtnPlayIcon

        this._i18n = new I18n()
        this._viewModel = new MainViewModel()

        this._viewAppBarMenu

        this._i18n.load().then(() => {
            this._viewModel.loadTemplates().then((templates) => {
                this._template = new Template(this._i18n, templates)
                this._viewContextMenu = new ContextMenuView(this._template)
                this._viewSuggestions = new SuggestionsView(this._template)
                this._viewRhymer = new RhymerView(this._template)
                this._viewThesaurus = new ThesaurusView(this._template)
                this._viewDefinitions = new DefinitionsView(this._template)
                this._viewReader = new ReaderView(this._i18n, this._template)
                this._viewVoiceSettings = new VoiceSettingsView(this._i18n, this._template)
                this._viewTabs = new TabsView(this._template,
                    [
                        new TabData("tab_rhymer", "tab_rhymer_title", "placeholder-rhymes"),
                        new TabData("tab_thesaurus", "tab_thesaurus_title", "placeholder-thesaurus"),
                        new TabData("tab_dictionary", "tab_dictionary_title", "placeholder-definitions"),
                        new TabData("tab_reader", "tab_reader_title", "placeholder-reader")
                    ])
                this._applyTemplates()
                this._initializeViews()
                this._bindViewModel()
                this._viewModel.loadDb()
            })
        })
    }
    _applyTemplates() {
        this._elemPlaceholderAppBar.innerHTML = this._template.createAppBarHtml("app-bar", "app_name")

        this._elemPlacholderInputTextSearch = document.querySelector("#placeholder-input-text-search")

        this._elemPlaceholderAppProgressIndicator.innerHTML = this._template.createLinearProgressIndicatorHtml()
        this._elemProgressBarLabel = document.querySelector("#progressbar-label")
        this._elemPlacholderInputTextSearch.innerHTML = this._template.createInputTextHtml("input-text-search", "btn_search_title")

        this._viewTabs._applyTemplates()
    }

    _initializeViews() {
        this._elemActionItemMenu = document.querySelector("#menu_overflow")
        this._viewAppBarMenu = new AppBarMenuView(this._elemActionItemMenu, this._template)

        this._mdcLinearProgress = new MainView.MDCLinearProgress(document.querySelector('.mdc-linear-progress'))
        this._elemProgressBarLabel.innerText = this._i18n.translate("progressbar_app_label")
        this._mdcLinearProgress.determinate = false
        this._mdcLinearProgress.progress = 0
        this._mdcLinearProgress.open()

        this._mdcInputTextSearch = new MainView.MDCTextField(document.querySelector("#input-text-search"))
        this._elemBtnSearch = document.querySelector("#btn-search")
        this._elemBtnSearch.disabled = true
        this._elemBtnClearSearchText = document.querySelector("#btn-clear-search-text")
        this._elemBtnClearSearchText.style.display = "none"

        this._viewTabs._initializeViews()
    }

    _bindViewModel() {
        // viewmodel -> view bindings
        this._viewModel.isLoading.observer = (isLoading) => { this._showLoading(isLoading && !this._template.isLoaded) }
        this._viewModel.searchTextDisabled.observer = (isDisabled) => this._mdcInputTextSearch.disabled = isDisabled
        this._viewModel.searchButtonDisabled.observer = (isDisabled) => this._elemBtnSearch.disabled = isDisabled
        this._viewModel.clearSearchTextButtonVisible.observer = (isVisible) => this._updateClearSearchTextButtonVisibility(isVisible)
        this._viewModel.rhymes.observer = (newRhymes) => { this._viewRhymer.showRhymes(newRhymes) }
        this._viewModel.thesaurusEntries.observer = (newThesaurusEntries) => { this._viewThesaurus.showThesaurus(newThesaurusEntries) }
        this._viewModel.definitions.observer = (newDefinitions) => { this._viewDefinitions.showDefinitions(newDefinitions) }
        this._viewModel.suggestions.observer = (newSuggestions) => { this._viewSuggestions.showSuggestions(this._elemPlacholderInputTextSearch, newSuggestions) }
        this._viewModel.activeTab.observer = (newActiveTab) => { this._viewTabs.switchToTab(newActiveTab) }
        this._viewModel.loadingProgress.observer = (newLoadingProgress) => { this._updateLoadingProgress(newLoadingProgress) }
        this._viewModel.isSpeechPlaying.observer = (newIsSpeechPlaying) => { this._viewReader.updateSpeechPlayingState(newIsSpeechPlaying) }
        this._viewModel.voices.observer = (newVoices) => this._viewVoiceSettings.updateVoicesList(newVoices)
        this._viewModel.isReaderTabVisible.observer = (isVisible) => { this._updateReaderTabVisibility(isVisible) }
        this._viewModel.dialogInfo.observer = (dialogInfo) => { this._showDialog(dialogInfo) }
        this._viewModel.isRhymerLoading.observer = (isLoading) => { this._viewRhymer.setLoading(isLoading) }
        this._viewModel.isThesaurusLoading.observer = (isLoading) => { this._viewThesaurus.setLoading(isLoading) }
        this._viewModel.isDefinitionsLoading.observer = (isLoading) => { this._viewDefinitions.setLoading(isLoading) }

        // view -> viewmodel bindings
        this._viewTabs.observer = (tabIndex) => {
            if (tabIndex == MainViewModel.TabIndex.READER) this._viewVoiceSettings.layout()
            this._viewModel.activeTab.value = tabIndex
        }
        this._viewAppBarMenu.observer = (index) => { this._viewModel.onAppMenuItemSelected(index) }
        this._mdcInputTextSearch.foundation.adapter.registerTextFieldInteractionHandler('keydown', ((evt) => {
            if (evt.keyCode == 13) this._searchAll()
        }))
        this._mdcInputTextSearch.foundation.adapter.registerTextFieldInteractionHandler('input', ((evt) => {
            this._viewModel.onSearchTextInput(this._mdcInputTextSearch.value)
        }))
        this._elemBtnSearch.onclick = () => { this._searchAll() }
        this._elemBtnClearSearchText.onclick = () => { this._onClearSearchTextClicked() }
        this._elemActionItemMenu.onclick = () => { this._viewAppBarMenu.showAppBarMenu(this._viewModel.appBarMenuItems) }
        this._viewContextMenu.observer = (word, index) => { this._viewModel.onContextMenuItemSelected(word, index) }
        this._viewSuggestions.observer = (word) => { this._onSuggestionSelected(word) }

        this._viewRhymer.wordClickedObserver = (wordElem) => { this._onWordElemClicked(wordElem) }
        this._viewThesaurus.wordClickedObserver = (wordElem) => { this._onWordElemClicked(wordElem) }
        this._viewDefinitions.wordClickedObserver = (wordElem) => { this._onWordElemClicked(wordElem) }
        this._viewReader.onPlayClickedObserver = (poemText, selectionStart, selectionEnd) => {
            this._viewModel.playText(poemText, selectionStart, selectionEnd)
        }
        this._viewVoiceSettings.voiceSelectonObserver = (selectedVoiceIndex) => { this._viewModel.selectVoice(selectedVoiceIndex) }
        this._viewVoiceSettings.pitchObserver = (pitchValue) => { this._viewModel.setVoicePitch(pitchValue) }
        this._viewVoiceSettings.speedObserver = (speedValue) => { this._viewModel.setVoiceSpeed(speedValue) }
    }

    _updateReaderTabVisibility(isVisible) {
        if (!isVisible) this._viewTabs.hideTab(MainViewModel.TabIndex.READER)
        else this._viewTabs.showTab(MainViewModel.TabIndex.READER)
    }
    _updateClearSearchTextButtonVisibility(isVisible) {
        if (isVisible) this._elemBtnClearSearchText.style.display = "inline-block"
        else this._elemBtnClearSearchText.style.display = "none"
    }
    _onClearSearchTextClicked() {
        this._mdcInputTextSearch.value = ""
        this._viewModel.onSearchTextInput(this._mdcInputTextSearch.value)
    }
    _searchAll() {
        this._viewSuggestions.hide()
        this._viewModel.fetchAll(this._mdcInputTextSearch.value)
    }

    _onSuggestionSelected(word) {
        this._mdcInputTextSearch.value = word
        this._elemBtnSearch.click()
    }

    _onWordElemClicked(wordElem) {
        this._viewContextMenu.showContextMenu(wordElem, wordElem.innerText, this._viewModel.contextMenuItems)
    }

    _showLoading(isLoading) {
        if (isLoading) {
            this._elemPlaceholderAppProgressIndicator.style.display = "block"
            this._mdcLinearProgress.open()
        } else {
            this._mdcLinearProgress.close()
            this._elemPlaceholderAppProgressIndicator.style.display = "none"
        }
    }
    _updateLoadingProgress(loadingProgress) {
        if (!this._mdcLinearProgress.determinate) {
            this._mdcLinearProgress.close()
            this._mdcLinearProgress.determinate = true
            this._mdcLinearProgress.open()
        }
        this._elemProgressBarLabel.innerText = this._i18n.translate("progressbar_db_label", Math.round(loadingProgress * 100))
        this._mdcLinearProgress.progress = loadingProgress
    }
    _showMenu = () => this._viewAppBarMenu.showAppBarMenu(this._viewModel.appBarMenuItems)

    _showDialog(dialogInfo) {
        const contentHtml = this._template.createHtml(dialogInfo.contentTemplateId, dialogInfo.templateParameters)
        this._elemPlaceholderDialog.innerHTML =
            this._template.createDialogHtml(dialogInfo.title, contentHtml)
        this._i18n.translateElement(this._elemPlaceholderDialog)
        const dialog = new MainView.MDCDialog(document.querySelector('.mdc-dialog'))
        dialog.open()
    }
}
MainView.MDCDialog = mdc.dialog.MDCDialog
MainView.MDCLinearProgress = mdc.linearProgress.MDCLinearProgress
MainView.MDCTextField = mdc.textField.MDCTextField
function main_view_init() {
    const mainView = new MainView()
}
