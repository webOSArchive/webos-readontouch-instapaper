enyo.kind({
  name: "Preferences",
  kind: enyo.VFlexBox,
  style: "background-color: white;",
  contentHeight:"100%",
  events: {
      onReceive: "",
      onSave: "",
      onCancel: ""
  },
  components: [
        {name: "setAlarm", kind: "PalmService", service: "palm://com.palm.power/timeout/", method: "set", onResponse: "alarmServiceResponseHandler"},
        {name: "clearAlarm", kind: "PalmService", service: "palm://com.palm.power/timeout/", method: "clear", onResponse: "alarmServiceResponseHandler"},
        {kind: "Toolbar", pack: "center", components: [
            {name: "saveButton", kind: "Button", content: $L("Done"), onclick: "doneClick", className: "enyo-button-dark"},
            {kind: enyo.HFlexBox, flex: 1, components: [
                {kind: enyo.HtmlContent, content: $L("Preferences & Accounts"), style: " text-align: center; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: white; margin-left: 8px; ", flex: 1},
            ]}
        ]},
        {name: "scroller", kind: enyo.Scroller, flex: 1, height: (Util.isTablet() ? "850px" : "360px"), autoHorizontal: false, horizontal: false, components: [
          {kind: "Control", className: "enyo-preferences-box", width: "100%", style: "max-width: 635px;", components: [
               {name: "generalSettingsRG", kind: "RowGroup", width: "94%", caption: $L("General Settings"), components: [
 	              {kind: "LabeledContainer", label: $L("EXPERIMENTAL: Show images"), components: [
	                  {kind: "CheckBox", name: "showImages", onChange: "checkboxClicked"}
	              ]},
	              {kind: "LabeledContainer", label: $L("EXPERIMENTAL: Show scrollbar in item list (may reduce scrolling performance!)"), allowHtml: true, components: [
                      {kind: "CheckBox", name: "showListScrollbar", onChange: "showScrollbarClicked"}
                  ]},                                   
              ]},
              {name: "syncSettingsRG", kind: "RowGroup", width: "94%", caption: $L("Synchronisation Settings"), components: [
                  {kind: "LabeledContainer", label: $L("Sync on startup"), components: [
                      {kind: "CheckBox", name: "autoSyncEnabled", onChange: "checkboxClicked"}
                  ]},
                  {kind: "LabeledContainer", label: $L("Sync only unread items"), components: [
                      {kind: "CheckBox", name: "downloadOnlyUnreadArticlesEnabled", onChange: "checkboxClicked"}
                  ]},
                  /*{kind: "LabeledContainer", label: $L("Auto download articles"), components: [
                      {kind: "CheckBox", name: "autoDownloadArticlesEnabled", disabled: (Util.isWebOS() == false ? true : false), onChange: "checkboxClicked"}
                  ]},*/
                  {kind: "LabeledContainer", label: $L("Sync after adding a link"), components: [
	                  {kind: "CheckBox", name: "syncAfterAddingLink", onChange: "checkboxClicked"}
	              ]},
                  {kind: "LabeledContainer", label: $L("Download how many articles"), components: [
                      {name: "articleLimitSelector", kind: "CustomListSelector", onChange: "articleLimitChanged", style: "text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-left: 10px; ", items: [
                          /*{caption: "3"},
                          {caption: "10"},*/
                          {caption: "25"},
                          {caption: "50"},
                          {caption: "100"},
                          {caption: "250"},
                          {caption: "500"},
                          {caption: "1000"},
                          {caption: "1500"},
                          {caption: "2000"},
                          {caption: $L("all")},
                      ]},
                  ]},
                  {kind: "LabeledContainer", name: "changedArticleLimit"},                  
              ]},
              {name: "rowGroup", kind: "RowGroup", width: (Util.isTablet() ? "94%" : "280px"), caption: $L("Instapaper - Account"), components: [
                  {kind: "RowGroup", components: [
                      {name: "username", hint: $L("Username"), kind: "Input", alwaysLooksFocused: true, oninput: "resetVerified", autoCapitalize: "lowercase"},
                  ]},
                  {kind: "RowGroup", components: [
                      {name: "password", hint: $L("Password"), kind: "PasswordInput", alwaysLooksFocused: true, oninput: "resetVerified"},
                  ]},
                 {kind: "LabeledContainer", name: "verifyStatus"},
                  {kind: "HFlexBox", width: (Util.isTablet() ? "600px" : "280px"), components: [
                      {name: "logoutButton", flex:1, caption: $L("Logout"), className: "enyo-button", kind: "Button", onclick: "showConfirmLogoutDialog"},
                      /*{name: "verifyButton",  flex:1, caption: "Verify!", className: "enyo-button", kind: "ActivityButton", onclick: "verifyAccount"},*/
                  ]},
             ]},
          ]},
      ]},
      {kind: "ModalDialog", name: "clearDataDialog", caption: $L("Clear local data!"), components:[
          {content: $L("Are you sure that you want to delete your local data?"), className: "enyo-paragraph"},
          {layoutKind: "HFlexLayout", components: [
              {kind: "Button", caption: $L("Hell, no!"), flex: 1, onclick: "closeClearDataDialog", className: "enyo-button-dark"},
              {kind: "Button", caption: $L("Yes, sure!"), flex: 1, className: "enyo-button-negative", onclick: "confirmClearData"},
          ]}
      ]},
      {kind: "ModalDialog", name: "logoutDialog", caption: $L("Logout"), components:[
          {content: $L("Are you sure that you want to logout of Instapaper and delete all your local data?"), className: "enyo-paragraph"},
          {layoutKind: "HFlexLayout", components: [
              {kind: "Button", caption: $L("Hell, no!"), flex: 1, onclick: "closeLogoutDialog", className: "enyo-button-dark"},
              {kind: "Button", caption: $L("Yes, sure!"), flex: 1, className: "enyo-button-negative", onclick: "logoutAccount"},
          ]}
      ]},
      {kind: "ModalDialog", name: "needsRestartDialog", caption: $L("Restart needed"), components:[
          {content: $L("You have to restart the app to see the changes."), className: "enyo-paragraph"},
          {layoutKind: "HFlexLayout", components: [
              {kind: "Button", caption: $L("Ok"), flex: 1, onclick: "closeNeedsRestartDialog"/*, className: "enyo-button-negative"*/},
              /*{kind: "Button", caption: "Delete", flex: 1, className: "enyo-button-negative", onclick: "confirmDownloadImages"},*/
          ]}
      ]},
  ],
  
    create : function( ) {
        this.inherited(arguments);
        this.log();
        
        var kind;
        // create general section
        if (Util.isTouchpad()) {
            kind = {kind: "LabeledContainer", label: $L("Use AdvancedBrowser to view full Article"), components: [
                {kind: "CheckBox", name: "useAdvancedBrowser", onChange: "checkboxClicked"}
            ]}; 
            this.$.generalSettingsRG.createComponent( kind, {owner: this} );
        } else if (Util.isWebOS() && Util.isTouchpad() == false) {
            kind = {kind: "LabeledContainer", label: $L("Rotation lock (always portrait)"), components: [
               {kind: "CheckBox", name: "useRotationLock", onChange: "changedRotationLock"}
            ]};
            this.$.generalSettingsRG.createComponent( kind, {owner: this} );
            this.$.generalSettingsRG.createComponent( {kind: "LabeledContainer", name: "changedRotationLock"}, {owner: this} );
            
            kind = {kind: "LabeledContainer", name: "changedRotationLock"},
            this.$.generalSettingsRG.createComponent( kind, {owner: this} );
            this.$.generalSettingsRG.createComponent( {kind: "LabeledContainer", name: "changedRotationLock"}, {owner: this} );
        }
        
        if (Util.isTablet()) {
        	kind = {kind: "LabeledContainer", label: $L("Maximize Article-View in portrait-mode"), components: [
                {kind: "CheckBox", name: "maximizeView", onChange: "checkboxClicked"}
            ]}; 
            this.$.generalSettingsRG.createComponent( kind, {owner: this} );
        }
        
        if (!Util.isPre3()) {
        	kind = {kind: "LabeledContainer", label: $L("Preview mode prefered"), components: [
                {kind: "CheckBox", name: "previewPrefered", onChange: "checkboxClicked"}
            ]}; 
        	this.$.generalSettingsRG.createComponent( kind, {owner: this} );
        }

        // create sync section
        if (Util.isWebOS()) {
            kind = {kind: "LabeledContainer", label: $L("Background synchronization"), components: [
              {name: "bgSyncIntervalSelector", kind: "CustomListSelector", onChange: "bgSyncIntervalChanged", style: "text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-left: 10px; ", items: [
                  {caption: $L("30M"), value: "30M"},
                  {caption: $L("1H"), value: "1H"},
                  {caption: $L("2H"), value: "2H"},
                  {caption: $L("4H"), value: "4H"},
                  {caption: $L("8H"), value: "8H"},
                  {caption: $L("24H"), value: "24H"},
                  {caption: $L("never"), value: "never"},
              ]}]};
            this.$.syncSettingsRG.createComponent( kind, {owner: this} );
        }
        this.$.syncSettingsRG.createComponent( {name: "clearLocalDataButton", caption: $L("Clear local data!"), kind: "ActivityButton", onclick: "showConfirmClearDataDialog"}, {owner: this} );
        
        
        this.$.verifyStatus.hide();
        this.$.changedArticleLimit.hide();
        if (Util.isWebOS() == true && Util.isTouchpad() == false && this.$.changedRotationLock) {
            this.$.changedRotationLock.hide();
        }
        this.$.logoutButton.setDisabled( true );
    }, 
    
    resetClearLocalDataButton : function( ) {
    	if (this.$.clearLocalDataButton) {
        	this.$.clearLocalDataButton.setCaption($L("Clear local data!"));
            this.$.clearLocalDataButton.setStyle("");
            this.$.clearLocalDataButton.setActive(false);
    	}
    },

    disableControls : function ( disabled ) {
    	this.log();
        this.$.username.setDisabled( disabled );
        this.$.password.setDisabled( disabled );
//        this.$.verifyButton.setDisabled( disabled );
        if (Util.isTablet() == true) {
            if (Util.isWebOS() == true && Util.isTouchpad() == true && this.$.useAdvancedBrowser) {
            	this.$.useAdvancedBrowser.setDisabled( disabled );
            }
            if (this.$.maximizeView) {
                this.$.maximizeView.setDisabled( disabled );
            }
        } else {
        	if (this.$.useRotationLock) {
            	this.$.useRotationLock.setDisabled( disabled );
        	}
        }
        if (Util.isWebOS() == true && this.$.bgSyncIntervalSelector) {
            this.$.bgSyncIntervalSelector.setDisabled( disabled );
        }
        this.$.showImages.setDisabled( disabled );
        this.$.downloadOnlyUnreadArticlesEnabled.setDisabled( disabled );
//        this.$.autoDownloadArticlesEnabled.setDisabled( disabled );
        this.$.articleLimitSelector.setDisabled( disabled );
    	if (this.$.clearLocalDataButton) {
    		this.$.clearLocalDataButton.setDisabled( disabled );
    	}
		this.$.syncAfterAddingLink.setDisabled( disabled );
        this.$.showListScrollbar.setDisabled( disabled );

        if (!Util.isPre3() && this.$.previewPrefered) {
        	this.$.previewPrefered.setDisabled( disabled );
        }
    },
    
    showingChanged : function( ) {
        this.log();
        this.resetClearLocalDataButton();
        
        if (Util.getSettings().syncInProgress == true) {
            this.owner.showFailurePopup($L("There is currently a sync in progress. Data can not be cleared now!"), $L("Failure!"));
            return;
        }

        
        if (Util.getSettings().online == false) {
            this.log("client is offline");
            this.disableControls( true );
            if (this.owner.$.pane !== undefined && this.owner.$.pane.getViewName() == "preferences") {
                this.owner.showFailurePopup($L("In offline mode all preferences are read-only!"), $L("Warning!"));
            }
        }
        else if (Util.getSettings().syncInProgress == true){
            this.log("sync in progress");
            this.disableControls( true );
            if (this.owner.$.pane !== undefined && this.owner.$.pane.getViewName() == "preferences") {
                this.owner.showFailurePopup($L("Synchronization is ongoing: Preferences are read-only during that process!"), $L("Warning!"));
            }
        }
        else {
            this.disableControls( false );
        }
        
        var orientation = enyo.getWindowOrientation();
        if (orientation == "left" || orientation == "right") {
            // portrait
            this.$.scroller.height = 700;  
        } else {
            // landscape
            this.$.scroller.height = 900;  
        }
        
        this.readFromLocalStorage();


    },
    
    saveData : function( username, password ) {
        // this.log("username: " + username);
        // this.log("password: " + password);
        var newUsernameValue = "";
        var newPasswordValue = "";
        if (username !== undefined && password !== undefined) {
            newUsernameValue = username;
            newPasswordValue = password;
            this.$.username.setValue( newUsernameValue );
            this.$.password.setValue( newPasswordValue );
        } else {
            newUsernameValue = this.$.username.getValue();
            newPasswordValue = this.$.password.getValue();
        }
        // this.log("newUsernameValue: " + newUsernameValue);
        // this.log("newPasswordValue: " + newPasswordValue);
        
        if (Util.isTablet() == true) {
            if (Util.isWebOS() == true && Util.isTouchpad() == true) {
                var newUseAdvancedBrowser = this.$.useAdvancedBrowser.getChecked();
                this.log("newUseAdvancedBrowser: " + newUseAdvancedBrowser);
            }
            
            var newMaximizeView = this.$.maximizeView.getChecked();
            this.log("newMaximizeView: " + newMaximizeView);
        } else {
            var newUseRotationLock = this.$.useRotationLock.getChecked();
            this.log("newUseRotationLock: " + newUseRotationLock);
            
        }
        
        if (Util.isWebOS() == true) {
            var newBgSyncIntervalSelector = this.$.bgSyncIntervalSelector.getValue();
            this.log("newBgSyncIntervalSelector: " + newBgSyncIntervalSelector);
        }
                
        var newShowImages = this.$.showImages.getChecked();
        this.log("newShowImages: " + newShowImages);
        var newAutoSync = this.$.autoSyncEnabled.getChecked();
        this.log("newAutoSync: " + newAutoSync);
        var newAutoDownloadArticles;
//        var newAutoDownloadArticles = this.$.autoDownloadArticlesEnabled.getChecked();
//        this.log("newAutoDownloadArticles: " + newAutoDownloadArticles);
        var newDownloadOnlyUnreadArticles = this.$.downloadOnlyUnreadArticlesEnabled.getChecked();
        this.log("newDownloadOnlyUnreadArticles: " + newDownloadOnlyUnreadArticles);
        var newArticleLimit = this.$.articleLimitSelector.getValue();
        this.log("newArticleLimit: " + newArticleLimit);
        if (!Util.isPre3()) {
            var newPreviewPrefered = this.$.previewPrefered.getChecked();
            this.log("newPreviewPrefered: " + newPreviewPrefered);
        }
        var syncAfterAddingLink = this.$.syncAfterAddingLink.getChecked();
        this.log("syncAfterAddingLink: " + syncAfterAddingLink);
        var showListScrollbar = this.$.showListScrollbar.getChecked();
        this.log("showListScrollbar: " + showListScrollbar);

        this.writeToLocalStorage( newUsernameValue, newPasswordValue, newUseAdvancedBrowser, newMaximizeView, newUseRotationLock, newBgSyncIntervalSelector, newAutoSync, newAutoDownloadArticles, newDownloadOnlyUnreadArticles, newArticleLimit, newShowImages, newPreviewPrefered, syncAfterAddingLink, showListScrollbar );
    },

    setAccountVerified : function ( value ) {
        this.log("value: " + value);
        localStorage.removeItem("accountVerified");     
        localStorage.setItem("accountVerified", value);
    },
         
    getAccountVerified : function ( ) {
        var accountVerified = localStorage.getItem("accountVerified");
        return accountVerified == "true" ? true : false;
    },
         
   discardChanges : function( ) {
        localStorage.removeItem("username");     
        localStorage.removeItem("password");     
        this.$.username.setValue("");
        this.$.password.setValue("");
        this.setAccountVerified( false );
    }, 
    
    writeToLocalStorage : function ( username, password, useAdvancedBrowser, maximizeView, useRotationLock, bgSyncInterval, autoSync, autoDownloadArticles, downloadOnlyUnreadArticles, articleLimit, showImages, previewPrefered, syncAfterAddingLink, showListScrollbar ) {
        this.log("START");

        // this.log("username: '" + username + "'");
        // this.log("password: '" + password + "'");
        this.log("useAdvancedBrowser: '" + useAdvancedBrowser + "'");
        this.log("maximizeView: '" + maximizeView + "'");
        this.log("useRotationLock: '" + useRotationLock + "'");
        this.log("bgSyncInterval: '" + bgSyncInterval + "'");
        this.log("autoSync: '" + autoSync + "'");
        this.log("autoDownloadArticles: '" + autoDownloadArticles + "'");
        this.log("downloadOnlyUnreadArticles: '" + downloadOnlyUnreadArticles + "'");
        this.log("articleLimit: '" + articleLimit + "'");
        this.log("showImages: '" + showImages + "'");
        this.log("previewPrefered: '" + previewPrefered + "'");
        this.log("syncAfterAddingLink: '" + syncAfterAddingLink + "'");
        this.log("showListScrollbar: '" + showListScrollbar + "'");   
        
        // write to localstorage
        if (username !== undefined && username != null && password !== undefined && password != null) {
            var verified = username.length > 0 && password.length > 0;
            this.setAccountVerified( verified );
            if (verified) {
                localStorage.removeItem("username");     
                localStorage.setItem("username", username);
                localStorage.removeItem("password");     
                localStorage.setItem("password", password);
                this.markAccountVerified();
            }
        }

        localStorage.removeItem("useAdvancedBrowser");     
        localStorage.setItem("useAdvancedBrowser", useAdvancedBrowser);
        localStorage.removeItem("maximizeView");     
        localStorage.setItem("maximizeView", maximizeView);
        localStorage.removeItem("useRotationLock");     
        localStorage.setItem("useRotationLock", useRotationLock);
             
        localStorage.removeItem("bgSyncInterval");     
        localStorage.setItem("bgSyncInterval", bgSyncInterval);
        localStorage.removeItem("autoSync");     
        localStorage.setItem("autoSync", autoSync);
        localStorage.removeItem("autoDownloadArticles");     
        localStorage.setItem("autoDownloadArticles", autoDownloadArticles);
        localStorage.removeItem("downloadOnlyUnreadArticles");     
        localStorage.setItem("downloadOnlyUnreadArticles", downloadOnlyUnreadArticles);
        localStorage.removeItem("articleLimit");     
        localStorage.setItem("articleLimit", articleLimit);
        localStorage.removeItem("showImages");     
        localStorage.setItem("showImages", showImages);
        localStorage.removeItem("previewPrefered");     
        localStorage.setItem("previewPrefered", previewPrefered);
        localStorage.removeItem("syncAfterAddingLink");     
        localStorage.setItem("syncAfterAddingLink", syncAfterAddingLink);
        localStorage.removeItem("showListScrollbar");     
        localStorage.setItem("showListScrollbar", showListScrollbar);
        
        var appinfo = enyo.fetchAppInfo();
        localStorage.setItem("lastVersion", appinfo.version);
        
        // force reloading the settings
        Util.getSettings( true );

        this.log("END");
    },    
    
    readFromLocalStorage : function( ) {
        this.log("START");

        // grab items from storage         
        var accountVerified = Util.getSettings().accountVerified;
        var username = Util.getSettings().username;
        var password = Util.getSettings().password;
        
        var useAdvancedBrowser = Util.getSettings().useAdvancedBrowser;
        var maximizeView = Util.getSettings().maximizeView;
        var useRotationLock = Util.getSettings().useRotationLock;

        var bgSyncInterval = Util.getSettings().bgSyncInterval;
        var autoSync = Util.getSettings().autoSync;
        var autoDownloadArticles = Util.getSettings().autoDownloadArticles;
        var downloadOnlyUnreadArticles = Util.getSettings().downloadOnlyUnreadArticles;
        var articleLimit = Util.getSettings().articleLimit;
        var showImages = Util.getSettings().showImages;
        var previewPrefered = Util.getSettings().previewPrefered;
        var syncAfterAddingLink = Util.getSettings().syncAfterAddingLink;
        var showListScrollbar = Util.getSettings().showListScrollbar;
        
        // this.log("username: '" + username + "'");
        // this.log("password: '" + password + "'");
        this.log("accountVerified: '" + accountVerified + "'");
        this.log("useAdvancedBrowser: '" + useAdvancedBrowser + "'");
        this.log("maximizeView: '" + maximizeView + "'");
        this.log("useRotationLock: '" + useRotationLock + "'");
        this.log("bgSyncInterval: '" + bgSyncInterval + "'");
        this.log("autoSync: '" + autoSync + "'");
        this.log("autoDownloadArticles: '" + autoDownloadArticles + "'");
        this.log("downloadOnlyUnreadArticles: '" + downloadOnlyUnreadArticles + "'");
        this.log("articleLimit: '" + articleLimit + "'");
        this.log("showImages: '" + showImages + "'");
        this.log("previewPrefered: '" + previewPrefered + "'");
        this.log("syncAfterAddingLink: '" + syncAfterAddingLink + "'");
        this.log("showListScrollbar: '" + showListScrollbar + "'");   
        
        // write to ui        
        this.$.username.setValue( username );
        this.$.password.setValue( password );
        this.$.autoSyncEnabled.setChecked( autoSync );
//        this.$.autoDownloadArticlesEnabled.setChecked( autoDownloadArticles );
        this.$.downloadOnlyUnreadArticlesEnabled.setChecked( downloadOnlyUnreadArticles );
        this.$.syncAfterAddingLink.setChecked( syncAfterAddingLink );
        this.$.showListScrollbar.setChecked( showListScrollbar );
        if (Util.isWebOS() == true && this.$.bgSyncIntervalSelector) {
            this.$.bgSyncIntervalSelector.setValue( bgSyncInterval );
        }
        this.$.articleLimitSelector.setValue( articleLimit );
        this.$.showImages.setChecked( showImages );
        if (!Util.isPre3() && this.$.previewPrefered) {
            this.$.previewPrefered.setChecked( previewPrefered );
        }
        
        if (Util.isTablet() == true) {
            if (Util.isWebOS() == true && Util.isTouchpad() == true && this.$.useAdvancedBrowser) {
                this.$.useAdvancedBrowser.setChecked( useAdvancedBrowser );
            }
            if (this.$.maximizeView) {
                this.$.maximizeView.setChecked( maximizeView );
            }
        } else {
        	if (this.$.useRotationLock) {			
				this.$.useRotationLock.setChecked( useRotationLock );
			}
        }
        
        if (accountVerified == true) {
            this.markAccountVerified();
        }
        
        this.log("END");
    },

    getValueFromUiAndStoreIt : function() {
        this.log("START");
        // get value from ui 
        var username = this.$.username.getValue( );
        var password = this.$.password.getValue( );

        if (Util.isTablet() == true) {
            if (Util.isWebOS() == true && Util.isTouchpad() == true) {
                var useAdvancedBrowser = this.$.useAdvancedBrowser.getChecked( );
            }
            var maximizeView = this.$.maximizeView.getChecked( );
        } else if (this.$.useRotationLock){
            var useRotationLock = this.$.useRotationLock.getChecked( );
        }

        if (Util.isWebOS() == true) {
            var bgSyncInterval = this.$.bgSyncIntervalSelector.getValue( );
        }
        var autoSync = this.$.autoSyncEnabled.getChecked( );
        var autoDownloadArticles;
//        var autoDownloadArticles = this.$.autoDownloadArticlesEnabled.getChecked( );
        var downloadOnlyUnreadArticles = this.$.downloadOnlyUnreadArticlesEnabled.getChecked( );
        var articleLimit = this.$.articleLimitSelector.getValue( );
        var showImages = this.$.showImages.getChecked( );
        if (!Util.isPre3()) {
            var previewPrefered = this.$.previewPrefered.getChecked( );
        }
        var syncAfterAddingLink = this.$.syncAfterAddingLink.getChecked( );
        var showListScrollbar = this.$.showListScrollbar.getChecked( );
        
        this.log("END");
        this.writeToLocalStorage( username, password, useAdvancedBrowser, maximizeView, useRotationLock, bgSyncInterval, autoSync, autoDownloadArticles, downloadOnlyUnreadArticles, articleLimit, showImages, previewPrefered, syncAfterAddingLink, showListScrollbar );
    },
    
    verifyAccount : function( ) {
        this.log("START");

        if (this.$.password.getValue().trim() != "" && this.$.username.getValue().trim() != "") {
//            this.$.verifyButton.setActive(true);
            this.owner.$.myservices.verifyAccount( this.$.username.getValue(), this.$.password.getValue(), this.owner.$.preferences, "grabVerifyAccountSuccess", "grabVerifyAccountFailed" );
        }

        this.log("END");
    },
    
    clearLocalData : function( ) {
        
        /*if (Util.getSettings().syncInProgress == true) {
            this.owner.showFailurePopup("There is currently a sync in progress. Data can not be cleared now!", "Failure!");
            return;
        }*/
        
        
        this.log("START");
        
        this.$.saveButton.setDisabled( true );
        
        this.$.clearLocalDataButton.setActive(true);
        
        // load settings from storage
        var fontsize = localStorage.getItem("fontsize");
        var fontfamily = localStorage.getItem("fontfamily");
        var theme = localStorage.getItem("theme");
        var fixedWidth = localStorage.getItem("fixedWidth");
        var online = localStorage.getItem("online");

        var lastClickDate = localStorage.getItem("lastClickDate");
        var clickCount = localStorage.getItem("clickCount");

        // delete items from storage
        localStorage.clear();

        this.log("deleting downloaded articles...");
        this.owner.$.dataManager.deleteDownloadedArticles();
        this.log("deleting downloaded images...");
        this.owner.$.dataManager.deleteDownloadedImages();

        // show empty page and clear selection
        this.owner.$.feedWebViewPane.showEmptyPage();
        this.owner.$.detailPane.showEmptyPage();
        this.owner.$.itemListPane.clearSelection();

        this.owner.$.dataManager.setItemsAll([]);
        this.owner.$.dataManager.setFeedItems([]);
        this.owner.$.dataManager.setToggledReadState([]);
        this.owner.$.dataManager.setDownloadedArticles([]);
        this.owner.$.dataManager.setCurrentlyWaiting([]);
        this.owner.$.dataManager.setCurrentlyLoading([]);
        this.owner.$.dataManager.setCancelArticleDownload([]);
        this.owner.$.dataManager.setTotalItemsToDownload([]);
        this.owner.$.dataManager.setAvailableTags([]);
        this.owner.$.dataManager.getDownloadedImages([]);
        this.owner.$.dataManager.getTextInfo([]);
        this.owner.$.dataManager.setTotalImagesToDownload([]);
        
        if (Util.isPlaybook()) {
            var dirs = blackberry.io.dir.appDirs.app.storage.path;
            var filePath1 = String(dirs) + "/itemList.data";
            var filePath2 = String(dirs) + "/textInfo.data";
            try {
                if (blackberry.io.file.exists(filePath1)) {
                    blackberry.io.file.deleteFile(filePath1);
                }
                if (blackberry.io.file.exists(filePath2)) {
                    blackberry.io.file.deleteFile(filePath2);
                }
            }
            catch (e) {
                alert("error in delete file: " + e);
            }     
        }
        
        
        this.owner.$.itemListPane.$.filterButton.setCaption($L("No filter active"));
        this.owner.$.itemListPane.$.filterButton.setStyle("");
        
        this.owner.$.previewPane.loadArticles();
        this.owner.$.itemListPane.$.feedList.render();
        this.owner.$.itemListPane.$.feedList.refresh();
        this.owner.$.itemListPane.$.countLabel.setContent($L("0 items"));
        
        this.$.clearLocalDataButton.setCaption($L("Cleared local data!"));
        this.$.clearLocalDataButton.setStyle("background-color: green; color: #FFFFFF; font-weight:bold;");
        this.$.changedArticleLimit.hide();
        if (Util.isWebOS() == true && Util.isTouchpad() == false && this.$.changedRotationLock) {
            this.$.changedRotationLock.hide();
        }
        
        this.owner.$.itemListPane.selectView("emptyList");
//        this.owner.$.previewPane.selectView("emptyList");

        // this.owner.$.dataManager.dropTables();
        // this.owner.$.dataManager.createDbStructure();
                
        // store values to storage
        localStorage.setItem( "fontsize", fontsize );
        localStorage.setItem( "fontfamily", fontfamily );
        localStorage.setItem( "theme", theme );
        localStorage.setItem( "fixedWidth", fixedWidth );
        localStorage.setItem( "itemState", "unread" );
        localStorage.setItem( "filterTags", "" );
        localStorage.setItem( "lastVersion", enyo.fetchAppInfo().version)
        localStorage.setItem( "online", online );

        localStorage.setItem( "lastClickDate", lastClickDate );
        localStorage.setItem( "clickCount", clickCount );

        this.getValueFromUiAndStoreIt(); 
        
        this.$.clearLocalDataButton.setActive(false);
        this.$.saveButton.setDisabled( false );
        
        this.log("END");
    },

    markAccountVerified : function( ) {
        this.log("START");
        // this.log("markAccountVerified()");
//        this.$.verifyButton.setCaption("Connected!");
//        this.$.verifyButton.addClass("enyo-button-affirmative");

        if (Util.getSettings().online == true) {
            this.$.logoutButton.setDisabled( false );
        }
        this.$.logoutButton.addClass("enyo-button-negative");

        this.setAccountVerified( true );
        this.log("END");
    },
    
    resetVerified : function( ) {
        this.log("START");
//        this.$.verifyButton.setCaption("Verify!");
//        this.$.verifyButton.removeClass("enyo-button-affirmative");
        this.$.logoutButton.removeClass("enyo-button-negative");
        // this.$.verifyButton.setDisabled(false); 
        this.setAccountVerified( false );
        // this.discardChanges();
        this.log("END");
    },
    
    grabVerifyAccountSuccess : function() {
        this.log("START");
        this.$.verifyStatus.setLabel(""); 
        this.$.verifyStatus.hide();
//        this.$.verifyButton.setActive(false);
        this.saveData();
        this.markAccountVerified();
        this.log("END");
    },

    grabVerifyAccountFailed : function() {
        this.error("START");
        // this.log("this.$.verifyStatus: " + this.$.verifyStatus.getShowing());
//        this.$.verifyButton.setActive(false);
        this.$.verifyStatus.show();
        this.$.verifyStatus.setStyle("color: red;");
        this.$.verifyStatus.setLabel($L("Validation failed! Please try again with other credentials!")); 
        // this.log("this.$.verifyStatus: " + this.$.verifyStatus.getShowing());
        this.setAccountVerified( false );
        this.error("END");
    },
  
    checkboxClicked : function() {
        this.log("START");
        this.saveData();
        this.log("END");
    },
    
    articleLimitChanged: function( inSender, inValue, inOldValue ) {
        this.log("START");
        // this.log("inSender: " + inSender + ", Value: " + inValue + ", inOldValue: " + inOldValue);
        
        // this.setArticleLimit( inValue );
        if (inValue !== undefined) {
            this.saveData();

            this.resetClearLocalDataButton();
            this.$.changedArticleLimit.show();
            this.$.changedArticleLimit.setStyle("color: red;");
            this.$.changedArticleLimit.setLabel($L("After changing the article download limit your should clear all local data to keep data consistent!")); 
        }
        this.log("END");
    },

    changedRotationLock: function( inSender, inValue, inOldValue ) {
        this.log("START");

        // if (inValue !== undefined) {
            this.saveData();
            this.log("show label...");
            // this.resetClearLocalDataButton();
            if (this.$.changedRotationLock) {
                this.$.changedRotationLock.show();
                this.$.changedRotationLock.setStyle("color: red;");
                this.$.changedRotationLock.setLabel($L("App must be restarted for this change to become effective!")); 
            }
        // }
        this.log("END");
    },

    bgSyncIntervalChanged: function( inSender, inValue, inOldValue ) {
        this.log("START");
        // this.log("inSender: " + inSender + ", Value: " + inValue + ", inOldValue: " + inOldValue);
        
        // this.setArticleLimit( inValue );
        if (inValue !== undefined && inValue != Util.getSettings().bgSyncInterval) {
            this.saveData();
            var appId = enyo.fetchAppInfo().id;
            var time = Util.getAlarmTimeFromSettings();
            this.log("time: " + time);
            if (time == null) {
                this.log("clearing alaram! ");
                this.$.clearAlarm.call({
                    "key" : appId + ".sync" 
                });
            } else {
                this.log("set next bgsync in: " + time);
                this.$.setAlarm.call({
                    "wakeup" : true, 
                    "key" : appId + ".sync", 
                    "uri":"palm://com.palm.applicationManager/launch",
                    "params" : {"id" : appId, "params": {"action" : "doSync"}},
                    "in": time
                });
            }

        }
        this.log("END");
    },

    doneClick : function() {
        if (this.getAccountVerified() == true) {
            
            if (Util.getSettings().previewPrefered == true) {
                this.owner.$.pane.selectViewByName("previewSlidingPane");
            } else {
                this.owner.$.pane.selectViewByName("feedSlidingPane");
            }
            
            if (Util.isWebOS()) {
                var appId = enyo.fetchAppInfo().id;
                var time = Util.getAlarmTimeFromSettings();
                this.log("time: " + time);
                if (time == null) {
                    this.log("clearing alaram! ");
                    this.$.clearAlarm.call({
                        "key" : appId + ".sync" 
                    });
                } else {
                    this.log("set next bgsync in: " + time);
                    this.$.setAlarm.call({
                        "wakeup" : true, 
                        "key" : appId + ".sync", 
                        "uri":"palm://com.palm.applicationManager/launch",
                        "params" : {"id" : appId, "params": {"action" : "doSync"}},
                        "in": time
                    });
                }
            }

        } else {
            this.discardChanges();
            this.clearLocalData();
            this.log("no valid userdata entered. directing user to welcome page...");
            this.owner.$.pane.selectViewByName("welcomePane");
        }
        Util.getSettings( true );
        this.owner.rotationLock();
    },

    showConfirmClearDataDialog : function() {
        this.$.clearDataDialog.openAtCenter();            
    },
  
    confirmClearData : function( inSender, inValue, inOldValue ) {
        this.log("START");
        this.closeClearDataDialog();
        this.clearLocalData();
        this.log("END");
    },
  
   closeClearDataDialog : function() {
       this.$.clearDataDialog.close();  
   },
   
   showConfirmLogoutDialog : function() {
       this.$.logoutDialog.openAtCenter();            
   },
  
   closeLogoutDialog : function() {
       this.$.logoutDialog.close();  
   },
   
   logoutAccount : function() {
       this.log();
       this.$.username.setValue( "" );
       this.$.password.setValue( "" );
       this.resetVerified();
       this.clearLocalData();
       Util.getSettings( true );
       this.$.logoutDialog.close();  
   },
   
   showScrollbarClicked : function( inSender, inValue, inOldValue ) {
       this.log("START");

       var newShowListScrollbar = this.$.showListScrollbar.getChecked();
       this.log("newShowListScrollbar: " + newShowListScrollbar );
       var oldShowListScrollbar = Util.getSettings().showListScrollbar;
       this.log("oldShowListScrollbar: " + oldShowListScrollbar );
       
       this.saveData();

       if ( newShowListScrollbar != oldShowListScrollbar ) {
           this.log("showListScrollbar has changed to " + newShowListScrollbar);
           this.$.needsRestartDialog.openAtCenter();            
       }
       
       this.log("END");
   },
   
   closeNeedsRestartDialog : function() {
       this.$.needsRestartDialog.close();  
   },
   

});