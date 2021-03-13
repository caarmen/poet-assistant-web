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
        this._elemPlaceholderSnackbar = document.querySelector("#placeholder-snackbar")

        this._elemPlacholderInputTextSearch

        this._mdcLinearProgress
        this._mdcInputTextSearch

        this._elemProgressBarLabel
        this._elemActionItemMenu
        this._elemBtnSearch
        this._elemBtnClearSearchText
        this._elemBtnPlay
        this._elemBtnPlayIcon

        this._mainViewModel = new MainViewModel()

        this._viewAppBarMenu

        this._mainViewModel.loadTranslations().then(() => {
            this._mainViewModel.loadTemplates().then((templates) => {
                this._template = new Template(this._mainViewModel.i18n, templates)
                this._viewContextMenu = new ContextMenuView(this._template)
                this._viewSuggestions = new SuggestionsView(this._template)
                this._viewRhymer = new RhymerView(this._mainViewModel.i18n, this._template)
                this._viewThesaurus = new ThesaurusView(this._mainViewModel.i18n, this._template)
                this._viewDefinitions = new DefinitionsView(this._mainViewModel.i18n, this._template)
                this._viewReader = new ReaderView(this._mainViewModel.i18n, this._template)
                this._viewVoiceSettings = new VoiceSettingsView(this._mainViewModel.i18n, this._template)
                this._viewTabs = new TabsView(this._template,
                    [
                        new TabData("tab_rhymer", "tab_rhymer_title", "placeholder-rhymes"),
                        new TabData("tab_thesaurus", "tab_thesaurus_title", "placeholder-thesaurus"),
                        new TabData("tab_dictionary", "tab_dictionary_title", "placeholder-definitions"),
                        new TabData("tab_reader", "tab_reader_title", "placeholder-reader")
                    ])
                this._applyTemplates()
                this._initializeViews()
                this._mainViewModel.loadDb().then(() => {
                    this._readerViewModel = new ReaderViewModel(this._mainViewModel.settings)
                    this._bindViewModel()
                })
            })
        })
    }
    _applyTemplates() {
        this._elemPlaceholderAppBar.innerHTML = this._template.createAppBarHtml("app-bar", "app_name")

        this._elemPlacholderInputTextSearch = document.querySelector("#placeholder-input-text-search")

        this._elemPlaceholderAppProgressIndicator.innerHTML = this._template.createLinearProgressIndicatorHtml()
        this._elemProgressBarLabel = document.querySelector("#progressbar-label")
        this._elemPlacholderInputTextSearch.innerHTML = this._template.createInputTextHtml("input-text-search", "btn_search_title")
        this._mainViewModel.i18n.translateElement(this._elemPlacholderInputTextSearch)

        this._viewTabs._applyTemplates()
    }

    _initializeViews() {
        this._elemActionItemMenu = document.querySelector("#menu_overflow")
        this._viewAppBarMenu = new AppBarMenuView(this._elemActionItemMenu, this._template)

        this._mdcLinearProgress = new MainView.MDCLinearProgress(document.querySelector('.mdc-linear-progress'))
        this._elemProgressBarLabel.innerText = this._mainViewModel.i18n.translate("progressbar_app_label")
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
        this._mainViewModel.isLoading.observer = (isLoading) => { this._showLoading(isLoading && !this._template.isLoaded) }
        this._mainViewModel.searchTextDisabled.observer = (isDisabled) => this._mdcInputTextSearch.disabled = isDisabled
        this._mainViewModel.searchButtonDisabled.observer = (isDisabled) => this._elemBtnSearch.disabled = isDisabled
        this._mainViewModel.clearSearchTextButtonVisible.observer = (isVisible) => this._updateClearSearchTextButtonVisibility(isVisible)
        this._mainViewModel.rhymes.observer = (newRhymes) => { this._viewRhymer.showRhymes(newRhymes) }
        this._mainViewModel.thesaurusEntries.observer = (newThesaurusEntries) => { this._viewThesaurus.showThesaurus(newThesaurusEntries) }
        this._mainViewModel.definitions.observer = (newDefinitions) => { this._viewDefinitions.showDefinitions(newDefinitions) }
        this._mainViewModel.suggestions.observer = (newSuggestions) => { this._viewSuggestions.showSuggestions(this._elemPlacholderInputTextSearch, newSuggestions) }
        this._mainViewModel.activeTab.observer = (newActiveTab) => { this._viewTabs.switchToTab(newActiveTab) }
        this._mainViewModel.loadingProgress.observer = (newLoadingProgress) => { this._updateLoadingProgress(newLoadingProgress) }
        this._mainViewModel.isReaderTabVisible.observer = (isVisible) => { this._updateReaderTabVisibility(isVisible) }
        this._mainViewModel.dialogInfo.observer = (dialogInfo) => { this._showDialog(dialogInfo) }
        this._mainViewModel.isRhymerLoading.observer = (isLoading) => { this._viewRhymer.setLoading(isLoading) }
        this._mainViewModel.isThesaurusLoading.observer = (isLoading) => { this._viewThesaurus.setLoading(isLoading) }
        this._mainViewModel.isDefinitionsLoading.observer = (isLoading) => { this._viewDefinitions.setLoading(isLoading) }
        this._mainViewModel.snackbarText.observer = (snackbarText) => { this._showSnackbar(snackbarText) }

        this._readerViewModel.dialogInfo.observer = (dialogInfo) => { this._showDialog(dialogInfo) }
        this._readerViewModel.isSpeechPlaying.observer = (newIsSpeechPlaying) => { this._viewReader.updateSpeechPlayingState(newIsSpeechPlaying) }
        this._readerViewModel.poemSavedStateLabel.observer = (savedStateLabel) => { this._viewReader.updatePoemSavedState(savedStateLabel) }
        this._readerViewModel.poemText.observer = (newPoemText) => { this._viewReader.setPoemText(newPoemText) }
        this._readerViewModel.voices.observer = (newVoices) => {
            this._mainViewModel.updateVoices(newVoices)
            this._viewVoiceSettings.updateVoicesList(newVoices)
        }
        this._readerViewModel.selectedVoiceLabel.observer = (newSelectedVoiceLabel) => this._viewVoiceSettings.updateSelectedVoiceLabel(newSelectedVoiceLabel)
        this._readerViewModel.voicePitch.observer = (newVoicePitch) => this._viewVoiceSettings.updatePitch(newVoicePitch)
        this._readerViewModel.voiceSpeed.observer = (newVoiceSpeed) => this._viewVoiceSettings.updateSpeed(newVoiceSpeed)

        // view -> viewmodel bindings
        this._viewTabs.observer = (tabIndex) => {
            if (tabIndex == MainViewModel.TabIndex.READER) this._viewVoiceSettings.layout()
            this._mainViewModel.activeTab.value = tabIndex
        }
        this._viewAppBarMenu.observer = (index) => { this._mainViewModel.onAppMenuItemSelected(index) }
        this._mdcInputTextSearch.foundation.adapter.registerTextFieldInteractionHandler('keydown', ((evt) => {
            if (evt.keyCode == 13) this._searchAll()
        }))
        this._mdcInputTextSearch.foundation.adapter.registerTextFieldInteractionHandler('input', ((evt) => {
            this._mainViewModel.onSearchTextInput(this._mdcInputTextSearch.value)
        }))

        this._mdcInputTextSearch.foundation.adapter.registerInputInteractionHandler('click', ((evt) => {
            this._mainViewModel.fetchSuggestions(this._mdcInputTextSearch.value, true)
        }))
        this._elemBtnSearch.onclick = () => { this._searchAll() }
        this._elemBtnClearSearchText.onclick = () => { this._onClearSearchTextClicked() }
        this._elemActionItemMenu.onclick = () => { this._viewAppBarMenu.showAppBarMenu(this._mainViewModel.appBarMenuItems) }
        this._viewContextMenu.observer = (word, index) => { this._mainViewModel.onContextMenuItemSelected(word, index) }
        this._viewSuggestions.observer = (word) => { this._onSuggestionSelected(word) }

        this._viewRhymer.wordClickedObserver = (wordElem) => { this._onWordElemClicked(wordElem) }
        this._viewRhymer.shareClickedObserver = () => { this._mainViewModel.onShareRhymes() }
        this._viewRhymer.settingsClickedObserver = () => { this._viewRhymer.showSettings(this._mainViewModel.getRhymerSettingsSwitches()) }
        this._viewRhymer.settingToggledObserver = (id, value) => { this._mainViewModel.onRhymerSettingToggled(id, value) }
        this._viewThesaurus.wordClickedObserver = (wordElem) => { this._onWordElemClicked(wordElem) }
        this._viewThesaurus.settingsClickedObserver = () => { this._viewThesaurus.showSettings(this._mainViewModel.getThesaurusSettingsSwitches()) }
        this._viewThesaurus.shareClickedObserver = () => { this._mainViewModel.onShareThesaurus() }
        this._viewThesaurus.settingToggledObserver = (id, value) => { this._mainViewModel.onThesaurusSettingToggled(id, value) }
        this._viewDefinitions.wordClickedObserver = (wordElem) => { this._onWordElemClicked(wordElem) }
        this._viewDefinitions.shareClickedObserver = () => { this._mainViewModel.onShareDefinitions() }
        this._viewReader.onPlayClickedObserver = (poemText, selectionStart, selectionEnd) => {
            this._readerViewModel.playText(poemText, selectionStart, selectionEnd)
        }
        this._viewReader.onCopyClickedObserver = (poemText, selectionStart, selectionEnd) => {
            this._mainViewModel.copyPoemText(poemText, selectionStart, selectionEnd)
        }
        this._viewReader.onClearClickedObserver = (poemText, selectionStart, selectionEnd) => {
            this._readerViewModel.onClearClicked()
        }
        this._viewReader.onPoemTextObserver = (poemText) => this._readerViewModel.setPoemText(poemText)
        this._viewReader.onFileUploadedObserver = (file) => this._readerViewModel.readFile(file)
        this._viewReader.onFileDownloadObserver = (poemText) => this._readerViewModel.writeFile(poemText)
        this._viewVoiceSettings.voiceSelectonObserver = (selectedVoiceIndex) => { this._readerViewModel.selectVoice(selectedVoiceIndex) }
        this._viewVoiceSettings.pitchObserver = (pitchValue) => { this._readerViewModel.setVoicePitch(pitchValue) }
        this._viewVoiceSettings.speedObserver = (speedValue) => { this._readerViewModel.setVoiceSpeed(speedValue) }
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
        this._mainViewModel.onSearchTextInput(this._mdcInputTextSearch.value)
    }
    _searchAll() {
        if (this._mdcInputTextSearch.value.length > 0) {
            this._viewSuggestions.hide()
            this._mainViewModel.fetchAll(this._mdcInputTextSearch.value)
        }
    }

    _onSuggestionSelected(word) {
        if (this._mainViewModel.onSuggestionSelected(word)) {
            this._mdcInputTextSearch.value = word
            this._elemBtnSearch.click()
        }
    }

    _onWordElemClicked(wordElem) {
        this._viewContextMenu.showContextMenu(wordElem, wordElem.innerText, this._mainViewModel.contextMenuItems)
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
        this._elemProgressBarLabel.innerText = this._mainViewModel.i18n.translate("progressbar_db_label", Math.round(loadingProgress * 100))
        this._mdcLinearProgress.progress = loadingProgress
    }
    _showMenu = () => this._viewAppBarMenu.showAppBarMenu(this._mainViewModel.appBarMenuItems)

    _showDialog(dialogInfo) {
        const contentHtml = this._template.createHtml(dialogInfo.contentTemplateId, dialogInfo.templateParameters)
        this._elemPlaceholderDialog.innerHTML =
            this._template.createDialogHtml(dialogInfo.title, contentHtml)
        this._mainViewModel.i18n.translateElement(this._elemPlaceholderDialog)
        if (dialogInfo.positiveAction == undefined) {
            this._elemPlaceholderDialog.querySelector(".mdc-dialog__actions").style.display = "none"
        }
        const dialog = new MainView.MDCDialog(document.querySelector('.mdc-dialog'))
        if (dialogInfo.positiveAction != undefined) {
            dialog.listen('MDCDialog:closed', (e) => { if (e.detail.action == "ok") { dialogInfo.positiveAction() } })
        }
        dialog.open()
    }
    _showSnackbar(snackbarText) {
        this._elemPlaceholderSnackbar.innerHTML = this._template.createSnackbarHtml(snackbarText)
        const snackbar = new MainView.MDCSnackbar(document.querySelector('.mdc-snackbar'))
        snackbar.open()
    }
}
MainView.MDCDialog = mdc.dialog.MDCDialog
MainView.MDCLinearProgress = mdc.linearProgress.MDCLinearProgress
MainView.MDCSnackbar = mdc.snackbar.MDCSnackbar
MainView.MDCTextField = mdc.textField.MDCTextField
function main_view_init() {
    const mainView = new MainView()
}
