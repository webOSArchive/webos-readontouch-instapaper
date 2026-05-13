enyo.kind({
    name: "FullVersionLimitReached",
    kind: enyo.ModalDialog,
    width: "350px",
    caption: $L("ReadOnTouch PRO needed!"),
    components: [
         {name: "inhalt", content: $L("You have already read 5 articles today. To read more you have to buy the fullversion."), className: "enyo-paragraph"},
         {kind: "Button", onclick: "openAppCat", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
             {kind: "Image", src: "images/appcat.png"}, {content: $L("Buy now!"), style: "font-size: 25pt; padding: 10px"}
         ]},
         {layoutKind: "HFlexLayout", components: [
             {kind: "Button", caption: $L("Close"), flex: 1, onclick: "close", className: "enyo-button-negative"},
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
