enyo.kind({
    name: "AddLinkDialog",
    kind: enyo.ModalDialog,
    height: "285px",
    width: (Util.isTablet() ? "500px" : "320px"),
    caption: $L("Add new Article"),
    events: {
        onAccept: ""
    },
    components: [
        {kind: "ApplicationEvents", onWindowHidden: "close"},
        {kind: "RowGroup", caption: $L("Article URL"), components: [
           // {name: "url", hint: "url of new item", kind: "Input", autoCapitalize: "lowercase", inputType: "url", alwaysLooksFocused: true},
           (Util.isWebOS() ? 
        		{name: "url", hint: $L("url of new article"), style: "background-color: white; min-height: 100px;", kind: "RichText", richContent: false, oninput: "setDirty"} 
                : {name: "url", hint: $L("url of new article"), style: "background-color: white; min-height: 100px;", kind: "Textarea", richContent: false, oninput: "setDirty"} )
        ]},
        {layoutKind: "HFlexLayout", components: [
            {name: "cancelButton", kind: "Button", caption: $L("Close"), flex: 1, onclick: "onClose"},
            {name: "addButton", kind: "ActivityButton", caption: $L("Submit"), flex: 1, className: "enyo-button", onclick: "onSubmit"},
        ]}
    ],
    
    published: {
        funcName: "",
        funcName2: "",
    },
    
    rendered : function() {
        this.inherited(arguments);
        this.log("setting focus...");
        this.$.cancelButton.setCaption($L("Close"));
        if (Util.isTablet() || Util.isTouchpadOrPre3()) {
            this.$.url.forceFocusEnableKeyboard();  
        }

        if ( (Util.isTablet() || Util.isTouchpadOrPre3()) && this.$.url.getValue() == "") {
            this.$.addButton.setDisabled( true );
            this.$.addButton.removeClass("enyo-button-affirmative");        
        } else {
            this.$.addButton.setDisabled( false );
            this.$.addButton.addClass("enyo-button-affirmative");        
        }
        // this.checkClipboard();
    },

    checkClipboard : function() {
        if (Util.isWebOS()) {
            enyo.dom.getClipboard( enyo.bind(this, this.getClipboardOnWebOS) );
        } else if (Util.isPlaybook()) {
            var clip = blackberry.clipboard.getText();
            this.handleClipData( clip );            
            blackberry.clipboard.setText("");
        }
    },
    
    getClipboardOnWebOS: function( inSender, inEvent ) {
        this.handleClipData( inSender );            
    },
    
    handleClipData : function( clip ) {
        this.log("clip: " + clip);
        if (clip != null && String(clip).trim().length > 0) {
            this.log("clip.substr(0,4): " + clip.substr(0,4));
            // check if it's an url
            if (clip.substr(0,4) == "http") {
                this.log("clipboard content is an url!");
                this.$.url.setValue( clip );
                this.$.url.setSelection({start: 0, end: 0});   
                this.setDirty();
            }
        }    
    },
    
    setParams : function( url, title, func ) {
    	this.log();
        this.$.url.setValue( url );
        if (func !== undefined) {
            this.setFuncName( func );
        }

        if ( (Util.isTablet() || Util.isTouchpadOrPre3()) && this.$.url.getValue() == "") {
            this.$.addButton.setDisabled( true );
            this.$.addButton.removeClass("enyo-button-affirmative");        
        } else {
            this.$.addButton.setDisabled( false );
            this.$.addButton.addClass("enyo-button-affirmative");        
        }
       
    },
    
    onClose : function( ) {
        if (this.getFuncName2().length > 0) {
            this.log("calling " + this.getFuncName2());
            // a function that binds this to this.foo
            var fn = enyo.bind(this.owner, this.getFuncName2());
            // the value of this.foo(3)
            var value = fn();
        }
        this.close();
    },
    
    setFinished : function( value, func2 ) {
        this.setActive( false );
        if (value == true) {
            this.$.addButton.setCaption($L("Added feed!"));
            this.$.addButton.setDisabled(true); 
            // this.$.cancelButton.setCaption("Ok");
            this.setCaption($L("Link added successfully"));
            this.$.url.setDisabled(true);
            if (func2 !== undefined) {
                this.setFuncName2( func2 );
            }
        } else {
            this.$.addButton.setCaption($L("Failure!"));
            this.$.cancelButton.setDisabled(false);
            this.$.url.setDisabled(false);
            this.$.cancelButton.setCaption($L("Close"));
            this.setCaption($L("Operation failed"));
        }
    },
    
    setActive : function ( value ) {
        this.$.addButton.setActive( value ); 
        this.$.url.disabled = !value; 
    },
    
    onSubmit : function( ) {
        this.log("this.getFuncName(): " + this.getFuncName());
        var url = this.$.url.getValue().trim();
        if (this.getFuncName().length > 0 && url.length > 0) {
            this.setActive( true ); 
            // a function that binds this to this.foo
            var fn = enyo.bind(this.owner.$.dataManager, this.getFuncName());
            // the value of this.foo(3)
            var value = fn(url, "");
        }
    },

    resetAddItemDialog : function() {
        this.log("START");
//        this.$.url.disabled = false; 
//        this.$.title.disabled = false; 

        this.$.url.setValue("");

        this.$.url.setDisabled(false);

        if ( (Util.isTablet() || Util.isTouchpadOrPre3()) && this.$.url.getValue() == "") {
            this.$.addButton.setDisabled( true );
            this.$.addButton.removeClass("enyo-button-affirmative");        
        } else {
            this.$.addButton.setDisabled( false );
            this.$.addButton.addClass("enyo-button-affirmative");        
        }

        this.$.addButton.setCaption($L("Submit"));
        this.$.cancelButton.setCaption($L("Close"));
        
        this.$.addButton.setActive( false ); 

        if (Util.isTablet() || Util.isTouchpadOrPre3()) {
            this.$.url.forceFocusEnableKeyboard();  
        }
        
        // this.checkClipboard();
        this.log("END");
    },

    setActive : function ( value ) {
        this.$.addButton.setActive( value ); 
        this.$.cancelButton.setDisabled( !value ); 
        this.$.url.setDisabled( !value ); 
    },
    
    setDirty : function() {
        // this.log();
        var value = this.$.url.getValue().trim();
        if (value.length > 0) {
            this.isDirty = true;
            this.$.addButton.addClass("enyo-button-affirmative");
        } else {
            this.isDirty = false;
            this.$.addButton.removeClass("enyo-button-affirmative");
        }
        this.$.addButton.setDisabled( !this.isDirty );
    },
    
    
});