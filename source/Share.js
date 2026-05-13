enyo.kind({
    name: "Share",
    kind: enyo.Control,
    events: {
        onAccept: ""
    },
    components: [
         {name: "launchAppCall", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "launch", onSuccess: "launchFinished", onFailure: "launchFail", onResponse: "gotResponse"},
         {
             name: "openEmailCall",
             kind: "PalmService",
             service: "palm://com.palm.applicationManager/",
             method: "open",
             onSuccess: "openEmailSuccess",
             onFailure: "openEmailFailure",
             onResponse: "gotResponse",
        },
        {name: "shareList", kind: "PopupSelect", onSelect: "popupShareItemSelect", items: [
            {caption: $L("Share by / via:"), disabled: true, value: "-1"}, 
            {name: "copyContent", caption: $L("Clipboard"), value: "5", icon: "images/clipboard.png"}, 
            {name: "itemEMail", caption: $L("Mail"), value: "0", icon: "images/mail-32x32.png"}, 
            {name: "itemMessaging", caption: $L("Messaging"), value: "1", icon: "images/messaging-32x32.png"}, 
            {name: "itemMeOrg", caption: $L("OrganizeMe!"), value: "7", icon: "images/meorg-32x32.png"},
            {name: "itemPdf", caption: $L("Create PDF (via Mail)"), value: "8", icon: "images/pdf-32x32.png"},
            {name: "itemFacebook", caption: $L("Facebook"), value: "2", icon: "images/facebook-32x32.png"},
            {name: "itemTwitter", caption: $L("Twitter"), value: "3", icon: "images/twitter-32x32.png"},
            {name: "itemGoogle", caption: $L("Google+"), value: "4", icon: "images/google-32x32.png"},
            {name: "itemBufferapp", caption: $L("Buffer"), value: "6", icon: "images/bufferapp.png"},
         ]},
        {name: "shareListOffline", kind: "PopupSelect", onSelect: "popupShareItemSelect", items: [
            {caption: $L("Share by / via:"), disabled: true, value: "-1"}, 
            {name: "copyContent", caption: $L("Clipboard"), value: "5", icon: "images/clipboard.png"}, 
            {name: "itemEMail", caption: $L("Mail"), value: "0", icon: "images/mail-32x32.png"}, 
            {name: "itemMessaging", caption: $L("Messaging"), value: "1", icon: "images/messaging-32x32.png"}, 
         ]},
        {name: "shareListNonWebOS", kind: "PopupSelect", onSelect: "popupShareItemSelect", items: [
            {caption: $L("Share by / via:"), disabled: true, value: "-1"}, 
            /* {name: "copyContent", caption: "Clipboad", value: "5", icon: "images/clipboard.png"},*/ 
            {name: "itemEMail", caption: $L("Mail"), value: "0", icon: "images/mail-32x32.png"}, 
            {name: "itemPdf", caption: $L("Create PDF (via Mail)"), value: "8", icon: "images/pdf-32x32.png"},
            {name: "itemFacebook", caption: $L("Facebook"), value: "2", icon: "images/facebook-32x32.png"},
            {name: "itemTwitter", caption: $L("Twitter"), value: "3", icon: "images/twitter-32x32.png"},
            {name: "itemGoogle", caption: $L("Google+"), value: "4", icon: "images/google-32x32.png"},
            {name: "itemBufferapp", caption: $L("Buffer"), value: "6", icon: "images/bufferapp.png"},
         ]},
        {name: "shareListOfflineNonWebOS", kind: "PopupSelect", onSelect: "popupShareItemSelect", items: [
            {caption: $L("Share by / via:"), disabled: true, value: "-1"}, 
            /* {name: "copyContent", caption: "Clipboad", value: "5", icon: "images/clipboard.png"},*/ 
            {name: "itemEMail", caption: $L("Mail"), value: "0", icon: "images/mail-32x32.png"}, 
            {name: "itemPdf", caption: $L("Create PDF (via Mail)"), value: "8", icon: "images/pdf-32x32.png"},
         ]},
        {kind: "ModalDialog", name: "noUrlDialog", caption: $L("No URL available"), components:[
             {content: $L("This object does not contain a url to share."), className: "enyo-paragraph"},
             {layoutKind: "HFlexLayout", components: [
                 {kind: "Button", caption: $L("Ok"), flex: 1, onclick: "closeNoUrlDialog"},
             ]}
        ]},
    ],
    
    published: {
        item: null,
        link: '',
        isNotebook: false,
        hasSource: false,
        hasPublicNotebook: false,
        isPublicNotebook: false,
        staticMode: true
    },
   
    shareItem : function( source, inEvent ) {
        this.log("START");
        // this.log("Util.getSettings().online: " + Util.getSettings().online);
        if (Util.isWebOS()) {
            if(Util.getSettings().online == true) {
            	if (this.staticMode == true) {
	                this.$.shareList.openAt({
	                    bottom : 49,
	                    right : 0
	                });
            	} else {
                    this.$.shareList.openAt({
                        top : inEvent.clientY-50,
                        left : (Util.isTablet() == true ? inEvent.clientX : 20)
                    });        
            	}
            } else {
            	if (this.staticMode == true) {
	                this.$.shareListOffline.openAt({
	                    bottom : 49,
	                    right : 0
	                });
            	} else {
                    this.$.shareListOffline.openAt({
                        top : inEvent.clientY-50,
                        left : (Util.isTablet() == true ? inEvent.clientX : 20)
                    });        
            	}
            }
        } else {
            if(Util.getSettings().online == true) {
            	if (this.staticMode == true) {
	                this.$.shareListNonWebOS.openAt({
	                    bottom : 49,
	                    right : 0
	                });
            	} else {
                    this.$.shareListNonWebOS.openAt({
                        top : inEvent.clientY-50,
                        left : (Util.isTablet() == true ? inEvent.clientX : 20)
                    });        
            	}
            } else {
            	if (this.staticMode == true) {
	                this.$.shareListOfflineNonWebOS.openAt({
	                    bottom : 49,
	                    right : 0
	                });
            	} else {
                    this.$.shareListOfflineNonWebOS.openAt({
                        top : inEvent.clientY-50,
                        left : (Util.isTablet() == true ? inEvent.clientX : 20)
                    });        
            	}
            }
        }
        this.log("END");
    },
    
    popupShareItemSelect : function( inSender, inValue ) {
        this.log("START");
        this.log("inSender: " + inSender);
        this.log("inValue: " + inValue);
        this.log("inValue.value: " + inValue.value);
        this.log("Util.getSettings().online: " + Util.getSettings().online);
        if (inValue !== undefined && Util.getSettings().online == true) {
            switch (inValue.value) {
                case "0": 
                    this.shareItemByMail();
                    break;
                case "1": 
                    this.shareItemViaMessaging();
                    break;
                case "2": 
                    this.shareItemViaFacebook();
                    break;
                case "3":
                    this.shareItemViaTwitter();
                    break;            
                case "4":
                    this.shareItemViaGooglePlus();
                    break;     
                case "5":
                    var str = Util.stripHTML( this.owner.$.currentArticleView.getContent() );
                    // this.log("adding to clipboard: " + str);
                    if (Util.isWebOS()) {
                        enyo.dom.setClipboard( str );
                    } else if (Util.isPlaybook()) {
                        blackberry.clipboard.setText( str );
                    }
                    break;       
                case "6":
                    this.shareItemViaBuffer();
                    break;     
                case "7": 
                    this.shareItemViaMeOrg();
                    break;
                case "8": 
                    this.shareItemViaCreatePdf();
                    break;
                default: 
                    this.shareItemByMail();
                    break;
            }
        } else if (inValue !== undefined && Util.getSettings().online == false) {
            switch (inValue.value) {
                case "0": 
                    this.shareItemByMail();
                    break;
                case "1": 
                    this.shareItemViaMessaging();
                    break;
                case "5":
                    var str = Util.stripHTML( this.owner.$.currentArticleView.getContent() );
                    // this.log("adding to clipboard: " + str);
                    enyo.dom.setClipboard( str );
                    break;       
                default: 
                    break;
            }
        } else {
            this.warn("inValue is undefined or client is offline!");
        }
        this.log("END");
    },
    
    
    shareItemByMail : function( ) {
        this.log("START");
        var item = this.owner.getSelectedItem();
        var obj = Util.getElementFromArrayById( this.owner.getDataManager().getTextInfo(), item.item_id);
        // this.log("obj: "+ JSON.stringify(obj));

        var title = (obj != null && obj.title !== undefined ? obj.title : (selectedItem.title != "" ? selectedItem.title : selectedItem.url));

//        this.log(JSON.stringify(item));
        if (title == undefined || title == null || title == "") {
            title = $L("ReadOnTouch PRO: Shared Article");
        }
        var text = item.url; // + "<br><br><br>---<br>Sent by ReadOnTouch PRO - http://sven-ziegler.com";
        
        if (Util.isWebOS()) {
            var params =  {
                "summary": title,
                "text": text, 
            };
            this.$.openEmailCall.call({"id": "com.palm.app.email", "params" : params});    
        } else if (Util.isBlackBerry()) {
            var remote = new blackberry.transport.RemoteFunctionCall("blackberry/invoke/invoke");
            // alert("remote: " + remote);
            remote.addParam("appType", "mailto:?Subject=" + encodeURIComponent( title ) + "&body=" + encodeURIComponent( text ));
            remote.makeAsyncCall();
        } else {
            Platform.browser( "mailto:?Subject=" + encodeURIComponent( title ) + "&body=" + encodeURIComponent( text ), this )();
        }            
        this.log("END");
    },
    
    shareItemViaCreatePdf : function( ) {
        this.log("START");
        var item = this.owner.getSelectedItem();
        var text = $L("Create PDF and send to me");
        var mail = "mypdf@joliprint.com";
        if (Util.isWebOS()) {
            var params =  {
                "summary": text,
                "text": item.url, 
                "recipients":[
                    {
                        "type": "email",
                        "contactDisplay":$L("PDF Creator"), 
                        "role":1, 
                        "value": mail
                    }
                ],
            };
            this.$.openEmailCall.call({"id": "com.palm.app.email", "params" : params});    
        } else if (Util.isBlackBerry()) {
            var remote = new blackberry.transport.RemoteFunctionCall("blackberry/invoke/invoke");
            remote.addParam("appType", "mailto:" + mail + "?Subject=" + encodeURIComponent( text ) + "&body=" + encodeURIComponent( item.url ));
            remote.makeAsyncCall();
        } else {
            Platform.browser( "mailto:" + mail + "?Subject=" + encodeURIComponent( text ) + "&body=" + encodeURIComponent( item.url ), this )();
        }
        this.log("END");
    },
    
    shareItemViaMessaging : function( ) {
        this.log("START");
        var item = this.owner.getSelectedItem();
        var params =  { "compose": { "messageText" :  item.url }};
        this.$.launchAppCall.call({"id": "com.palm.app.messaging", "params" : params});    
        this.log("END");
    },
    
    shareItemViaMeOrg : function( ) {
        this.log("START");
        var item = this.owner.getSelectedItem();
        var file = this.owner.getDataManager().getDownloadedArticleContent( item.item_id );
        // var desc = Util.loadFile( file, item.title );
        var desc = this.owner.$.currentArticleView.getContent();
        if (String(desc).length > 17) {
            desc = String(desc).substring(8, String(desc).length - 9);
        }
        this.log("file: " + file);
        this.log("desc: " + desc);
        var params =  { 
            "action": "addLink",
            "url": item.url,
            "title": item.title,
            "description": desc ,
        };
        this.$.launchAppCall.call({"id": "com.sven-ziegler.meorg", "params" : params});    
        this.log("END");
    },
    
    shareItemViaFacebook : function( ) {
        this.log("START");
        var item = this.owner.getSelectedItem();
        var url = "http://www.facebook.com/sharer.php?u=" + item.url + "&t=" + item.title;
        Platform.browser( url, this )();
        this.log("END");
    },
    
    shareItemViaTwitter : function( ) {
        this.log("START");
        var item = this.owner.getSelectedItem();
        var url = "http://twitter.com/intent/tweet?via=ReadOnTouch%20PRO&url=" + item.url; 
        Platform.browser( url, this )();
        this.log("END");
    },
    
    shareItemViaGooglePlus : function( ) {
        this.log("START");
        var item = this.owner.getSelectedItem();
        var url = "https://m.google.com/app/plus/x/?v=compose&content=" + item.url; 
        Platform.browser( url, this )();
        this.log("END");
    },
    
    shareItemViaBuffer : function( ) {
        this.log("START");
        var item = this.owner.getSelectedItem();
        var url = "http://bufferapp.com/add?url=" + item.url + "&text=" + item.title + ""; 
        Platform.browser( url, this )();
        this.log("END");
    },
    
 
});