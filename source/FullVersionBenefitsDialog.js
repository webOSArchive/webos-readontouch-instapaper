enyo.kind({
    name: "FullVersionBenefitsDialog",
    kind: enyo.ModalDialog,
    width: "350px",
    caption: $L("Benefits of the full version"),
    components: [
         {name: "scroller", kind: enyo.Scroller, flex: 1, height: (Util.isWebOS() ?  
                 (Util.isTouchpad() ? "510px" : (Util.isTouchpadOrPre3() ? "300px" : "165px"))
                 : (Util.isTablet() || Util.isBrowser() ? "480px" : "275px")), autoHorizontal: false, horizontal: false, components: [
		     {htmlContent: true, content: "<table border=0>"},
		     {htmlContent: true, content: "<tr><td valign='top'><li></td><td>" + $L("Storage of articles on sync and thereby offline access for your articles.") + "</td></tr>", className: "enyo-paragraph", flex:1},
		     {htmlContent: true, content: "<tr><td valign='top'><li></td><td>" + $L("Images download for offline access.") + "</td></tr>", className: "enyo-paragraph", flex:1},
		     {htmlContent: true, content: "<tr><td valign='top'><li></td><td>" + $L("Share articles.") + "</td></tr>", className: "enyo-paragraph", flex:1},
		     {htmlContent: true, content: "<tr><td valign='top'><li></td><td>" + $L("Open articles in external browser.") + "</td></tr>", className: "enyo-paragraph", flex:1},
		     {htmlContent: true, content: "<tr><td valign='top'><li></td><td>" + $L("Read more than 5 articles per day.") + "</td></tr>", className: "enyo-paragraph", flex:1},
		     {htmlContent: true, content: "<tr><td valign='top'><li></td><td>" + $L("You support further development of this app.") + "</td></tr>", className: "enyo-paragraph", flex:1},
		     {htmlContent: true, content: "<tr><td valign='top'><li></td><td>" + $L("No more ads!") + "</td></tr>", className: "enyo-paragraph", flex:1},
		     /*{htmlContent: true, content: "<tr><td valign='top'><li></td><td>" + $L("This popup will be missing too.") + "</td></tr>", className: "enyo-paragraph", flex:1},*/
		     {htmlContent: true, content: "</table>"},
		     {kind: "Button", onclick: "openAppCat", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
		         {kind: "Image", src: "images/appcat.png"}, {content: $L("Buy now!"), style: "font-size: 25pt; padding: 10px"}
		     ]},
		     {layoutKind: "HFlexLayout", components: [
                 {kind: "Button", caption: $L("Close"), flex: 1, onclick: "close", className: "enyo-button-negative"},
		     ]}
	     ]}
    ],

    create : function () {
        this.inherited(arguments);
    },
    
    openAppCat: function() {
        url = Platform.getReviewURL();
        Platform.browser( url, this )();
    },

});
