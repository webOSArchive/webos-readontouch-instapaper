enyo.kind({
    name: "Launcher",
    kind: "Component",
 
    components: [   
        // Application events handlers
        {kind: "ApplicationEvents", onUnload: "cleanup", onApplicationRelaunch: "relaunch"},
        {name: "addItemFeed", kind: "WebService", contentType: "application/json; charset=utf-8", onSuccess: "addItemFeedSuccess", onFailure: "addItemFeedFailed"},
        {name: "setAlarm", kind: "PalmService", service: "palm://com.palm.power/timeout/", method: "set", onResponse: "alarmServiceResponseHandler"},
        {name: "clearAlarm", kind: "PalmService", service: "palm://com.palm.power/timeout/", method: "clear", onResponse: "alarmServiceResponseHandler"},
     ],
 
     // declare 'published' properties
    published: {
        syncLayer: { title: "Syncing article list...", icon : "images/ReadOnTouch-48-r2.png" },
        app: null,
    },
    
    create: function (inSender, inEvent) {
        this.inherited(arguments);
    },
 
    startup: function () {
        var params = enyo.windowParams;
        // this.log(params);
 
        this.relaunch(params);
    },
 
    relaunch: function ( bla ) {
        // this.log("START");
        var params = enyo.windowParams;
        // this.log(params);
        
        // check to see if main app window is already open
        this.appWindow = enyo.windows.fetchWindow("main");
        // this.log("this.appWindow: "+ this.appWindow);
        // this.log("params.action: "+ params.action);
        // enyo.windows.addBannerMessage("Test 123456 :-))","{}","/images/ReadOnTouch-48-r2.png");
 
        // check to see if a special param has been sent to the app
        // in this case, we may have defined a params.action property in
        // JustType to tell the app to do something. Let's assume that our
        // params are either:  {action: "addData", data: "Some data"} or
        //                     {action: "doSomething"}
        if (params.action) {
            switch (params.action) {
                case "addLink":
                    if (this.appWindow != null && this.appWindow !== undefined) {
                        // this.log("reactivating existing window...");
                        enyo.windows.activateWindow(this.appWindow, params);   
                    } else {
                        // open the main window and pass the params along
                        this.addLink( params.url, params.title );
                    }
                    break;
                case "doSync":
                    if (this.appWindow == null || this.appWindow == undefined) {
                        this.app = new DataManager();
                        this.app.doSync( true, this, "removeDashboard", "addSyncLayer", "restartBgSyncAlarm");
                    } else {
                        this.log("no bg sync available, because the app is active!");
                        // enyo.windows.addBannerMessage("No background sync available.. ","{}","images/ReadOnTouch-24.png");
                        // enyo.windows.addBannerMessage("... because the app is active!","{}","images/ReadOnTouch-24.png");
                        this.restartBgSyncAlarmQuick();
                    }
                    break;
            }
        }
        else {
            if (Util.getSettings().syncInProgress == true && Util.syncIsStillActive() == true) {
                enyo.windows.addBannerMessage("App is currently not available... ","{}","images/ReadOnTouch-24.png");
                enyo.windows.addBannerMessage("... because of background sync!","{}","images/ReadOnTouch-24.png");
            } else {
                this.opencard("normal.html", "main", params);
            }
        }
        // this.log("END");
        return true;
    },
 
    // cleanup was defined above as the onUnload handler for application events
    // we'll use it to save any changes to our appPrefs
    cleanup: function () {
        // this.log("Cleanup in appLaunch");
        // this.savePrefs();
        this.restartBgSyncAlarm();
    },
    
    opencard : function( path, name, params) {
        // this.log();
        basePath = enyo.fetchAppRootPath() + "/";
        path = basePath + path;
        enyo.windows.activate(path, name, params);    
    },
    
    restartBgSyncAlarm : function() {
        this.log();
        localStorage.setItem("syncInProgress", false);
        Util.getSettings( true );
        var appId = enyo.fetchAppInfo().id;
        var time = Util.getAlarmTimeFromSettings();
        // this.log("time: " + time);
        if (time == null) {
            // this.log("clearing alaram! ");
            this.$.clearAlarm.call({
                "key" : appId + ".sync" 
            });
        } else {
            // this.log("set next bgsync in: " + time);
            this.$.setAlarm.call({
                "wakeup" : true, 
                "key" : appId + ".sync", 
                "uri":"palm://com.palm.applicationManager/launch",
                "params" : {"id" : appId, "params": {"action" : "doSync"}},
                "in": time
            });
        }
     },
    
    restartBgSyncAlarmQuick : function() {
        this.log('restarting bg sync in 2 minutes');
        localStorage.setItem("syncInProgress", false);
        Util.getSettings( true );
        var appId = enyo.fetchAppInfo().id;
        var time = "00:02:00";
        // this.log("time: " + time);
        // this.log("set next bgsync in: " + time);
        this.$.setAlarm.call({
            "wakeup" : true, 
            "key" : appId + ".sync", 
            "uri":"palm://com.palm.applicationManager/launch",
            "params" : {"id" : appId, "params": {"action" : "doSync"}},
            "in": time
        });
     },
    
    removeDashboard: function( newData) {
        // enyo.windows.addBannerMessage("Finished syncing article list!","{}","images/ReadOnTouch-24.png");
        // this.$.dashboard.setLayers([]);
        
        this.restartBgSyncAlarm();        
        /*if (true == newData) {
            // check if app is active and update it
            // this.error("we have new articles, so check if app is active");
            this.appWindow = enyo.windows.fetchWindow("main");
            if (this.appWindow != null && this.appWindow !== undefined) {
                // this.log("reactivating existing window...");
                enyo.windows.addBannerMessage("Refreshing client data...","{}","images/ReadOnTouch-24.png");
                enyo.windows.activateWindow(this.appWindow, {"action": "updateUi"});   
            }
        }*/
    }, 

    addLayer : function( title, url ) {
        var layer = { title: title, text: url, icon : "images/ReadOnTouch-48-r2.png" }; 
        if (this.$.dashboard === undefined) {
            var kindItem = {name : "dashboard", kind : "Dashboard", icon : "images/ReadOnTouch-48-r2.png", smallIcon : "images/ReadOnTouch-24.png", onTap : "dashboardTapHandler", onDashboardActivated: "dashboardActivated", onUserClose: "userClose", onLayerSwipe: "userClose"};
            this.createComponent( kindItem, {owner: this});
        }
        this.$.dashboard.setLayers([layer]);
    }, 

    addSyncLayer : function( ) {
        /*if (this.$.dashboard === undefined) {
            var kindItem = {name : "dashboard", kind : "Dashboard", icon : "images/ReadOnTouch-48-r2.png", smallIcon : "images/ReadOnTouch-24.png", onTap : "dashboardTapHandler", onDashboardActivated: "dashboardActivated", onUserClose: "userClose", onLayerSwipe: "userClose"};
            this.createComponent( kindItem, {owner: this});
            // enyo.windows.addBannerMessage("Started syncing article list...","{}","images/ReadOnTouch-24.png");
        }
        this.$.dashboard.setLayers([this.syncLayer]);
        */
    }, 

    dashboardTapHandler: function() {
        // this.log();
        if (this.app != null && Util.getSettings().syncInProgress == false) {
            this.removeDashboard();
            this.opencard("normal.html", "main", {});
        } else if (this.app == null && Util.getSettings().syncInProgress == false) {
            this.$.dashboard.setLayers([]);
            this.opencard("normal.html", "main", {});
        } else {
            enyo.windows.addBannerMessage("Wait for sync to be finished!","{}","images/ReadOnTouch-24.png");
        }
    }, 
    
    userClose : function( ) {
        // this.log();
        localStorage.setItem("syncInProgress", false);
    },

    addLink : function( saveUrl, title ) {
        this.log("START");
        this.log("url: " + saveUrl);
        this.log("title: " + title);
        
        var url = "https://getpocket.com/v3/add";
        url = url + "?url=" + encodeURIComponent(saveUrl);
        if (title) {
            url = url + "&title=" + encodeURIComponent(title);
        }
        url = url + "&access_token=" + Util.getSettings().password;
        url = url + "&consumer_key=" + Util.getApiKey();

        /* Switch to v3 API - 2023-09-15
        var username = localStorage.getItem("username");
        var password = localStorage.getItem("password");
        var url = "https://readitlaterlist.com/v2/add?username=" + username + "&password=" + password + "&apikey=" + Util.getApiKey() +"&url=" + encodeURIComponent(url);
        if (title) {
            url += "&title=" + title;  
        } 
        */
        this.log("Posting to URL: " + url);
        
        this.$.addItemFeed.setUrl(url);
        this.$.addItemFeed.call();
        
        this.log("END");
    },

    addItemFeedSuccess: function(inSender, inResponse, inRequest) {
        var message = "Added Link successfully!";
        if (this.appWindow === undefined) {
            this.showInfo( message );
        }
    },
        
    addItemFeedFailed: function(inSender, inResponse, inRequest) {
        var message = "Link could not be added!";
        if (this.appWindow === undefined) {
            this.showInfo( message );
        }
    },
    
    showInfo : function( message ) {
        enyo.windows.addBannerMessage( message,"{}","images/ReadOnTouch-24.png" );
        // this.addLayer( message );
        this.opencard( "background.html", "background" );
        enyo.windows.fetchWindow( "background" ).close();
    },

    alarmServiceResponseHandler : function() {
        
    },
        
    dashboardActivated: function( dash ) {
        // this.error(dash);
        for(l in dash)
        {
            // this.error("for...");
            var c = dash[l].dashboardContent;
            if(c)
            {
                // this.error("change bg...");
                c.$.topSwipeable.applyStyle("background-color", "black");
            }
        }
    },
});

