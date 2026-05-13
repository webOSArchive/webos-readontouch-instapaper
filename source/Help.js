enyo.kind({
    name : "ReadOnTouch.Help",
    kind: enyo.ModalDialog,
    layoutKind:"VFlexLayout",
    width: (Util.isTablet() ? "470px" : "320px"), 
    height: (Util.isTablet() ? "480px" : "480px"),
    events: {
        onAccept: ""
    },
    components: [
        {kind: "ApplicationEvents", onWindowHidden: "close"},
        {name: "launchAppCall", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "launch"},
        {name: "openEmailCall", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
        {kind: enyo.Scroller, flex: 1, height: (Util.isTablet() ? "390px" : "390px"), autoHorizontal: false, horizontal: false, components: [
            {layoutKind: "VFlexLayout", components:[
                {kind : "RowGroup", caption : $L("Feedback & Support"), components : [
                    {kind : "Button", caption : $L("E-Mail the Developer"), onclick : "sendMail"},
                    (Util.isWebOS() == true ? {kind : "Button", caption : $L("Support Thread @ webOS Nation Forum"), onclick : "openLink"} : {kind : "Button", caption : "Support Thread @ CrackBerry Forum", onclick : "openLink"}),
                ]}, 
                {kind : "RowGroup", caption : $L("Article List Icons"), components : [
                    {kind : "HFlexBox", flex : 1, packed : "center", align : "center", components : [
                        {kind : "Image", src : "images/help-new.png", style: "margin-right: 10px;"}, 
                        {content : $L("Add a new article.")}
                    ]}, 
                    {kind : "HFlexBox", flex : 1, packed : "center", align : "center", components : [
                        {kind : "Image", height: "32px", src : "images/help-sync.png", style: "margin-right: 10px;"}, 
                        {content : $L("Refresh the article list.")}
                    ]},
                ]},
                {kind : "RowGroup", caption : $L("Article / Web View Icons"), components : [
                    {kind : "HFlexBox", flex : 1, packed : "center", align : "center", components : [
                        {kind : "Image", height: "32px", src : "images/help-sync.png", style: "margin-right: 10px;"}, 
                        {content : $L("Refresh article content.")}
                    ]},
                    {kind : "HFlexBox", flex : 1, packed : "center", align : "center", components : [
                        {kind : "Image", height: "32px", src : "images/help-font.png", style: "margin-right: 10px;"}, 
                        {content : $L("Configure viewing settings (font, font-size,...).")}
                    ]},
                    {kind : "HFlexBox", flex : 1, packed : "center", align : "center", components : [
                        {kind : "Image", height: "32px", src : "images/help-share.png", style: "margin-right: 10px;"}, 
                        {content : $L("Share article content.")}
                    ]},
                    {kind : "HFlexBox", flex : 1, packed : "center", align : "center", components : [
                        {kind : "Image", height: "32px", src : "images/help-web.png", style: "margin-right: 10px;"}, 
                        {content : $L("Open article in external browser.")}
                    ]},
                    {kind : "HFlexBox", flex : 1, packed : "center", align : "center", components : [
                        {kind : "Image", height: "32px", src : "images/help-read.png", style: "margin-right: 10px;"}, 
                        {content :$L("Mark article read.")}
                    ]},
                    {kind : "HFlexBox", flex : 1, packed : "center", align : "center", components : [
                        {kind : "Image", height: "32px", src : "images/help-add.png", style: "margin-right: 10px;"}, 
                        {content : $L("Mark article unread.")}
                    ]},
                ]},
            ]}
        ]},
        {name: "buttonOrientation", layoutKind: "HFlexLayout", components: [
            {name: "acceptButton", kind: "Button", flex:1, caption: $L("Close Help"), onclick: "acceptButtonClick"}
        ]},
        
    ],
    
    sendMail : function() {
        this.log("START");
        var appinfo = enyo.fetchAppInfo();
        var title = appinfo.title + ", Version: " + appinfo.version + " (" + Util.deviceName + ")"; 
        var mail = "webos@webosarchive.org";
        if (Util.isWebOS()) {
            var params =  {
                "summary": title,
                "recipients": [{"value" : mail}],
                "text": "" 
            };
            this.$.openEmailCall.call({"id": "com.palm.app.email", "params" : params});    
        } else if (Util.isBlackBerry()) {
            var remote = new blackberry.transport.RemoteFunctionCall("blackberry/invoke/invoke");
            remote.addParam("appType", "mailto:" + mail + "?Subject=" + encodeURIComponent( title ) );
            remote.makeAsyncCall();
        }
        this.log("END");
    },
    
    openLink : function( ) {        
        this.log("START");
        var url = "http://forums.webosnation.com/hp-touchpad-apps/299668-readontouch-incredibly-comfortable-offline-reader-websites.html";
        if (Util.isBlackBerry()) {
            url = "http://forums.crackberry.com/playbook-apps-games-f243/readontouch-pro-native-pocket-readitlater-client-blackberry-playbook-719122/";
        }
        Platform.browser( url, this )();
        this.log("END");
    },
    
    acceptButtonClick: function() {
        this.doAccept();
        this.close();
    },
    
    
});
