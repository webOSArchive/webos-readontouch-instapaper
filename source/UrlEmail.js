enyo.kind({
    name: "UrlEmail",
    kind: enyo.Component,
    
    published: {
        message: ""
    },
    
    events: {
        onConfirm: ""
    },
    
    components: [
        {kind: "PalmService", service: "palm://com.palm.applicationManager/", components: [
            {name: "launchApp", method: "launch"},
            {name: "openApp", method: "open"}
        ]}
    ],
    
    create: function( ){
        this.inherited(arguments);
    },
    
    gotoUrl: function(url){
        console.log("Going to URL: " + url);
        
        //--> Data checks
        if (!url){
            console.log("No URL to go to...");
            return false;
        }
        
        //--> Determine which OS and which method to use
        if (Util.platform == "ios" || Util.platform == "android"){
            //--> iOS & Android Child Browser
            window.plugins.childBrowser.showWebPage(url);
            
            //--> Close app store launches after 3 seconds
            if (this.Left(url, 23) == "http://itunes.apple.com"){
                setTimeout(function(){
                    window.plugins.childBrowser.close();
                }, 3000);
            }
        }else if (Util.platform == "chrome" || Util.platform == "web" || Util.platform == "intel"){
            //--> For web apps
            window.open(url,'_newtab','');
        }else{
            //--> webOS method
            this.$.openApp.call(
                {target: url}
            );
        }
    },
    
    gotoEmail: function(subject, message, to, cc, bcc, html){
        console.log("Sending Email to: " + to + ", " + html);
        //--> Data checks
        if (!to){
            to = "";    
        }
        if (!cc){
            cc = "";    
        }
        if (!bcc){
            bcc = "";   
        }
        if (!html){
            html = false;   
        }
        
        //--> Determine which OS and which method to use
        if (Util.platform == "ios"){
            //--> iOS & Android Child Browser
            window.plugins.emailComposer.showEmailComposer(subject, message, to, cc, bcc, html);
        }else if (Util.platform == "android"){
            window.plugins.webintent.startActivity({
                action: WebIntent.ACTION_SEND,
                url: "mailto:" + to + "?subject=" + subject + "&body=" + message}
            );
            // window.plugins.childBrowser.openExternal( "mailto:" + to + "?subject=" + subject + "&body=" + message, false );
            // window.location = "mailto:" + to + "?subject=" + subject + "&body=" + message;
        }else if (Util.platform == "chrome" || Util.platform == "web" || Util.platform == "intel"){
            //--> For web apps
            window.location = "mailto:" + to + "?subject=" + subject + "&body=" + message;
        }else{
            //--> webOS method
            this.$.openApp.call({
                id: "com.palm.app.email",
                params: {
                    summary: subject,
                    text: message
                }
            });
        }
    },

    gotoText: function(to, message){
        console.log("Sending Text Message: " + message);
        //--> Data checks
        if (!to){
            to = "";    
        }
        
        //--> Determine which OS and which method to use
        if (Util.platform == "ios"){
            //--> iOS & Android Child Browser
            window.plugins.smsComposer.showSMSComposer(to, message);
        }else if (Util.platform == "android"){
            //--> iOS & Android Child Browser
            window.plugins.sms.send(to, message);
        }else if (Util.platform == "chrome" || Util.platform == "web" || Util.platform == "intel"){
            //--> For web apps
            //window.open(url,'','');
            alert($L("Sorry, messaging is not enabled for your platform"));
        }else{
            //--> webOS method
            this.$.openApp.call({
                id: "com.palm.app.messaging",
                params: {
                    messageText: message
                }
            });
        }
    },


    gotoFacebookShare: function(url, message){
        console.log("Sharing on Facebook: " + url + ", " + message);
        //--> Determine which OS and which method to use
        if (Util.platform == "webos"){
            //--> webOS method
            this.$.launchApp.call({
                id: "com.palm.app.enyo-facebook",
                params: {
                    type: "status", statusText: message
                }
            });
        }else{
            //--> Other method
            this.gotoUrl("http://www.facebook.com/sharer.php?u=" + Url.encode(url) + "&t=" + Url.encode(message));
        }
    },

    //--> Processes a click on any object and looks for http:// and mailto:
    processClick: function(inSender, inEvent){
        console.log("inEvent: " + inEvent);
        //--> No need to do this on webOS
        if (Util.platform != "webos"){
            var emailEvent = this.extractEmailFromEvent(inEvent);
            console.log("emailEvent: " + emailEvent);
            if (emailEvent.to != ""){
                //console.log("Found an Email: " + emailEvent.to);
                this.gotoEmail(emailEvent.subject, emailEvent.body, emailEvent.to, emailEvent.cc, emailEvent.bcc, false);
                return;
            }
            if (this.extractLinkFromEvent(inEvent) != ""){
                //console.log("Found a URL: " + this.extractLinkFromEvent(inEvent));
                this.gotoUrl(this.extractLinkFromEvent(inEvent));
                return;
            }
        }
    },
    
    //--> Extracts a link from a click on a target
    extractLinkFromEvent: function(obj){
        if (!obj || obj === undefined){
            return "";
        }
        
        if (obj && obj.target && obj.target.parentNode && this.Left(obj.target.parentNode, 4).toLowerCase() == "http"){
            console.log("extractLinkFromEvent 1");
            return String(obj.target.parentNode);
        }else if (obj && obj.target && obj.target.href){
            console.log("extractLinkFromEvent 2");
            return obj.target.href;
        //}else if (obj && obj.srcElement){
        //  console.log(obj.srcElement);
        //  console.log("extractLinkFromEvent 3");
        //  return obj.srcElement;
        //}else if (obj.target && obj.target.innerHTML){
        //  return getLinks(obj.target.innerHTML);
        }else{
            console.log("extractLinkFromEvent 4");
            return obj;  
        }
    },
    
    //--> Extracts a link from a click on a target
    extractEmailFromEvent: function(obj){
        try{
            if (!obj || obj === undefined){
                return this.extractPartsFromMailto("");
            }
            
            if (obj && enyo.isString(obj) && this.Left(obj, 6).toLowerCase() == "mailto"){
                //console.log("****** extractEmailFromEvent 1: " + String(obj));
                return this.extractPartsFromMailto(String(obj));
            }else if (obj && obj.target && obj.target.parentNode && this.Left(obj.target.parentNode, 6).toLowerCase() == "mailto"){
                //console.log("****** extractEmailFromEvent 1: " + String(obj.target.parentNode));
                return this.extractPartsFromMailto(String(obj.target.parentNode));
            }else if (obj && obj.target && obj.target.parentElement && this.findEmailAddresses(obj.target.parentElement) != ""){
                //console.log("****** extractEmailFromEvent 2");
                return this.extractPartsFromMailto(obj.target.parentElement)
            }else if (obj.target && obj.target.parentElement.href && this.findEmailAddresses(obj.target.parentElement.href) != ""){
                //console.log("****** extractEmailFromEvent 3");
                return this.extractPartsFromMailto(obj.target.parentElement.href)
            }else if (obj && obj.target && obj.target.href && this.findEmailAddresses(obj.target.href) != ""){
                //console.log("****** extractEmailFromEvent 4");
                return this.extractPartsFromMailto(obj.target.href)
            }else if (obj && obj.srcElement && this.findEmailAddresses(obj.srcElement) != ""){
                //console.log("****** extractEmailFromEvent 5");
                return this.extractPartsFromMailto(obj.srcElement)
            //}else if (obj.target && obj.target.innerHTML){
            //  return getLinks(obj.target.innerHTML);
            //}else if (obj.target && obj.target.innerHTML){
            //  return getLinks(obj.target.innerHTML);
            }else{
                //console.log("****** extractEmailFromEvent 6");
                return this.extractPartsFromMailto("");
            }
        }catch(e){
            console.log("extractEmailFromEvent Error: " + e);
            return this.extractPartsFromMailto("");
        }
    },
    
    //--> Extracts a link from a click on a target
    extractPartsFromMailto: function(inText){
        try{
            if (!inText || inText == null || inText === undefined){
                inText = "";
            }
            inText = inText.toString();
            
            var textObj = inText.split("?");
            var outObj = {"to": "", "subject": "", "body": "", "cc": "", "bcc": "", "inText": inText}
            outObj.to = this.findEmailAddresses(inText);
    
    
            if (textObj.length > 0 && textObj[1] !== undefined){
                var partsObj = textObj[1].split("&")
                for (i=0; i<partsObj.length; i++){
                    var thisObj = partsObj[i].split("=");
                    if (thisObj.length > 0 && !thisObj[0] !== undefined){
                        if (thisObj[0].toLowerCase() == "subject"){
                            outObj.subject = Url.decode(thisObj[1]);
                        }else if (thisObj[0].toLowerCase() == "body"){
                            outObj.body = Url.decode(thisObj[1]);
                        }else if (thisObj[0].toLowerCase() == "cc"){
                            outObj.cc = Url.decode(thisObj[1]);
                        }else if (thisObj[0].toLowerCase() == "bcc"){
                            outObj.bcc = Url.decode(thisObj[1]);
                        }
                    }
                }
            }
            
            return outObj;
        }catch(e){
            console.log("extractPartsFromMailto Error: " + e);
            return outObj;
        }
    },
    
    findEmailAddresses: function(StrObj) {
        try{
            if (!StrObj || StrObj == null || StrObj === undefined){
                return "";
            }
            
            var separateEmailsBy = ", ";
            var email = ""; // if no match, use this
            var emailsArray = StrObj.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
            if (emailsArray){
                for (var i = 0; i < emailsArray.length; i++) {
                    //if (i != 0){
                    //  email += separateEmailsBy;
                    //}
                    //email += emailsArray[i];
                    email = emailsArray[i];
                }
            }
            return email;
        }catch(e){
            return "";
        }
    },
    
    Left : function(str, len) {
        return str.substring(0, len);
    },
    
});