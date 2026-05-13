enyo.kind({
    name: "AppMissing",
    kind: "Popup",
    //layoutKind: "VFlexLayout",
    style: "width: 380px; height: 330px; ",
    components: [
        {name: "message", allowHtml: true, style: "padding: 15px; font-size: 18pt; text-align: center"},
        {kind: "Button", onclick: "openAppCat", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
                {kind: "Image", src: "images/appcat_96x96.png"}, {content: $L("Get now!"), style: "font-size: 25pt; padding: 10px"}
        ]},
        {kind: "Button", className: "enyo-button-dark", caption: $L("Close"), onclick: "close"},
        {name: "launchApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"}
    ],
    published: {
        appId: "",
        appTitle: ""
    },
    appTitleChanged: function() {
        this.validateComponents();
        this.$.message.setContent($L("You need the app")+" <span style='color:#084774'>" + this.appTitle + "</span> "+$L("to use this feature!"));
    },
    openAppCat: function() {
        this.validateComponents();
        var finderApp = "com.palm.app.enyo-findapps";
        if (Util.isTouchpadOrPre3() && !Util.isTouchpad()) {
            finderApp = "com.palm.app.findapps";
        }
        this.$.launchApp.call({id: finderApp, params: {target: "http://developer.palm.com/appredirect/?packageid=" + this.appId}});
    },
});