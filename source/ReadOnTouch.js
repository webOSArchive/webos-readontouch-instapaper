enyo.kind({
     name: "ReadOnTouch",
     kind: enyo.VFlexBox,
     components: [
         {kind: "maklesoft.cross.ApplicationEvents", onWindowRotated: "onWindowRotated", onOpenAppMenu: "onOpenAppMenu", onBack: "obBackGesture", onWindowParamsChange: "windowParamsChangeHandler"},
         {name: "myservices", kind: "ReadOnTouch.Services"},
         {name: "launchBrowserCall", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "launch"},
         {name: "launchApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
         {name: "connection", kind: "PalmService", service: "palm://com.palm.connectionmanager/", method: "getstatus", onResponse: "connectionResponseHandler", subscribe: true},
         {name: "requestItemsService", kind: "WebService", onSuccess: "grabFeedSuccess", onFailure: "grabFeedFailure", components: [
                {method: "GET", handleAs: "json", contentType: "application/x-www-form-urlencoded; charset=utf-8", headers: {"Content-type": "application/x-www-form-urlencoded", "Connection": "close"},}
         ]},
         {name: "pane", kind: "Pane", flex: 1, components: [
             {name: "emptyList", kind: "StartScreen"},
             {name: "feedSlidingPane", kind: "SlidingPane", flex: 1, style: "background-color: #000000;", multiViewMinWidth: 500, components: [
                 {name: "itemListPane", kind: "ItemList", width: "300px"},
                 {name: "feedWebViewPane", kind: "ItemView", dragAnywhere: false, flex: 1, onResize: "slidingResize"},
             ]} ,
             {name: "previewSlidingPane", kind: "SlidingPane", flex: 1, style: "background-color: #000000;", multiView: false, multiViewMinWidth: 50000, components: [
                 {name: "previewPane", kind: "PreviewPane", flex: 1},
                 {name: "detailPane", kind: "ItemView", dragAnywhere: true, flex: 1, onResize: "slidingResize"},
             ]} ,
             {name: "preferences", kind: "Preferences"},
             {name: "changelogDialog", kind: "ChangelogDialog"},
             {name: "welcomePane", kind: "Welcome"} ,
             {name: "popupDialog", kind: "MyPopupDialog"},
             {name: "popupDialog2", kind: "MyPopupDialog"},
             {name: "addItemDialog", kind: "AddLinkDialog"},
             {name: "progressDialog", kind: "ProgressDialog"},
             {name: "menuDialog", kind: "MenuDialog", onMenuSelect: "onMenuSelect"},
             {name: "appMissing", kind: "AppMissing"},
             {name: "about", kind: "AboutDialog"},
             {name: "dataManager", kind: "DataManager"},
             {name: "help", kind: "ReadOnTouch.Help"},
             /*{name: "help", kind: "Popup", scrim: true, components: [
                {
                    kind: "Scroller", 
                    style: "height: 500px; width: 500px;",
                    components: [{
                        kind: "ReadOnTouch.Help"
                    }]
                }]
             }*/
         ]},
         {name: "appMenu", kind: "AppMenu", components: [
             {caption: $L("Preferences"), onclick: "showPreferences"},
             {caption: $L("Quick-Start Guide"), onclick: "showQuickStartGuide"},
             /*{caption: "Feedback & Support", onclick: "showOnlineSupport"},*/
             {caption: $L("Show Changelog"), onclick: "showChangelog"},
             /*{caption: $L("Rate Me!"), onclick: "rateMeClicked"},
             {caption: $L("More Apps by this Developer"), onclick: "moreAppsClicked"},
             {caption: $L("About"), onclick: "showAboutPopup"},*/
             {caption: $L("Help"), onclick: "showHelp"},
         ]},
    ],

     // declare 'published' properties
    published: {
        calledFromExtern: false,
        offlineMode: true,
        webViewMaximized: false,
        filterTags: "",
    },
    
    create: function() {
        this.log("START");
        this.inherited(arguments);
        this.log("END");
    },
    
    showWelcomePage : function( ) {
        this.log("redirecting to welcomePane");
        this.$.pane.selectViewByName("welcomePane");
    },
    
    checkConnection : function( ) {
        if (Util.isWebOS()) {
            this.log("webos detected")
            this.$.connection.call({}); 
        } else if (Util.isBrowser() == true) {
            this.log("browser detected")
            var inResponse = { "isInternetConnectionAvailable": true };
            this.connectionResponseHandler( "null", inResponse );
        } else if (Util.isBlackBerry()) {
            var conn = blackberry.system.hasDataCoverage();
            var inResponse = { "isInternetConnectionAvailable": conn };
            this.connectionResponseHandler( "null", inResponse );
        } else {
            this.log("no webos or browser detected, using phonegap!")
            var networkState = navigator.network.connection.type;
        
            // var states = {};
            // states[Connection.UNKNOWN]  = 'Unknown connection';
            // states[Connection.ETHERNET] = 'Ethernet connection';
            // states[Connection.WIFI]     = 'WiFi connection';
            // states[Connection.CELL_2G]  = 'Cell 2G connection';
            // states[Connection.CELL_3G]  = 'Cell 3G connection';
            // states[Connection.CELL_4G]  = 'Cell 4G connection';
            // states[Connection.NONE]     = 'No network connection';
        
            // alert('Connection type: ' + states[networkState]);
            var inResponse = { "isInternetConnectionAvailable": true };
            if (networkState == Connection.NONE) {
                inResponse = { "isInternetConnectionAvailable": false };
            }
            this.connectionResponseHandler( "null", inResponse );
        }
    },
    
    normalStart : function ( ) {
        this.log("START");
        
        // if somebody gets here, there could no bg sync active!
        localStorage.setItem("syncInProgress", false);
        Util.getSettings( true );
        
        enyo.keyboard.setResizesWindow( true ); 
        
        enyo.nextTick( this, "rotationLock" );
                
        // check if this is the first start
        this.log("Util.getSettings().lastVersion: ", Util.getSettings().lastVersion);
        this.log("Util.getSettings().accountVerified: ", Util.getSettings().accountVerified);
        if (Util.getSettings().lastVersion == "" || Util.getSettings().accountVerified != true) {
            this.showWelcomePage();
            return;
        } else {
            // FIXME test only
            // this.setLastVersion("1.0.0") ;
            var appinfo = enyo.fetchAppInfo();
            this.log("currentVersion: " + appinfo.version);
            this.log("lastVersionUsed: " + Util.getSettings().lastVersion);
            if (appinfo.version != Util.getSettings().lastVersion) {
                this.log("new version detected, showing changelog");
                localStorage.setItem("lastVersion", appinfo.version);
                this.$.changelogDialog.openAtCenter();  
            }
        } 

         this.$.pane.selectViewByName("previewSlidingPane");


        // check connection state     
        enyo.nextTick( this, "checkConnection" );

        this.setCalledFromExtern(false);
        if (this.$.dataManager.getItemsAll().length > 0) {
            enyo.nextTick( this, "showItemsFromStorage" );
            var lastRead = Util.getSettings().lastRead;
            this.log("lastRead: " + lastRead);
            if (lastRead != "" && lastRead != null && Util.isTablet() && 1==1) {
                this.log("loading last article...");
                var lastRow = Util.getSettings().lastRow;
                this.log("lastRow: " + lastRow);
                var selObj = Util.getElementFromArrayById( this.$.dataManager.getItemsAll(), lastRead);
                this.log("selObj: " + selObj);
                if (selObj != null) {
                    this.$.itemListPane.setSelectedObj( selObj );
                    this.$.itemListPane.loadLocalData( lastRead );
                    if (lastRow != -1) {
                        this.$.itemListPane.setSelectedRow( lastRow );
                        // this.$.itemListPane.$.feedList.render();  
                        this.$.itemListPane.$.feedList.refresh();  
                        var scrollerArticle = Util.getSettings().scrollerArticle;
                        this.log("scrollerArticle: " + scrollerArticle);
                        this.$.feedWebViewPane.setArticleScrollPosition( scrollerArticle );
                    }
                }
            }
            this.$.feedWebViewPane.onRotateWindow( true );
             this.$.previewPane.loadArticles();  
        } else {
            this.$.itemListPane.selectView("emptyList");
            this.$.feedWebViewPane.showEmptyPage();
        }
        this.log("END");
    },
    
    showItemsFromStorage : function() {
        this.log("START");
        // show just the items with the selected state
        this.log("preparing '" + Util.getSettings().itemState + "' items...");
        this.$.dataManager.setFeedItems( this.$.dataManager.getFeedItemsByStateAndTag(Util.getSettings().itemState, Util.getSettings().filterTags, true ) );
        
        // show content
        // this.log("render itemlist...");
        // this.$.itemListPane.$.feedList.render();
        // this.log("refreshing itemlist...");
        // this.$.itemListPane.$.feedList.refresh();
        var count = this.$.dataManager.getFeedItems().length;
        this.log("updating countLabel to " + count + " items");
        this.$.itemListPane.$.countLabel.setContent(count + $L(" items"));
        if (this.$.dataManager.getItemsAll().length == 0) {
            this.$.itemListPane.selectView("emptyList");
        } else {
            this.$.itemListPane.selectView("scroller");
        }
        this.log("finished!");
        this.log("END");
    },
    
    disableItemListPaneControls : function( disabled ) {
        // this.log("START");
        if (disabled !== undefined) {
            // this.$.itemListPane.$.itemStateSelector.setDisabled( disabled );
            this.$.itemListPane.$.orderSelector.setDisabled( disabled );
            this.$.itemListPane.$.searchBox.setDisabled( disabled );
            this.$.itemListPane.$.addButton.setDisabled( disabled );
            this.$.itemListPane.$.refreshButton.setDisabled( disabled );
            this.$.itemListPane.$.countLabel.setStyle( "color: #CFCFCF" );
        }
        // this.log("END");
    },
    
   loadItemList : function() {
        this.$.dataManager.loadItemList( false );
   },
   
    refreshFeedItemsListLite: function() {
        this.log("START");
        this.log();

        // this.$.feedWebViewPane.showEmptyPage();
        // this.$.itemListPane.clearSelection();
        // this.setFeedItems([]);
        
        this.loadItemList( );
        
        // this.$.itemListPane.hideListSpinner();
        this.log("END");
    },
    
    ////////////////////////////////////////////
    // APP MENU - START
    ////////////////////////////////////////////
    showAboutPopup : function() {
        // this.log("showAboutPopup()");
        this.$.about.openAtCenter();  
    },

    showChangelog : function() {
        // this.log("showAboutPopup()");
        this.$.changelogDialog.openAtCenter();  
    },

    showHelp : function() {
        // this.$.launchBrowserCall.call({"id": "com.palm.app.browser", "params":{"target": "http://sven-ziegler.com/wordpress/?page_id=86"}});
        this.$.help.openAtCenter();
    },

    showOnlineSupport : function() {
        // this.$.launchBrowserCall.call({"id": "com.palm.app.browser", "params":{"target": "http://sven-ziegler.com/wordpress/?page_id=81"}});
        this.$.myservices.callAppManService( "mailto:webos@webosarchive.org" );
    },

    showPreferences : function() {
        // this.log("showPreferences()");
        if (this.$.pane.getViewName() == "feedSlidingPane" || this.$.pane.getViewName() == "previewSlidingPane") {
            this.$.pane.selectViewByName("preferences");
        } else {
            this.showFailurePopup($L("Please finish the active task before!"), $L("Failure!"));
        }
    },
    
    showQuickStartGuide : function( ) {
        if (this.$.pane.getViewName() == "feedSlidingPane") {
            this.$.pane.selectViewByName("welcomePane");
            this.$.welcomePane.startAsQuickGuideOnly( true );
        } else {
            this.showFailurePopup($L("Please finish the active task before!"), $L("Failure!"));
        }
    },
    
    ////////////////////////////////////////////
    // APP MENU - END
    ////////////////////////////////////////////

    showFeedFailurePopup : function( msg ) {
        this.log("START");
        this.$.popupDialog.openAtCenter();  
        this.$.popupDialog.setTitle($L("Failure!"));
        this.$.popupDialog.setMessage( $L(msg) );
        this.$.popupDialog.hideCancelButton();
        this.log("END");
    },
    
    showFailurePopup : function ( str, title ) {
        this.$.popupDialog.openAtCenter();  
        if (title !== undefined) {
            this.$.popupDialog.setTitle( $L(title) );
        } else {
            this.$.popupDialog.setTitle($L("Failure!"));
        }
        this.$.popupDialog.setMessage($L(str));
        this.$.popupDialog.hideCancelButton();
    },

    showFailurePopup2 : function ( str, title ) {
        this.$.popupDialog2.openAtCenter();  
        if (title !== undefined) {
            this.$.popupDialog2.setTitle( $L(title) );
        } else {
            this.$.popupDialog2.setTitle($L("Failure!"));
        }
        this.$.popupDialog2.setMessage($L(str));
        this.$.popupDialog2.hideCancelButton();
    },

    connectionResponseHandler: function( inSender, inResponse ) {
        this.log("START");
        this.log(inResponse);
        var online = false;
        if (inResponse.isInternetConnectionAvailable == true) {
            this.log("device is online");
            online = true;
        } else {
            this.log("device is offline");
        }
        localStorage.setItem("online", online);
        Util.getSettings( true );
        
        if (this.$.itemListPane) {
            this.$.itemListPane.setOnline( online );
        }
        if (this.$.previewPane) {
            this.$.previewPane.setOnline( online );
        }
        
        this.log("Util.getSettings().autoSync: " + Util.getSettings().autoSync);
        if (online && Util.getSettings().autoSync == true) {
            // sync itemlist + articles
            this.$.dataManager.doSync( false );
        } else {
            this.log("autosync is disabled");
        }       
        
        this.log("END");
    }, 
    
    showAddLinkDialog : function ( params ) {
        this.log(params);
        // check if called from external
        this.$.addItemDialog.openAtCenter();  
        this.$.addItemDialog.resetAddItemDialog();
        this.$.addItemDialog.checkClipboard();
        if (params !== undefined) {
            this.log("called from external...");
            if (params.title !== undefined && params.title != null && params.title.length > 0) {
                this.$.addItemDialog.setParams( params.url, params.title, "addLink");
                this.$.addItemDialog.onSubmit();
            } else {
                this.$.addItemDialog.setParams( params.url, null, "addLink");
                // this.$.addItemDialog.onSubmit();
            }
        } else {
            
            
            
            // this.log("this.getItemsAll().length: " + this.getItemsAll().length);
            
            // if (this.getItemsAll().length == 0) {
                // this.showFailurePopup ("Because of a bug in the ReadItLater API you have to add your first article to the reading list not via an external app like ReadOnTouch. Go to <a href=\"http://readitlaterlist.com/edit/\" and add a sample site.", "Information" );
            // }
            


            
            this.$.addItemDialog.setFuncName( "addLink");
        }
    },

    showProgressPopup : function ( state, caption, pos, number, total, finished, func ) {
        // this.log("pos: " + pos);
        this.$.progressDialog.openAtCenter();  
        this.$.progressDialog.updateProgress( state, caption, pos, number, total, finished, func );
    },
    
    slidingResize : function( inSender, inValue ) {
        this.log("START");
        if (inValue != null) {
            this.log("inValue: " + inValue);
            // var info = enyo.fetchDeviceInfo();
            var screenWidth = Util.screenWidth;
            this.log("screenWidth: " + screenWidth);
            var posEnd = inValue.lastIndexOf("px");
            var value = inValue.substring(0, posEnd);
            this.log("value: " + value);
            if (screenWidth == value) {
                this.setWebViewMaximized( true );
            } else {
                this.setWebViewMaximized( false );
            }
            this.$.feedWebViewPane.onRotateWindow( true );
        }
        this.log("END");
    },
    
    resizeWebView : function( ) {
        this.log("START");
        // var s = enyo.fetchControlSize(this);
        // this.log("w: " + s.w);
        // this.log("h: " + s.h);
        this.$.feedSlidingPane.selectViewByName("itemListPane");
        // this.$.feedSlidingPane.selectViewByName("feedWebViewPane").applyStyle('height', '630px');
        this.log("END");
    },
    
    zoomInWebPanel:function() {
        this.log("active pane: " + this.$.pane.getViewName());
        if (this.$.pane.getViewName() == "feedSlidingPane") {
            this.$.pane.selectView(this.$.feedSlidingPane);
        } else {
        	this.$.pane.selectView(this.$.previewSlidingPane);
        }
        this.$.feedSlidingPane.selectView(this.$.feedWebViewPane);
    },
    
    onOpenAppMenu : function() {
        this.log();
        this.$.appMenu.open();
    },
    
    onWindowRotated : function( ) {
        if (Util.isWebOS()) {
            this.log("enyo.getWindowOrientation: " + enyo.getWindowOrientation);
            var info = enyo.fetchDeviceInfo();
            this.log(enyo.json.stringify(info));
            Util.deviceName = info.modelNameAscii;
            Util.screenWidth = info.screenWidth;
            Util.screenHeight = info.screenHeight;
        } else if (Util.isPlaybook()) {
            var orientation = window.orientation;
            this.log("orientation: " + orientation);
            if (orientation == 0) { // landscape mode
                this.log("switched to landscape");
                // Util.screenWidth = 1024;
                // Util.screenHeight = 600;
                Util.screenWidth = screen.width;
                Util.screenHeight = screen.height;
            } else {
                this.log("switched to portrait");
                // Util.screenWidth = 600;
                // Util.screenHeight = 1024;
                Util.screenWidth = screen.width;
                Util.screenHeight = screen.height;
            }
        }
        // this.$.feedWebViewPane.render();
        
        this.$.feedWebViewPane.onRotateWindow();
    },

    obBackGesture : function(inSender, inEvent) {
       enyo.setFullScreen( false );
       this.$.feedSlidingPane.back(inEvent);
       inEvent.stopPropagation();
   },
   
    windowParamsChangeHandler: function() {
    /*    this.error(enyo.windowParams);
        this.onApplicationRelaunch();
        return true;*/
        this.log("START");
        this.log(enyo.windowParams);
        if (enyo.windowParams.action == "addLink") {
            // TODO check online state
            this.log("added from external...");
            this.setCalledFromExtern(true);
            this.showAddLinkDialog(enyo.windowParams);
        } else if (enyo.windowParams.action == "updateUi") {
            this.error("the UI must refreshed, because there is new data available :-)");
            // this.showFeedFailurePopup("the UI must refreshed, because there is new data available :-)", "Strike!");
            this.$.dataManager.reloadData();
            this.showItemsFromStorage();
        }
        this.log("END");
        return true;
    },
    
    /*addItemDialog : function() {
        this.log("START");
        this.log();
        this.$.addItemDialog.openAtCenter();  
        this.$.addItemDialog.resetAddItemDialog();
        this.log("END");
    },*/
   
   rotationLock : function() {
       // this.error();
       this.log("Util.getSettings().useRotationLock: " + Util.getSettings().useRotationLock);
        if (Util.isWebOS() == true && Util.isTouchpad() == false && Util.getSettings().useRotationLock == true) {
           // this.error("rotate!");
            enyo.setAllowedOrientation("portrait"); //"landscape"  
        }
   },
   
   showMenuDialog : function() {
       this.log();
       this.$.menuDialog.openAtCenter();  
   },

   onMenuSelect : function( inSender, inValue ) {
       this.$.menuDialog.close();
       this.log("inValue: " + inValue);
        switch (inValue) {
            case "1": 
                this.showPreferences();
            break;
            case "2": 
                this.showQuickStartGuide();
            break;
            case "3": 
                this.showChangelog();
            break;
            case "4": 
                this.showAboutPopup();
            break;
            case "6": 
                this.rateMeClicked();
            break;
            case "7": 
                this.moreAppsClicked();
            break;
            default: 
                this.showHelp();
            break;
        }
   },
   
   rateMeClicked : function() {
       if (Util.isWebOS()) {
           var finderApp = "com.palm.app.enyo-findapps";
           if (Util.isTouchpadOrPre3() && !Util.isTouchpad()) {
               finderApp = "com.palm.app.findapps";
           }
           this.$.launchApp.call({id: finderApp, params: {target: "http://developer.palm.com/appredirect/?packageid=org.webosarchive.readontouch"}});
       } else {
           var url = Platform.getReviewURL();
           Platform.browser( url, this )();
       }
   },
    
   moreAppsClicked : function() {
       if (Util.isWebOS()) {
           var finderApp = "com.palm.app.enyo-findapps";
           if (Util.isTouchpadOrPre3() && !Util.isTouchpad()) {
               finderApp = "com.palm.app.findapps";
           }
           this.$.launchApp.call({id: finderApp, params: {target: "http://developer.palm.com/appredirect/?packageid=com.sven-ziegler.meorg"}});
       } else {
           var url = "http://appworld.blackberry.com/webstore/vendor/26457/";           
           Platform.browser( url, this )();
       }
   },
    
}); 