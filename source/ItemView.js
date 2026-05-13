enyo.kind({
    name: "ItemView",
    kind: enyo.SlidingView,
    components: [
        {name: "link", kind: "UrlEmail"},
        (Util.isTablet() == true ? 
        {name: "headerToolbar", kind: "Toolbar", pack: "center", components: [
            {kind: enyo.HFlexBox, flex: 1, components: [
                {kind: enyo.HtmlContent, content: "", name: "selectedItemName", style: "text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 18px; color: white; margin-left: 8px; ", flex: 1, align: "left"},
                {kind: enyo.Spinner, name: "feedWebViewSpinner", align: "right"}
            ]}
        ]}  :  "null"),
        {name: "scrollerArticle", autoHorizontal: false, horizontal: false, kind: (Util.isTablet() ? enyoextras.ScrollBarsScroller : enyo.Scroller), flex: 1, onScrollStart: "onScrollStart", onScrollStop: "onScrollStop", ongesturestart: "gesturestartHandler", ongestureend: "gestureendHandler", style: "background-color: #FFFFFF; margin: 0px; padding: 0px; ", components: [
            {kind: enyo.HtmlContent, name: "currentArticleView", flex: 1, style: "margin-left: 8px; margin-right: 8px;", onResize: "resizeWebView", className: Util.getClassName("article-view"), onLinkClick: "linkClicked", ondblclick: "onDoubleClick", onclick: "onClickCalled"},
        ]},
        {name: "scrollerWeb", kind: enyo.Scroller, flex: 1, ongesturestart: "gesturestartHandler", ongestureend: "gestureendHandler", style: "background-color: #FFFFFF; margin: 0px; padding: 0px; ", components: [
            {kind: (Util.isWebOS() && Util.isTouchpad() ? enyo.WebView : enyo.iframe), name: "currentWebView", flex: 1, style: "margin: 10px; padding: 0px;  ", onLoadComplete: "loadComplete", onLoadStarted: "duringLoad", onResize: "resizeWebView"},
        ]},
        {name: "footerToolbar", kind: enyo.Toolbar, pack: "center", components: [
            {kind: "GrabButton", align : "left" },
            {kind: "Spacer"}, 
            {kind: (Util.isTouchpad() || Util.isBrowser() ? enyo.RadioToolButtonGroup : null), name: "radioButtons", onclick: "switchView", value: "text", components: [
              {caption: $L("Article"), value: "text", style: "font-size: 0.7em; text-align: center; ", name: "textButton"},
              {caption: $L("Web"), value: "web", style: "font-size: 0.7em; text-align: center; ", name: "webButton"},
            ]},
            {kind: "Spacer"}, 
            {name: "refreshButton",     kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/sync.png" , align: "right", onclick: "refreshWebView"},
            {name: "fontButton",        kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/font.png",  align: "right", onclick: "changeFontSettings"},
            {name: "shareButton",       kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/share.png", align: "right", onclick: "shareItem"},
            /*{name: "fullScreenButton",  kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon: "images/max.png",    align: "right", onclick: "onDoubleClick"},*/
            {name: "openItemButton",    kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/web.png",   align: "right", onclick: "openItemInBrowser"},
            {name: "toggleStateButton", kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/read.png",  align: "right", onclick: "toggleReadState"},
            {name: "markUnreadButton",  kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/add.png",   align: "right", onclick: "toggleReadState"},
        ]},
         {name: "fontDialog", kind: "ReadOnTouch.FontDialog"},
         {name: "linkList", kind: "PopupSelect", onSelect: "popupOpenLinkSelect", items: [
            {name: "linkReadOnTouch", caption: $L("Add link to ReadOnTouch PRO"), value: "0", icon: "images/ReadOnTouch-32-r2.png"}, 
            {name: "linkBrowser", caption: $L("Open link in external browser"), value: "4", icon: "images/help-browser.png"},
         ]},
         {name: "mySpinnerScreen", kind: "ReadOnTouch.SpinnerScreen"},
         {name: "share", kind: "Share"},
    ],

    published: {
        updateArticleInProgress : false,
        articleIsCurrentlyLoading : false,
        urlClicked : "",
        fullscreen: false,
        firstStart: true,
    },
    
    create : function( ) {
        this.inherited(arguments);
        this.viewMode = "text";
        if( this.$.markUnreadButton.getShowing( ) == true ) {
            this.$.markUnreadButton.hide();
        }
    },
    
    rendered : function( ) {
        this.inherited(arguments);
        this.log("START");
        this.log();
        if (Util.isTouchpad() || Util.isBrowser()) {
            if( this.$.scrollerWeb.getShowing( ) == true ) {
                this.$.scrollerWeb.hide(); 
            }

            this.$.radioButtons.setValue("text");
        }
        this.log("END");
    },

    showEmptyPage : function( firstStart ) {
        this.log("START");
        this.log();
        this.setViewMode("text");
        
        this.hideSpinner();
        
        if (Util.isWebOS()) {
            var path = enyo.fetchAppRootPath();
            if (Util.isTouchpad() == true) {
                path += "/html/empty_tp.html";
            } else {
                path += "/html/empty_mobile.html";
            }
            this.$.currentArticleView.setContent( Util.loadFile(path) );
        } else {
            var content = "";
            if (Util.isTablet() == true) {
                content = '<br/><br/><br/><br/><br/><center><img src="images/ReadOnTouch-256-bw-r2a.png" border=0></center>';
            } else {
                content = '<br/><br/><center><img src="images/ReadOnTouch-256-bw-r2a.png" border=0></center>';
            }
            this.$.currentArticleView.setContent( content );
        }
        if (Util.isTablet()) {
            this.log("clearing webview also...");
            this.$.selectedItemName.setContent("");
	        if (Util.isTouchpad() || Util.isBrowser()) {
    	        this.$.radioButtons.setValue("text");
	            this.$.webButton.setDisabled(true);
    	       }
            // this.$.currentWebView.reloadPage();
            // this.$.currentWebView.setUrl( path );
            
            if (this.$.currentWebView != undefined) {
                this.$.currentWebView.destroy();
    
                var kindItem =  {
                    kind: enyo.WebView, 
                    name: "currentWebView", 
                    flex: 1, 
                    style: "margin: 10px; padding: 0px;  ", 
                    onLoadComplete: "loadComplete", 
                    onLoadStarted: "duringLoad", 
                    onResize: "resizeWebView"
                };
    
                this.$.scrollerWeb.createComponent( kindItem, {owner: this} );
                this.$.scrollerWeb.render();
            }
        } else if (!Util.isWebOS() && Util.isTablet()) {
            this.$.selectedItemName.setContent("");
        }    
        this.$.refreshButton.setDisabled(true);
        this.$.fontButton.setDisabled(true);
        this.$.shareButton.setDisabled(true);
        this.$.toggleStateButton.setDisabled(true);
        this.$.markUnreadButton.setDisabled(true);
        this.$.openItemButton.setDisabled(true);
        // this.$.fullScreenButton.setDisabled(true);
        
        if (this.firstStart == false) {
            Util.setItem( "lastRead", "");
            Util.setItem( "lastRow", -1);
            Util.setItem( "scrollerArticle", 0);
        } else {
            this.firstStart = false;
        }

        this.formatArticle();
        this.log("END");
    },
    
    showNotYetPage : function( ) {
        this.log("START");
        this.log();
        if (Util.isWebOS()) {
            var path = enyo.fetchAppRootPath() + "/html/notyet.html"
            this.$.currentArticleView.setContent( Util.loadFile(path) );
        } else {
            var content = '<br/><br/><center><div id=\"article_container\">'+$L("Sorry, but the data was not downloaded");
            if (Util.getSettings().online == false) {
                content += " "+$L("before you got offline!");
            } else {
                content += " "+$L("yet. Try to refresh this article.");
            }
            content += "</div></center>";
            this.$.currentArticleView.setContent( content );
        }
        // this.$.currentArticleView.setUrl(path);
        this.hideSpinner();
        if (Util.isTablet()) {
            this.$.selectedItemName.setContent("");
	        if (Util.isTouchpad() || Util.isBrowser()) {
    	        this.$.radioButtons.setValue("text");
	            this.$.webButton.setDisabled(true);
	       }
        }    
        if (Util.getSettings().online == true) {
            this.$.refreshButton.setDisabled(false);
        } else {
            this.$.refreshButton.setDisabled(true);
        }
        this.$.fontButton.setDisabled(true);
        this.$.shareButton.setDisabled(true);
        this.$.toggleStateButton.setDisabled(true);
        this.$.markUnreadButton.setDisabled(true);
        this.$.openItemButton.setDisabled(true);
        // this.$.fullScreenButton.setDisabled(true);

        this.log("END");
    },
    
    setUrl : function( url, title, state, id ) {
        this.log("isTablet: " + Util.isTablet() + ", url: " + url);
        // this.$.currentFeedItemWebView.$.scroller.punt();
        this.$.scrollerArticle.setScrollTop(0);
        if (Util.isTablet()) {
            this.$.scrollerWeb.setScrollTop(0);
        }

        if (url === undefined || url == undefined || url == null || url == "" || url == "undefined") {
            this.showNotYetPage();
            this.formatArticle();
            return;
        }

        this.log("state: " + state);
        if (state == 0) {
            if( this.$.markUnreadButton.getShowing( ) == true ) {
                this.$.markUnreadButton.hide(); 
            }
            if( this.$.toggleStateButton.getShowing( ) == false ) {
                this.$.toggleStateButton.show(); 
            }

            // this.$.markUnreadButton.applyStyle("display", "none"); 
            // this.$.toggleStateButton.applyStyle("display", null); 
        } else {
            if( this.$.markUnreadButton.getShowing( ) == false ) {
                this.$.markUnreadButton.show(); 
            }
            if( this.$.toggleStateButton.getShowing( ) == true ) {
                this.$.toggleStateButton.hide(); 
            }
            // this.$.markUnreadButton.applyStyle("display", null); 
            // this.$.toggleStateButton.applyStyle("display", "none"); 
        }

        // if (Util.isTouchpad() == true) {
        if (this.viewMode == "web") {
            this.$.currentWebView.setUrl( url );
            this.$.selectedItemName.setContent( title );
            this.$.fontButton.setDisabled( true );
        } else {
            // if (!Util.isBrowser()) {
            if (1==1) {
                this.log("no browser...");
                var content = url;
                if (!Util.isBrowser()) {
                    content = Util.loadFile(url, title);
                }
                if ( Util.getSettings().showImages == true) {
                    this.log("showing images :-)");
                    var obj = Util.getElementFromArrayById( this.owner.$.dataManager.getTextInfo(), id);
                    if (obj != null) {
                        
                        // !!!! --- IMAGES --- !!!! 
                        var images = obj.images;
                        // this.log("images: " + JSON.stringify(images));
                        if (images !== undefined && images != null) {
                            for (index in images) {
                                // this.log("index: " + index);
                                var img = images[index];
                                // this.log("img: " + JSON.stringify(img));
                                var str = "<!--IMG_" + index + "[^>]*>";
                                // this.log("str: " + str);
                                var regExp = new RegExp( str ); 
                                var fn = Util.getFilenameFromURL( img.src );
                                if (fn == "") {
                                    fn = img.src;
                                } else {
                                	fn = id + "_" + fn;
                                    var objImage = Util.getElementFromArrayByFilename( this.owner.$.dataManager.getDownloadedImages(), fn);
                                    if ( objImage != null) {
                                    	this.log("objImage: " + JSON.stringify(objImage));
                                        fn = objImage.file;
                                    } else {
                                        fn = img.src;
                                    }
                                }
                                this.log("fn: " + fn);
                                content = String(content).replace(regExp, "<center><img style='max-width: 100%' border=0 src='" + fn + "' /></center><br/>");
                                // content = String(content).replace(regExp, "<center><img style='max-width: 96%' border=0 src='file:///accounts/1000/appdata/rotd3d238b89a67e34e39b5abf8db19b.testDev_b5abf8db19bb4264f59/data/STREETBALL_WHUDAT-1.jpg' /></center><br/>");
                            }
                        }

                        // !!!! --- VIDEOS --- !!!! 
                        if (Util.isWebOS() || Util.getSettings().online == false) {
                            var videos = obj.videos;
                            // this.log("videos: " + JSON.stringify(videos));
                            if (videos !== undefined && videos != null) {
                                for (index in videos) {
                                    // this.log("index: " + index);
                                    var img = videos[index];
                                    // this.log("img: " + JSON.stringify(img));
                                    var str = "<!--VIDEO_" + index + "[^>]*>";
                                    // this.log("str: " + str);
                                    var regExp = new RegExp( str ); 
                                    var fn = Util.getFilenameFromURL( img.src );
                                    if (fn == "") {
                                        fn = img.src;
                                    } else {
                                        var objImage = Util.getElementFromArrayByFilename( this.owner.$.dataManager.getDownloadedImages(), fn);
                                        if ( objImage != null) {
                                            fn = objImage.file;
                                        } else {
                                            fn = img.src;
                                        }
                                    }
                                    this.log("fn: " + fn);
                                    content = String(content).replace(regExp, '<p style="font-style: italic;">'+$L("Embedded video:")+' <a href="' + fn + '">' + fn + '</a></p>');
                                }
                            }
                        }
                    } else {
                        this.log("no downloaded images available... :-(");
                    }
                }
                // alert("content: " + content);
                this.$.currentArticleView.setContent( content );
            } else {
                this.log("browser!");
                this.$.currentArticleView.setContent( url );
            }
            // this.$.currentArticleView.setContent( "<center><div id=\"article_container\">" + url + "</div></center>", title );
            // this.$.selectedItemName.setContent( title );
            this.loadComplete();
            this.$.fontButton.setDisabled( false );
        }
        this.formatArticle();

        if (Util.isWebOS()) {
            this.log("toggle fullscreen to: " + this.fullscreen);
            enyo.setFullScreen( this.fullscreen );
        }
    },
    
    setViewMode : function( mode ) {
        this.log("START");
        if (mode !== undefined) {
            this.log("set viewmode to: " + mode);
            this.viewMode = mode;  
            if (this.viewMode == "web") {
                if( this.$.scrollerArticle.getShowing( ) == true ) {
                    this.$.scrollerArticle.hide(); 
                }
                if( this.$.scrollerWeb.getShowing( ) == false ) {
                    this.$.scrollerWeb.show(); 
                }
            } else {
                if( this.$.scrollerArticle.getShowing( ) == false ) {
                    this.$.scrollerArticle.show(); 
                }
                if( this.$.scrollerWeb.getShowing( ) == true ) {
                    this.$.scrollerWeb.hide(); 
                }
            }
            if (this.viewMode == "web") {
                this.$.scrollerArticle.hide();
                this.$.scrollerWeb.show();
            } else {
                this.$.scrollerArticle.show();
                this.$.scrollerWeb.hide();
            }
        } else {
            this.error("mode is undefined!");
        }
        if (Util.isTablet() && this.$.selectedItemName.getContent() != "") {
	        if (Util.isTouchpad() || Util.isBrowser()) {
    	        this.$.radioButtons.setValue(mode);
	        }
        }
        this.log("END");
    },
    
    getViewMode : function( ) {
        return this.viewMode;  
    },
    
    switchView : function( inSender, inEvent ) {
        this.log("START");
        if (inSender !== undefined && this.$.webButton.getDisabled() == false) {
            this.log("switchView(): " + inSender.value);
            
            this.setViewMode(inSender.value);
            
            var item = this.getSelectedItem();
            if (this.owner.$.pane.getViewName() == "feedSlidingPane") {
            	this.owner.$.itemListPane.loadLocalData( item.item_id );
            } else {
            	this.owner.$.previewPane.loadLocalData( item.item_id );
            }
        }
        this.log("END");
    },
    
    getSelectedItem : function() {
    	this.log("selected view: " + this.owner.$.pane.getViewName());
    	if (this.owner.$.pane.getViewName() == "feedSlidingPane") {
    		return this.owner.$.itemListPane.getSelectedObj();
    	} else {
    		return this.owner.$.previewPane.getSelectedObj();
    	}    	
    },

    getArticleMaxWidth : function() {
        if (Util.isTablet()) {
            return "690px";
        } else {
            return "300px";
        }
        return 500;
    },

    onRotateWindow : function( force ) {
        
        if (force == undefined || force == false) {
            this.formatArticle();
        }
        
        this.log("Util.isPlaybook():" + Util.isPlaybook());                
        this.log("Util.isPortraitMode():" + Util.isPortraitMode());                
        this.log("!this.owner.getWebViewMaximized():" + !this.owner.getWebViewMaximized());   
        
        var localIsPortrait = (Number(screen.width) < Number(screen.height) ? true : false);
        this.log("width: " + screen.width);
        this.log("height: " + screen.height);
        this.log("localIsPortrait:" + localIsPortrait);
             
                
        if (Util.isPlaybook() && !this.owner.getWebViewMaximized() && (Util.isPortraitMode() || localIsPortrait)) {
            if (Util.isTouchpad() || Util.isBrowser()) {
				if( this.$.radioButtons.getShowing( ) == true ) {
        	        this.$.radioButtons.hide(); 
            	}
            }
            if( this.$.fontButton.getShowing( ) == true ) {
                this.$.fontButton.hide(); 
            }
            if( this.$.shareButton.getShowing( ) == true ) {
                this.$.shareButton.hide(); 
            }
        } else {
            if( this.$.radioButtons.getShowing( ) == false ) {
                this.$.radioButtons.show(); 
            }
            if( this.$.fontButton.getShowing( ) == false ) {
                this.$.fontButton.show(); 
            }
            if( this.$.shareButton.getShowing( ) == false ) {
                this.$.shareButton.show(); 
            }
        }
    },
    
    formatArticle : function( ) {
        this.log();
        
        // load settings from storage
        var theme = Util.getSettings().theme;
        
        this.$.currentArticleView.addStyles("font-size: " + Util.getSettings().fontsize + "; line-height: " + Util.getSettings().lineSpacing + "; font-family: " + Util.getSettings().fontfamily );    
        this.$.currentArticleView.render();    
        
        if (theme == "Day") {
            this.$.scrollerArticle.applyStyle( "background-color", "#ffffff" );
            this.$.currentArticleView.applyStyle( "background-color", "#ffffff" );
            this.$.currentArticleView.applyStyle( "background-color", "#ffffff" );
            this.$.currentArticleView.applyStyle( "color", "#000000" );
        } else if (theme == "Night") {
            this.$.scrollerArticle.applyStyle( "background-color", "#000000" )
            this.$.currentArticleView.applyStyle( "background-color", "#000000" )
            this.$.currentArticleView.applyStyle( "background-color", "#000000" );
            this.$.currentArticleView.applyStyle( "color", "#ffffff" );
        } else if (theme == "Paperback") {
            this.$.scrollerArticle.applyStyle( "background-color", "#cac0a2" )
            this.$.currentArticleView.applyStyle( "background-color", "#cac0a2" )
            this.$.currentArticleView.applyStyle( "background-color", "#cac0a2" );
            this.$.currentArticleView.applyStyle( "color", "#161616" );
        } else if (theme == "green") {
            this.$.scrollerArticle.applyStyle( "background-color", "#000000" )
            this.$.currentArticleView.applyStyle( "background-color", "#000000" )
            this.$.currentArticleView.applyStyle( "background-color", "#000000" );
            this.$.currentArticleView.applyStyle( "color", "#4dee28" );
        } else if (theme == "amber") {
            this.$.scrollerArticle.applyStyle( "background-color", "#000000" )
            this.$.currentArticleView.applyStyle( "background-color", "#000000" )
            this.$.currentArticleView.applyStyle( "background-color", "#000000" );
            this.$.currentArticleView.applyStyle( "color", "#eeba28" );
        }

        if (Util.getSettings().fixedWidth == true) {
            this.$.currentArticleView.applyStyle( "width", this.getArticleMaxWidth() );    
        } else {
            this.$.currentArticleView.applyStyle( "width", "95%" );    
        } 
    },    

    loadComplete: function( ) {
        this.log("START");
        this.log("Util.getSettings().online: " + Util.getSettings().online);

        this.updateArticleInProgress = false;
        this.log("updateArticleInProgress: " + this.updateArticleInProgress);
        this.setArticleIsCurrentlyLoading(false);
        this.onRotateWindow();
        // this.formatArticle();
        this.hideSpinner();
        if (Util.isTouchpad() || Util.isBrowser()) {
            this.$.webButton.setDisabled( !Util.getSettings().online );
        }
    
        this.$.shareButton.setDisabled(false); 
        if (/*this.$.selectedItemName.getContent() != "" &&*/ Util.getSettings().online == true)
        {
            this.$.toggleStateButton.setDisabled(false); 
            this.$.markUnreadButton.setDisabled(false);
            this.$.refreshButton.setDisabled(false);
            if (this.viewMode == "web") {
                this.$.fontButton.setDisabled( true );
            } else {
                this.$.fontButton.setDisabled( false );
            }
            this.$.openItemButton.setDisabled(false); 
            // this.$.fullScreenButton.setDisabled(false);

	        if (Util.isTouchpad() || Util.isBrowser()) {
                this.$.radioButtons.setValue( this.getViewMode() );
            }

            /*this.$.copyContent.setDisabled(false); 
            this.$.itemEMail.setDisabled(false); 
            this.$.itemMessaging.setDisabled(false); 
            this.$.itemFacebook.setDisabled(false); 
            this.$.itemTwitter.setDisabled(false); 
            this.$.itemGoogle.setDisabled(false); 
            this.$.itemBufferapp.setDisabled(false);*/ 
            
        } else if (/*this.$.selectedItemName.getContent() != "" &&*/ Util.getSettings().online == false) {
            
            /*this.$.copyContent.setDisabled(false); 
            this.$.itemEMail.setDisabled(false); 
            this.$.itemMessaging.setDisabled(false); 
            this.$.itemFacebook.setDisabled(true); 
            this.$.itemTwitter.setDisabled(true); 
            this.$.itemGoogle.setDisabled(true); 
            this.$.itemBufferapp.setDisabled(true);*/ 
            
            this.$.toggleStateButton.setDisabled(false); 
	        if (Util.isTouchpad() || Util.isBrowser()) {
                this.$.radioButtons.setValue( this.getViewMode() );
            }
        } else {
            // this.error("this.$.selectedItemName.getContent(): " + this.$.selectedItemName.getContent());
            this.log("Util.getSettings().online: " + Util.getSettings().online);
        }
        this.log("END");
    },
    
    duringLoad: function( ) {
        this.log("START");
        // this.log(this.$.selectedItemName.getContent());

        if (this.viewMode == "web") {
            this.setArticleIsCurrentlyLoading(true);
            this.showSpinner();
            if (Util.isTouchpad() || Util.isBrowser()) {
                this.$.webButton.setDisabled( !Util.getSettings().online );
            }
    
            if (/*this.$.selectedItemName.getContent() != "" &&*/ Util.getSettings().online == true)
            {
                this.$.toggleStateButton.setDisabled(false); 
                this.$.markUnreadButton.setDisabled(false);
                this.$.refreshButton.setDisabled(false);
                if (this.viewMode == "web") {
                    this.$.fontButton.setDisabled( true );
                } else {
                    this.$.fontButton.setDisabled( false );
                }
                this.$.shareButton.setDisabled(false); 
                this.$.openItemButton.setDisabled(false); 
                // this.$.fullScreenButton.setDisabled(false);
                 
	        if (Util.isTouchpad() || Util.isBrowser()) {
                    this.$.radioButtons.setValue( this.getViewMode() );
                }
            } else if (/*this.$.selectedItemName.getContent() != "" &&*/ Util.getSettings().online == false) {
                this.$.toggleStateButton.setDisabled(false); 
		        if (Util.isTouchpad() || Util.isBrowser()) {
                    this.$.radioButtons.setValue( this.getViewMode() );
                }
            } else {
                // this.error("AHA!!!!");
            }
        }
        this.log("END");
    },
    
    refreshWebView: function( ) {
        this.log("START");
        this.log();
        if (this.getViewMode() == "text") {
            this.showSpinner();
            var item = this.getSelectedItem();
            this.log("item_id: " + item.item_id);
            enyo.asyncMethod( this.owner, this.owner.$.dataManager.loadArticle( item.item_id, item.url, true ) );
            this.setUpdateArticleInProgress(true);
        } else {
            if (this.viewMode == "web") {
                this.$.currentWebView.reloadPage();
            }
            else {
                var item = this.owner.$.itemListPane.getSelectedItem();
                var file = this.owner.$.dataManager.getDownloadedArticleContent( item.item_id );
                this.$.currentArticleView.setContent( Util.loadFile( file, item.title ) ); 
            }
        }
        this.log("END");
    },
    
    updateArticle : function ( successful ) {
        this.log("START");
        // this.showSpinner();
        if ( successful == true) {
            // if (Util.isTouchpad() == true) {
            if (this.viewMode == "web") {
                this.$.currentWebView.reloadPage();
            }
            else {
	            var item = this.getSelectedItem();
                // var file = this.owner.$.dataManager.getDownloadedArticleContent( item.item_id, item.title );
                // this.$.currentArticleView.setContent( Util.loadFile( file ) ); 
                var file = this.owner.$.dataManager.getDownloadedArticleContent( item.item_id );
                this.setUrl(file, item.oldTitle, item.state);
                // this.$.currentArticleView.setContent( Util.loadFile(url, title) );
            }
        } else {
            this.owner.showFailurePopup($L("Could not reload article! Please try again later."));
        }
        this.log("END");
    },
    

   toggleReadState: function( a, b, inId, inUrl, inIndex ) {
        this.log("START");
        this.log("inId: " + inId);
        this.log("inUrl: " + inUrl);
        var id, url;
        if (inId !== undefined && inUrl !== undefined) {
            id = inId;
            url = inUrl;
        } else {
            var item = this.getSelectedItem();
            id = item.item_id;
            url = item.url;
        }
        this.log("id: " + id);
        this.log("url: " + url);
       
       // this.showSpinner();
       
        if (Util.getSettings().online == true) {
            this.owner.$.dataManager.toggleReadStateOnline( id, url, inIndex );
        } else {
            this.owner.$.dataManager.toggleReadStateOffline( id );
        }
       

        this.log("END");
    },

    popupOpenLinkSelect : function( inSender, inValue ) {
        this.log("START");
        this.log("inSender: " + inSender);
        this.log("inValue: '" + inValue.value +"'");
        if (inValue !== undefined) {
            switch (inValue.value) {
                case "0": 
                    var params = {
                        url : this.getUrlClicked() 
                    };
                    this.owner.showAddLinkDialog( params );
                    break;
                default: 
                    this.openLinkInBrowser( this.getUrlClicked() );
                    break;
            }
        } else {
            this.warn("inValue is undefined or client is offline!");
        }
        this.log("END");
    },

    openItemInBrowser : function( ) {
        this.log("START");
        var item = this.getSelectedItem();
        Platform.browser( item.url, this )();
        this.log("END");
    },

    openLinkInBrowser : function( url ) {
        this.log("START");
        Platform.browser( url, this )();
        this.log("END");
    },

    launchFinished: function( inSender, inResponse ) {
        this.log("START");
        this.log("Launch app success, results=" + enyo.json.stringify(inResponse));
        this.log("END");
    },
    
    launchFail: function( inSender, inResponse ) {
        this.log("START");
        this.error("Launch app failure, results=" + enyo.json.stringify(inResponse));
        if (inResponse.errorText=='"com.maklesoft.browser" was not found') {
            this.owner.$.appMissing.setAppTitle($L("Advanced Browser"));
            this.owner.$.appMissing.setAppId("com.maklesoft.browser");
            this.owner.$.appMissing.openAtCenter();
        } else if (inResponse.errorText=='"com.sven-ziegler.meorg" was not found') {
            this.owner.$.appMissing.setAppTitle($L("OrganizeMe!"));
            this.owner.$.appMissing.setAppId("com.sven-ziegler.meorg");
            this.owner.$.appMissing.openAtCenter();
        }

        /*if (inResponse.errorText.indexOf("maklesoft") != -1) {
            this.owner.showFailurePopup("The AdvancedBrowser could not be found. Please change your settings!", "Failure");
        }*/
        this.log("END");
    },
    
/*    doUrlRedirected : function( ) {
        if (this.getArticleIsCurrentlyLoading() == false) {
            this.owner.showFailurePopup("DU STROLCH!");
        }
}, */
    showSpinner : function( ) {
        this.log("START");
        if (Util.isTablet()) {
            this.log("tablet");
            if( this.$.feedWebViewSpinner.getShowing( ) == false ) {
                this.$.feedWebViewSpinner.show(); 
            }
        } else {
            this.log("handy");
            this.$.mySpinnerScreen.showSpinner();
        }
        this.log("END");
    },
    
    hideSpinner : function( ) {
        this.log("START");
        if (Util.isTablet()) {
            this.log("tablet");
            if( this.$.feedWebViewSpinner.getShowing( ) == true ) {
                this.$.feedWebViewSpinner.hide(); 
            }
        } else {
            this.log("handy");
            this.$.mySpinnerScreen.hideSpinner();
        }
        this.log("END");
    },
    
    resizeWebView: function( ) {
        this.log("START");
        console.log();
        if (Util.isTablet()) {
            this.owner.$.feedWebViewPane.$.currentArticleView.resize();
            this.owner.$.feedWebViewPane.$.currentWebView.resize();
        }
        this.log("END");
    },
    
    changeFontSettings : function( ) {
        this.$.fontDialog.openAtCenter();  
    },
    
    linkClicked: function (inSender, inEvent) {
        if (this.isScrolling == true) {
            this.log("article is currently scrolling...")
            return;
        }
        this.log("inSender: " + inSender);
        // this.log("inEvent: " + enyo.json.stringify(inEvent));
        this.log("this.gesturing: " + this.gesturing);
        this.log("this.dragging: " + this.dragging);
        if (inEvent !== undefined && inEvent != null) {
            var item = this.getSelectedItem();
            var link = "";
            var appinfo = enyo.fetchAppInfo();
            var pos = inEvent.indexOf(appinfo.id + "/");
            this.log("pos: " + pos);
            if (pos != -1 && pos + appinfo.id.length < inEvent.length) {
                var newPos = pos + appinfo.id.length;
                link = item.url + inEvent.substr(newPos+1, inEvent.length);
            } else {
                var start = inEvent.substr(0,4);
                this.log("start: " + start);
                if (start == "file") {
                    var str = inEvent.substr( 7, inEvent.length );
                    if (str.substr(0,1) == "/") {
                        link = Util.getHostname( item.url ) + str;
                    } else {
                        link = item.url + str;
                    }
                } else {
                    link =  inEvent;
                }
            }
            this.log("link: " + link);
            this.setUrlClicked( link )
            this.$.linkList.openAtCenter( );
        }
    },
    
    /*dragstartHandler: function(inSender, inEvent) {
      if (this.gesturing) { return true; }
      this.dragging = true;
    
      if (Math.abs(inEvent.dy/inEvent.dx) <= 1 && inEvent.dx <= 0) { 
          this.log("swipe: right");
        // 'right' swipe
      } else if (Math.abs(inEvent.dy/inEvent.dx) <= 1 && inEvent.dx > 0) { 
          this.log("swipe: left");
        // 'left' swipe
      } else if (Math.abs(inEvent.dy/inEvent.dx) > 1 && inEvent.dy <= 0) { 
          this.log("swipe: down");
        // 'down' swipe
      } else if (Math.abs(inEvent.dy/inEvent.dx) > 1 && inEvent.dy > 0) { 
          this.log("swipe: up");
        // 'up' swipe
      }
    }, 
    
    dragfinishHandler: function(inSender, inEvent) {
      enyo.nextTick(this, function() { this.dragging = false; } );
    },*/ 
    
    gesturestartHandler: function(inSender, inEvent) {
      this.gesturing = true;
      this.gesture = {
        x: inEvent.centerX,
        y: inEvent.centerY
      };
    }, 
    
    gestureendHandler: function(inSender, inEvent) {
      enyo.nextTick(this, function() { this.gesturing = false; } );
      var dy = inEvent.centerY - this.gesture.y;
      var dx = inEvent.centerX - this.gesture.x;
    
      if (Math.abs(dy/dx) > 1 && dy <= 0) { 
          // 'down' power swipe
          this.log("power-swipe: down");
          if (this.viewMode == "web") {
              this.$.scrollerWeb.scrollToBottom();
          } else {
              this.$.scrollerArticle.scrollToBottom();
          }
      } else if (Math.abs(dy/dx) > 1 && dy > 0) { 
          // 'up' power swipe
          this.log("power-swipe: up");
          if (this.viewMode == "web") {
              this.$.scrollerWeb.setScrollTop(0);
          } else {
              this.$.scrollerArticle.setScrollTop(0);
          }
      }
    },
    
    onScrollStart : function(inSender, inEvent) {
        // this.log();
        this.isScrolling = true;
    },
    
    onScrollStop : function(inSender, inEvent) {
        // this.log();
        this.isScrolling = false;
        // this.log("scrollerArticle: " + this.$.scrollerArticle.getScrollTop());
        if (this.$.scrollerArticle.getScrollTop() > 0) {
            Util.setItem("scrollerArticle", this.$.scrollerArticle.getScrollTop());
        }
    },
    
   onDoubleClick : function( ) {
       this.fullscreen = !this.fullscreen;
       this.log("toggle fullscreen to: " + this.fullscreen);
       if (this.fullscreen == true) {
           var theme = Util.getSettings().theme;
           if (theme == "Day") {
               this.owner.$.feedSlidingPane.applyStyle( "background-color", "#ffffff" );
           } else if (theme == "Paperback") {
               this.owner.$.feedSlidingPane.applyStyle( "background-color", "#cac0a2" );
           }
           if (this.$.footerToolbar.getShowing( ) == true) {
               this.$.footerToolbar.hide(); 
           }
           if (Util.isTablet() == true) {
               if (this.$.headerToolbar.getShowing( ) == true) {
                   this.$.headerToolbar.hide(); 
               }
               enyo.nextTick( this.owner, "zoomInWebPanel" );
           }
       } else {
           this.owner.$.feedSlidingPane.applyStyle( "background-color", "#000000" );
           if (this.owner.getWebViewMaximized() == true) {
               enyo.nextTick( this.owner, "resizeWebView" );   
           }
           if (Util.isTablet() == true) {
                if( this.$.headerToolbar.getShowing( ) == false ) {
                    this.$.headerToolbar.show(); 
                }
           }
           if( this.$.footerToolbar.getShowing( ) == false ) {
               this.$.footerToolbar.show(); 
           }
       }
       
       if (Util.isWebOS()) {
           enyo.setFullScreen( this.fullscreen );
       }
   }, 
   
/*   onDoubleClick : function( ) {
       this.fullscreen = !this.fullscreen;
       this.log("toggle fullscreen to: " + this.fullscreen);
       var style = null;
       if (this.fullscreen == true) {
           style = "none";
           if (Util.isTablet() == true) {
               this.owner.zoomInWebPanel();
           }
       } else {
           if (this.owner.getWebViewMaximized() == true) {
               this.owner.resizeWebView();
           }
       }
       if (Util.isWebOS()) {
           enyo.setFullScreen( this.fullscreen );
       }
   },*/ 
   
   setArticleScrollPosition : function( pos ) {
       this.log("pos: " + pos);
       if (Util.isTablet() == true) {
           enyo.job("setArticleScrollPosition", enyo.bind(this, function() { this.$.scrollerArticle.setScrollTop(pos); }), 50);
       } else {
           this.$.scrollerArticle.scrollTo( pos, 0 );
       }
   },
   
    onClickCalled : function( inSender, inEvent ) {
        // this.log("inSender: " + inSender);
        // this.log("inEvent: " + inEvent);
        // this.log("inEvent.screenX: " + inEvent.screenX);
        // this.log("inEvent.screenY: " + inEvent.screenY);
        // this.log("inEvent.clientX: " + inEvent.clientX);
        // this.log("inEvent.clientY: " + inEvent.clientY);
        if (Util.isPlaybook()) {
            var now = new Date();
            var diff = Util.ms_between(this.lastClick, now);
            this.log("diff: " + diff);
            if (diff > 0 && diff <= 200) {
                this.onDoubleClick();
            }
            this.lastClick = now;
        }
     },
   
    shareItem : function( source, inEvent ) {
        this.log("START");
        // this.log("Util.getSettings().online: " + Util.getSettings().online);
        var item = this.getSelectedItem();
	    this.$.share.setItem( item );
	    this.$.share.setStaticMode( true );
        this.$.share.setIsNotebook( false );
        this.$.share.shareItem();
        this.log("END");
    },
    
    getDataManager : function() {
    	return this.owner.$.dataManager;
    }
    
});