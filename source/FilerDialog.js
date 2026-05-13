enyo.kind({
    name: "ReadOnTouch.FilerDialog",
    kind: enyo.ModalDialog,
    height: (Util.isTablet() ? "600px" : "450px"),
    width: (Util.isTablet() ? "480px" : "280px"),
    caption: $L("Filter Article-List"),
    events: {
        onAccept: ""
    },
    components: [
        {kind: "ApplicationEvents", onWindowHidden: "close"},
        {name: "scroller", kind: enyo.Scroller, flex: 1, height: (Util.isTablet() ? "480px" : "330px"), autoHorizontal: false, horizontal: false, components: [
            {name: "rowGroupState", kind: "RowGroup", caption: $L("Item State") , components: [
                {kind: "LabeledContainer", label: $L("All"), components:[
                    {kind : "CheckBox", name : "all", onChange : "stateChanged" }
                ]},
                {kind: "LabeledContainer", label: $L("Unread"), components:[
                    {kind : "CheckBox", name : "unread", onChange : "stateChanged" }
                ]},
                {kind: "LabeledContainer", label: $L("Read"), components:[
                    {kind : "CheckBox", name : "read", onChange : "stateChanged" }
                ]},
            ]},
            {name: "rowGroupTags", kind: "RowGroup", caption: $L("Tags") , components: [
            ]},
        ]},
        {kind: "Spacer"},
        {name: "popupDialog", kind: "MyPopupDialog"},
        {layoutKind: "HFlexLayout", components: [
            {name: "clearButton", kind: "Button", caption: $L("Clear"), flex: 1, className: "enyo-button-negative", onclick: "onClear"},
            {name: "cancelButton", kind: "Button", caption: $L("Cancel"), flex: 1, className: "enyo-button-dark", onclick: "onClose"},
            {name: "filterButton", kind: "ActivityButton", caption: $L("Filter "), flex: 1, className: "enyo-button-affirmative", onclick: "onSubmit"},
        ]},
    ],
    
    published: {
        funcName: "",
        funcName2: "",
        scope: "",
        itemState: "",
        tags: "",
    },
    
    rendered : function() {
        this.inherited(arguments);
        this.log();
    },
    
    setValues : function( state, tags, filterTags ) {
        this.log("state: " + state);
        this.log("tags: " + enyo.json.stringify(tags));
        this.log("filterTags: " + filterTags);
        
        var allTags = "";
        
        this.setItemState( state );
        this.toggleButton( state );
        
        for (key in tags) {
            var obj = tags[key];
            // this.log("key: " + key);
            // this.log("obj: " + enyo.json.stringify(obj));
            if (obj.isTag == true) {
                var kindItem = {
                    kind: "LabeledContainer", 
                    label: obj.tag, 
                    name: "lc"+obj.tag,
                    components:[
                        {kind : "CheckBox", name : "cb"+obj.tag, onChange : "tagChanged" }
                    ]
                };
                this.$.rowGroupTags.createComponent( kindItem, {owner: this});
                allTags += obj.tag + ",";
            }
        }
        
        if (allTags != "") {
            allTags = allTags.substr(0, allTags.length-1);
        }
        
        if (filterTags != "") {
            var filterTagsArray = filterTags.split(",");
            for(key in filterTagsArray) {
                var tag = filterTagsArray[key];
                this.log("tag: " + tag);
                this.$["cb"+tag].setChecked(true);
    
                // if (allTags.indexOf(tag) != -1) {
                    // var components = this.$.rowGroupTags.getComponents();
                    // for (var i=0; i<components.length; i++) {
                        // var obj = components[i]
                        // // ["cb"+tag];
                        // this.log("obj: "+ obj);
                    // }
                // }
            }
            
            this.setTags( filterTags );
        }
        
        if (tags == undefined || tags == null || tags == "") {
            var kindItem = {
                    kind: "LabeledContainer", 
                    label: $L("Your articles have no tags!"),
                };
                this.$.rowGroupTags.createComponent( kindItem, {owner: this});
        }
        
        // put values from storage in ui

        this.$.rowGroupTags.render();
    },
    
    toggleButton : function ( value ) {
        switch (value) {
            case "unread": 
                this.$.all.setChecked(false);
                this.$.unread.setChecked(true);
                this.$.read.setChecked(false);
                break;
            case "read": 
                this.$.all.setChecked(false);
                this.$.unread.setChecked(false);
                this.$.read.setChecked(true);
                break;
            default: 
                this.$.all.setChecked(true);
                this.$.unread.setChecked(false);
                this.$.read.setChecked(false);
                break;
        }
    },
    
    stateChanged : function( inButton ) {
        // this.error("inButton: " + inButton );
        // this.error("inButton.name: " + inButton.name );

        this.toggleButton( inButton.name );        
        this.setItemState( inButton.name );
    },
    
    tagChanged : function ( inValue ) {
        this.log("inValue: " + inValue.name);
        var newValue = inValue.name.substr(2, inValue.name.length); 
        this.log("tag: " + newValue);
        var checked = inValue.getChecked();
        if (checked == true) {
            // add tag to tag-list
            if (this.getTags() == "") {
                this.setTags(newValue);
            } else {
                this.setTags( this.getTags() + "," + newValue);
            }
        } else {
            // remove tag from tag-list
            var posStart = this.getTags().indexOf(newValue);
            this.log("posStart: " + posStart);
            this.log("newValue.length: " + newValue.length);
            this.log("this.getTags().length: " + this.getTags().length);
            if (posStart != -1) {
                if (posStart + newValue.length == this.getTags().length) {
                    this.setTags( this.getTags().substr(0, posStart-1));
                } else if (posStart == 0){
                    this.setTags( this.getTags().substr(newValue.length+1, this.getTags().length));
                } else {
                    var str1 = this.getTags().substr(0, posStart-1);
                    var str2 = this.getTags().substr(posStart + newValue.length, this.getTags().length);
                    this.log("str1: " + str1);
                    this.log("str2: " + str2);
                    this.setTags( str1 + str2 );
                }
            }
        }
        
        this.log("selected tags: " + this.getTags());

        // var childs = this.$.rowGroupTags.getControls();
        // for (key in childs) {
            // // this.log("child: " + childs[key].name);
            // if (childs[key].name == newValue) {
                // this.log("obj: " + childs[key].name);
            // }
        // }
    },
    
    onClose : function( ) {
        this.log();
        this.$.rowGroupTags.destroyControls();
        this.close();
    },
    
    
    setActive : function ( value ) {
        this.$.filterButton.setActive( value ); 
    },
    
    onSubmit : function( force ) {
        this.log("this.getFuncName(): " + this.getFuncName());
        this.log("force: " + force);
        if (this.getFuncName().length > 0) {
            this.setActive( true ); 
            // a function that binds this to this.foo
            var fn = enyo.bind(this.getScope(), this.getFuncName());
            // the value of this.foo(3)
            var result = fn( this.getItemState(), this.getTags() );
            this.log("result.length: " + result.length);
            if (result.length > 0 || force == true) {
                if (this.getFuncName2().length > 0) {
                    this.log("calling " + this.getFuncName2());
                    // a function that binds this to this.foo
                    var fn2 = enyo.bind(this.getScope(), this.getFuncName2());
                    // the value of this.foo(3)
                // this.log("force: " + force);
                    var value = fn2( this.getItemState(), this.getTags(), force );
                }
                this.setActive( false ); 
                
                // store filter
                localStorage.removeItem("itemState");     
                localStorage.setItem("itemState", this.getItemState());
                localStorage.removeItem("filterTags");     
                localStorage.setItem("filterTags", this.getTags());
                
                this.onClose();
            } else {
                this.setActive( false ); 
                this.showFailurePopup($L("Your current request did not return any articles."), $L("No results found!"));
            }
        }
    },
    
    onClear : function( ) {
        this.setTags( "" );
        this.setItemState( "unread" );

        this.onSubmit( true );        
    },

    showFailurePopup : function ( str, title ) {
        this.$.popupDialog.openAtCenter();  
        if (title !== undefined) {
            this.$.popupDialog.setTitle( $L(title) );
        } else {
            this.$.popupDialog.setTitle($L("Failure!"));
        }
        this.$.popupDialog.setMessage($L(str));
        this.$.popupDialog.hideCancelButton();
    },

    
});