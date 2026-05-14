enyo.kind({
    name : "PreviewPane",
    kind : enyo.SlidingView,
    layoutKind : enyo.VFlexLayout,
    components : [
        {kind: "Toolbar", id: "headerToolbar"/*, style: "height: 70px;"*/, components: [
            {kind: enyo.HFlexBox, flex: 1, components: [ 
                {name: "menuButton", kind: "IconButton", className: "enyo-button-dark", depressed: false, down: false, toggling: false, icon : "images/settings.png", onclick: "showMenuDialog" },
                {name: "listButton", kind: "IconButton", className: "enyo-button-dark", depressed: false, down: false, toggling: false, icon : "images/list.png", onclick: "showListPane" },
                {style: "width: 25px; border-right: 1px solid rgba(1, 1, 1, 0.3); "}, 
                {style: "width: 25px; border-left: 1px solid rgba(255, 255, 255, 0.3); "}, 
                {name: "filterButton", kind: "Button", className: "enyo-button-dark", depressed: false, down: false, toggling: false, label: $L("No filter active"), onclick: "doFilterByTags" },
                {style: "width: 25px; border-right: 1px solid rgba(1, 1, 1, 0.3); "}, 
                {style: "width: 25px; border-left: 1px solid rgba(255, 255, 255, 0.3); "}, 
                {kind: enyo.SearchInput,name: "searchBox", hint: $L("Search"), autoCapitalize: "lowercase", value: "", oninput: "onSearch", onCancel: "clearSearch", style: (Util.isPlaybook() ? "width: 250px" : "width: 300px"), align: "right"},
/*                {style: "width: 25px; border-right: 1px solid rgba(1, 1, 1, 0.3); "}, 
                {style: "width: 25px; border-left: 1px solid rgba(255, 255, 255, 0.3); "},*/ 
                {kind: "Spacer"}, 
                {style: "width: 10px"}, 
            ]}
        ]},
        {kind: "Pane", name: "contentPane", flex: 1, transitionKind: enyo.transitions.Simple, style: "background-color: #BFBFBF; margin: 0; font-family: Prelude, sans-serif;", components: [
            {name: "scroller", kind: enyo.Scroller /*(Util.isTablet() ? enyoextras.ScrollBarsScroller : enyo.Scroller)*/, flex : 1, onScrollStart: "onScrollStart", onScrollStop: "onScrollStop", components : [
                {name: "container", components: [ //Flexbox rausgenommen
                ]}
            
            ]}, 
            {name: "emptyList", kind: "VFlexBox", style: "background-color: white;", align: "center", pack: "top", components: [
                { content: "<br>"+$L("No articles found.")+"<br><br>"+$L("Have you synced? If not, hit the refresh-icon at the bottom of this list.")+"<br><br>"+$L("If you have already synced then try to add an article via the add-icon at the bottom of this panel or via an external application on your mobile device or pc / mac."),
                    style: "text-align: center; margin: 10px;",
                    className: "enyo-text-body"}
            ]}
        ]}, 
        {kind: "Toolbar", id: "footerToolbar"/*, style: "height: 70px;"*/, components: [
            {kind: enyo.HFlexBox, flex: 1, components: [ 
                /*{style: "width: 25px; border-right: 1px solid rgba(1, 1, 1, 0.3); "}, 
                {style: "width: 25px; border-left: 1px solid rgba(255, 255, 255, 0.3); "}, 
                {name: "orderSelector", kind: "CustomListSelector", value: 1, onChange: "sortOrderChanged", style: "width: 100px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 16px; color: white; margin-left: 5px; ", items: [
                    {caption: $L("Newest"), value: 1},
                    {caption: $L("Oldest"), value: 2},
                    {caption: $L("Title"), value: 3},
                    {caption: $L("Url"), value: 4},
                ]},
                {style: "width: 25px; border-right: 1px solid rgba(1, 1, 1, 0.3); "}, 
                {style: "width: 25px; border-left: 1px solid rgba(255, 255, 255, 0.3); "}, 
                {kind: "Spacer"}, 
                {kind: enyo.Spinner, name: "listSpinner", align: "right"},
                {kind: "Spacer"}, 
                {name: "countLabel", kind: enyo.HtmlContent, style : "color: #FFFFFF; font-size: 16px; margin-top: 15px;"},
                {style: "width: 10px"}, */
                {name: "buttonFullLeft",     kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/back-full.png" , align: "left", onclick: "gotoFirstPage"},
                {name: "buttonLeft",         kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/back.png" , align: "left", onclick: "gotoPrevPage"},
                {name: "currentPageLabel", kind: enyo.HtmlContent, style : "color: #FFFFFF; font-size: 16px; margin-top: 15px; margin-left: 15px; margin-right: 15px;", content: $L("Page") + " 1"},
                {name: "buttonRight",        kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/forth.png" , align: "left", onclick: "gotoNextPage"},
                {name: "buttonFullRight",    kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/forth-full.png" , align: "left", onclick: "gotoLastPage"},
                {style: "width: 25px; border-right: 1px solid rgba(1, 1, 1, 0.3); "}, 
                {style: "width: 25px; border-left: 1px solid rgba(255, 255, 255, 0.3); "}, 
                {name: "addButton",         kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/new.png" , align: "right", onclick: "doAddItem"},
                {name: "refreshButton",     kind: "IconButton", className: "enyo-button-dark", style: "margin-top: 7px; height: 20px;", depressed: false, down: false, toggling: false, icon : "images/sync.png" , align: "right", onclick: "doRefreshTap"},
                /*{style: "width: 25px; border-right: 1px solid rgba(1, 1, 1, 0.3); "}, 
                {style: "width: 25px; border-left: 1px solid rgba(255, 255, 255, 0.3); "}, 
                {name: "typeSelector", kind: "CustomListSelector", value: 1, onChange: "typeChanged", style: "width: 100px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 16px; color: white; margin-left: 5px; ", items: [
                    {caption: $L("All"), value: 1},
                    {caption: $L("Article"), value: 2},
                    {caption: $L("Video"), value: 3},
                    {caption: $L("Image"), value: 4},
                ]},*/
                {kind: "Spacer"}, 
                {kind: enyo.Spinner, name: "listSpinner", align: "right"},
                {style: "width: 10px"}, 
            ]}
        ]},
        {name: "tagSelectDialog", kind: "ReadOnTouch.FilerDialog"},
        {name: "share", kind: "Share"},
    ],
    events : {
        "onListTap" : "",
        "onRefreshTap" : "",
    },
   
    published: {
        selectedRow : -1,
        selectedObj: null,
        maxItems: 32,
        page: 0,
    },
    
    create : function( ) {
        this.inherited(arguments);
        if (Util.isBrowser()) {
        	this.maxItems = 50;
        }
        if (Util.isWebOS() && !Util.isTouchpadOrPre3()) {
            this.$.headerToolbar.applyStyle( "-webkit-border-image", "none !important");
            this.$.footerToolbar.applyStyle( "-webkit-border-image", "none !important");
        }
        if (Util.isWebOS()) {
            this.$.menuButton.hide();
        }
    },
    
    showListPane : function() {
        this.owner.$.pane.selectViewByName("feedSlidingPane");    
    },
    
    rendered : function( ) {
        this.inherited(arguments);
        this.log("START");
        this.log();
        this.$.addButton.setDisabled(!Util.getSettings().online); 
        this.$.refreshButton.setDisabled(!Util.getSettings().online); 
//        this.$.orderSelector.setValue( Util.getSettings().sortOrder );
        if (Util.isTablet() == false) {
            var $article_container = $('#headerToolbar');
            this.log("$article_container: " + $article_container);
            $($article_container).css("heigth", "20px" );
        }    
        
        if (this.owner.$.dataManager.getItemsAll().length == 0) {
            this.$.contentPane.selectViewByName( "emptyList", true ); 
        } else {
            this.$.contentPane.selectViewByName( "scroller", true ); 
        }
        
        this.log("END");
    },
    
    loadArticles : function() {
//        this.log("START");
        this.showListSpinner();
        this.updateCountLabel();
        this.processNavigationButtons();
//    	this.log("this.page: " + this.page);
    	
        this.$.container.destroyControls();
        
        var newPage = Number(Number(this.page) + 1);
//    	this.log("newPage: " + newPage);
        var maxCount = Number(Number(this.maxItems) * Number(newPage));
//    	this.log("maxCount: " + maxCount);
        var end = (this.owner.$.dataManager.getFeedItems().length < maxCount ? this.owner.$.dataManager.getFeedItems().length : maxCount );
//    	this.log("end: " + end);
        var start = Number(Number(this.maxItems) * Number(this.page));
//    	this.log("start: " + start);
        var itemFilter = this.$.searchBox.getValue().toLowerCase();
        
    	for (i=start; i<end; i++) {
//            this.log("i: "+ i);
            item = this.owner.$.dataManager.getFeedItems()[i];
            // this.log("item: "+ JSON.stringify(item));
            obj = Util.getElementFromArrayById( this.owner.$.dataManager.getTextInfo(), item.item_id);
            // this.log("obj: "+ JSON.stringify(obj));

            name = (obj != null && obj.title !== undefined ? obj.title : (item.title != "" ? item.title : item.url));
            name = Util.applyFilterHighlight( name, itemFilter, "searchResult");
            // Use downloaded textInfo excerpt, fall back to the bookmark's description field.
            excerpt = (obj != null && obj.excerpt !== undefined && obj.excerpt !== "" ? obj.excerpt : (item.description || ""));
            excerpt = Util.applyFilterHighlight( excerpt, itemFilter, "searchResult");

            imgSrc = this.getImageForObject( obj );
//            this.log("imgSrc: "+ imgSrc);
            age = this.getTimeUpdated( item );
//            this.log("age: "+ age);

            var host = (obj != null && obj.host ? obj.host : item.host);
            favicon = "http://www.google.com/s2/favicons?domain=" + host;
            faciconImg = "<img style=\"width: 14px; height: 14px;\" border=0 src=" + favicon + ">";
            host = Util.applyFilterHighlight( host, itemFilter, "searchResult");
            content = "<img class='favicon' src='" + favicon + "'><a href+'" + item.url + "'>" + host + "</a>";

            isVideo = (obj != null && obj.isArticle == 0 && obj.videos && obj.videos.length > 0 ? true : false);
//            this.log("isVideo: " + isVideo);

            var imgRead = "<img src='images/art-" + (item.state == 0 ? "" : "un") + "read.png'>";
            var imgClass = imgSrc != "" ? "articleimage articleimageimg" : "articleimage articleimagenone";
            var imgStyle = imgSrc != "" ? "background-image: url(" + imgSrc + ")" : "";

            if (!isVideo) {
                kindItem = {
                    name: "articlebox" + item.item_id, className: "articlebox", value: item.item_id, onclick: "showArticle", components: [
                        {name: "articleheadline" + item.item_id, className: "articleheadline", value: item.item_id, onclick: "showArticle", content: name},
                        {name: "articleimage" + item.item_id, className: imgClass, value: item.item_id, style: imgStyle, onclick: "showArticle", components: [
                            {name: "articleadded" + item.item_id, className: (imgSrc != "" ? "articleadded articleaddedimg" : "articleadded "), value: item.item_id,  content: age},
                        ]},
                        {name: "articleexcerpt" + item.item_id, className: "articleexcerpt", value: item.item_id, onclick: "showArticle", content: excerpt},
                        {name: "articlebuttonread" + item.item_id, className: "articlebuttonread", value: item.item_id, onclick: "markItemRead", content: imgRead},
                        {name: "articlebottom" + item.item_id, className: "articlebottom", value: item.item_id, onclick: "showPage", content: content},
                        {name: "articlebuttonshare" + item.item_id, className: "articlebuttonshare", value: item.item_id, onclick: "shareItem", content: "<img src='images/art-share.png'>"},
                    ]
                };
            } else {
                kindItem = {
                    name: "articlebox" + item.item_id, className: "articlebox", value: item.item_id, onclick: "showVideo", components: [
                        {name: "articleheadline" + item.item_id, className: "articleheadline", value: item.item_id, onclick: "showVideo", content: name},
                        {name: "articleimage" + item.item_id, className: imgClass, value: item.item_id, style: imgStyle, onclick: "showVideo", components: [
                            {name: "articleadded" + item.item_id, className: (imgSrc != "" ? "articleadded articleaddedimg" : "articleadded "), value: item.item_id, content: age},
                            {name: "articleplay" + item.item_id, className: "articleplay articleplay ", value: item.item_id}
                        ]},
                        {name: "articleexcerpt" + item.item_id, className: "articleexcerpt", value: item.item_id, onclick: "showArticle", content: excerpt},
                        {name: "articlebuttonread" + item.item_id, className: "articlebuttonread", value: item.item_id, onclick: "markItemRead", content: imgRead},
                        {name: "articlebottom" + item.item_id, className: "articlebottom", value: item.item_id, onclick: "showPage", content: content},
                        {name: "articlebuttonshare" + item.item_id, className: "articlebuttonshare", value: item.item_id, onclick: "shareItem", content: "<img src='images/art-share.png'>"},
                    ]
                };

            }
            
//            this.log("creating kind...");
            this.$.container.createComponent( kindItem, {owner: this});
        }
//        this.log("rendering container");
    	this.$.container.render();

        if (end == 0) {
            this.$.contentPane.selectViewByName( "emptyList", true ); 
        } else {
            this.$.contentPane.selectViewByName( "scroller", true ); 
        }
//        this.$.countLabel.setContent(count + $L(" items"));

        this.hideListSpinner();
//        this.log("END");  
    },
    
    getImageForObject : function( obj ) {
        result = "";
        if (obj != null) {
            // !!!! --- IMAGES --- !!!! 
            images = obj.images;
            // this.log("images: " + JSON.stringify(images));
            if (images !== undefined && images != null) {
                for (index in images) {
                    // this.log("index: " + index);
                    img = images[index];
                    // this.log("img: " + JSON.stringify(img));
                    str = "<!--IMG_" + index + "[^>]*>";
                    // this.log("str: " + str);
                    regExp = new RegExp( str ); 
                    fn = Util.getFilenameFromURL( img.src );
//                    this.log("looking for file: " + fn);
                    if (fn == "") {
                        fn = img.src;
                    } else {
                        fn = obj.item_id + "_" + fn;
//                        this.log("looking for downloaded file: " + fn);
                        objImage = Util.getElementFromArrayByFilename( this.owner.$.dataManager.getDownloadedImages(), fn);
                        if ( objImage != null) {
//                            this.log("found the image...");
                            fn = objImage.file;
                        } else {
//                            this.log("did not found the image, using the original");
                            fn = img.src;
                        }
                    }
//                    this.log("fn: " + fn);
                    result = fn;
                    break;
                }
            }
        }
        return result;
    },
    
    getTimeUpdated : function( item ) {
        return "";
        //Deprecated due to removal from v3 API - 2023-09-10
        ts = new Date();
        oldDate = new Date();
        oldDate.setTime(item.time_updated * 1000);
        diff = Util.days_between(ts, oldDate);
        diffhtml = "";
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
        return diffhtml;
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
            this.showListSpinner();
            // this.owner.setJustStarted( 1 );
            enyo.asyncMethod( this.owner, "refreshFeedItemsListLite" );
            count = 0;
            if (this.owner.$.dataManager.getFeedItems()) {
                count = this.owner.$.dataManager.getFeedItems().length;
            }
//            this.$.countLabel.setContent(count + $L(" items"));
        }
        this.log("END");
    },

    sortOrderChanged: function( inSender, inValue, inOldValue ) {
        this.log("START");
        this.log("Value: " + inValue + ", inOldValue: " + inOldValue);
        this.$.scroller.setScrollTop();
        
        localStorage.setItem( "sortOrder", inValue );
        Util.getSettings( true );

        result = Util.sort( this.owner.$.dataManager.getFeedItemsByStateAndTag(Util.getSettings().itemState, Util.getSettings().filterTags), inValue);
        this.owner.$.dataManager.setFeedItems( result );

        // this.$.feedList.refresh();
        this.log("END");
    },

    showArticle: function( inSender, inEvent ) {
        this.log("START");
        this.log("inSender: " + inSender);
        this.log("inSender.value: " + inSender.value);
        this.log("inEvent: " + inEvent);

        if (this.isScrolling == true) {
            this.log("previewpane is currently scrolling...")
            return;
        }
        
        if (!inSender.ishold) {
            // enyo.nextTick( this.owner, this.owner.zoomInWebPanel);
            this.owner.$.previewSlidingPane.selectViewByName("detailPane");

            if (inSender.value !== undefined) {
                this.log(" -> clicked item_id: " + inSender.value);
                this.selectedObj =  Util.getElementFromArrayById(this.owner.$.dataManager.feedItems, inSender.value);
        
                if(this.selectedObj) {
                    this.log("this.selectedObj.title: " + this.selectedObj.title);
                    this.log("this.selectedObj.url: " + this.selectedObj.url);
                    this.log("Util.getSettings().online: " + Util.getSettings().online);
                    // this.log("this.owner.getPreferedView(): " + this.owner.getPreferedView());
                    this.owner.$.detailPane.setViewMode( "text" );
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

            file = this.owner.$.dataManager.getDownloadedArticleContent( id );
            viewMode = this.owner.$.detailPane.getViewMode();
            online = Util.getSettings().online;
            obj = Util.getElementFromArrayById( this.owner.$.dataManager.getTextInfo(), id);
            // this.log("obj: "+ JSON.stringify(obj));

            title = (obj != null && obj.title !== undefined ? obj.title : (this.selectedObj.title != "" ? this.selectedObj.title : this.selectedObj.url));

            // alert("file: " + file);
            this.log("viewMode: " + viewMode);
            this.log("online: " + online);

            if (online == true) {
                // client is online
                if (viewMode == "text" && file != null) {
                    this.owner.$.detailPane.setUrl(file, title, this.selectedObj.state, id);
                } else if (viewMode == "text" && file == null) {
                    this.owner.$.detailPane.setUpdateArticleInProgress( true );
                    this.owner.$.detailPane.showSpinner();
                    this.owner.$.dataManager.loadArticle( id, this.selectedObj.url, true );
                } else {
                    this.grabViewData( this.owner.$.detailPane.getViewMode() );
                }
            } else {
                // client is offline
                if (file != null) {
                    this.owner.$.detailPane.setUrl(file, title, this.selectedObj.state, id);
                } else {
                    this.owner.$.detailPane.showNotYetPage();
                }
            }
            
            if (Util.isTablet()) {
            }
                this.owner.$.detailPane.$.selectedItemName.setContent(title);
        }
        this.owner.$.pane.selectViewByName("detailPane");
        this.log("END");
    },

    grabViewData : function ( type ) {
        this.log("START");
        if (type !== undefined) {
            this.log();
            url = "";
            if (type == "text") {
                url = "https://text.readitlaterlist.com/v2/text?apikey=" + this.owner.getApiKey() + "&images=1&mode=less&url=" + encodeURIComponent(this.selectedObj.url);
            } else {
                url = this.selectedObj.url;
            } 
            // url = encodeURIComponent(url);
            // this.log("this.selectedObj.title: " + this.selectedObj.oldTitle);
            if (Util.isTablet()) {
                if (this.selectedObj.newTitle != "") {
                    this.owner.$.detailPane.$.selectedItemName.setContent(this.selectedObj.newTitle);
                } else {
                    this.owner.$.detailPane.$.selectedItemName.setContent(this.selectedObj.url);
                }
            }
            // this.owner.$.feedWebViewPane.$.currentFeedItemWebView.setUrl(url);
            this.owner.$.detailPane.setUrl(url, this.selectedObj.oldTitle, this.selectedObj.state);
            // this.$.feedList.refresh();        
        } else {
            this.error("type is undefined!");
        }
        this.log("END");
    },
    
    getSelectedItem : function( ) {
        return this.selectedObj;
    },
    
    hideItem : function( ) {
        this.log("START");
        this.log();
        this.owner.$.dataManager.getFeedItems().splice( this.selectedRow, 1);
        this.clearSelection();
//        this.$.countLabel.setContent(this.owner.$.dataManager.feedItems.length + $L(" items"));
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
        // this.$.feedList.refresh();
        this.log("END");
    },
    
    onSearch : function ( inSender, event ) {
        this.log("START");
        // scroll to top of list
        // this.$.feedList.$.scroller.punt();
        this.$.scroller.setScrollTop(0);
//        enyo.nextTick("filterItems", enyo.bind(this, "filterItems"));
        this.filterItems();
        this.log("END");
    },
    
    filterItems : function ( ) {
        this.log("START");
        // this.log();
        if (this.oldList)
        {
            this.owner.$.dataManager.setFeedItems(this.oldList);
//            this.$.countLabel.setContent(this.owner.$.dataManager.getFeedItemsByStateAndTag(Util.getSettings().itemState, Util.getSettings().filterTags).length + $L(" items"));
        }
        
        filter = this.$.searchBox.getValue().toLowerCase();
        this.log("filter: " + filter);
//        this.log("items to search: " + this.owner.$.dataManager.getFeedItemsByStateAndTag(Util.getSettings().itemState, Util.getSettings().filterTags).length);
        filteredItems = [];
        searchList = this.owner.$.dataManager.getFeedItemsByStateAndTag(Util.getSettings().itemState, Util.getSettings().filterTags);
        
        for (index in searchList) {
        	item = searchList[index];
            var obj = Util.getElementFromArrayById( this.owner.$.dataManager.getTextInfo(), item.item_id);
            var title = (obj != null && obj.title !== undefined ? obj.title : item.title);
            title = String(title).toLowerCase();
            var url = (obj != null ? obj.resolvedUrl : item.url);
            url = String(url).toLowerCase();
            var tags = "";
            if (item.tags !== undefined && item.tags != null && item.tags != "") {
                tags = item.tags.toLowerCase();
            }
            var excerpt = (obj != null && obj.excerpt !== undefined? obj.excerpt : "");
            excerpt = String(excerpt).toLowerCase();
            // this.log("title: " + title);
            // this.log(" url: " + url);
            if (title.indexOf(filter) != -1 || url.indexOf(filter) != -1 || tags.indexOf(filter) != -1 || excerpt.indexOf(filter) != -1)
            {
                // this.log("found item: " + item.title);
                filteredItems.push(item);
            } 
        }
        this.oldList = searchList;
        this.owner.$.dataManager.setFeedItems(filteredItems);
        this.selectedRow = -1;
        
        this.log("matched items: " + filteredItems.length);
        this.page = 0;
        this.loadArticles();
        
        this.log("END");
    },
    
    clearSearch : function( ) {
        this.log("START");
        this.log();
        if (this.oldList)
        {
            this.owner.$.dataManager.feedItems = this.oldList;
//            this.$.countLabel.setContent(this.owner.$.dataManager.feedItems.length + $L(" items"));
            this.selectedRow = -1;
            this.page = 0;
            this.loadArticles();
            // this.$.feedList.render();
            // this.$.feedList.refresh();
//            this.$.countLabel.setContent(this.owner.$.dataManager.getFeedItems().length + $L(" items"));
            this.oldList = null;
            // this.$.searchBox.value = "";
        }
        this.log("END");
    },
    
    markItemRead : function( inSender, inIndex ) {
        this.log("inSender:" + inSender + ", inIndex: " + inIndex );
        
        this.log(" -> clicked item_id: " + inSender.value);
        this.selectedObj =  Util.getElementFromArrayById(this.owner.$.dataManager.feedItems, inSender.value);

        if(this.selectedObj) {
            this.log("this.selectedObj.title: " + this.selectedObj.title);
            this.log("this.selectedObj.url: " + this.selectedObj.url);
            if (Util.getSettings().itemState != "all") {
                this.$["articlebox" + this.selectedObj.item_id].applyStyle("width", 0);
                setTimeout(enyo.bind(this, function() { this.$["articlebox" + this.selectedObj.item_id].applyStyle("display", "none"); this.$["articlebox" + this.selectedObj.item_id].destroy(); }), 480);
            } else {
            	 var imgRead = "<img src='images/art-" + (this.selectedObj.state == 1 ? "" : "un") + "read.png'>";
                 this.showListSpinner();
            }
            
            this.owner.$.detailPane.toggleReadState( null, null, this.selectedObj.item_id, this.selectedObj.url, inIndex );
            this.updateCountLabel( true );
        }  
    },

    onSwipe : function( inSender, inIndex ) {
        this.log("inSender:" + inSender + ", inIndex: " + inIndex );

        obj = this.owner.$.dataManager.feedItems[inIndex];
    
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
      dy = inEvent.centerY - this.gesture.y;
      dx = inEvent.centerX - this.gesture.x;
    
      if (Math.abs(dy/dx) > 1 && dy <= 0) { 
          this.error("power-swipe: down");
          this.$.scroller.scrollToBottom();
        // 'down' power swipe
      } else if (Math.abs(dy/dx) > 1 && dy > 0) { 
          this.error("power-swipe: up");
          // this.$.feedList.punt();
          this.$.scroller.setScrollTop();
        // 'up' power swipe
      }
    },
    
    onMousehold : function( inSender, inEvent ) {
        inSender.ishold = true;
        this.log("inSender: " + inSender);
        this.log("inEvent: " + inEvent.rowIndex);
        
        obj = this.owner.$.dataManager.feedItems[inEvent.rowIndex];
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

    showMenuDialog : function() {
        this.log();
        this.owner.showMenuDialog();  
    },
    
    showPage: function( inSender, inEvent ) {
        this.log("START");
        this.log("inSender: " + inSender);
        this.log("inSender.value: " + inSender.value);
        this.log("inEvent: " + inEvent);
        this.log(" -> clicked item_id: " + inSender.value);
        this.selectedObj =  Util.getElementFromArrayById(this.owner.$.dataManager.feedItems, inSender.value);
        Platform.browser( this.selectedObj.url, this )();
    },
    
    showVideo: function( inSender, inEvent ) {
        this.log("START");
        this.log("inSender: " + inSender);
        this.log("inSender.value: " + inSender.value);
        this.log("inEvent: " + inEvent);
        this.log(" -> clicked item_id: " + inSender.value);
        this.selectedObj =  Util.getElementFromArrayById(this.owner.$.dataManager.feedItems, inSender.value);
        Platform.browser( this.selectedObj.url, this )();
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

    shareItem : function( source, inEvent ) {
        this.log("START");
        // this.log("Util.getSettings().online: " + Util.getSettings().online);
        item = this.getSelectedItem();
	    this.$.share.setItem( item );
	    this.$.share.setStaticMode( false );
        this.$.share.setIsNotebook( false );
        this.$.share.shareItem( source, inEvent );
        this.log("END");
    },
    
    gotoFirstPage : function() {
    	this.page = 0;
    	this.log("this.page: " + this.page);
        this.$.scroller.setScrollTop(0);
        this.loadArticles();
    },
    
    gotoLastPage : function() {
    	this.page = Math.floor( this.owner.$.dataManager.getFeedItems().length / this.maxItems);
    	this.log(this.owner.$.dataManager.getFeedItems().length / this.maxItems + " -> " + this.page);
    	this.log("this.page: " + this.page);
        this.$.scroller.setScrollTop(0);
        this.loadArticles();
    },
    
    gotoNextPage : function() {
    	this.page++;
    	this.log("this.page: " + this.page);
    	this.log("Math.floor( this.owner.$.dataManager.getFeedItems().length / this.maxItems): " + Math.floor( this.owner.$.dataManager.getFeedItems().length / this.maxItems));
    	if (this.page >= Math.floor( this.owner.$.dataManager.getFeedItems().length / this.maxItems)) {
    		this.page = Math.floor( this.owner.$.dataManager.getFeedItems().length / this.maxItems);
    	}
    	this.log("this.page: " + this.page);
        this.$.scroller.setScrollTop(0);
        this.loadArticles();
    },
    
    gotoPrevPage : function() {
    	if (this.page > 0) {
    		this.page--;
    	}
    	this.log("this.page: " + this.page);
        this.$.scroller.setScrollTop(0);
        this.loadArticles();
    },

    updateCountLabel : function( dec ) {
    	this.log();
        var displayPage = Number(Number(this.page) + 1);
        var len = this.owner.$.dataManager.getFeedItems().length;
        if (dec == true) {
        	len = Number(Number(len) - 1);
        }
        var articleCount = len + $L(" items");
    	this.$.currentPageLabel.setContent( $L("Page") + " " + displayPage + " / " + Math.ceil( this.owner.$.dataManager.getFeedItems().length / this.maxItems) + " ( " + articleCount + " )");
    },
    
    processNavigationButtons : function() {
    	this.log("this.page: " + this.page);
    	this.log("Math.ceil( this.owner.$.dataManager.getFeedItems().length / this.maxItems): " + Math.ceil( this.owner.$.dataManager.getFeedItems().length / this.maxItems));
    	if (this.page == 0) {
    		this.$.buttonFullLeft.setDisabled( true );
    		this.$.buttonLeft.setDisabled( true );
    	} else {
    		this.$.buttonFullLeft.setDisabled( false );
    		this.$.buttonLeft.setDisabled( false );
    	}
    	
    	if (this.page == Math.ceil( this.owner.$.dataManager.getFeedItems().length / this.maxItems) - 1) {
    		this.$.buttonFullRight.setDisabled( true );
    		this.$.buttonRight.setDisabled( true );
    	} else {
    		this.$.buttonFullRight.setDisabled( false );
    		this.$.buttonRight.setDisabled( false );
    	}
    },
    
});
