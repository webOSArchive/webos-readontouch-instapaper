enyo.kind({
    name: "ProgressDialog",
    kind: enyo.ModalDialog,
    height: "240px",
    events: {
        onAccept: ""
    },
    components: [
        {kind: "ApplicationEvents", onWindowHidden: "close"},
        {layoutKind: "VFlexLayout", components:[
            {name: "message", kind: enyo.HtmlContent, content: "", className:"enyo-paragraph"},
            {kind: "ProgressBar", name: "progress"},
            {kind: "LabeledContainer", name: "status", style: "font-size: 0.7em; text-align: right; "},
            {name: "cancelButton", caption: $L("Cancel"), kind: "ActivityButton", onclick: "onCancel", className: "enyo-button-negative"},
        ]}
    ],
    
    published: {
        funcName: "",
    },
    
    rendered : function () {
        this.inherited(arguments);
        this.$.cancelButton.hide();
    },
    
    resetDialog : function() {
        this.$.cancelButton.setActive( false ); 
        this.$.cancelButton.setCaption($L("Cancel"));
        this.$.cancelButton.hide();
    },
    
    updateProgress : function ( state, caption, pos, number, total, finished, func ) {
        //if (state !== undefined && state == "2") {
            this.$.message.setContent($L("This may take a while, depending on how many articles you try to load...<br><br>"))
        /*} else {
            this.$.message.setContent("<br><br>")
        }*/
        if (caption !== undefined) {
            this.setCaption( caption );
        }
        if (pos !== undefined) {
            this.$.progress.setPosition( pos );
        }
        if (number !== undefined && number != "unknown") {
            this.$.status.setLabel($L("downloaded: ") + number + $L(" of total: ") + total);
        } else {
            this.$.status.setLabel("");
        }
        if (number !== undefined && number != "unknown" && number != total && finished == false) {
            this.$.cancelButton.show();    
        }
        if (func !== undefined) {
            this.setFuncName( func );
        }
    },
    
    onCancel : function( ) {
        this.log("this.getFuncName(): " + this.getFuncName());
        if (this.getFuncName() !== undefined) {
            this.$.cancelButton.show(); 
            this.$.cancelButton.setActive( true ); 
            this.$.cancelButton.setCaption($L("Cancel (just finishing...)"));
            // a function that binds this to this.foo
            var fn = enyo.bind(this.owner.$.dataManager, this.getFuncName());
            // the value of this.foo(3)
            var value = fn();
        }
    }
});