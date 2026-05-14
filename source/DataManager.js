enyo.kind({
    name: "DataManager",
    kind: "Component",
    components: [   
        {name: "requestItemsService", kind: "WebService", method: "POST", handleAs: "json", contentType: "application/x-www-form-urlencoded; charset=utf-8", onSuccess: "grabFeedSuccess", onFailure: "grabFeedFailure"},
        {name: "markReadFeed", kind: "WebService", method: "POST", handleAs: "json", contentType: "application/x-www-form-urlencoded; charset=utf-8", onSuccess: "markReadFeedSuccess", onFailure: "markReadFeedFailed"},
        {kind: enyo.PalmService,
            name: "downloadService",
            service: "palm://com.palm.downloadmanager/",
            method: "download",
            mime: "text/html",
            timeout: 30000,
            subscribe: true,
            resubscribe: true,
            onSuccess: "grabArticleSuccess",
            onFailure: "grabArticleFailure",
        },
        {kind: enyo.PalmService,
            name: "deleteDownloadFile",
            service: "palm://com.palm.downloadmanager/",
            method: "deleteDownloadedFile",
            onSuccess : "deleteFinished",
            onFailure : "deleteFail",
        },
        {kind: enyo.PalmService,
            name: "downloadImagesService",
            service: "palm://com.palm.downloadmanager/",
            method: "download",
            timeout: 30000,
            subscribe: true,
            resubscribe: true,
            onSuccess: "grabImageSuccess",
            onFailure: "grabImageFailure",
        },
        {name: "addItemFeed", kind: "WebService", method: "POST", contentType: "application/x-www-form-urlencoded; charset=utf-8", onSuccess: "addItemFeedSuccess", onFailure: "addItemFeedFailed"},
        {name: "downloadArticlesService", handleAs: "json", contentType: "application/json; charset=utf-8", kind: "WebService", onSuccess: "downloadArticlesSuccess",  onFailure: "downloadArticlesSuccess"},
        {name: "downloadTextInfoService", handleAs: "json", contentType: "application/json; charset=utf-8", kind: "WebService", onSuccess: "downloadTextInfoSuccess",  onFailure: "downloadTextInfoSuccess"},
        {name: "downloadImageService", kind: "WebService", onSuccess: "downloadImageSuccess",  onFailure: "downloadImageSuccess"},
        {kind: "ModalDialog", name: "failureDialog", style: "height: 240px;", caption: $L("Max. allowed content size exceeded"), components:[
            {content: "", name: "failureSize"},
            {kind: "Button", caption: $L("Ok"), flex: 1, className: "enyo-button-negative", onclick: "closeDialog"},
        ]},
    ],

     // declare 'published' properties
    published: {
        background: false,
        /*syncInProgress: false,*/

        currentMaxDownloads: 1,
        millisToWait: 1000,

        /*preferedView: "",*/
        textInfo: [],
        feedItems: [],
        itemsAll: [],
        downloadedArticles: [],
        failedArticles: [],
        currentlyLoading: [],
        currentlyWaiting: [],
        totalItemsToDownload: 0,
        toggledReadState: [],
        accountVerified: false,
        availableTags: [],
        cancelArticleDownload: false,
        
        funcname: undefined, 
        scope: undefined,
        
        db: null,
        activeItem: null,
        dataIsStored: false,
        newDownloadedArticles: [],
        
        cancelImageDownload: false,
        imagesToDownload: [],
        downloadedImages: [],
        currentlyLoadingImages: [],
        currentlyWaitingImages: [],
        totalImagesToDownload: 0,
        
        sumFileSize: 0,
        
    },

    create: function (inSender, inEvent) {
        this.inherited(arguments);
        this.reloadData();
        if (!Util.isWebOS()) {
            this.currentMaxDownloads = 1;
        }
        // this.collectDataFromLocalStorage();
    },
 
     doSync : function( bgMode, scope, funcname, funcname2, funcname3 ) {
        this.log("START");
        
        if (Util.getSettings().syncInProgress == true) {
            this.log("There is already a sync going on... returning!");
            this.log("END");
            return;
        } 
        
        this.funcname = funcname;
        this.scope = scope;
        
        // there could only be one current sync
        localStorage.setItem("syncInProgress", true);
        Util.getSettings( true );
        
        this.log("bgMode: " + bgMode);
        this.log("funcname: " + funcname);
        this.log("scope: " + scope);
        if ( bgMode !== undefined) {
            this.setBackground( bgMode );
        } else {
            this.setBackground( false );
        }

        this.log("Util.getSettings().online: " + Util.getSettings().online);
        // this.log("Util.getSettings().username: " + Util.getSettings().username);
        // this.log("Util.getSettings().password: " + Util.getSettings().password);
        this.log("Util.getSettings().accountVerified: " + Util.getSettings().accountVerified);
        this.log("Util.getSettings().autoSync: " + Util.getSettings().autoSync);
        if (Util.getSettings().online == true) {
            if (Util.getSettings().username != "" && Util.getSettings().password != "" && Util.getSettings().accountVerified == true)
            {
                // mark offline readed items online as read
                this.markRead( bgMode );
            
                if (Util.getSettings().autoSync == true && bgMode == false) {
                    this.owner.disableItemListPaneControls(true);
                    this.loadItemList(  );
                } else if (Util.getSettings().bgSyncInterval != "never" && bgMode == true) {
                    localStorage.setItem("lastActivity", new Date().getTime());
                    if (this.background == true && funcname2 !== undefined && this.scope !== undefined) {
                        this.log("Start syncing... :-)");
                        // a function that binds this to this.foo
                        var func = enyo.bind(this.scope, funcname2);
                        // the value of this.foo(3)
                        func();
                    }
                    this.loadItemList( funcname, scope );
                } else {
                    this.log("autosync disabled!");
                    localStorage.setItem("syncInProgress", false);
                    Util.getSettings( true );
                }
            } else {
                this.log("currently no verified user account detected!");
                localStorage.setItem("syncInProgress", false);
                Util.getSettings( true );
                if (this.background == true && funcname3 !== undefined && this.scope !== undefined) {
                    this.log("restart timer...");
                    // a function that binds this to this.foo
                    var func = enyo.bind(this.scope, funcname3);
                    // the value of this.foo(3)
                    func();
                }
            }
        } else {
            this.log("currently not online!");
            localStorage.setItem("syncInProgress", false);
            Util.getSettings( true );
            if (this.background == true && funcname3 !== undefined && this.scope !== undefined) {
                this.log("restart timer...");
                // a function that binds this to this.foo
                var func = enyo.bind(this.scope, funcname3);
                // the value of this.foo(3)
                func();
            }
        }
        
        this.log("Util.getSettings().syncInProgress: " + Util.getSettings().syncInProgress);
        if (Util.getSettings().syncInProgress == true && this.getBackground() == true) {
            // while (Util.getSettings().syncInProgress == true && this.getBackground() == true) {
                // // wait 5 seconds
                // this.sleep(5000);
                // this.log("Util.getSettings().syncInProgress: " + Util.getSettings().syncInProgress);
            // }
        }
        

        this.log("END");
    },

    sleep : function(naptime){
        naptime = naptime * 1000;
        var sleeping = true;
        var now = new Date();
        var alarm;
        var startingMSeconds = now.getTime();
        this.log("starting nap at timestamp: " + startingMSeconds + "\nWill sleep for: " + naptime + " ms");
        while(sleeping){
            alarm = new Date();
            alarmMSeconds = alarm.getTime();
            if(alarmMSeconds - startingMSeconds > naptime){ sleeping = false; }
        }        
        this.log("Wakeup!");
    },
    

    ////////////////////////////////////////////
    // LOAD ARTICLE LIST - START
    ////////////////////////////////////////////
    loadItemList : function ( forceUnread ) {
        this.log("START");

        var params = {
            "folder_id": "unread",
            "limit":     "500"
        };

        var api = Util.getApiKey();
        var instaUrl = "https://www.instapaper.com/api/1/bookmarks/list";
        var authHeader = OAuthHelper.buildAuthHeader(
            "POST", instaUrl, params,
            api.key, api.secret,
            Util.getSettings().password,
            Util.getSettings().tokenSecret
        );

        if (this.getBackground() == false) {
            this.owner.$.itemListPane.showListSpinner();
            this.owner.showProgressPopup( "1", $L("Syncing article list"), 1, "unknown", "unknown", false );
        }

        this.$.requestItemsService.setHeaders({"Authorization": authHeader});
        this.$.requestItemsService.setUrl(instaUrl);
        this.$.requestItemsService.call(params);

        this.log("END");
    },
   
    grabFeedSuccess: function(inSender, responseText) {
        this.log("START");
        // this.log()
        // this.log("inSender: " + inSender);
        this.log("responseText: " + enyo.json.stringify(responseText));
        // this.log("enyo.json.stringify(responseText).length: " + enyo.json.stringify(responseText).length);

        if (this.getBackground() == true) {
            localStorage.setItem("lastActivity", new Date().getTime());
        }

        var len = 0;
        if (responseText) {
            len = enyo.json.stringify(responseText).length;
        }
        // this.log("len: " + len);
        
        if (len > 2) {

            // Instapaper returns a JSON array of typed objects (bookmark, meta, user)
            var bookmarks = [];
            var deleteIds = [];
            for (var i = 0; i < responseText.length; i++) {
                var entry = responseText[i];
                if (entry.type === "bookmark") {
                    bookmarks.push(entry);
                } else if (entry.type === "meta" && entry.delete_ids) {
                    deleteIds = entry.delete_ids;
                }
            }
            for (var d = 0; d < deleteIds.length; d++) {
                var delId = deleteIds[d];
                var arr = this.getItemsAll();
                for (var di = arr.length - 1; di >= 0; di--) {
                    if (arr[di].item_id == delId) { arr.splice(di, 1); break; }
                }
            }

            {

                if (this.getBackground() == true) {
                    localStorage.setItem("lastActivity", new Date().getTime());
                }

                var readItems = this.getFeedItemsByStateAndTag("read", "");
                this.log("saved " + readItems.length + " read items for local history");       
                
                var oldUnreadItems = this.getFeedItemsByStateAndTag("unread", "");
                this.log("oldUnreadItems.length: " + oldUnreadItems.length);
                
                var totalItemCountBeforeSync = Number(readItems.length) + Number(oldUnreadItems.length);
                this.log("totalItemCountBeforeSync: " + totalItemCountBeforeSync);
                
                // collect and handle response-data
                this.temp = bookmarks;
                var total = bookmarks.length;
                var countNewUnread = total;
                
                if (Util.getSettings().downloadOnlyUnreadArticles == true) {
                	total = countNewUnread;
                }
                
                // if (Number(total) > 1500 && forceUnread != true) {
                    // this.log("too many items, restart itemlist loading with only unread items");
                    // this.loadItemList( true );
                    // return;
                // }
                
                
                if (Number(total) != Number(totalItemCountBeforeSync)) {
                	this.log("something has changed... there is some unfinished business!");
                    // create array of items        
                    var counter = 0;
                    var countReadItems = 0;
                    var countUnreadItems = 0;
                    for (var ki = 0; ki < this.temp.length; ki++)
                    {
                        var actual = (Number(total) > 0) ? (100 * Number(counter) / Number(total)) : 0;
                        if (this.getBackground() == false) {
                            this.owner.showProgressPopup( "1", $L("Syncing article list"), actual, undefined, total, false );
                        }
                        var obj = this.temp[ki];
                        var hostMatch = obj.url.match(/^https?:\/\/([^\/]+)/);
                        var host = hostMatch ? hostMatch[1].replace(/^www\./, '') : "";
                        var newItem = {
                            "item_id" : obj.bookmark_id,
                            "url" : obj.url,
                            "title" : obj.title,
                            "description" : obj.description || "",
                            "time_updated" : new Date(obj.time * 1000),
                            "time_added" : new Date(obj.time * 1000),
                            "tags" : "",
                            "state" : 0,
                            "oldTitle" : obj.title,
                            "age" : "",
                            "host" : host,
                            "newTitle" : obj.title,
                        };

                        countUnreadItems++;

                        if (totalItemCountBeforeSync > 0) {
                            Util.removeElement( this.getItemsAll(), newItem );
                        }
                        counter++;
                        this.getItemsAll().push(newItem);
                    }
                    
                    if (this.getBackground() == true) {
                        localStorage.setItem("lastActivity", new Date().getTime());
                    }
                    
                    this.log("this.getItemsAll(): " + this.getItemsAll().length);
                    this.log("final counter: " + counter);
                    if (this.getBackground() == false) {
                        this.owner.showProgressPopup( "1", $L("Processing article list"), 1/3, undefined, 3, false );
                    }
                    // sort array of items depending on time_updated!
                    this.setItemsAll(this.getItemsAll().sort(function(a,b) {  
                        // this.log(" +----> b: " + b.time_updated + ", a: " + a.time_updated);
                        return b.time_updated - a.time_updated;
                    })); 
                    
            
                    if (this.getBackground() == true) {
                        localStorage.setItem("lastActivity", new Date().getTime());
                    }
                    
                    countReadItems = countReadItems + readItems.length;
                    countUnreadItems = countUnreadItems + oldUnreadItems.length;
                    
                    this.log("countReadItems: " + countReadItems);
                    this.log("countUnreadItems: " + countUnreadItems);
                    var countableArticles = countReadItems + countUnreadItems;
                    if (Util.getSettings().downloadOnlyUnreadArticles == true) {
                        countableArticles = countUnreadItems;
                    }
                    this.log("countableArticles: " + countableArticles);
                    this.log("Util.getSettings().articleLimit: " + Util.getSettings().articleLimit);
                    
                    if (countableArticles > Util.getSettings().articleLimit) {
                        this.log("maxitems (" + Util.getSettings().articleLimit + ") reached");
                        
                        if (Util.getSettings().downloadOnlyUnreadArticles == false) {
                            this.log("keep all kind of items, but delete everything above the limit");
                            if (this.getItemsAll().length > Util.getSettings().articleLimit) {
        
                                // delete downloaded articles
                                for (var key = Util.getSettings().articleLimit; key < this.getItemsAll().length; key++) {
                                    var tmpObj = this.getItemsAll()[key];
                                    if (tmpObj != null) {
                                        var obj = Util.getElementFromArrayById( this.getDownloadedArticles(), tmpObj.item_id);
                                        if (obj != null) {
                                            this.deleteFile( obj );
                                        }
                                    }
                                }
        
                                // delete downloaded images
                                for (var key = Util.getSettings().articleLimit; key < this.getItemsAll().length; key++) {
                                    var tmpObj = this.getItemsAll()[key];
                                    if (tmpObj != null) {
                                        var obj = Util.getElementFromArrayById( this.getDownloadedImages(), tmpObj.item_id);
                                        if (obj != null) {
                                            this.deleteFile( obj );
                                        }
                                    }
                                }
        
                                this.setItemsAll(this.getItemsAll().slice(0, Util.getSettings().articleLimit));
                            }
                        } else {
                            var tmpResult = this.getFeedItemsByStateAndTag("unread", "");
                            this.log("tmpResult.length: " + tmpResult.length);
                            if (tmpResult.length > Util.getSettings().articleLimit) {
                                this.log("keep only unread items, but delete everything above the limit");
        
                                // select articles that are over the limit
                                var tmpResult = [];
                                for (var key = Util.getSettings().articleLimit; key < this.getFeedItemsByStateAndTag("unread", ""); key++) {
                                    var tmpObj = this.getFeedItemsByStateAndTag("unread", "")[key];
                                    if (tmpObj != null) {
                                        var obj = Util.getElementFromArrayById( this.getDownloadedArticles(), tmpObj.item_id);
                                        if (obj != null) {
                                            this.deleteFile( obj );
                                        }
                                    }
                                }                            
                                
                                // delete downloaded images
                                for (var key = Util.getSettings().articleLimit; key < this.getFeedItemsByStateAndTag("unread", ""); key++) {
                                    var tmpObj = this.getFeedItemsByStateAndTag("unread", "")[key];
                                    if (tmpObj != null) {
                                        var obj = Util.getElementFromArrayById( this.getDownloadedImages(), tmpObj.item_id);
                                        if (obj != null) {
                                            this.deleteFile( obj );
                                        }
                                    }
                                }
        
                                this.setItemsAll(this.getFeedItemsByStateAndTag("unread", "").slice(0, Util.getSettings().articleLimit));
                                
                                
                                for (var c = 0; c < readItems.length; c++) {
                                    var obj = readItems[c];
                                    this.log("read item saved: " + enyo.json.stringify(obj));
                                    this.getItemsAll().push( obj );
                                }
                                
                            }
                        }

                        this.log("new item count total: " + this.getItemsAll().length);
                        
                    } else if (Util.getSettings().downloadOnlyUnreadArticles == true) {
                        this.log("maxitems (" + Util.getSettings().articleLimit + ") NOT reached, but only keep unread items");
                        this.setItemsAll(this.getFeedItemsByStateAndTag("unread", ""));
                        
                        for (var c = 0; c < readItems.length; c++) {
                            var obj = readItems[c];
                            this.log("read item saved: " + enyo.json.stringify(obj));
                            this.getItemsAll().push( obj );
                        }

                    } else {
                        this.log("maxitems (" + Util.getSettings().articleLimit + ") NOT reached, keep all items");
                        for (var c = 0; c < readItems.length; c++) {
                            var obj = readItems[c];
                            this.log("read item saved: " + enyo.json.stringify(obj));
                            this.getItemsAll().push( obj );
                        }
                    }

                    if (this.getBackground() == true) {
                        localStorage.setItem("lastActivity", new Date().getTime());
                    }
                    

                    // iterate over items and grab the tags
                    for (var c=0; c<this.getItemsAll().length; c++) {
                        var newItem = this.getItemsAll()[c];
                        if (newItem.tags !== undefined) {
                            // this.log("tags: " + newItem.tags);
                            this.addGlobalTags( this.getAvailableTags(), newItem.tags);
                        }
                    }

                    this.log("this.getAvailableTags(): " + this.getAvailableTags().length);
                    this.setAvailableTags(this.getAvailableTags().sort(function(a,b) {  
                        // enyo.log(" +----> b: " + b.time_updated + ", a: " + a.time_updated);
                        if (a.isTag == false || b.isTag == false) {
                            return 0;
                        }
                        
                        return a.tag.localeCompare( b.tag );
                    }));
                    
                    for (key in this.getAvailableTags()) {
                        this.log("tag: " + this.getAvailableTags()[key].tag);
                    } 


                    if (this.getBackground() == true) {
                        localStorage.setItem("lastActivity", new Date().getTime());
                    } else if (this.getBackground() == false) {
                        this.owner.showProgressPopup( "1", $L("Processing article list"), 2/3, undefined, 3, false  );
                    }
                    // save itemlist
                    // this.log("saving itemlist...");
                    // var storageType = "itemList";
                    // localStorage.removeItem(storageType);
                    // localStorage.setItem(storageType, JSON.stringify(this.getItemsAll()));
                    this.storeItemsAll();
                        
                } else {
                	this.log("nothing has changed!");
                }
                
                if (this.getBackground() == false) {
                    if (this.getItemsAll().length == 0) {
                        this.owner.$.itemListPane.selectView("emptyList");
                    } else {
                        this.owner.$.itemListPane.selectView("feedList");
                    }
                }
                
                this.log("saving timestamp of sync...");
                // save timestamp of sync
                localStorage.removeItem("lastSync");
                localStorage.setItem("lastSync", new Date().getTime());
                
                // save tags
                localStorage.removeItem("availableTags");
                localStorage.setItem("availableTags", JSON.stringify(this.getAvailableTags()));
                
                this.log("this.getBackground(): " + this.getBackground());
                if (this.getBackground() == false) {
                    this.owner.showProgressPopup( "1", $L("Processing article list"), 3/3, undefined, 3, false );
                    // show stored itemlist
                    this.owner.showItemsFromStorage();
                    this.owner.$.previewPane.loadArticles();
                    this.owner.disableItemListPaneControls( false );
                }

                // enyo.nextTick("autoSyncArticles", enyo.bind(this, this.doAutoSyncArticles()));
                this.log("Util.getSettings().autoDownloadArticles: " + Util.getSettings().autoDownloadArticles);
                if (Util.getSettings().autoDownloadArticles == true) {
                    this.doAutoSyncArticles();
                } else {
                    this.log("downloadArticles disabled");
                    localStorage.setItem("syncInProgress", false);
                    Util.getSettings( true );
                    if (this.getBackground() == true) {
                        localStorage.setItem("lastActivity", new Date().getTime());
                    } else if (this.getBackground() == false) {
                        this.owner.$.itemListPane.hideListSpinner();
                        this.owner.$.previewPane.hideListSpinner();
                        this.owner.showProgressPopup( "1", $L("Syncing article list"), 100, "unknown", "unknown", true );
                        this.owner.$.progressDialog.close();
                    }
                }

            }
        }
        else {
            localStorage.setItem("syncInProgress", false);
            Util.getSettings( true );
            if (this.getBackground() == false) {
                // show content
                var errorMsg = $L("Sync was not successful, please try again later.");
                this.owner.error( errorMsg );
                this.owner.error("responseText: " + enyo.json.stringify(responseText));
                this.setFeedItems([]);
                this.owner.showItemsFromStorage();
                this.owner.$.previewPane.loadArticles();
                this.owner.$.progressDialog.close();
                this.owner.$.itemListPane.hideListSpinner();
                this.owner.$.previewPane.hideListSpinner();
                this.owner.disableItemListPaneControls( false );
                this.owner.showFeedFailurePopup( errorMsg );
            }
        }
        this.log("END");
    },
    
    grabFeedFailure : function(inSender, inResponse, inRequest) {
        this.log("START");

        if (this.getBackground() == false) {
            // hide the spinner in the itemlist
            this.owner.$.itemListPane.hideListSpinner();
            this.owner.$.previewPane.hideListSpinner();
            this.owner.$.progressDialog.close();
        }                  

        this.error();
        this.log("inSender: " + inSender);
        this.log("inResponse: " + inResponse);
        this.log("inRequest: " + inRequest);
        
        
        var status = "";
        
        if (inRequest && inRequest.xhr) {
            status = inRequest.xhr.status;
            this.log("inRequest.xhr.status: " + inRequest.xhr.status);
            this.log("inRequest.xhr.getResponseHeader(\"Content-Type\"): " + inRequest.xhr.getResponseHeader("Content-Type"));
            this.log("inRequest.xhr: " + enyo.json.stringify(inRequest.xhr));
        }
        
        this.setFeedItems([]);
        if (this.getBackground() == false) {
            
        	if (status == 403 && Util.getSettings().accountVerified == true) {
                // empty item list
                this.owner.showFailurePopup ($L("You do not have any articles in your reading list. Try and add some! :-)"), $L("Information") );
            } else if (status == 401) {
            	// 401 - Username and/or password is incorrect
                this.owner.showFailurePopup ($L("Your username and/or password is incorrect!"), $L("Error") );
            } else if (status == 503) {
            	// 503 - Instapaper server is down for maintenance.
                this.owner.showFailurePopup ($L("Instapaper's server is down for scheduled maintenance."), $L("Information") );
            } else {
                // show stored itemlist
                this.owner.showItemsFromStorage();
                this.owner.$.previewPane.loadArticles();
                this.owner.showFeedFailurePopup ( inResponse );
            }
            this.owner.disableItemListPaneControls( false );
            
        }
        this.log("END");
    },
    
   isTagAvailable : function( inTag ) {
      for (key in this.getAvailableTags()) {
          var obj = this.getAvailableTags()[key];
          if (obj.tag == inTag) {
              // this.log("found tag: " + inTag);
              return true;
          }
      }    
      return false;
   },
   
   addGlobalTags : function( inArray, inTags) {
       if (tags !== inTags && inArray != null) {
           var tags = inTags.split(",");
           for (key in tags) {
               var tag = tags[key];
               // this.log("tag: " + tag);
               if (this.isTagAvailable( tag ) == false) {
                   var item = {
                       "tag" : tag,
                       "isTag" : true,
                   };
                   this.getAvailableTags().push( item );
                   this.log("added global tag: " + tag);
               }
           }
       }
   },

    ////////////////////////////////////////////
    // LOAD ARTICLE LIST - END
    ////////////////////////////////////////////
    
    
    ////////////////////////////////////////////
    // TOGGLE ARTICLE READ-STATE - START
    ////////////////////////////////////////////
    markRead : function( bgMode ) {
        this.log("START");
        if ( bgMode !== undefined) {
            this.setBackground( bgMode );
        }
        if (this.getToggledReadState().length == 0) {
            this.log("nothing to do...");
        }
        for (var key in this.getToggledReadState()) {
            this.log("key: " + key);
            var obj = this.getToggledReadState()[key];
            this.log("obj.item_id: " + obj.item_id);
            this.toggleReadStateOnline( obj.item_id, true );
        }
        this.setToggledReadState([]);
        localStorage.removeItem("offlineRead");
        this.log("END");
    },
    
    toggleReadStateOnline: function( item_id, alreadToggledState, inIndex ) {
        this.log("START");
        this.log("item_id: " + item_id);

        var useAction = "";

        // get item by id
        var item = Util.getElementFromArrayById( this.getItemsAll(), item_id );
        this.log("item.state: " + item.state);

        if (true == alreadToggledState) {
            if (item.state == 0) {
                item.state = 1;
            } else {
                item.state = 0;
            }
            this.log("item was already toggled for viewing purposes, so switched back to old item.state: " + item.state);
        }

        if (item.state == 0) {     // mark item read
            useAction = "archive";
        } else {    // mark item unread
            useAction = "unarchive";
        }

        var instaUrl = "https://www.instapaper.com/api/1/bookmarks/" + useAction;
        var params = {"bookmark_id": String(item_id)};
        var api = Util.getApiKey();
        var authHeader = OAuthHelper.buildAuthHeader(
            "POST", instaUrl, params,
            api.key, api.secret,
            Util.getSettings().password,
            Util.getSettings().tokenSecret
        );

        this.log("Posting to URL: " + instaUrl);
        this.$.markReadFeed.setHeaders({"Authorization": authHeader, "item_id": item_id, "alreadToggledState": alreadToggledState, "inIndex": inIndex});
        this.$.markReadFeed.setUrl(instaUrl);
        this.$.markReadFeed.call(params);
        if (this.getBackground() == false) {
            this.owner.$.feedWebViewPane.showSpinner();
            this.owner.$.detailPane.showSpinner();
        }

        this.log("END");
    },
    
    toggleReadStateOffline: function( inId ) {
        this.log("START");
       
        this.owner.$.feedWebViewPane.showSpinner();
        
        // get item by id
        var item = Util.getElementFromArrayById( this.getItemsAll(), inId );
        
        if (item != null) {
            // save item
            var newItem = {
                "item_id" : item.item_id,
                "url" : item.url
            };
            this.getToggledReadState().push( newItem );       
            
            // save items to storage
            localStorage.removeItem("offlineRead");
            localStorage.setItem("offlineRead", enyo.json.stringify(this.getToggledReadState()));
    
            this.updateItemInList( item );
    
            if (this.getBackground() == false) {
                // resize webview if required
                if (this.owner.getWebViewMaximized() == true || this.owner.$.feedWebViewPane.getFullscreen() == true) {
                    this.owner.resizeWebView();
                    this.owner.setWebViewMaximized( false );
                }
                this.owner.$.itemListPane.clearSelection();
                this.owner.$.feedWebViewPane.showEmptyPage();

                this.owner.$.feedWebViewPane.hideSpinner();
            }
        } else {
            this.error("could not find item with id: " + inId);
        } 

        this.log("END");
    },
    
    markReadFeedSuccess: function( inSender, inResponse, inRequest ) {
        this.log("START");        

        this.log(inRequest.headers);
        this.log("this.getBackground(): " + this.getBackground());
        // this.log("this.owner.getWebViewMaximized(): " + this.owner.getWebViewMaximized());
        // this.log("Util.isTouchpad(): " + Util.isTouchpad());
        // this.log("Util.isPortraitMode(): " + Util.isPortraitMode());
        
        var item_id = inRequest.headers.item_id;
        var inIndex = inRequest.headers.inIndex;
        this.log("item_id: " + item_id);
        
        if (this.getBackground() == false) {
            // this.log("1");
            var item = this.owner.$.itemListPane.getSelectedItem();
            this.log("item: " + item);
            if (item !== undefined && item != null) {
                id = item.item_id;
            } else {
                id = item_id;
            }
            this.log("id: " + id);

            if (item_id == id) {
		    	if (this.owner.$.pane.getViewName() == "feedSlidingPane") {
	                // resize webview if required
	                if (this.owner.getWebViewMaximized() == true || this.owner.$.feedWebViewPane.getFullscreen() == true || Util.isTouchpad() == false) {
	                    this.owner.resizeWebView();
	                    this.owner.setWebViewMaximized( false );
	                }
	                
	                this.owner.$.itemListPane.clearSelection();
	                this.owner.$.feedWebViewPane.showEmptyPage();
		    	} else {
	                // this.owner.$.detailPane.markItemRead( {"value": item_id}, null);
	                // this.owner.$.detailPane.showEmptyPage();
	                this.owner.$.previewSlidingPane.selectViewByName("previewPane");
		    	}    	
            } else {
                this.log("inIndex toggled article: " + inIndex);
                this.log("selected row: " + this.owner.$.itemListPane.getSelectedRow());
                
                var indexOld = Number(inIndex);
                var indexCurrent = Number(this.owner.$.itemListPane.getSelectedRow());
                if (indexOld < indexCurrent) {
                    this.owner.$.itemListPane.setSelectedRow( Number(indexCurrent)-1 );
                    this.owner.$.itemListPane.$.feedList.refresh();
                }
            }
            this.owner.$.feedWebViewPane.hideSpinner();
            this.owner.$.detailPane.hideSpinner();
            
            if (this.getItemsAll().length == 0) {
                this.owner.$.itemListPane.selectView("emptyList");
            } else {
                this.owner.$.itemListPane.selectView("feedList");
            }

        }
        
        this.toggleItemState( item_id );
    
        this.log("END");
    },
    
    markReadFeedFailed: function( inSender, inResponse, inRequest ) {
        this.log("START");

        this.error();
        this.log("inSender: " + inSender);
        this.log("inResponse: " + inResponse);
        this.log("inRequest: " + inRequest);
        this.log("request headers: " + inRequest.headers);
        var status = "";
        
        if (inRequest && inRequest.xhr) {
            status = inRequest.xhr.status;
            this.log("inRequest.xhr.status: " + inRequest.xhr.status);
            this.log("inRequest.xhr.getResponseHeader(\"X-Error\"): " + inRequest.xhr.getResponseHeader("X-Error"));
            this.log("inRequest.xhr: " + enyo.json.stringify(inRequest.xhr));
        }

        this.error(inResponse);

        this.owner.$.feedWebViewPane.hideSpinner();
        this.owner.$.feedFailurePopup.openAtCenter();

        this.log("END");
    },

    toggleItemState : function( item_id ) {
        this.log("item_id: " + item_id);
        
        // item state togglen
        var item;
        if (item_id !== undefined) {
            item = Util.getElementFromArrayById( this.getItemsAll(), item_id );
        } else {
            // item = this.owner.$.itemListPane.getSelectedItem();
            this.error("Missing parameter: item_id");
            return; 
        }

        if (item !== null) {
            this.updateItemInList( item );
        } else {
            this.log("item already removed from local storage...");
        }
        
        if (this.getBackground() == false) {
            if (this.owner.$.itemListPane.$.searchBox.getValue() != "")
            {
                this.log("search was active...");
                this.owner.$.itemListPane.filterItems();
            } else {
                this.log("search was NOT active...");
            }
        }
    },
    
    updateItemInList : function ( item ) {
        this.log("START");
        if (item !== undefined) {
            // item aus der liste entfernen
            this.log("found item, remove it from local storage...");
            Util.removeElement( this.getItemsAll(), item);
    
            var now = Math.round(new Date().getTime() / 1000);

            this.log("item.title: " + item.title);
            this.log("item.url: " + item.url);
            this.log("item.state old: " + item.state);
            if (item.state == "0") {
                item.state = 1;
            } else if (item.state == "1") {
                item.state = 0;
            }       
            item.time_updated = now;
            
            this.log("item.state new: " + item.state);
            
            // item neu in die liste packen
            this.getItemsAll().push(item);

            // sort array of items depending on time_updated!
            this.setItemsAll(this.getItemsAll().sort(function(a,b) {  
                // this.log(" +----> b: " + b.time_updated + ", a: " + a.time_updated);
                return b.time_updated - a.time_updated;
            })); 
            
            this.setItemsAll( Util.sort( this.getItemsAll(), Util.getSettings().sortOrder ) );
    
            // save itemlist
            // this.log("saving itemlist...");
            // var storageType = "itemList";
            // localStorage.removeItem(storageType);
            // localStorage.setItem(storageType, JSON.stringify(this.getItemsAll()));
            this.storeItemsAll();
            
            if (this.getBackground() == false) {
                // show stored itemlist
                
                // var scrollPos = this.owner.$.itemListPane.$.scroller.getScrollTop();
                var top = this.owner.$.itemListPane.$.feedList.$.scroller.top;
                this.log("top: " + top);                
                // var bottom = this.owner.$.itemListPane.$.feedList.$.scroller.bottom;
                // this.log("bottom: " + bottom);                
                this.owner.showItemsFromStorage();
                this.owner.$.previewPane.loadArticles();
                if (top != 0 /*|| bottom != 0*/) {
                    this.owner.$.itemListPane.scrollTo( top );
                }
            }
        }
        this.log("END");
    },
    ////////////////////////////////////////////
    // TOGGLE ARTICLE READ-STATE - END
    ////////////////////////////////////////////
    
    getDownloadedArticleContent : function( id ) {
        // this.log("this.getDownloadedArticles().length: " + this.getDownloadedArticles().length);
        this.log("START");
        for (var key in this.getDownloadedArticles()) {
            // this.log("key: " + key);
            var obj = this.getDownloadedArticles()[key];
            // this.log("obj.item_id: " + obj.item_id);
            if (obj.item_id == id) {
                // this.log("found content for id: " + id + " at: " + obj.file );
                this.log("END");
                return obj.file;
            }
        }
        // this.log("id: " + id + " has NOT been downloaded!");
        this.log("END");
        return null;
    },
    

    ////////////////////////////////////////////
    // DOWNLOADING ARTICLES - START
    ////////////////////////////////////////////
    isArticleAlreadyDownloaded : function( id ) {
        // this.log("START");
        // this.log("looking for id: " + id);
        // this.log("this.getDownloadedArticles().length: " + this.getDownloadedArticles().length);
        for (var key in this.getDownloadedArticles()) {
            // this.log("key: " + key);
            var obj = this.getDownloadedArticles()[key];
            // this.log("obj.item_id: " + obj.item_id);
            if (obj.item_id == id) {
                // this.log("id: " + id + " has already been downloaded!");
                // this.log("END");
                return true;
            }
        }
        // this.log("id: " + id + " has NOT been downloaded!");
        // this.log("END");
        return false;
    },
    
    isItemCurrentlyDownloading : function( item ) {
        // this.log("START");
        this.log("item.item_id: " + item.item_id);
        for (var key in this.getCurrentlyLoading()) {
            var obj = this.getCurrentlyLoading()[key];
            this.log("key: " + key);
            this.log("obj.item_id: " + obj.item_id);
            if (obj.item_id == item.item_id) {
                // this.log("true: " + obj.item_id);
                // this.log("END");
                return true;
            }
        }
        // this.log("item " + item.item_id + " is currently not downloading!");
        // this.log("END");
        return false;
    },
    
    isItemCurrentlyWaiting : function( item ) {
        // this.log("START");
        // this.log("index: " + index);
        for (var key in this.getCurrentlyWaiting()) {
            var obj = this.getCurrentlyWaiting()[key];
            // this.log("obj: " + obj);
            if (obj.item_id == item.item_id) {
                // this.log("true: " + obj.item_id);
                // this.log("END");
                return true;
            }
        }
        // this.log("item " + index + " is currently not downloading!");
        // this.log("END");
        return false;
    },

    doAutoSyncArticles : function() {
        this.log("START");
        for (var key in this.getItemsAll())
        {
            var obj = this.getItemsAll()[key];
            if (!this.isArticleAlreadyDownloaded( obj.item_id ) && !this.isItemCurrentlyWaiting( obj )) {
                this.getCurrentlyWaiting().push(obj);
            }
        }
        
        this.setTotalItemsToDownload( this.getCurrentlyWaiting().length );
        this.setCancelArticleDownload( false );
        this.setCancelImageDownload( false );
        this.setCurrentlyLoading([]);
        this.setCurrentlyLoadingImages([]);
        
        if (this.getTotalItemsToDownload() > 0) {


            if (this.getBackground() == true) {
                localStorage.setItem("lastActivity", new Date().getTime());
            }
            enyo.nextTick("downloadArticles", enyo.bind(this, "downloadArticles"));
        } else {
            this.log("no articles to download!");
            
            if (this.getImagesToDownload().length > 0) {
                this.log("found some images that needs to be downloaded");
                enyo.job("doDownloadImages",this.doDownloadImages( ), 1000 * 60 * 5);
            } else {
                this.log("and no more images to download!");
                if (this.getBackground() == true) {
                    localStorage.setItem("lastActivity", new Date().getTime());
                }
                this.syncFinished();
            }
        }
        
        this.log("END");
    },
    
    downloadArticles : function() {
        this.log("START");

        this.log("currently waiting for downloading articles: " + this.getCurrentlyWaiting().length);
        this.log("currently downloading articles: " + this.getCurrentlyLoading().length);
        this.log("max simultaneously articles: " + this.getCurrentMaxDownloads());

        if (this.getBackground() == true) {
            localStorage.setItem("lastActivity", new Date().getTime());
        }
        
        // if no more items waiting for download -> finished!   
        if ((this.getCurrentlyWaiting().length == 0 && this.getCurrentlyLoading().length == 0) || (this.getCurrentlyLoading().length == 0 && this.getCancelArticleDownload() == true)) {
            if (this.getBackground() == false) {
                this.owner.$.itemListPane.hideListSpinner();
                this.owner.$.previewPane.hideListSpinner();
                this.owner.disableItemListPaneControls(false);
            }
            if (this.getTotalItemsToDownload() > 0) {
                var total = this.getTotalItemsToDownload();
                if (this.getBackground() == false) {
                    this.owner.showProgressPopup( "2", $L("Downloading new articles"), 100, total, total, true );
                    // this.owner.$.progressDialog.resetDialog();            
                    // this.owner.$.progressDialog.close();
                }
                this.setTotalItemsToDownload(0);
            } else {
                if (this.getBackground() == false) {
                    this.owner.showProgressPopup( "2", $L("Downloading new articles"), 100, "unknown", 0, true );
                    // this.owner.$.progressDialog.resetDialog();            
                    // this.owner.$.progressDialog.close();
                }
            }
            
            localStorage.setItem("syncInProgress", false);
            Util.getSettings( true );
            if (this.background == true && this.funcname !== undefined && this.scope !== undefined) {
                this.log("there is some unfinished business to do... ;-)");
                // a function that binds this to this.foo
                var func = enyo.bind(this.scope, this.funcname);
                // the value of this.foo(3)
                var value = func( true );
            }
            
            // STORE TEXTINFO
            this.storeTextInfo();

            if (this.getImagesToDownload().length > 0 && Util.getSettings().showImages == true && this.getCancelArticleDownload() == false) {
                this.log("will download a total of " + this.getImagesToDownload().length + " images!");
                if (this.getBackground() == false) {
                    this.owner.showProgressPopup( "2", $L("Downloading new images"), 0, 0, this.getImagesToDownload().length, false, "cancelDownloadArticles" );
                }
                // download items
                enyo.job("doDownloadImages",this.doDownloadImages( ), 1000 * 60 * 5);
                // for (key in this.getImagesToDownload()) {
                    // // enyo.job("loadImage",this.loadImage( this.getImagesToDownload()[key] ), 1000 * 60 * 5);
                    // // setInterval(this.downloadArticles(), 1000 * 60 * 5);
                // }
            } else {
                this.log("nothing todo, finishing... :-)");
                this.owner.$.progressDialog.resetDialog();            
                this.owner.$.progressDialog.close();
            }
            this.log("END");
            return;
        }
        
        
        if (this.getCurrentlyLoading().length >= this.getCurrentMaxDownloads()) {
            this.log("waiting another " + this.getMillisToWait() + " ms. returning!")
            return;
        }

        if (this.getBackground() == false) {
            this.owner.$.itemListPane.showListSpinner();
            this.owner.disableItemListPaneControls(true);
        }
        
        if (this.getCurrentlyLoading().length < this.getCurrentMaxDownloads() && this.getCurrentlyWaiting().length == 0) {
            var total = this.getTotalItemsToDownload();
            var sum = this.getCurrentlyWaiting().length + this.getCurrentlyLoading().length;
            var actual = total - sum;
            if (actual < 0) {
                actual = 0;
            }
            if (this.getBackground() == false) {
                this.owner.showProgressPopup( "2", $L("Downloading new articles"), 100 / total * actual, actual, total, false, "cancelDownloadArticles" );
            }
        }
        
        while (this.getCurrentlyLoading().length < this.getCurrentMaxDownloads() && this.getCurrentlyWaiting().length > 0  && this.getCancelArticleDownload() == false) {

            var waitingItem = this.getCurrentlyWaiting()[0];
            if (waitingItem === undefined || waitingItem == "undefined") {
                this.error("waitingItem == undefined");
                return;
            } else {
                this.log("waitingItem: " + waitingItem);
            }
            Util.removeElement( this.getCurrentlyWaiting(), waitingItem);
            this.log("add to currently loading: " + waitingItem.item_id);
            this.getCurrentlyLoading().push(waitingItem);
            this.loadArticle( waitingItem.item_id, waitingItem.url );

            this.log("currently downloading articles: " + this.getCurrentlyLoading().length);
            
            var total = this.getTotalItemsToDownload();
            var sum = this.getCurrentlyWaiting().length + this.getCurrentlyLoading().length;
            var actual = total - sum;
            if (actual < 0) {
                actual = 0;
            }
            if (this.getBackground() == true) {
                localStorage.setItem("lastActivity", new Date().getTime());
            } else if (this.getBackground() == false) {
                this.owner.showProgressPopup( "2", $L("Downloading new articles"), 100 / total * actual, actual, total, false, "cancelDownloadArticles" );
            }
        }

        this.log("END");
    },
    
    loadArticle : function ( id, url, refreshOnly, inMode ) {
        this.log("START");
        this.log("id: " + id);
        var newUrl = Util.getTextProxyUrl() + "?id=" + encodeURIComponent(id) + "&t=" + encodeURIComponent(Util.getSettings().password) + "&s=" + encodeURIComponent(Util.getSettings().tokenSecret) + (url ? "&u=" + encodeURIComponent(url) : "");
        this.log("newUrl: " + newUrl);
        
        // TODO make dynamic
        var appinfo = enyo.fetchAppInfo();
        var targetDir = "/media/internal/appdata/";
        targetDir += appinfo.id + "/";
        var targetFilename = id + ".html";
        this.log("targetFilename: " + targetFilename);
        var params;
        if (refreshOnly !== undefined && refreshOnly == true) {
            this.log("refresh only this article");
            params = { "subscribe" : false, "resubscribe" : false, "target" : newUrl, "targetDir" : targetDir, "targetFilename" : targetFilename, "keepFilenameOnRedirect" : true};
        } else {
            this.log("batch mode...");
            params = { "target" : newUrl, "targetDir" : targetDir, "targetFilename" : targetFilename, "keepFilenameOnRedirect" : true};
        }
        // this.$.downloadService.setHeaders({"id" : id, "index" : index, "obj" : obj});
        if (Util.isWebOS() == true) {
            this.log("downloading article with webOS");
            this.$.downloadService.call(params);
        } else {
            this.log("downloading article without webOS");
            this.$.downloadArticlesService.setHeaders( {"item_id" : id} );
            this.$.downloadArticlesService.setUrl( newUrl );
            this.$.downloadArticlesService.call( );
        }

        this.log("END");
    },
   
    loadArticleNew : function ( id, url, refreshOnly, inMode ) {
        this.log("START");
        this.log("id: " + id);
        this.log("url: " + url);
        this.log("refreshOnly: " + refreshOnly);
        // var mode = "less";
        // if ((inMode !== undefined && inMode != null) || (url.indexOf("heise.de") != -1) ) {
            // this.log("treffer!");
            // mode = "more";
        // }
        var newUrl = "https://text.readitlater.com/v3beta/text?apikey=" + Util.getApiKey() + "&refresh=1&videos=0&images=0&output=json&url=" + encodeURIComponent(url) + "&random=" + Util.getRandomString();        
        if (!Util.isWebOS()) {
            newUrl = "https://text.readitlater.com/v3beta/text?apikey=" + Util.getApiKey() + "&refresh=1&videos=1&images=0&output=json&url=" + encodeURIComponent(url) + "&random=" + Util.getRandomString();
        }
        this.log("newUrl: " + newUrl);
        
        this.$.downloadTextInfoService.setHeaders( {"item_id" : id, "refreshOnly" : refreshOnly} );
        this.$.downloadTextInfoService.setUrl( newUrl );
        this.$.downloadTextInfoService.call( );


        this.log("END");
    },
   
    downloadTextInfoSuccess: function(inSender, inResponse, inRequest) {
        this.log("START");
        // this.log("inResponse.article: " + JSON.stringify(inResponse.article));
        // this.log("inResponse.images: " + JSON.stringify(inResponse.images));
        // this.log("inResponse.videos: " + JSON.stringify(inResponse.videos));
        
        var refreshOnly = inRequest.headers.refreshOnly;
        this.log("refreshOnly: " + refreshOnly);
        var id = inRequest.headers.item_id;
        this.log("id: " + id);
        
        for (key in inResponse.images) {
            var obj = inResponse.images[key];
            this.log("need to download: " + obj.src);
            this.getImagesToDownload().push( { "url" : obj.src, "item_id" : id } );
        }

        
        var newItem = {
            "item_id": id,
            "resolvedUrl": inResponse.resolvedUrl,
            "host": inResponse.host,
            "title": inResponse.title,
            "datePublished": inResponse.datePublished,
            "timePublished": inResponse.timePublished,
            "excerpt": inResponse.excerpt,
            "images": inResponse.images,
            "videos": inResponse.videos,
            "wordCount": inResponse.wordCount,
            "isArticle": inResponse.isArticle,
            "isIndex": inResponse.isIndex,
        };
        this.getTextInfo().push( newItem );
        // localStorage.removeItem("textInfo");
        // localStorage.setItem("textInfo", JSON.stringify(this.getTextInfo()));

        // var id = inResponse.resolved_id;

        var newUrl = "https://text.readitlater.com/v3beta/text?apikey=" + Util.getApiKey() + "&refresh=1&videos=0&images=0&mode=less&url=" + encodeURIComponent(inResponse.resolvedUrl) + "&random=" + Util.getRandomString();        
        this.log("newUrl: " + newUrl);


        // TODO make dynamic
        var appinfo = enyo.fetchAppInfo();
        var targetDir = "/media/internal/appdata/";
        targetDir += appinfo.id + "/";
        var targetFilename = id + ".html";
        this.log("targetFilename: " + targetFilename);
        var params;
        if (refreshOnly !== undefined) {
            if (refreshOnly == true || refreshOnly == "true") {
                this.log("refresh only this article");
                params = { "subscribe" : false, "resubscribe" : false, "target" : newUrl, "targetDir" : targetDir, "targetFilename" : targetFilename, "keepFilenameOnRedirect" : true};
            } else {
                this.log("batch mode...");
                params = { "target" : newUrl, "targetDir" : targetDir, "targetFilename" : targetFilename, "keepFilenameOnRedirect" : true};
            }
        } else {
            this.log("batch mode...");
            params = { "target" : newUrl, "targetDir" : targetDir, "targetFilename" : targetFilename, "keepFilenameOnRedirect" : true};
        }

        if (Util.isWebOS() == true) {
            this.log("downloading article with webOS");
            this.$.downloadService.call(params);
        } else {
            this.log("downloading article without webOS");
            this.downloadArticlesSuccess( null, inResponse.article, { "headers" : {"item_id": id} , "url": newUrl} );
        }
        this.log("END");
    },

    downloadTextInfoFailure : function(inSender, inResponse, inRequest) {
        this.log("START");

        this.error("Unexpected Error!");
        this.error(JSON.stringify(inResponse));
        this.error(inRequest);
        this.log("END");
    },

    grabArticleSuccess: function(inSender, inResponse) {
        // this.log("START");
//        this.log(JSON.stringify(inResponse));
        var ticket = inResponse.ticket;
        // this.log("ticket: " + ticket);
        var completed = inResponse.completed;
        // this.log("completed: " + completed);
        
        if (completed == true) {
            this.log("retrieved downloaded data");
            // get data from response
            var target = inResponse.target;
            // this.log("target: " + target);
            if (target !== undefined) {
                var posStart = target.lastIndexOf("/");
                // this.log("posStart: " + posStart);
                var posEnd = target.lastIndexOf(".html");
                // this.log("posEnd: " + posEnd);
                var id = target.substring(posStart+1, posEnd);
                this.log("downloaded item id: " + id);
                this.log("ticket: " + ticket);
                
                var obj = Util.getElementFromArrayById( this.getItemsAll(), id );
                this.log("obj: " + obj);
                if (obj != null) {
                    this.log("found item: " + obj.item_id);
                    
                    // TODO: check file size, and redownload if content is too small
                    this.log("inResponse.amountTotal: " + inResponse.amountTotal);
                    
                    // var content = Util.loadFile( inResponse.destPath + inResponse.destFile, "", true );
                    // if (content != null) {
                        // this.log("content.length: " + content.length);
                        // if (content.length < 50) {
                            // // check if this is already the second download attemp
                            // var pos = inResponse.url.indexOf("mode=more");
                            // this.log("pos of mode=more: " + pos);
                            // if (pos == -1) {
                                // this.log("redownload article, because content-size was to small...");
                                // this.deleteFile( {"ticket": ticket } );
                                // this.loadArticleNew( obj.item_id, obj.url, true, "more" );
                                // return;
                            // } else {
                                // this.log("downloaded content is just this small, using this one...");
                            // }
                        // }
                    // } 

                    // remove from array of actualy downloading items
                    if (this.isItemCurrentlyDownloading( obj )) {
                        Util.removeElement( this.getCurrentlyLoading(), obj);
                    }
                    
                    // save item
                    var item = {
                        "item_id" : obj.item_id,
                        "ticket" : ticket,
                        "file" : target,
                    };
                    // insert new article
                    if (!this.isArticleAlreadyDownloaded( obj.item_id )) {
//                        this.log("saving article: " + enyo.json.stringify(item));
                        this.getDownloadedArticles().push(item);
                        localStorage.removeItem("downloadedArticles");
                        localStorage.setItem("downloadedArticles", enyo.json.stringify(this.getDownloadedArticles()));
                    } else {
//                        this.log("updating article: " + enyo.json.stringify(item));
                        Util.removeElement( this.getDownloadedArticles(), item );
                        this.getDownloadedArticles().push(item);
                        localStorage.removeItem("downloadedArticles");
                        localStorage.setItem("downloadedArticles", enyo.json.stringify(this.getDownloadedArticles()));
                    }

                    // Extract excerpt + first image from the ROTMETA comment in the downloaded file.
                    try {
                        var metaXhr = new XMLHttpRequest();
                        metaXhr.open("GET", target, false);
                        metaXhr.send(null);
                        var rotmetaMatch = metaXhr.responseText.match(/<!--ROTMETA:(.*?)-->/);
                        if (rotmetaMatch) {
                            var meta = enyo.json.parse(rotmetaMatch[1]);
                            var existingMeta = Util.getElementFromArrayById(this.getTextInfo(), id);
                            var metaEntry = {
                                "item_id": id,
                                "excerpt": meta.excerpt || "",
                                "images": (meta.image ? {"1": {"src": meta.image}} : {}),
                                "host": obj.host || "",
                                "title": obj.title || ""
                            };
                            if (existingMeta === null) {
                                this.getTextInfo().push(metaEntry);
                            } else {
                                existingMeta.excerpt = metaEntry.excerpt;
                                existingMeta.images  = metaEntry.images;
                            }
                            localStorage.setItem("textInfo", enyo.json.stringify(this.getTextInfo()));
                        }
                    } catch(e) {
                        this.error("ROTMETA parse failed: " + e);
                    }

                    // refresh list
                    // this.$.itemListPane.$.feedList.render();
                    if (this.getBackground() == false) {
                        this.owner.$.itemListPane.$.feedList.refresh();
                        // enyo.nextTick("downloadArticles", enyo.bind(this, "downloadArticles"));
                        var listInProgress = this.owner.$.feedWebViewPane.getUpdateArticleInProgress();
                        var gridInProgress = this.owner.$.detailPane.getUpdateArticleInProgress();
                        this.log("listInProgress: " + listInProgress + ", gridInProgress: " + gridInProgress);
                        if (!listInProgress && !gridInProgress) {
                            enyo.job("downloadArticles", enyo.bind(this, "downloadArticles"), this.getMillisToWait());
                        } else {
                            if (listInProgress) {
                                this.owner.$.itemListPane.updateItem( id );
                            } else {
                                this.owner.$.previewPane.updateItem( id );
                            }
                        }
                    } else {
                        // this.downloadArticles();
                        enyo.job("downloadArticles", enyo.bind(this, "downloadArticles"), this.getMillisToWait());
                    }
                }
            }
            
        } else {
            var interrupted = inResponse.interrupted;
            var destFile = inResponse.destFile;
            if (destFile !== undefined) {
                var posEnd = destFile.lastIndexOf(".html");
                var id = destFile.substring(0, posEnd);
    
                if (interrupted == true && id !== undefined && id != null) {
                    this.error("current download of id " + id + " was interruped!");
                    var obj = Util.getElementFromArrayById( this.getItemsAll(), id );
                    if (obj != null) {
                        this.error("removing item from currently downloading queue: " + obj.item_id);
                        // remove from array of actualy downloading items
                        if (this.isItemCurrentlyDownloading( obj )) {
                            Util.removeElement( this.getCurrentlyLoading(), obj);
                        }
                    }
                    if (this.getBackground() == false) {
                        var listInProgress = this.owner.$.feedWebViewPane.getUpdateArticleInProgress();
                        var gridInProgress = this.owner.$.detailPane.getUpdateArticleInProgress();
                        if (!listInProgress && !gridInProgress) {
                            enyo.job("downloadArticles", enyo.bind(this, "downloadArticles"), this.getMillisToWait());
                        } else if (listInProgress) {
                            this.owner.$.feedWebViewPane.updateArticle( true );
                        } else {
                            this.owner.$.previewPane.updateItem( id );
                        }
                    } else {
                        // this.downloadArticles();
                        enyo.job("downloadArticles", enyo.bind(this, "downloadArticles"), this.getMillisToWait());
                    }
                }
            }
        }
        // this.log("END");
    },

    grabArticleFailure : function(inSender, inResponse, inRequest) {
        this.log("START");

        this.error("Unexpected Error!");
        this.error(JSON.stringify(inResponse));
        this.error(inRequest);
        // var str = JSON.stringify(inResponse);
        // this.showFailurePopup( str, "Unexpected Error!" ); 

/*        this.error();
        this.log("inSender: " + inSender);
        this.log("inResponse: " + inResponse);
        this.log("inRequest: " + inRequest);
        
        if (inRequest && inRequest.xhr) {
            this.log("inRequest.xhr.status: " + inRequest.xhr.status);
            this.log("inRequest.xhr.getResponseHeader(\"Content-Type\"): " + inRequest.xhr.getResponseHeader("Content-Type"));
            this.log("inRequest.xhr: " + enyo.json.stringify(inRequest.xhr));
        }
        
        this.setFeedItems([]);
        // show stored itemlist
        this.showItemsFromStorage();
        this.showFeedFailurePopup( "inResponse: " + inResponse );*/
        this.log("END");
    },

    deleteDownloadedArticles : function() {
        // delete downloaded articles
        this.log("count: " + this.getDownloadedArticles().length);
        for (key in this.getDownloadedArticles()) {
            var obj = this.getDownloadedArticles()[key];
//            this.log("obj: " + JSON.stringify(obj) );
            this.deleteFile( obj );
        }
        this.setDownloadedArticles([]);
        localStorage.removeItem("downloadedArticles");
        localStorage.setItem("downloadedArticles", enyo.json.stringify(this.getDownloadedArticles()));
    },

    clearArticleCache : function() {
        this.deleteDownloadedArticles();
        this.setTextInfo([]);
        localStorage.removeItem("textInfo");
        localStorage.setItem("textInfo", enyo.json.stringify([]));
        enyo.job("downloadArticles", enyo.bind(this, "downloadArticles"), this.getMillisToWait());
    },

    deleteFinished : function( inSender, inResponse ) {
       // this.log("deleteDownloadedFile success, results=" + enyo.json.stringify(inResponse));
    },

    deleteFail : function( inSender, inResponse ) {
       this.log("deleteDownloadedFile failure, results=" + enyo.json.stringify(inResponse));
    },  

    deleteFile : function( obj ) {
        if (Util.isWebOS()) {
           this.$.deleteDownloadFile.call({"ticket" : obj.ticket});
        } else if (Util.isPlaybook()) {
           if (blackberry.io.file.exists( obj.file )) {
               blackberry.io.file.deleteFile( obj.file );
           }
        }
    },

    cancelDownloadArticles : function ( ) {
        this.cancelArticleDownload = true;
        this.cancelDownload();
    },
    
    ////////////////////////////////////////////
    // DOWNLOADING ARTICLES - END
    ////////////////////////////////////////////
    

    ////////////////////////////////////////////
    // ADD LINK - START
    ////////////////////////////////////////////
    addLink : function( saveUrl, title, callback ) {
        this.log("START");
        this.log("save url: " + saveUrl);
        this.log("save title: " + title);

        var instaUrl = "https://www.instapaper.com/api/1/bookmarks/add";
        var params = {"url": saveUrl};
        if (title) {
            params.title = title;
        }
        var api = Util.getApiKey();
        var authHeader = OAuthHelper.buildAuthHeader(
            "POST", instaUrl, params,
            api.key, api.secret,
            Util.getSettings().password,
            Util.getSettings().tokenSecret
        );

        this.log("Posting to URL: " + instaUrl);
        this.$.addItemFeed.setHeaders({"Authorization": authHeader});
        this.$.addItemFeed.setUrl(instaUrl);
        this.$.addItemFeed.call(params);

        this.log("END");
    },
    
    addItemFeedSuccess: function(inSender, inResponse, inRequest) {
        this.log("START");
        this.log("inResponse: " + inResponse );
        
        if (this.owner.getCalledFromExtern() == true) {
            this.owner.setCalledFromExtern( false );
        } else {
            if (this.getItemsAll().length == 0) {
                this.owner.$.itemListPane.selectView("emptyList");
            } else {
                this.owner.$.itemListPane.selectView("feedList");
            }
        }
        enyo.windows.addBannerMessage($L("Added Link successfully!"),"{}","images/ReadOnTouch-24.png");
        if (Util.getSettings().syncAfterAddingLink == true) {
	        this.loadItemList();
        }
        this.owner.$.addItemDialog.close();

        this.log("END");
    },
        
    addItemFeedFailed: function(inSender, inResponse, inRequest) {
        this.error("START");
        this.error("inResponse: " + inResponse );
        this.error("this.$.popupDialog: " + this.$.popupDialog );

        if (this.owner.getCalledFromExtern() == true) {
            this.owner.setCalledFromExtern( false );
            enyo.windows.addBannerMessage($L("Link could not be added!"),"{}","images/ReadOnTouch-24.png");
        } else {
            enyo.windows.addBannerMessage($L("Link could not be added!"),"{}","images/ReadOnTouch-24.png");
            this.owner.$.addItemDialog.openAtCenter();
            this.owner.$.addItemDialog.setFinished( false );
        }

        this.error("END");
    },
    ////////////////////////////////////////////
    // ADD LINK - END
    ////////////////////////////////////////////
    
    getFeedItemsByStateAndTag : function( state, tag, force ) {
        this.log("START");
        this.log("state: " + state);
        this.log("tag: '" + tag + "'");
        this.log("force: " + force);
        
        var oldCount = this.getFeedItems().length;
        this.log("oldCount: " + oldCount);

        // this.log();
        var result = [];
        
        if (state !== undefined && state != null && tag != undefined && tag != null)
        {
            // 0=unread, 1=read
            var intState = -1;
            if (state == "read") {
                intState = 1;
            } else if (state == "unread") {
                intState = 0;
            }
            this.log("ALL ITEMS: " + JSON.stringify(this.getItemsAll()));
            // iterate over all items            
            for (var key in this.getItemsAll())
            {
                var obj = this.getItemsAll()[key];
                 this.log("obj: " + obj.title);
                if (obj !== undefined && obj != null) {
                    
                    // check reading state
                    if ((intState != -1 && obj.state == intState) || (intState == -1)) {
                        // check tags
                        if (tag != "") {
                            if (this.hasTag( obj.tags, tag )) {
                                result.push(obj);
                            }
                        } else {
                            result.push(obj);
                        }
                    }
                    
                }
            }
            
            result = Util.sort( result, Util.getSettings().sortOrder );
            
            /*// if sort by oldest is selected, list must be reversed
            var sortBy = "";
            if (this.getBackground() == false) {
                sortBy = this.owner.$.itemListPane.getSelectedItemState();
            }
            this.log("sortBy: " + sortBy);
            if (sortBy == "Oldest") {
                result.reverse();
            }*/
        }
        this.log("result.length: " + result.length);
        
        if (result.length > 0 || true == force) {
            localStorage.setItem("filterTags", tag);
            Util.getSettings( true );
            if (this.getBackground() == false) {
                if (state != "unread" || tag != "") {
                    this.owner.$.itemListPane.styleFilterButton( true );
                    this.owner.$.previewPane.styleFilterButton( true );
                    // this.owner.$.itemListPane.$.filterButton.setCaption($L("Filter active"));
                    // this.owner.$.itemListPane.$.filterButton.setStyle("background-color: green; color: #FFFFFF; font-weight:bold;");
                } else {
                    this.owner.$.itemListPane.styleFilterButton( false );
                    this.owner.$.previewPane.styleFilterButton( false );
                    // this.owner.$.itemListPane.$.filterButton.setCaption("No filter active");
                    // this.owner.$.itemListPane.$.filterButton.setStyle("");
                }
                if (oldCount != Number(result.length)+1) {
                    this.owner.$.feedWebViewPane.showEmptyPage();
                    this.owner.$.itemListPane.clearSelection( );
                }
                this.owner.$.itemListPane.$.feedList.$.scroller.punt();
            }
        } else if (result.length == 0 && state == "unread") {
            if (this.getBackground() == false) {
                this.owner.$.itemListPane.styleFilterButton( false );
            }
            // this.owner.$.itemListPane.$.filterButton.setCaption("No filter active");
            // this.owner.$.itemListPane.$.filterButton.setStyle("");
        }

        if (true == force) {
            localStorage.removeItem("filterTags");
            Util.getSettings( true );
        }

        
        this.log("END");
        return result;
    },
    
    hasTag : function ( tags, tag ) {
        var matchedAll = true;
        if (tags !== undefined && tags != null & tag !== undefined && tag != null) {
            this.log("obj.tags: " + tags);
            // this.log("tag: " + tag);
            
            if (tag.indexOf(",") != 1) {
                var tagArray = tag.split(",");
                for(key in tagArray) {
                    var tmpTag = tagArray[key];
                    if (tags.indexOf(tmpTag) == -1) {
                        matchedAll = false;
                        break;
                    }
                }
            } else {
                if (tags.indexOf(tag) == -1) {
                    matchedAll = false;;
                }
            }
            
        } else {
            matchedAll = false;
        }
        if (matchedAll == true) {
            this.log("found! :-)");
        }
        return matchedAll;
    },
    
    reloadData : function( ) {
        this.log("START");
        if (Util.isPlaybook()) {
            // save image for webworks
            try {
                var dirs = "";
                dirs = blackberry.io.dir.appDirs.app.storage.path;
                var filePath = String(dirs) + "/itemList.data";
                // alert("filePath: " + filePath);
                if (blackberry.io.file.exists(filePath)) {
                    // alert("file exists... trying to read");
                    blackberry.io.file.readFile(filePath,enyo.bind( this, this.handleOpenedItemsAll), false);
                } else {
                    // alert("no file available, load from local storage");
                    this.loadItemsAllFromLocalStorage();
                }
            }
            catch (e) {
                // alert("error in loading itemList file: "+e);
                this.setItemsAll( enyo.json.parse(localStorage.getItem("itemList")) );
                if (this.getItemsAll() == null) {
                    this.log("no items found");
                    this.setItemsAll([]);
                } else {
                    this.log("items loaded from local storage: " + this.getItemsAll().length);
                }
            }     
        } else {

            this.setItemsAll( enyo.json.parse(localStorage.getItem("itemList")) );
            if (this.getItemsAll() == null) {
                this.log("no items found");
                this.setItemsAll([]);
            } else {
                this.log("items loaded from local storage: " + this.getItemsAll().length);
            }
        }

        this.setAvailableTags( enyo.json.parse(localStorage.getItem("availableTags")) );
        if (this.getAvailableTags() == null) {
            this.setAvailableTags([]);
        } else {
            for (var c=0; c<this.getAvailableTags().length; c++) {
                var obj = this.getAvailableTags()[c];
                // this.log("loaded tag: " + obj.tag);
            }
        }

        this.setDownloadedArticles( enyo.json.parse(localStorage.getItem("downloadedArticles")) );
        if (this.getDownloadedArticles() == null) {
            this.log("no already downloaded articles found");
            this.setDownloadedArticles([]);
        } else {
            this.log("loaded already downloaded articles: " + this.getDownloadedArticles().length);
        }

        if (Util.isPlaybook()) {
            // save image for webworks
            try {
                var dirs = "";
                dirs = blackberry.io.dir.appDirs.app.storage.path;
                var filePath = String(dirs) + "/textInfo.data";
                this.log("filePath: " + filePath);
                if (blackberry.io.file.exists(filePath)) {
                    this.log("file exists... trying to read");
                    blackberry.io.file.readFile(filePath,enyo.bind( this, this.handleOpenedTextInfo), false);
                } else {
                    this.loadTextInfoFromLocalStorage();
                }
            }
            catch (e) {
                // alert("error in loading textInfo file: "+e);
                this.setTextInfo( enyo.json.parse(localStorage.getItem("textInfo")) );
                if (this.getTextInfo() == null) {
                    this.log("no already downloaded text info found");
                    this.setTextInfo([]);
                } else {
                    this.log("loaded already downloaded text info: " + this.getTextInfo().length);
                }
            }     
        } else {

            this.setTextInfo( enyo.json.parse(localStorage.getItem("textInfo")) );
            if (this.getTextInfo() == null) {
                this.log("no already downloaded text info found");
                this.setTextInfo([]);
            } else {
                this.log("loaded already downloaded text info: " + this.getTextInfo().length);
            }
        }

        this.setDownloadedImages( enyo.json.parse(localStorage.getItem("downloadedImages")) );
        if (this.getDownloadedImages() == null) {
            this.log("no already downloaded images found");
            this.setDownloadedImages([]);
        } else {
            this.log("loaded already downloaded images: " + this.getDownloadedImages().length);
        }

        var imagesToDownload = localStorage.getItem("imagesToDownload");
        if (imagesToDownload != null) {
            this.setImagesToDownload( enyo.json.parse(imagesToDownload) );
            if (this.getImagesToDownload() == null) {
                this.log("no images to download found");
                this.setImagesToDownload([]);
            } else {
                this.log("loaded images to download: " + this.getImagesToDownload().length);
            }
        } else {
            this.log("no images to download found");
            this.setImagesToDownload([]);
        }

        // load all items that have been offline marked as read        
        this.setToggledReadState( enyo.json.parse(localStorage.getItem("offlineRead")) );
        if (this.getToggledReadState() == null) {
            this.setToggledReadState([]);
        } else {
            this.log(this.getToggledReadState().length + " are marked read while client was offline");
            // TODO mark as read now when online
            this.log("online: " + Util.getSettings().online);
            if (Util.getSettings().online == true) {
                this.markRead();
            }
        }

        this.log("END");
    },

    loadItems : function( state, tags ) {
        this.log("START");
        localStorage.setItem("itemState", state );
        Util.getSettings( true );
        this.log("Util.getSettings().itemState: " + Util.getSettings().itemState);

        // try to reload from complete list
        this.setFeedItems( this.getFeedItemsByStateAndTag( state, tags ) );
        // if feedItems not loaded, they should be grabbed
        this.log("this.getFeedItems().length:" + this.getFeedItems().length);
        if (this.getFeedItems().length == 0 && Util.getSettings().online == true && Util.getSettings().autoSync == true) { 
            if ((Util.getSettings().itemState == "unread") || (Util.getSettings().itemState == "read" && this.getDownloadOnlyUnreadArticles() == false)) {
                this.warn(" -> no feed items loaded from storage, trying to get from web-service!");
                this.loadItemList( );
            } else {
                this.log(" -> " + this.getFeedItems().length + " feed items ('" + Util.getSettings().itemState + "') loaded from storage!");
                // show content
                if (this.getBackground() == false) {
                    this.owner.$.itemListPane.$.feedList.render();
                    this.owner.$.itemListPane.$.feedList.refresh();        
                    this.owner.$.itemListPane.$.countLabel.setContent(this.getFeedItems().length + $L(" items"));
                    this.owner.$.previewPane.page = 0;;
                    this.owner.$.previewPane.loadArticles();
                }
            }
        }
        else {
            this.log(" -> " + this.getFeedItems().length + " feed items ('" + Util.getSettings().itemState + "') loaded from storage!");
            if (this.getBackground() == false) {
                // show content
                this.owner.$.itemListPane.$.feedList.render();
                this.owner.$.itemListPane.$.feedList.refresh();        
                this.owner.$.itemListPane.$.countLabel.setContent(this.getFeedItems().length + $L(" items"));
                this.owner.$.previewPane.page = 0;;
                this.owner.$.previewPane.loadArticles();
            }
        }
        this.log("END");
    },
    
    downloadArticlesSuccess: function(inSender, inResponse, inRequest) {
        this.log("START");
        // this.log("inRequest.headers: " + JSON.stringify(inRequest.headers) );
        this.log("inRequest.url: " + inRequest.url );
        var id = inRequest.headers.item_id;
        // this.log("id: " + id);
        // this.log("inResponse: " + inResponse );
        
        
        this.log("downloaded item id: " + id);
        
        var obj = Util.getElementFromArrayById( this.getItemsAll(), id );
        if (obj != null) {
            
            this.log("found item: " + obj.item_id);
            
            // if (inResponse != null) {
                // this.log("inResponse.length: " + inResponse.length);
                // if (inResponse.length < 50) {
                    // // check if this is already the second download attemp
                    // var pos = inRequest.url.indexOf("mode=more");
                    // this.log("pos of mode=more: " + pos);
                    // if (pos == -1) {
                        // this.log("redownload article, because content-size was to small...");
                        // // this.deleteFile( ticket );
                        // this.loadArticleNew( obj.item_id, obj.url, true, "more" );
                        // return;
                    // } else {
                        // this.log("downloaded content is just that small, using this one...");
                    // }
                // }
            // } 

            this.log("remove from array of currently downloading items");
            // remove from array of currently downloading items
            if (this.isItemCurrentlyDownloading( obj )) {
                Util.removeElement( this.getCurrentlyLoading(), obj);
            }
            
            this.log("0");
            var value = "";
            if (inResponse != null) {
                this.log("trim...");
                value = inResponse.trim();
            }
            this.log("1");
            // var pos = value.indexOf("'");
            // if (pos != -1) {
                // // this.log("pos: " + pos);
                // // this.log("old:" + value.substring(pos, value.length));
                // // value = String(value).replace(/[^']['][^']/gi, "''");
                // // this.log("new: " + value.substring(pos, value.length));
            // }

            this.log("looking up dirs...");
            var dirs = '';
            if (Util.isBlackBerry()) {
                dirs = blackberry.io.dir.appDirs.app.storage.path;
            }
            var filePath = String(dirs) + "/" + String(obj.item_id) + ".html";
            
            if (Util.isBrowser()) {
                filePath = value;
            }
            
            this.log("filePath: " + filePath);

            // save item
            var item = {
                "item_id" : obj.item_id,
                "file" : filePath
            };
            
            // this.getNewDownloadedArticles().push(item.item_id);
            // alert("this.getNewDownloadedArticles().length: " + this.getNewDownloadedArticles().length);

            // insert new article
            if (!this.isArticleAlreadyDownloaded( item.item_id )) {
                // alert("1");
                // alert("saving article: " + item.item_id);
                this.getDownloadedArticles().push(item);
                localStorage.removeItem("downloadedArticles");
                localStorage.setItem("downloadedArticles", enyo.json.stringify(this.getDownloadedArticles()));
            } else {
                // alert("2");
                // alert("updating article: " + item.item_id);
                Util.removeElement( this.getDownloadedArticles(), item );
                this.getDownloadedArticles().push(item);
                localStorage.removeItem("downloadedArticles");
                localStorage.setItem("downloadedArticles", enyo.json.stringify(this.getDownloadedArticles()));
            }
    
            // save article for webworks
            if (Util.isBlackBerry()) {
                var blob_data = blackberry.utils.stringToBlob(value, "UTF-8");
                try {
                    if (blackberry.io.file.exists(filePath)) {
                        blackberry.io.file.deleteFile(filePath);
                    }
                    blackberry.io.file.saveFile(filePath, blob_data);
                }
                catch (e) {
                    alert("error in saving file:"+e);
                }     
            }
            // alert("blob_data: " + blob_data);
            
            
            // alert("fertig!" );
    
            // refresh list
            // this.$.itemListPane.$.feedList.render();
            if (this.getBackground() == false) {
                this.owner.$.itemListPane.$.feedList.refresh();
                // enyo.nextTick("downloadArticles", enyo.bind(this, "downloadArticles"));
                if (this.owner.$.feedWebViewPane.getUpdateArticleInProgress() == false) {
                    enyo.job("downloadArticles", enyo.bind(this, "downloadArticles"), this.getMillisToWait());
                } else {
                    // notify webviewpane for the case that the user reloaded the article-view
                    this.owner.$.itemListPane.updateItem( item.item_id );
                    this.owner.$.feedWebViewPane.updateArticle( true );
                }
            } else {
                // this.downloadArticles();
                enyo.job("downloadArticles", enyo.bind(this, "downloadArticles"), this.getMillisToWait());
            }
        }

        this.log("END");
    },
        
    doDownloadImages : function( id, refreshOnly ) {
        this.log("START");
        
        this.log("id: " + id);
        this.id = id;
        this.log("refreshOnly: " + refreshOnly);
        this.refreshOnly = refreshOnly;

		this.processImagesToDownload();

        // this.setImagesToDownload([]);
//		this.log("this.getCurrentlyWaitingImages(): " + JSON.stringify(this.getCurrentlyWaitingImages()));
//		this.log("this.getCurrentlyWaitingImages().length: " + this.getCurrentlyWaitingImages().length);
        this.setTotalImagesToDownload( this.getCurrentlyWaitingImages().length );
        this.log(this.getTotalImagesToDownload() + " images have to be downloaded.");
        
        if (this.getTotalImagesToDownload() > 0) {
        	this.log("starting download job.");
            if (this.getBackground() == true) {
                localStorage.setItem("lastActivity", new Date().getTime());
            }
            enyo.nextTick("downloadImages", enyo.bind(this, "downloadImages", id, refreshOnly));
        } else {
            if (this.getBackground() == true) {
                localStorage.setItem("lastActivity", new Date().getTime());
            }
            if (id == undefined || refreshOnly == undefined) {
            	this.log("sync is finished!");
                this.syncFinished();
            } else {
            	this.log("updating item in itemlist...");
                this.owner.$.itemListPane.updateItem( id );
            }
        }
        
        this.log("END");
    },
    
    processImagesToDownload : function() {
        for (key in this.getImagesToDownload()) {
        	if (this.getCurrentlyWaitingImages().length >= 500) {
        		return;
        	}
        	this.log("key: " + key);
            obj = this.getImagesToDownload()[key];
            this.log("obj: " + JSON.stringify(obj));
            this.addImageToDownloadQueue( obj );
        }
    },
    
    addImageToDownloadQueue : function( obj ) {
        if (!this.isImageAlreadyDownloaded( obj ) && !this.isImageCurrentlyWaiting( obj )) {
            // only add image if it's not already in the download list
            if (!Util.isURLinArray(this.getCurrentlyWaitingImages(), obj.url)) {
                this.log(" -> download it");
                this.getCurrentlyWaitingImages().push( obj );
            }
        }
    },
    
    downloadImages : function() {
        this.log("START");

        var id = this.id;
        var refreshOnly = this.refreshOnly;

        this.log("id: " + id);
        this.log("refreshOnly: " + refreshOnly);

        this.log("currently waiting for downloading images: " + this.getCurrentlyWaitingImages().length);
        this.log("currently downloading images: " + this.getCurrentlyLoadingImages().length);
        this.log("max simultaneously images: " + this.getCurrentMaxDownloads());

        this.log("this.getCancelArticleDownload(): " + this.getCancelArticleDownload());
        this.log("this.getCancelImageDownload(): " + this.getCancelImageDownload());

        if (this.getBackground() == true) {
            localStorage.setItem("lastActivity", new Date().getTime());
        }
        
        // if no more items waiting for download -> finished!   
        if ((this.getCurrentlyWaitingImages().length == 0 && this.getCurrentlyLoadingImages().length == 0) || (this.getCurrentlyLoadingImages().length == 0 && (this.getCancelImageDownload() == true) || this.getCancelArticleDownload() == true)) {
            if (this.getBackground() == false) {
                this.owner.$.itemListPane.hideListSpinner();
                this.owner.$.previewPane.hideListSpinner();
                this.owner.$.itemListPane.$.feedList.refresh();
                if (this.getItemsAll().length == 0) {
                    this.log("selecting empty list...");
                    this.owner.$.itemListPane.selectView("emptyList");
                    this.owner.$.previewPane.selectView("emptyList");
                } else {
                    this.owner.$.itemListPane.selectView("feedList");
                    this.owner.$.previewPane.selectView("scroller");
                    this.owner.$.previewPane.loadArticles();
                }

                this.owner.disableItemListPaneControls(false);
                this.owner.$.progressDialog.resetDialog();            
                this.owner.$.progressDialog.close();
            }
            if (this.owner.$.feedWebViewPane.getUpdateArticleInProgress() == true) {
                this.owner.$.itemListPane.updateItem( id );
            }
            localStorage.setItem("syncInProgress", false);
            Util.getSettings( true );
            if (this.background == true && this.funcname !== undefined && this.scope !== undefined) {
                this.log("there is some unfinished business to do... ;-)");
                // a function that binds this to this.foo
                var func = enyo.bind(this.scope, this.funcname);
                // the value of this.foo(3)
                var value = func( true );
            }
            
            this.log("END");
            return;
        }
        
        
        if (this.getCurrentlyLoadingImages().length >= this.getCurrentMaxDownloads()) {
            this.log("waiting another " + this.getMillisToWait() + " ms. returning!")
            enyo.job("downloadImages", enyo.bind(this, "downloadImages", id, refreshOnly), this.getMillisToWait());
            return;
        }

        if (this.getBackground() == false) {
            this.owner.$.itemListPane.showListSpinner();
            this.owner.disableItemListPaneControls(true);
        }
        
        if (this.getCurrentlyLoadingImages().length < this.getCurrentMaxDownloads() && this.getCurrentlyWaitingImages().length == 0) {
            var total = this.getTotalImagesToDownload();
            var sum = this.getCurrentlyWaitingImages().length + this.getCurrentlyLoadingImages().length;
            var actual = total - sum;
            if (actual < 0) {
                actual = 0;
            }
            if (this.getBackground() == false) {
                this.owner.showProgressPopup( "2", $L("Downloading new images"), Math.round(100 / Number(total) * Number(actual)), Number(actual), Number(total), false, "cancelDownloadImages" );
                // this.owner.showProgressPopup( $L("Downloading new images"), Math.round(100 / Number(total) * Number(actual)), Number(actual), Number(total), false, "cancelDownloadImages" );
            }
        }
        
        while (this.getCurrentlyLoadingImages().length < this.getCurrentMaxDownloads() && this.getCurrentlyWaitingImages().length > 0  && this.getCancelImageDownload() == false && this.getCancelArticleDownload() == false) {

            var waitingItem = this.getCurrentlyWaitingImages()[0];
            if (waitingItem === undefined || waitingItem == "undefined") {
                this.error("waitingItem == undefined");
                Util.removeElementByIndex( this.getCurrentlyWaitingImages(), 0);
                enyo.job("downloadImages", enyo.bind(this, "downloadImages", id, refreshOnly), this.getMillisToWait());
                return;
            } else {
//                this.log("waitingItem: " + JSON.stringify(waitingItem));
            }
            Util.removeElement( this.getCurrentlyWaitingImages(), waitingItem);
            this.log("add to currently loading: " + waitingItem.url );
            this.getCurrentlyLoadingImages().push( waitingItem );
            enyo.asyncMethod(this, "loadImage", waitingItem);
            // this.loadImage( waitingItem );
            this.log("currently loading images: " + this.getCurrentlyLoadingImages().length);
            
            var total = this.getTotalImagesToDownload();
            var sum = this.getCurrentlyWaitingImages().length + this.getCurrentlyLoadingImages().length;
            var actual = total - sum;
            if (actual < 0) {
                actual = 0;
            }
            if (this.getBackground() == true) {
                localStorage.setItem("lastActivity", new Date().getTime());
            } else if (this.getBackground() == false) {
                // this.owner.showProgressPopup( "2", $L("Downloading new articles"), 100 / total * actual, actual, total, false, "cancelDownloadArticles" );
                this.owner.showProgressPopup( "2", $L("Downloading new images"), Math.round(100 / Number(total) * Number(actual)), Number(actual), Number(total), false, "cancelDownloadImages" );
            }
        }
        
        enyo.job("downloadImages", enyo.bind(this, "downloadImages", id, refreshOnly), 1000);
        
        this.log("END");
    },
    
    loadImage : function ( ele ) {
        this.log("START");
        // this.log("url: " + url);

        var targetFilename = Util.getFilenameFromURL( ele.url );
        // this.log("targetFilename: " + targetFilename);
        //this removes the anchor at the end, if there is one
        targetFilename = targetFilename.substring(0, (targetFilename.indexOf("#") == -1) ? targetFilename.length : targetFilename.indexOf("#"));
        // this.log("targetFilename: " + targetFilename);
        //this removes the query after the file name, if there is one
        targetFilename = targetFilename.substring(0, (targetFilename.indexOf("?") == -1) ? targetFilename.length : targetFilename.indexOf("?"));
        targetFilename = ele.item_id + "_" + targetFilename;
        this.log("targetFilename: " + targetFilename);
        
        if (Util.isWebOS()) {
            var targetDir = "/media/internal/appdata/" + enyo.fetchAppInfo().id + "/.images/";
            var params = { "target" : ele.url, "targetDir" : targetDir, "keepFilenameOnRedirect" : true, "targetFilename" : targetFilename};
            this.$.downloadImagesService.call(params);
        } else {

            // Check the file size
            var sizeInBytes = 0;
            if (Util.isBlackBerry()) {
                try {
                    sizeInBytes = blackberry.io.fileTransfer.getRemoteFileSize( ele.url );
                } catch (e) {
                    this.error("ERROR: " + e);                
                }
                this.log("filesize: " + sizeInBytes);
            }

            if (Util.isBlackBerry() && (sizeInBytes > 250000 || sizeInBytes == 0)) {
                // file is to big, ignoring it
                // remove from array of actualy downloading items
                var obj = ele.url;
                this.log("removing url from download list, because of the filesize: " + obj + " (" + sizeInBytes + " bytes)");
                
                // remove from array of currently downloading items
                this.getImagesToDownload().splice( 0, 1);
                this.getCurrentlyLoadingImages().splice( 0, 1);
                
                enyo.job("downloadImages", enyo.bind(this, "downloadImages"), this.getMillisToWait());
            } else {
                var request = new XMLHttpRequest();
                // request.onreadystatechange = enyo.bind( this, this.downloadImageSuccess ) ; 
                
                var scope = this;
                
                
                try {
                    // request.open("GET", "http://whudat.de/images/STREETBALL_WHUDAT-1.jpg", true);
                    request.open("GET", ele.url, true);
                    request.setRequestHeader( "name", targetFilename );
                    request.setRequestHeader( "url", ele.url );
                    // request.setRequestHeader("Content-Type", "application/binary");
                    request.responseType = "arraybuffer";
                    var startReady0 = new Date();
                    request.onreadystatechange = enyo.bind( this, this.processBinaryDataOnPlaybook, request, targetFilename, ele.url, sizeInBytes );
                    request.send( "name=" + targetFilename + "&url=" + ele.url);
                } catch (e) {
                    console.error("**********************************************************");
                    console.error(e);
                    console.error("**********************************************************");
                    alert(e);
                }
            }
        }
        enyo.job("downloadImages", enyo.bind(this, "downloadImages"), this.getMillisToWait());
        this.log("END");
    },
    
    processBinaryDataOnPlaybook: function( request, targetFilename, url, sizeInBytes ) {
        // this.log();
        if(request.readyState == 4) {
            if(request.status == 200 || request.status == 304){
                try {
                    var startReady1 = new Date();
                    // this.log("duration: " + Util.ms_between(startReady0, startReady1));
                    
                    this.log("targetFilename: " + targetFilename);
                    this.log("url: " + url);
                        
                    var filename = blackberry.io.dir.appDirs.app.storage.path + "/" + targetFilename;
                    
                    if (Util.isPlaybook()) {
                        var response = request.response;
                        
                        // var startReady2 = new Date();
                        // console.log("duration: " + Util.ms_between(startReady1, startReady2));
                    
                        // try {
                            this.log("encoding data");
                            var encoded = Util.base64ArrayBuffer(response);
                            // var startReady3 = new Date();
                            // this.log("duration: " + Util.ms_between(startReady2, startReady3));
                        
                            // console.log("encoded: " + encoded);
                            this.log("creating blob data");
                            var blob_data =  blackberry.utils.stringToBlob(encoded, "binary");
                            // var startReady4 = new Date();
                            // this.log("duration: " + Util.ms_between(startReady3, startReady4));
                        
                            this.log("check file exist: " + filename);
                            // var filename = blackberry.io.dir.appDirs.app.storage.path + "/STREETBALL_WHUDAT-1.jpg";
                            if (blackberry.io.file.exists(filename)) {
                                console.log("delete existing file");
                                blackberry.io.file.deleteFile(filename);
                            }
                            // var startReady5 = new Date();
                            // this.log("duration: " + Util.ms_between(startReady4, startReady5));
                        
                            this.log("saving file");
                            blackberry.io.file.saveFile(filename, blob_data);
                            var startReady6 = new Date();
                            // this.log("duration: " + Util.ms_between(startReady5, startReady6));
                        
                            // console.log("overall duration: " + Util.ms_between(startReady0, startReady6));
                            this.log("overall response processing: " + Util.ms_between(startReady1, startReady6));
                        // } catch (e) {
                            // console.error("**********************************************************");
                            // console.error("file could not be saved because of: " + e);
                            // console.error("**********************************************************");
                        // }
                    
                        request = null;
                        response = null;
                        encoded = null;
                        blob_data = null;
                    
                        this.log("finished file handling");
                    }
    
                    if (Util.isElementInArray( this.getCurrentlyLoadingImages(), url, "url") == false || Util.isElementInArray( this.getImagesToDownload(), url, "url") == false) {
                        this.error("deleting downloaded image, because an error occured: " + targetFilename);
                        if (blackberry.io.file.exists(filename)) {
                            console.log("delete existing file");
                            blackberry.io.file.deleteFile(filename);
                        }
                        // remove from the arrays
                        this.getImagesToDownload().splice( 0, 1);
                        this.getCurrentlyLoadingImages().splice( 0, 1);
                    } else {
                        // save item
                        var item = {
                            "targetFilename" : targetFilename,
                            "ticket" : 0,
                            "file" : filename,
                        };
                        // this.log("saving image: " + item.targetFilename );
                        this.getDownloadedImages().push(item);
                        localStorage.removeItem("downloadedImages");
                        localStorage.setItem("downloadedImages", enyo.json.stringify(this.getDownloadedImages()));
                        this.log("downloaded image: " + this.getDownloadedImages().length + " ("+ targetFilename + ")");
                        this.getImagesToDownload().splice( 0, 1);
                        this.getCurrentlyLoadingImages().splice( 0, 1);
                    }
                    this.log("finished image!");                          
                    
                    enyo.job("downloadImages", enyo.bind(this, "downloadImages"), this.getMillisToWait());
                } catch (e) {
                    this.error("**********************************************************");
                    this.error("saving of image failed: " + targetFilename + " because of: ");
                    this.error(e);
                    this.error("**********************************************************");

                    // remove from array of currently downloading items
                    this.getImagesToDownload().splice( 0, 1);
                    this.getCurrentlyLoadingImages().splice( 0, 1);
    
                    enyo.job("downloadImages", enyo.bind(this, "downloadImages"), this.getMillisToWait());
                }
    
    
            } else {
                // something went wrong :-(
                // remove from array of currently downloading items
                var obj = url;
                // this.error("obj: " + obj);
                var targetFilename = Util.getFilenameFromURL( obj );
                this.error("download of image failed: " + targetFilename + "");
                this.error("status: " + request.status);
        
                this.getImagesToDownload().splice( 0, 1);
                this.getCurrentlyLoadingImages().splice( 0, 1);

                enyo.job("downloadImages", enyo.bind(this, "downloadImages"), this.getMillisToWait());
             }           
        }
    },
    
    grabImageSuccess: function(inSender, inResponse) {
        // this.log("START");
        // this.log(JSON.stringify(inResponse));
        var ticket = inResponse.ticket;
        // this.log("ticket: " + ticket);

        var completionStatusCode = inResponse.completionStatusCode;
        // this.log("completionStatusCode: " + completionStatusCode);

        var completed = inResponse.completed;
        // this.log("completed: " + completed);
        
        var obj = inResponse.url;
        if (completed == true && completionStatusCode == 200) {
            var targetFilename = Util.getFilenameFromURL( inResponse.target );
            if (inResponse.headers !== undefined && inResponse.headers.targetFilename !== undefined) {
            	targetFilename = inResponse.headers.targetFilename;
            	this.log("got new targetFilename from headers: " + targetFilename);
            }

            var ticket = inResponse.ticket;
            // this.log("ticket: " + ticket);
            
            this.log("inResponse.url: " + inResponse.url);
            this.log("this.getCurrentlyLoadingImages().length: " + this.getCurrentlyLoadingImages().length);
//            this.log("this.getCurrentlyLoadingImages(): " + JSON.stringify(this.getCurrentlyLoadingImages()));
            this.log("this.getImagesToDownload(): " + this.getImagesToDownload().length);
            
//            this.log("Util.isElementInArray( this.getCurrentlyLoadingImages(), inResponse.url, \"url\"): " + Util.isElementInArray( this.getCurrentlyLoadingImages(), inResponse.url, "url"));
//            this.log("Util.isElementInArray( this.getImagesToDownload(), inResponse.url, \"url\"): " + Util.isElementInArray( this.getImagesToDownload(), inResponse.url, "url"));
            
            if (Util.isElementInArray( this.getCurrentlyLoadingImages(), inResponse.url, "url") == false || Util.isElementInArray( this.getImagesToDownload(), inResponse.url, "url") == false) {
                this.error("deleting downloaded image, because an error occured: " + targetFilename);
                this.deleteFile( ticket );
                // remove from the arrays
                this.getImagesToDownload().splice( 0, 1);
                this.getCurrentlyLoadingImages().splice( 0, 1);
            } else {
                // save item
                var item = {
                    "targetFilename" : targetFilename,
                    "ticket" : ticket,
                    "file" : inResponse.target,
                };
                // this.log("saving image: " + item.targetFilename );
                this.getDownloadedImages().push(item);
                localStorage.removeItem("downloadedImages");
                localStorage.setItem("downloadedImages", enyo.json.stringify(this.getDownloadedImages()));
                this.log("downloaded image: " + this.getDownloadedImages().length + " ("+ targetFilename + ")");
                this.getImagesToDownload().splice( 0, 1);
                this.getCurrentlyLoadingImages().splice( 0, 1);
            }
            
            enyo.job("downloadImages", enyo.bind(this, "downloadImages"), this.getMillisToWait());
            
        } else {
            var interrupted = inResponse.interrupted;
            this.error("interrupted: " + interrupted);

            if (interrupted == true || completionStatusCode !== undefined) {
                var obj = inResponse.target;
                // this.log("obj: " + obj);
                var targetFilename = Util.getFilenameFromURL( obj );
                this.error("download of image failed: " + targetFilename + "");

                this.getImagesToDownload().splice( 0, 1);
                this.getCurrentlyLoadingImages().splice( 0, 1);

                enyo.job("downloadImages", enyo.bind(this, "downloadImages"), this.getMillisToWait());
            } else {
                if (completed !== undefined) {
                    this.error("completed: " + completed);
                    this.error(JSON.stringify(inResponse));
                }
            }
        }
        
        // this.log("END");
    },

    grabImageFailure : function(inSender, inResponse, inRequest) {
        this.error("START");

        // this.error("Unexpected Error!");
        // this.imagesFailed++;
//         
        // this.error(this.getImagesFailed());
        var str = JSON.stringify(inResponse);
        this.error(str);
        // this.owner.showFailurePopup( str, "Unexpected Error!" ); 

        this.error("END");
    },    
     
    cancelDownloadImages : function ( ) {
        this.cancelImageDownload = true;
        this.cancelDownload();
    },
    
    cancelDownload: function() {
        this.log("START");
        this.setTotalItemsToDownload([]);
        this.setCurrentlyWaiting([]);
        // this.setCurrentlyLoading([]);
        this.setTotalImagesToDownload(0);
        this.setCurrentlyWaitingImages([]);
        // this.setCurrentlyLoadingImages([]);
        enyo.job.stop("doDownloadImages");
        enyo.job.stop("downloadImages");
        enyo.job.stop("downloadArticles");
        this.owner.$.itemListPane.hideListSpinner();
        this.owner.$.previewPane.hideListSpinner();
        this.owner.disableItemListPaneControls(false);
        this.owner.$.progressDialog.resetDialog();            
        this.owner.$.progressDialog.close();
        localStorage.setItem("syncInProgress", false);
        localStorage.removeItem("imagesToDownload");
        localStorage.setItem("imagesToDownload", JSON.stringify(this.getImagesToDownload()) );
        Util.getSettings( true );
        this.log("END");
    },

    deleteDownloadedImages : function() {
        // delete downloaded articles
        this.log("count: " + this.getDownloadedImages().length);
        for (key in this.getDownloadedImages()) {
            var obj = this.getDownloadedImages()[key];
//            this.log("obj: " + JSON.stringify(obj));
            this.deleteFile( obj );
        }
        this.setDownloadedImages([]);
        localStorage.removeItem("downloadedImages");
        localStorage.setItem("downloadedImages", enyo.json.stringify(this.getDownloadedImages()));
    },

    isImageAlreadyDownloaded : function( ele ) {
        // this.log("START");
        // this.log("looking for id: " + id);
        // this.log("this.getDownloadedArticles().length: " + this.getDownloadedArticles().length);
        for (var key in this.getDownloadedImages()) {
            // this.log("key: " + key);
            var obj = this.getDownloadedImages()[key];
            // this.log("obj.item_id: " + obj.item_id);
            if (obj == ele.url) {
                // this.log("id: " + id + " has already been downloaded!");
                // this.log("END");
                return true;
            }
        }
        // this.log("id: " + id + " has NOT been downloaded!");
        // this.log("END");
        return false;
    },
    
    isImageCurrentlyWaiting : function( ele ) {
        // this.log("START");
        // this.log("index: " + index);
        for (var key in this.getCurrentlyWaitingImages()) {
            var obj = this.getCurrentlyWaitingImages()[key];
            // this.log("obj: " + obj);
            if (obj.url == ele.url) {
                // this.log("true: " + obj.item_id);
                // this.log("END");
                return true;
            }
        }
        // this.log("item " + index + " is currently not downloading!");
        // this.log("END");
        return false;
    },

    isImageCurrentlyDownloading : function( ele ) {
        // this.log("START");
        // this.log("url: " + url);
        for (var key in this.getCurrentlyLoadingImages()) {
            var obj = this.getCurrentlyLoadingImages()[key];
            if (obj.url == ele.url) {
                // this.log("true: " + obj.item_id);
                // this.log("END");
                return true;
            }
        }
        // this.log("item " + item.item_id + " is currently not downloading!");
        // this.log("END");
        return false;
    },
    
    storeItemsAll : function() {
        // save itemlist
        var contentSize = Number(JSON.stringify(this.getItemsAll()).length);
        this.log("saving notebook items: " + Math.round(contentSize/1024) + " kb");
        // every character using 2bytes, because of UTF-8! So only half of 5 mb is available for storage
        if (Util.isDebug()) {
            this.log("saving notebook items: " + Math.round(contentSize/1024) + " kb");
        }
        // every character using 2bytes, because of UTF-8! So only half of 5 mb is available for storage
        if (Util.isBrowser()) {
            if (Util.isDebug()) {
                this.log("storing items to browser local storage: " + this.getItemsAll().length);
            }
         // Request storage usage and capacity left
            window.webkitStorageInfo.queryUsageAndQuota(webkitStorageInfo.PERSISTENT, //the type can be either TEMPORARY or PERSISTENT
            function(used, remaining) {
              console.log("Used quota: " + used + ", remaining quota: " + remaining);
            }, function(e) {
              console.log('Error', e); 
            } );
            
            
            if (Util.isDebug()) {
                this.log("contentSize (bytes): " + Number(contentSize));
                this.log("additional space (1024*512) (bytes): " + Number(1024*512));
                this.log("requesting total bytes: " + Number(Number(contentSize) + Number(1024*512)));
            }
            var stoItems = this.getItemsAll();
         // Request Quota (only for File System API)  
            window.webkitStorageInfo.requestQuota(webkitStorageInfo.PERSISTENT, Number(Number(contentSize) + Number(1024*1024)), function(grantedBytes) {
              window.webkitRequestFileSystem(webkitStorageInfo.PERSISTENT, grantedBytes, function() {
            	  try {
                      localStorage.removeItem("itemList");
                      localStorage.setItem("itemList", JSON.stringify(stoItems));
            	  } catch(e) {
                      alert('Error: '+  e); 
            	  }
                  stoItems = null;
              }, function(e) {
                  alert('Error: '+  e); 
              }); 
            }, function(e) {
              alert('Error: '+  e); 
            });
        } else if (!Util.isPlaybook() && contentSize <= 2500000) {
            this.log("storing items to local storage: " + this.getItemsAll().length);
            localStorage.removeItem("itemList");
            localStorage.setItem("itemList", JSON.stringify(this.getItemsAll()));
        } else if (!Util.isPlaybook() && contentSize > 2500000) {
            this.log("show failure message");
            this.$.failureDialog.openAtCenter();
            this.$.failureDialog.$.failureSize.setContent($L("Your ") + this.getItemsAll().length + $L(" articles could not be stored. Try fewer articles (via preferences) and try again."));
        } else if (Util.isPlaybook()) {
            this.storeItemsAllToFileSystem();
        } else {
            this.error("WTF?!?!!?");
        }
    },
    
    storeItemsAllToFileSystem : function() {
        this.log("START");
        // first remove it from local storage
        localStorage.removeItem("itemList");
        
        var dirs = "";
        if (Util.isBlackBerry()) {
            dirs = blackberry.io.dir.appDirs.app.storage.path;
        } else if (Util.isWebOS()) {
            dirs = "/media/internal/appdata/" + enyo.fetchAppInfo().id;
        }
        var filePath = String(dirs) + "/itemList.data";
        
        if (Util.isPlaybook()) {
            // save image for webworks
            try {
                var blob_data =  blackberry.utils.stringToBlob(JSON.stringify(this.getItemsAll())/*, "UTF-8"*/);
                // this.log("stored blob_data in UTF-8: " + blob_data);
                // this.log("stored blob_data with default endocing: " + blob_data);
                if (blackberry.io.file.exists(filePath)) {
                    blackberry.io.file.deleteFile(filePath);
                }
                blackberry.io.file.saveFile(filePath, blob_data);
            }
            catch (e) {
                alert("error in saving file:"+e);
            }     
        } else if (Util.isWebOS()) {
            this.log("filePath: " + filePath);
            // Util.saveFile( filePath, JSON.stringify(this.getItemsAll()) );
            // this.$.fileService.writeFile(filePath, enyo.json.stringify(this.getItemsAll()), enyo.bind(this, this.callbackBackup, $L("itemsAll")));
        }
        this.log("END");
    },
    
    loadItemsAllFromLocalStorage : function() {
        this.log();
        this.setItemsAll( enyo.json.parse(localStorage.getItem("itemList")) );
        if (this.getItemsAll() == null) {
            this.log("no items found");
            this.setItemsAll([]);
        } else {
            this.log("items loaded from local storage: " + this.getItemsAll().length);
            this.storeItemsAllToFileSystem();
        }
    },

    handleOpenedItemsAll : function (fullPath, blobData) {
        this.log("fullPath: " + fullPath);
        this.log("blobData.length: " + blobData.length);
        this.log("blobData: " + JSON.stringify(blobData));
        // alert("file opened was: " + fullPath + " which contained " + blobData.length + " bytes");
        if (blobData != null && blobData.length > 0) {
            try {
                // var data = blackberry.utils.blobToString(blobData);
                // this.log("data from blackberry default encoding: " + data);
                // this.log("data.length: " + data.length);

                var stringData = blackberry.utils.blobToString(blobData, "UTF-8");
                // this.log("stringData from blackberry in UTF-8: " + stringData);
                // this.log("stringData.length: " + stringData.length);
                var parsed = enyo.json.parse(stringData);
                // this.log("parsed: " + parsed);
                this.setItemsAll( parsed );
                // alert("items loaded from file system: " + this.getItemsAll().length);
            } catch (e) {
                this.error(e);
            }
        }
    },

    storeTextInfo : function() {
        // save itemlist
        var contentSize = Number(JSON.stringify(this.getTextInfo()).length) + Number(JSON.stringify(this.getItemsAll()).length);
        this.log("saving textinfo items (incl. items all): " + Math.round(contentSize/1024) + " kb");
        // every character using 2bytes, because of UTF-8! So only half of 5 mb is available for storage
        if (!Util.isPlaybook() && contentSize <= 2500000) {
            this.log("storing textinfo to local storage: " + this.getTextInfo().length);
            localStorage.removeItem("textInfo");
            localStorage.setItem("textInfo", JSON.stringify(this.getTextInfo()));
        } else if (!Util.isPlaybook() && contentSize > 2500000) {
            this.log("show failure message");
            this.$.failureDialog.openAtCenter();
            this.$.failureDialog.$.failureSize.setContent($L("Your ") + this.getTextInfo().length + $L(" text infos could not be stored. Try fewer articles (via preferences) and try again."));
        } else if (Util.isPlaybook()) {
            this.storeTextInfoToFileSystem();
        } else {
            this.error("WTF?!?!!?");
        }
    },
    
    storeTextInfoToFileSystem : function() {
        this.log("START");
        // first remove it from local storage
        localStorage.removeItem("textInfo");
        
        var dirs = "";
        if (Util.isBlackBerry()) {
            dirs = blackberry.io.dir.appDirs.app.storage.path;
        } else if (Util.isWebOS()) {
            dirs = "/media/internal/appdata/" + enyo.fetchAppInfo().id;
        }
        var filePath = String(dirs) + "/textInfo.data";
        
        if (Util.isPlaybook()) {
            // save image for webworks
            try {
                var blob_data =  blackberry.utils.stringToBlob(JSON.stringify(this.getTextInfo())/*, "UTF-8"*/);
                // this.log("stored blob_data in UTF-8: " + blob_data);
                // this.log("stored blob_data with default endocing: " + blob_data);
                if (blackberry.io.file.exists(filePath)) {
                    blackberry.io.file.deleteFile(filePath);
                }
                blackberry.io.file.saveFile(filePath, blob_data);
            }
            catch (e) {
                alert("error in saving file:"+e);
            }     
        } else if (Util.isWebOS()) {
            this.log("filePath: " + filePath);
            // Util.saveFile( filePath, JSON.stringify(this.getItemsAll()) );
            // this.$.fileService.writeFile(filePath, enyo.json.stringify(this.getItemsAll()), enyo.bind(this, this.callbackBackup, $L("itemsAll")));
        }
        this.log("END");
    },
    
    loadTextInfoFromLocalStorage : function() {
        this.log();
        this.setTextInfo( enyo.json.parse(localStorage.getItem("textInfo")) );
        if (this.getTextInfo() == null) {
            this.log("no text info found");
            this.setTextInfo([]);
        } else {
            this.log("text infos loaded from local storage: " + this.getTextInfo().length);
            this.storeTextInfoToFileSystem();
        }
    },

    handleOpenedTextInfo : function (fullPath, blobData) {
        this.log("fullPath: " + fullPath);
        this.log("blobData.length: " + blobData.length);
        this.log("blobData: " + JSON.stringify(blobData));
        // alert("file opened was: " + fullPath + " which contained " + blobData.length + " bytes");
        if (blobData != null && blobData.length > 0) {
            try {
                // var data = blackberry.utils.blobToString(blobData);
                // this.log("data from blackberry default encoding: " + data);
                // this.log("data.length: " + data.length);

                var stringData = blackberry.utils.blobToString(blobData, "UTF-8");
                // this.log("stringData from blackberry in UTF-8: " + stringData);
                // this.log("stringData.length: " + stringData.length);
                var parsed = enyo.json.parse(stringData);
                // this.log("parsed: " + parsed);
                this.setTextInfo( parsed );
                this.log("text infos loaded from file system: " + this.getTextInfo().length);
            } catch (e) {
                this.error(e);
            }
        }
    },

    syncFinished : function() {
        this.log();
        localStorage.setItem("syncInProgress", false);
        Util.getSettings( true );
        if (this.getBackground() == false) {
            this.owner.$.itemListPane.hideListSpinner();
            this.owner.$.previewPane.hideListSpinner();
            this.owner.showProgressPopup( "1", $L("Syncing article list"), 100, "unknown", "unknown", true );
            this.owner.$.progressDialog.close();
        } else if (this.background == true && this.funcname !== undefined && this.scope !== undefined) {
            this.log("there is some unfinished business to do... ;-)");
            // a function that binds this to this.foo
            var func = enyo.bind(this.scope, this.funcname);
            // the value of this.foo(3)
            func();
        }
    },

});

