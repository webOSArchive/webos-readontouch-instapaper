enyo.kind({
    name: "AboutDialog",
    kind: enyo.ModalDialog,
    layoutKind:"VFlexLayout",
    width: (Util.isTablet() ? "470px" : "320px"), 
    height: ((Util.isTablet() && Util.isWebOS()) ? "480px" : "370px"),
    events: {
        onAccept: ""
    },
    components: [
        {kind: "ApplicationEvents", onWindowHidden: "close"},
        {name: "link", kind: "UrlEmail"},
        /*{layoutKind: "VFlexLayout", components:[*/
            {kind: enyo.Scroller, flex: 1, height: ((Util.isTablet() && Util.isWebOS()) ? "360px" : "260px"), autoHorizontal: false, horizontal: false, components: [
                {name: "wwwLabel", flex: 1, kind: "HtmlContent", allowHtml: true, onLinkClick: "linkClicked", className:"enyo-paragraph"},
            ]},
            {name: "buttonOrientation", layoutKind: "HFlexLayout", components: [
                {name: "acceptButton", kind: "Button", flex:1, caption: $L("OK"), onclick: "acceptButtonClick"}
            ]},
        /*]}*/
    ],
    
    rendered : function () {
        this.inherited(arguments);
        this.setCaption($L("About"));
        var appinfo = enyo.fetchAppInfo();
        
        var width = "20;"
        
        var test = "<table border=\"0\" width=\"100%\">";
        test += "<tr>";
        test += "<td>"+$L("Name:")+"</td>";
        test += "<td width=" + width + ">&nbsp;</td>";
        test += "<td>" + appinfo.title + "</td>";
        var img = "images/ReadOnTouch-64-r2.png";
        if (Util.isPlaybook()) {
            img = "images/ReadOnTouch-48-r2.png";
        }
        test += "<td rowspan=\"3\" align=\"right\" valign=\"top\"><img border=\"0\" src='" + img + "'></td>";
        test += "</tr>";
        test += "<tr>";
        test += "<td>"+$L("Version")+":</td>";
        test += "<td width=" + width + ">&nbsp;</td>";
        test += "<td>" + appinfo.version + "</td>";
        test += "</tr>";
        test += "<tr>";
        test += "<td>"+$L("Developer")+":</td>";
        test += "<td width=" + width + ">&nbsp;</td>";
        test += "<td>" + appinfo.vendor + "</td>";
        test += "</tr>";
        test += "<tr>";
        test += "<td colspan=4><hr></td>";
        test += "</tr>";
        test += "<tr>";
        test += "<td valign=\"top\">"+$L("eMail")+":</td>";
        test += "<td width=" + width + ">&nbsp;</td>";
        if (Util.isWebOS() == true) {
            test += "<td colspan=2><a href=\"mailto:webos@webosarchive.org\">webos@webosarchive.org</a></td>";
        } else {
            test += "<td colspan=2>webos@webosarchive.org</td>";
        }
        test += "</tr>";
        test += "<tr>";
        test += "<td valign=\"top\">"+$L("Web")+":</td>";
        test += "<td width=" + width + ">&nbsp;</td>";
        test += "<td colspan=2><a href=\"https://www.webosarchive.org\">https://www.webosarchive.org</a></td>";
        test += "</tr>";
/*        test += "<tr>";
        test += "<td valign=\"top\">"+$L("Facebook")+":</td>";
        test += "<td width=" + width + ">&nbsp;</td>";
        test += "<td colspan=2><a href=\"https://www.facebook.com/ReadOnTouch\">ReadOnTouch</a></td>";
        test += "</tr>";
        test += "<tr>";
        test += "<td valign=\"top\">"+$L("Google+")+":</td>";
        test += "<td width=" + width + ">&nbsp;</td>";
        test += "<td colspan=2><a href=\"https://plus.google.com/b/115546583562833428431/\">ReadOnTouch</a></td>";
        test += "</tr>";*/
        test += "<tr>";
        test += "<td valign=\"top\">"+$L("Web")+":</td>";
        test += "<td width=" + width + ">&nbsp;</td>";
        test += "<td colspan=2><a href=\"https://www.webosarchive.org\">webosarchive.org</a></td>";
        test += "</tr>";
        test += "<tr>";
        test += "<td colspan=4><hr></td>";
        test += "</tr>";
        test += "<tr>";
        test += "<td valign=\"top\">" + $L("Most Icons / Graphics:") + "</td>";
        test += "<td width=" + width + ">&nbsp;</td>";
        test += "<td colspan=2><a href=\"mailto:reischuck.micha@googlemail.com\">Micha Reischuck</a></td>";
        test += "</tr>";
        if (Util.isWebOS() && Util.isTouchpad()) {
            test += "<tr>";
            test += "<td colspan=4><hr></td>";
            test += "</tr>";
            test += "<tr>";
            test += "<td colspan=4>"+$L("I've patched the original webos 3.0.5 browser to provide the functionality to share links to ReadOnTouch. You can find the Patch in Preware, just search for \"ReadOnTouch\".")+"<br><br>";
            test += $L("If you don’t know what I’m talking about, please have a look at:")+" <a href=\"http://www.precentral.net/getting-started-homebrew-apps-patches-and-themes-webos-quick-install\">"+$L("What is Preware?")+"</a></td>";
            test += "</tr>";
        }
        test += "</table>";
        
        this.$.wwwLabel.setContent(test);
    },
    
    acceptButtonClick: function() {
        this.doAccept();
        this.close();
    },
    
    linkClicked: function (inSender, inEvent) {
        // this.log("inEvent: " + inEvent);
        // this.owner.$.myservices.callAppManService(inEvent);
        this.$.link.processClick( inSender, inEvent );  
    },
    
    

});