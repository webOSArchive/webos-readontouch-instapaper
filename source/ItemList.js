enyo.kind({
    name : "ItemList",
    kind : enyo.SlidingView,
    layoutKind : enyo.VFlexLayout,
    components : [
		{ className: 'scroll-bar',
			name: 'scrollBar',
			hide: function() {
				this.applyStyle('-webkit-transition', 'opacity 1.2s linear');
				this.setClassName('scroll-bar hidden');
			},
			show: function() {
				this.applyStyle('-webkit-transition', '');
				this.setClassName('scroll-bar shown');
			}
		},
        {kind: "Toolbar", id: "headerToolbar", components: [
            {kind: enyo.HFlexBox, flex: 1, components: [
                /*{name: "itemStateSelector", kind: "CustomListSelector", value: 1, onChange: "itemChanged", style: "width: 100px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 16px; color: white; margin-left: 10px; ", items: [
                    {caption: "Unread", value: 1},
                    {caption: "Read", value: 2},
                ]},*/
                {name: "menuButton", kind: "IconButton", className: "enyo-button-dark", depressed: false, down: false, toggling: false, icon : "images/settings.png", onclick: "showMenuDialog" },
                {name: "previewButton", kind: "IconButton", className: "enyo-button-dark", depressed: false, down: false, toggling: false, icon : "images/homescreen.png", onclick: "showPreviewPane" },
                {name: "filterButton", kind: "Button", className: /*"enyo-button-affirmative"*/"enyo-button-dark", depressed: false, down: false, toggling: false, label: $L("No filter active"), onclick: "doFilterByTags" /*, icon: "images/details-open-arrow.png"*/},
                {kind: "Spacer"}, 
                {kind: enyo.Spinner, name: "listSpinner", align: "right"},
                {kind: "Spacer"}, 
                {name: "orderSelector", kind: "CustomListSelector", value: 1, onChange: "sortOrderChanged", style: "width: 100px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 16px; color: white; margin-left: 10px; ", items: [
                    {caption: $L("Newest"), value: 1},
                    {caption: $L("Oldest"), value: 2},
                    {caption: $L("Title"), value: 3},
                    {caption: $L("Url"), value: 4},
                ]},
                {kind: "Spacer"}, 
            ]}
        ]},
        {kind: enyo.SearchInput,name: "searchBox", hint: $L("Search"), autoCapitalize: "lowercase", value: "", oninput: "onSearch", onCancel: "clearSearch"},
        {kind: "Pane", name: "contentPane", flex: 1, transitionKind: enyo.transitions.Simple, style: "background-color: white; ", components: [
            /*{name: "scroller", kind: enyo.Scroller, flex : 1, ondragstart: "dragstartHandler", ondragfinish: "dragfinishHandler", ongesturestart: "gesturestartHandler", ongestureend: "gestureendHandler", components : [*/
            {name : "feedList", kind : (Util.isBrowser()? "ekl.List.VirtualList" : "enyo.VirtualList"), onScrollStart: "onScrollStart", onScrollStop: "onScrollStop", onmousehold: "onMousehold", onLoadComplete: "hideListSpinner", onLoadStarted: "showListSpinner", onSetupRow : "getItem", onclick : "doListTap", components : [
                {name : "feedItem", kind : (Util.isWebOS() ? "SwipeableItem" : "Item"), ondrag: "dragstartHandler", onSwipe: "onSwipe", onConfirm: "markItemRead", cancelCaption: $L("Cancel"), confirmCaption: $L("Mark this item read?"), tapHighlight : true, components : [
                    {kind: enyo.VFlexBox, flex: 1, components: [
                        {name : "listItemTitle", kind: enyo.HtmlContent, content : "",  style: "font-size: 0.9em;"},
                        {kind: enyo.HFlexBox, flex: 1, style: "padding-bottom: 12px; padding-top: 3px; ", components: [
                            {name : "listItemUrl", kind: enyo.HtmlContent, content : "",  style: "font-size: 0.6em; font-weight: bold;"},
                            {kind: "Spacer", flex: 1},
                            {name : "listItemAge", kind: enyo.HtmlContent, content : "",  style: "font-size: 0.6em; font-weight: bold;"},
                        ]},
                        {kind: enyo.Spinner, name: "itemSpinner", style: "width: 10px, height: 10px"},
                    ]}
                ]}
            /*]}*/
            ]}, 
            {name: "emptyList", kind: "VFlexBox", align: "center", pack: "top", components: [
                { content: "<br>"+$L("No articles found.")+"<br><br>"+$L("Do you have already synced? If not, hit the refresh-icon at the bottom of this list.")+"<br><br>"+$L("If you have already synced then try to add an article via the add-icon at the bottom of this panel or via an external application on your mobile device or pc / mac."),
                    style: "text-align: center; margin: 10px;",
                    className: "enyo-text-body"}
            ]}
        ]}, 
        {name: "tagSelectDialog", kind: "ReadOnTouch.FilerDialog"},
        {kind: "Toolbar", components: [
            {name: "countLabel", kind: enyo.HtmlContent,style : "color: #FFFFFF; font-size: 16px; margin-left: 10px; "},
            {flex : 1},
            {name: "addButton",         kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/new.png" , align: "right", onclick: "doAddItem"},
            {name: "refreshButton",     kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/sync.png" , align: "right", onclick: "doRefreshTap"},
            (!Util.isTouchpad() ? {flex : 1} : null)
        ]},
        {
            kind: "Helpers.Updater", //Make sure the Updater Helper is included in your depends.json
            name: "myUpdater",
        }
    ],
    events : {
        "onListTap" : "",
        "onRefreshTap" : "",
    },
   
    published: {
        selectedRow : -1,
        selectedObj: null,
    },
    
    create : function( ) {
        this.inherited(arguments);
        if (Util.isWebOS() && !Util.isTouchpadOrPre3()) {
            this.$.headerToolbar.applyStyle( "-webkit-border-image", "none !important");
            this.$.footerToolbar.applyStyle( "-webkit-border-image", "none !important");
            this.$.feedList.$.scroller.setAccelerated( false );
        }
        if (!Util.isTouchpad() && !Util.isPlaybook()) { 
            this.$.feedList.$.scroller.setAccelerated( false );
        }
        if (Util.isWebOS()) {
            this.$.menuButton.hide();
        }
        if (Util.isPre3()) {
            this.$.previewButton.hide();
        }
        // show list scrollbar, if selected in preferences
        if (Util.getSettings().showListScrollbar == true) {
			var listName = "feedList"; // the string name of your list
			
			// we need to listen for scrollStart to show bar,
			// and scrollStop to hide the bar
			this.$[listName].$.scroller.scrollStart = enyo.bind(this, this.showBar);
			this.$[listName].$.scroller.scrollStop = enyo.bind(this, this.hideBar);
			
			// we need to take the old scroll method and hold it,
			// and override it with our own, which calls the old one
			this.scrollFunc = enyo.bind(this.$[listName].$.scroller,
				this.$[listName].$.scroller.scroll);
			this.$[listName].$.scroller.scroll = enyo.bind(this, this.scroll);
        } else {
            this.$.scrollBar.destroy();
        }
    },
    
    rendered : function( ) {
        this.inherited(arguments);
        this.log("START");
        this.log();
        this.$.addButton.setDisabled(!Util.getSettings().online); 
        this.$.refreshButton.setDisabled(!Util.getSettings().online); 
        this.$.orderSelector.setValue( Util.getSettings().sortOrder );
        if (Util.isTablet() == false) {
            var $article_container = $('#headerToolbar');
            this.log("$article_container: " + $article_container);
            $($article_container).css("heigth", "20px" );
        }    
        
        if (this.owner.$.dataManager.getItemsAll().length == 0) {
            this.$.contentPane.selectViewByName( "emptyList", true ); 
        } else {
            this.$.contentPane.selectViewByName( "feedList", true ); 
        }

        this.$.myUpdater.CheckForUpdate("ReadOnTouch PRO 3.1");
        
        this.log("END");
    },
    
    setOnline : function ( state ) {
        this.log("START");
        if (state !== undefined) {
            this.$.addButton.setDisabled(!Util.getSettings().online); 
            this.$.refreshButton.setDisabled(!Util.getSettings().online); 
        } else {
            this.error("state is undefined!");
        }
        this.log("END");
    },
    
    doAddItem : function( ) {
        this.log("START");
        this.owner.showAddLinkDialog();
        this.log("END");
    },
    
    doFilterByTags : function() {
        this.$.tagSelectDialog.openAtCenter();  
        this.$.tagSelectDialog.setValues( Util.getSettings().itemState, this.owner.$.dataManager.getAvailableTags(), Util.getSettings().filterTags );
        this.$.tagSelectDialog.setScope(this.owner.$.dataManager);
        this.$.tagSelectDialog.setFuncName("getFeedItemsByStateAndTag");
        this.$.tagSelectDialog.setFuncName2("loadItems");
    },
    
    doRefreshTap : function( ) {
        this.log("START");
        if (Util.getSettings().online == true || this.owner.getCalledFromExtern() == true) {
            this.log("online == true or launched from external");
            this.$.feedList.$.scroller.punt();
            this.showListSpinner();
            // this.owner.setJustStarted( 1 );
            enyo.asyncMethod( this.owner, "refreshFeedItemsListLite" );
            var count = 0;
            if (this.owner.$.dataManager.getFeedItems()) {
                count = this.owner.$.dataManager.getFeedItems().length;
            }
            this.$.countLabel.setContent(count + $L(" items"));
        }
        this.log("END");
    },
    
    sortOrderChanged: function( inSender, inValue, inOldValue ) {
        this.log("START");
        this.log("Value: " + inValue + ", inOldValue: " + inOldValue);
        this.$.feedList.$.scroller.punt();
        
        localStorage.setItem( "sortOrder", inValue );
        Util.getSettings( true );

        var result = Util.sort( this.owner.$.dataManager.getFeedItemsByStateAndTag(Util.getSettings().itemState, Util.getSettings().filterTags), inValue);
        this.owner.$.dataManager.setFeedItems( result );

        this.$.feedList.refresh();
        this.log("END");
    },

    doListTap: function( inSender, inEvent ) {
        this.log("START");
        // this.log("doListTap()");

        if (this.isScrolling == true || this.dragging == true || enyo.application.AndroidScrollHack == true) {
            this.log("itemlist is currently scrolling...")
            return;
        }
        
        if (!inSender.ishold) {
            this.log("Util.isPlaybook(): " + Util.isPlaybook());
            this.log("Util.isPortraitMode(): " + Util.isPortraitMode());
            if (!Util.isTablet() || (Util.isTablet() && Util.isPortraitMode() && Util.getSettings().maximizeView == true && !Util.isBrowser()) ) {
                this.log("zooming into webview...");
                enyo.nextTick( this.owner, this.owner.zoomInWebPanel);
                // this.owner.zoomInWebPanel();
            }
            
            if (inEvent !== undefined) {
                this.log(" -> clicked item #" + inEvent.rowIndex);
                this.selectedRow = inEvent.rowIndex;
                this.selectedObj = this.owner.$.dataManager.feedItems[inEvent.rowIndex];
                title = this.$.listItemTitle.getContent();
        
                if(this.selectedObj) {
                    this.log("this.selectedObj.title: " + this.selectedObj.title);
                    this.log("this.selectedObj.url: " + this.selectedObj.url);
                    this.log("Util.getSettings().online: " + Util.getSettings().online);
                    // this.log("this.owner.getPreferedView(): " + this.owner.getPreferedView());
                    this.owner.$.feedWebViewPane.setViewMode( "text" );
                    if (Util.isTablet() == false) {
                        this.owner.setWebViewMaximized( true );
                    }
                    this.log("set lastRead to " + this.selectedObj.item_id);
                    Util.setItem( "lastRead", this.selectedObj.item_id);
                    Util.setItem( "lastRow", inEvent.rowIndex);
                    Util.setItem( "scrollerArticle", 0);
                    enyo.nextTick( this, this.loadLocalData, this.selectedObj.item_id );
                }
            } else {
                this.error("inEvent is undefined!");
            }
        }
        inSender.ishold = false
        
        this.log("END");
    },
    
    updateItem : function( id ) {
        this.log("START:" + id);
        this.$.feedItem.render();
        this.loadLocalData( id );
        this.log("END");
    },
    
    loadLocalData : function ( id ) {
        this.log("START");
        this.log("id: " + id);
        
        if (id !== undefined) {

            var file = this.owner.$.dataManager.getDownloadedArticleContent( id );
            var viewMode = this.owner.$.feedWebViewPane.getViewMode();
            var online = Util.getSettings().online;

            var obj = Util.getElementFromArrayById( this.owner.$.dataManager.getTextInfo(), id);
            // this.log("obj: "+ JSON.stringify(obj));

            var title = (obj != null && obj.title !== undefined ? obj.title : (this.selectedObj.title != "" ? this.selectedObj.title : this.selectedObj.url));
            
            this.log("file: " + file);
            this.log("viewMode: " + viewMode);
            this.log("online: " + online);

            if (online == true) {
                // client is online
                if (viewMode == "text" && file != null) {
                    this.owner.$.feedWebViewPane.setUrl(file, title, this.selectedObj.state, id);
                } else if (viewMode == "text" && file == null) {
                    this.owner.$.feedWebViewPane.showEmptyPage();
                    this.owner.$.feedWebViewPane.showSpinner();
                    this.owner.$.feedWebViewPane.setUpdateArticleInProgress( true );
                    this.owner.$.dataManager.loadArticle( id, this.selectedObj.url, true );
                } else {
                    this.grabViewData( this.owner.$.feedWebViewPane.getViewMode() );
                }
            } else { 
                // client is offline
                if (file != null) {
                    // this.owner.$.feedWebViewPane.$.currentFeedItemWebView.setUrl(file);
                    this.owner.$.feedWebViewPane.setUrl(file, title, this.selectedObj.state, id);
                } else {
                    this.owner.$.feedWebViewPane.showNotYetPage();
                }
            }
            
            if (Util.isTablet()) {
//                if (this.selectedObj.oldTitle != "") {
//                    this.owner.$.feedWebViewPane.$.selectedItemName.setContent(this.selectedObj.oldTitle);
//                } else {
//                    this.owner.$.feedWebViewPane.$.selectedItemName.setContent(this.selectedObj.url);
//                }
                obj = Util.getElementFromArrayById( this.owner.$.dataManager.getTextInfo(), this.selectedObj.item_id);
                title = (obj != null && obj.title !== undefined ? obj.title : (this.selectedObj.title != "" ? this.selectedObj.title : this.selectedObj.url));
                this.owner.$.feedWebViewPane.$.selectedItemName.setContent(title);
            }
            // this.owner.$.feedWebViewPane.onRotateWindow( true );

            this.$.feedList.refresh();        
        }
        this.owner.$.pane.selectViewByName("feedWebViewPane");
        this.log("END");
    },

    grabViewData : function ( type ) {
        this.log("START");
        if (type !== undefined) {
            this.log();
            var url = "";
            if (type == "text") {
                url = "https://text.readitlaterlist.com/v2/text?apikey=" + this.owner.getApiKey() + "&images=1&mode=less&url=" + encodeURIComponent(this.selectedObj.url);
            } else {
                url = this.selectedObj.url;
            } 
            // url = encodeURIComponent(url);
            // this.log("this.selectedObj.title: " + this.selectedObj.oldTitle);
            if (Util.isTablet()) {
                if (this.selectedObj.newTitle != "") {
                    this.owner.$.feedWebViewPane.$.selectedItemName.setContent(this.selectedObj.newTitle);
                } else {
                    this.owner.$.feedWebViewPane.$.selectedItemName.setContent(this.selectedObj.url);
                }
            }
            // this.owner.$.feedWebViewPane.$.currentFeedItemWebView.setUrl(url);
            this.owner.$.feedWebViewPane.setUrl(url, this.selectedObj.oldTitle, this.selectedObj.state);
            this.$.feedList.refresh();        
        } else {
            this.error("type is undefined!");
        }
        this.log("END");
    },
    
    getSelectedItem : function( ) {
        return this.selectedObj;
    },
    
    startItemSpinner: function( inIndex ) { 
        // this.log("START");
        if (inIndex !== undefined) {
            this.$.feedList.prepareRow(inIndex);
            if( this.$.itemSpinner.getShowing( ) == false ) {
                this.$.itemSpinner.show(); 
            }
        } else {
            this.error("inIndex is undefined!");
        }
        // this.log("END");
    },
    
    stopItemSpinner: function( inIndex ) { 
        // this.log("START");
        if (inIndex !== undefined) {
            this.$.feedList.prepareRow(inIndex);
            if( this.$.itemSpinner.getShowing( ) == true ) {
                this.$.itemSpinner.hide(); 
            }
        } else {
            this.error("inIndex is undefined!");
        }
        // this.log("END");
    },
    
    getItem : function( inSender, inIndex ) {
        // this.log("START");
        if (this.owner.$.dataManager.getFeedItems() && inIndex !== undefined && this.owner.$.dataManager.getFeedItems().length > 0)
        {
            if (inIndex >= this.owner.$.dataManager.getFeedItems().length) {
                // this.log("END");
                return false;
            }
            // check if the row is selected
            var isRowSelected = (inIndex == this.selectedRow);

            // get the selected item
            var selectedItem = this.owner.$.dataManager.getFeedItems()[inIndex];

            // format the colors 
            if (selectedItem) {
	            var obj = Util.getElementFromArrayById( this.owner.$.dataManager.getTextInfo(), selectedItem.item_id);
	            // this.log("obj: "+ JSON.stringify(obj));
	
	            var title = (obj != null && obj.title !== undefined ? obj.title : (selectedItem.title != "" ? selectedItem.title : selectedItem.url));

	            if ((this.owner.$.dataManager.isArticleAlreadyDownloaded( selectedItem.item_id ) == true) && (isRowSelected == false)) {
                    // this.log("selectedItem is finished: " + selectedItem.title);
                    enyo.nextTick(this, "stopItemSpinner", inIndex);
                    this.$.feedItem.removeClass("item-not-downloaded");
                    this.$.feedItem.removeClass("item-selected");
                } else if ((this.owner.$.dataManager.isArticleAlreadyDownloaded( selectedItem.item_id ) == true) && (isRowSelected == true)) {
                    // this.log("selectedItem is finished and selected row: " + selectedItem.title);
                    enyo.nextTick(this, "stopItemSpinner", inIndex);
                    this.$.feedItem.removeClass("item-not-downloaded");
                    this.$.feedItem.addClass("item-selected");
                } else {
                    // this.log("selectedItem is waiting: " + selectedItem.title);
                    enyo.nextTick(this, "stopItemSpinner", inIndex);
                    this.$.feedItem.removeClass("item-selected");
                    this.$.feedItem.addClass("item-not-downloaded");
                }
                
                var ts = new Date();
                // this.log("ts: " + ts);
                
                var oldDate = new Date();
                oldDate.setTime(selectedItem.time_updated * 1000);
                var diff = Util.days_between(ts, oldDate);
                var diffhtml = "";
                if (diff == 0) {
                    diff = Util.hours_between(ts, oldDate);
                    if (diff == 0)
                    {
                        diff = Util.minutes_between(ts, oldDate);
                        if (diff > 1) {
                            diffhtml = diff + " "+$L("minutes");
                        } else {
							diffhtml = diff + " "+$L("minute");
						}
                    } else {
                        if (diff > 1) {
                            diffhtml = diff + " "+$L("hours");
                        } else {
							diffhtml = diff + " "+$L("hour");
						}
                    }
                } else {
                    if (diff > 1) {
                        diffhtml = diff + " "+$L("days");
                    } else {
						diffhtml = diff + " "+$L("day");
					}
                }

                selectedItem.age = diffhtml;
                var host = (obj != null ? obj.host : selectedItem.host);
                var favicon = "http://www.google.com/s2/favicons?domain=" + host;
                var faciconImgSmall = "<img style=\"width: 10px; height: 10px;\" border=0 src=" + favicon + ">";
                var faciconImg = "<img style=\"width: 14px; height: 14px;\" border=0 src=" + favicon + ">";
                var content = "<table border=0 width=\"285px\" style=\"margin: 0px; padding: 0px;\"><tr><td align=left valign=bottom>" + faciconImgSmall + "&nbsp; " + host + "</td><td>&nbsp;</td><td width=\"90px\" align=right valign=bottom>" + selectedItem.age + "&nbsp;ago</td></tr></table>"

                // this.log("content: " + content);
                // this.log("title: " + title);
                // this.$.listItemAge.setContent(content);

                var filter = this.$.searchBox.getValue().toLowerCase();
                if (filter != "") {
                    host = Util.applyFilterHighlight( host, filter, "searchResult");
                    title = Util.applyFilterHighlight( title, filter, "searchResult");
                }

                this.$.listItemUrl.setContent( faciconImgSmall + "&nbsp; " + host );
                this.$.listItemAge.setContent( selectedItem.age );

                this.$.listItemTitle.setContent(title);
                
                selectedItem.newTitle = faciconImg   + "&nbsp;" + selectedItem.oldTitle;

                this.$.feedItem.render();
                // this.log("END");
                return selectedItem;
            }
            else {
                // this.error(" -> this.owner.$.dataManager.feedItems[" + inIndex + "] not found!")
                // this.log("END");
                return false;
            }
        }
        else
        {
            // this.warn("no items for list available...");
            // this.log("END");
            return false;
        }
        // this.log("END");
    },
    
    hideListSpinner: function( ) {
        // this.log("START");
        if( this.$.listSpinner.getShowing( ) == true ) {
            this.$.listSpinner.hide(); 
        }
        // this.owner.$.feedWebViewPane.setViewMode("text");
        // this.log("END");
    },
    
    showListSpinner: function( ) {
        // this.log("START");
        // this.log();
        if( this.$.listSpinner.getShowing( ) == false ) {
            this.$.listSpinner.show(); 
        }
        // this.log("END");
    },
    
    hideItem : function( ) {
        this.log("START");
        this.log();
        this.owner.$.dataManager.getFeedItems().splice( this.selectedRow, 1);
        this.clearSelection();
        this.$.countLabel.setContent(this.owner.$.dataManager.feedItems.length + $L(" items"));
        this.log("END");
    },
    
    clearSelection : function( ) {
        this.log("START");
        this.log();
        this.selectedRow = -1;
        this.$.feedItem.setTapHighlight( false );
        this.log("title: " + this.$.listItemTitle.getContent());
        // if( this.$.feedItem.getShowing( ) == true ) {
            // this.$.feedItem.hide();
        // }
        this.$.feedList.refresh();
        this.log("END");
    },
    
    onSearch : function ( inSender, event ) {
        this.log("START");
        // scroll to top of list
        this.$.feedList.$.scroller.punt();
        enyo.nextTick("filterItems", enyo.bind(this, "filterItems"));
        this.log("END");
    },
    
    filterItems : function ( ) {
        this.log("START");
        // this.log();
        if (this.oldList)
        {
            this.owner.$.dataManager.setFeedItems(this.oldList);
            this.$.countLabel.setContent(this.owner.$.dataManager.getFeedItemsByStateAndTag(Util.getSettings().itemState, Util.getSettings().filterTags).length + $L(" items"));
        }
        
        var filter = this.$.searchBox.getValue().toLowerCase();
        this.log("filter: " + filter);
        this.log("items to search: " + this.owner.$.dataManager.getFeedItemsByStateAndTag(Util.getSettings().itemState, Util.getSettings().filterTags).length);
        var filteredItems = [];
        
        var searchList = this.owner.$.dataManager.getFeedItemsByStateAndTag(Util.getSettings().itemState, Util.getSettings().filterTags);
        
        for (index in searchList) {
            var item = searchList[index];
            var title = item.oldTitle.toLowerCase();
            var url = item.url.toLowerCase();
            var tags = "";
            if (item.tags !== undefined && item.tags != null && item.tags != "") {
                tags = item.tags.toLowerCase();
            }
            // this.log("title: " + title);
            // this.log(" url: " + url);
            if (title.indexOf(filter) != -1 || url.indexOf(filter) != -1 || tags.indexOf(filter) != -1)
            {
                // this.log("found item: " + item.title);
                filteredItems.push(item);
            } 
        }
        this.oldList = searchList;
        this.owner.$.dataManager.setFeedItems(filteredItems);
        this.selectedRow = -1;
        this.$.feedList.render();
        this.$.feedList.refresh();
        this.$.countLabel.setContent(filteredItems.length + $L(" items"));
        this.log("matched items: " + filteredItems.length);
        this.log("END");
    },
    
    clearSearch : function( ) {
        this.log("START");
        this.log();
        if (this.oldList)
        {
            this.owner.$.dataManager.feedItems = this.oldList;
            this.$.countLabel.setContent(this.owner.$.dataManager.feedItems.length + $L(" items"));
            this.selectedRow = -1;
            this.$.feedList.render();
            this.$.feedList.refresh();
            this.$.countLabel.setContent(this.owner.$.dataManager.getFeedItems().length + $L(" items"));
            this.oldList = null;
            // this.$.searchBox.value = "";
        }
        this.log("END");
    },
    
    markItemRead : function( inSender, inIndex ) {
        this.log("inSender:" + inSender + ", inIndex: " + inIndex );
        
        var obj = this.owner.$.dataManager.feedItems[inIndex];
    
        if(obj) {
            this.log("this.selectedObj.title: " + obj.title);
            this.log("this.selectedObj.url: " + obj.url);
            
            this.startItemSpinner( inIndex );
            this.owner.$.feedWebViewPane.toggleReadState( null, null, obj.item_id, obj.url, inIndex );
        }  
    },

    onSwipe : function( inSender, inIndex ) {
        this.log("inSender:" + inSender + ", inIndex: " + inIndex );

        var obj = this.owner.$.dataManager.feedItems[inIndex];
    
        if(obj) {
            // if article is unread
            if (obj.state == 0) {
                this.$.feedItem.setConfirmCaption($L("Mark this item read?"));
            } else {
                this.$.feedItem.setConfirmCaption($L("Mark this item unread?"));
            }
        }  
    },
    
    dragstartHandler: function(inSender, inEvent) {
      this.setAndroidScrollHack();

      if (this.gesturing) { return true; }
      this.dragging = true;
    
      if (Math.abs(inEvent.dy/inEvent.dx) <= 1 && inEvent.dx <= 0) { 
          this.error("swipe: right");
        // 'right' swipe
      } else if (Math.abs(inEvent.dy/inEvent.dx) <= 1 && inEvent.dx > 0) { 
          this.error("swipe: left");
        // 'left' swipe
      } else if (Math.abs(inEvent.dy/inEvent.dx) > 1 && inEvent.dy <= 0) { 
          this.error("swipe: down");
        // 'down' swipe
      } else if (Math.abs(inEvent.dy/inEvent.dx) > 1 && inEvent.dy > 0) { 
          this.error("swipe: up");
        // 'up' swipe
      }
    }, 
    
    dragfinishHandler: function(inSender, inEvent) {
        this.log();
      // enyo.nextTick(this, function() { this.dragging = false; } );
      this.dragging = false;
    }, 
    
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
          this.error("power-swipe: down");
          this.$.scroller.scrollToBottom();
        // 'down' power swipe
      } else if (Math.abs(dy/dx) > 1 && dy > 0) { 
          this.error("power-swipe: up");
          this.$.feedList.punt();
        // 'up' power swipe
      }
    },
    
    onMousehold : function( inSender, inEvent ) {
        inSender.ishold = true;
        this.log("inSender: " + inSender);
        this.log("inEvent: " + inEvent.rowIndex);
        
        var obj = this.owner.$.dataManager.feedItems[inEvent.rowIndex];
        this.log("title: " + obj.title);
    },
    
    onScrollStart : function(inSender, inEvent) {
        this.log();
        this.isScrolling = true;
    },
    
    onScrollStop : function(inSender, inEvent) {
        this.log();
        this.isScrolling = false;
        this.log("scroller: " + this.$.scroller.getScrollTop());
    },
    
    selectView : function( name ) {
        this.log("selecting view: " + name);
        this.$.contentPane.selectViewByName( name, true );   
        this.$.feedList.render(); 
        this.$.feedList.refresh();
    },

    scrollTo : function(topIndex){     
        this.log("START");
         var pageSize = this.$.feedList.getPageSize();     
         
         //-- it's very important to set bottomIndex, which should be in the range of source array.
         //-- or else, you will find some bottom items were removed.
         var bottomIndex = Number(topIndex) + Number(pageSize) -1;
         if(bottomIndex > this.owner.$.dataManager.getFeedItems().length -1)
            bottomIndex = this.owner.$.dataManager.getFeedItems().length - 1;     
       
         //-- scroll 1 by 1, until to the inIndex item, 
         //-- in case the scroll span is too large, the VirtuallList can not show properly.
         for(var i = 0; i < topIndex; i++) {
            this.$.feedList.$.scroller.adjustTop(i);
            this.$.feedList.$.scroller.adjustBottom(bottomIndex);
            this.$.feedList.$.scroller.top = i;
            this.$.feedList.$.scroller.bottom = bottomIndex;
            i = i++;
         }
         
         //-- scroll to the specific item we want here.
         this.$.feedList.$.scroller.adjustTop(topIndex);
         this.$.feedList.$.scroller.adjustBottom(bottomIndex);
         this.$.feedList.$.scroller.top = topIndex;
         this.$.feedList.$.scroller.bottom = bottomIndex;    
     
        this.$.feedList.refresh(); 
        this.log("END");
  },
  
    styleFilterButton : function( active ) {
        if (active == true) {
            this.$.filterButton.setCaption($L("Filter active"));
            this.$.filterButton.setStyle("background-color: green; color: #FFFFFF; font-weight:bold;");
        } else {
            this.$.filterButton.setCaption($L("No filter active"));
            this.$.filterButton.setStyle("");
        }
    },

    renderAndRefresh : function( ) {
        this.log();
		this.$.scrollBar.applyStyle('top', "153px");
        this.$.feedList.punt(); 
        this.$.feedList.refresh();
    },
    
    showMenuDialog : function() {
        this.log();
        this.owner.showMenuDialog();  
    },
    
    showPreviewPane : function() {
        this.owner.$.pane.selectViewByName("previewSlidingPane");  
        this.owner.$.previewPane.loadArticles();  
    },

    setAndroidScrollHack: function(inSender, inEvent)
    {
        // this.log();
        enyo.application.AndroidScrollHack = true;
        setTimeout(enyo.bind(this, function() { enyo.application.AndroidScrollHack = false; }), 200);
    },

	showBar: function() {
        this.$.scrollBar.show(); 
	},
	
	hideBar: function() {
//		setTimeout(enyo.bind(this, function() {
			this.$.scrollBar.hide();
//		}), 25);
	},
	
	scroll: function(inSender) {
		this.scrollFunc(arguments);
		// pass the arguments to the method so the list can scroll
		
		
		
		// inSender.y - the y scroll position
		// inSender.x - the x scroll position
		// this.doGetNumberOfItems() - gets the number of
		//  items in this list
		
		var items = this.getNumberOfItems();
		var yPos = inSender.y;
		var xPos = inSender.x;
		var scrollBarHeight = 50;
		var topOffset = 103;
		var bottomOffset = 50;
		// this could be an offset from any number
		//  of things, such as a header in your box
		var sizes = [];
		var avgSize = 0;
		var listName = "feedList"; // the string name of your list
		var listItems = this.$[listName].$.scroller.heights;
		
		for (var item in listItems) {
			// go through visibile items to get their height
			// then average it out to get an estimate of
			// the average height of each item in the list
			// so we know how far to move the scroll bar
			if (item) {
				sizes.push(listItems[item]);
			}
		}
		var z = sizes.length;
		for (var i = 0; i < z; i++) {
			avgSize += parseInt(sizes[i], 10);
		}
		avgSize = avgSize/z;
		
		delete sizes;
		delete z;
		
		// top is our current position (yPos) divided by
		// the total height of all items
		var top = yPos / (items * avgSize);

//		var maxH = Util.screenHeight;
//		maxH -= bottomOffset;
//		maxH -= topOffset;
		
		
		// then multiplied by -1 since this is going downward
		top = top * -1;
		// times the height of the list to get a pixel value
		if (this.$[listName].$.scroller.hasNode()) {
			top = top * (this.$[listName].$.scroller.node.clientHeight - bottomOffset);
//			top = top * (maxH - bottomOffset);
		}
		
		// add in the height of top offset and half of the height of the scroller bar
		top += topOffset;
		top += scrollBarHeight;
		
//		maxH = maxH + "px";
		
		// then  it has "px" added to it
		top = top + "px";
		
		this.$.scrollBar.applyStyle('top', top);
		this.$.scrollBar.applyStyle('left', (this.$[listName].hasNode().clientWidth - 8) + "px");
		// scroll bar is 6px + 2px on right
	},
	
	getNumberOfItems: function() {
		// return an integer of the number of items in your list
		// if you haven't yet set it up, return 0
		
		return this.owner.$.dataManager.getFeedItems().length;
	},    

});
