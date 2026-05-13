enyo.kind({
    name : "FilterList",
    kind : enyo.SlidingView,
    layoutKind : enyo.VFlexLayout,
    components : [
        {kind: "Toolbar", id: "headerToolbar", components: [
            {kind: enyo.HFlexBox, flex: 1, components: [
                {kind: enyo.HtmlContent, content: "Tags", style: " text-align: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: white; margin-left: 8px; ", flex: 1},
            ]}
        ]},
        {name: "scroller", kind: enyo.Scroller, flex : 1, ondragstart: "dragstartHandler", ondragfinish: "dragfinishHandler", ongesturestart: "gesturestartHandler", ongestureend: "gestureendHandler", components : [
            {name : "feedList", kind : enyo.VirtualList, onLoadComplete: "hideListSpinner", onLoadStarted: "showListSpinner", onSetupRow : "getItem", onclick : "doListTap", components : [
                {name : "feedItem", kind : enyo.SwipeableItem, onSwipe: "onSwipe", onConfirm: "markItemRead", cancelCaption: $L("Cancel"), confirmCaption: $L("Mark this item read?"), tapHighlight : true, components : [
                    {kind: enyo.HFlexBox, flex: 1, components: [
                        {kind: enyo.VFlexBox, flex: 1, components: [
                            {name : "listItemTitle", kind: enyo.HtmlContent, content : "",  style: "font-size: 0.9em; padding: 0px; margin-top: -3px; margin-left: 3px; "},
                        ]},
                        {kind: enyo.Spinner, name: "itemSpinner", style: "width: 10px, height: 10px"},
                    ]}
                ]}
             ]}
        ]}, 
        {kind: "Toolbar", id: "footerToolbar", components: [
            {kind: enyo.HFlexBox, flex: 1, components: [
                {kind: enyo.HtmlContent, content: "Footer...", style: " text-align: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: white; margin-left: 8px; ", flex: 1},
            ]}
        ]},
    ],
    events : {
        "onListTap" : "",
        "onRefreshTap" : "",
    },
    
    published: {
        online : false,
    },
    
    rendered : function( ) {
        this.inherited(arguments);
    },
    
    doFilterByTags : function() {
        this.$.tagSelectDialog.openAtCenter();  
        this.$.tagSelectDialog.setValues();
    },
    
    doListTap: function( inSender, inEvent ) {
        this.log("START");
        // this.log("doListTap()");
        
        if (!Util.isTouchpad() || (Util.isPortraitMode() && Util.getSettings().maximizeView == true) ) {
            this.owner.zoomInWebPanel();
        }
        
        if (inEvent !== undefined) {
            this.log(" -> clicked item #" + inEvent.rowIndex);
            this.selectedRow = inEvent.rowIndex;
            this.selectedObj = this.owner.feedItems[inEvent.rowIndex];
    
            if(this.selectedObj) {
                this.log("this.selectedObj.title: " + this.selectedObj.title);
                this.log("this.selectedObj.url: " + this.selectedObj.url);
                this.log("this.owner.getOnline(): " + this.owner.getOnline());
                // this.log("this.owner.getPreferedView(): " + this.owner.getPreferedView());
                this.owner.$.feedWebViewPane.setViewMode( "text" );
            }
        } else {
            this.error("inEvent is undefined!");
        }
        this.log("END");
    },
    
    getSelectedItem : function( ) {
        return this.selectedObj;
    },
    
    getItem : function( inSender, inIndex ) {
        // this.log("START");
        
        this.items = ["All unread", "Archiv", "basketball", "linux", "musik", "readontouch", "webos"];
        
        // check if the row is selected
        var isRowSelected = (inIndex == this.selectedRow);

        // get the selected item
        var selectedItem = this.items[inIndex];

        // format the colors 
        if (selectedItem) {
            if (isRowSelected == false) {
                // this.log("selectedItem is finished: " + selectedItem.title);
                this.$.feedItem.applyStyle("background", null);
                this.$.feedItem.applyStyle("color", null);
            } else if (isRowSelected == true) {
                // this.log("selectedItem is finished and selected row: " + selectedItem.title);
                this.$.feedItem.applyStyle("background", "#BBCCFF");
                this.$.feedItem.applyStyle("color", null);
            }
        }            
        
        // format the data
        if(selectedItem) {
            
            this.$.listItemTitle.setContent(this.items[inIndex]);
            
            return selectedItem;
        }
        else {
            this.error(" -> this.owner.feedItems[" + inIndex + "] not found!")
            // this.log("END");
            return false;
            }
        // this.log("END");
    },
    
});
