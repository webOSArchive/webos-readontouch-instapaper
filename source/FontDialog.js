enyo.kind({
    name: "ReadOnTouch.FontDialog",
    kind: enyo.ModalDialog,
    /*height: "470px",*/
    width: (Util.isTablet() ? "380px" : "320px"),
    caption: $L("Article-View Settings"),
    components: [
        {kind: "ApplicationEvents", onWindowHidden: "close"},
        {kind: enyo.Scroller, flex: 1, height: "390px", autoVertical: false, horizontal: false, components: [
            {kind: "RowGroup", components: [
                {kind: "LabeledContainer", label: $L("Font size:"), components: [
                    {name: "fontSizeSelector", kind: "CustomListSelector", value: 1, onChange: "changedSomething", style: "width: 120px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 16px; margin-left: 10px; ", items: [
                        {caption: $L("Very Small"), value: "13px"},
                        {caption: $L("Small"), value: "16px"},
                        {caption: $L("Medium"), value: "19px"},
                        {caption: $L("Large"), value: "22px"},
                        {caption: $L("Very Large"), value: "25px"},
                    ]},
                ]},           
             ]},
            {kind: "RowGroup", components: [
                {kind: "LabeledContainer", label: $L("Line spacing:"), components: [
                    {name: "lineSpacingSelector", kind: "CustomListSelector", value: 1, onChange: "changedSomething", style: "width: 120px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 16px; margin-left: 10px; ", items: [
                        {caption: $L("Normal"), value: "1.25"},
                        {caption: $L("Medium"), value: "1.5"},
                        {caption: $L("Large"), value: "1.75"},
                    ]},
                ]},           
             ]},
             {kind: "RowGroup", components: [
                {kind: "LabeledContainer", label: $L("Font family:"), components: [
                    {name: "fontFamilySelector", kind: "CustomListSelector", value: 1, onChange: "changedSomething", style: "width: 120px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 16px; margin-left: 10px; ", items: [
                        (Util.isWebOS() ? {caption: "Prelude", value: "Prelude"} : {caption: "DejaVu Serif", value: "DejaVu Serif"}),
                        {caption: "Arial", value: "Arial"},
                        {caption: "Verdana", value: "Verdana"},
                        {caption: "Times", value: "Times"},
                    ]},
                ]},           
             ]},
             {kind: "RowGroup", components: [
                {kind: "LabeledContainer", label: $L("Theme:"), components: [
                    {name: "lightSelector", kind: "CustomListSelector", value: 1, onChange: "changedSomething", style: "width: 120px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 16px; margin-left: 10px; ", items: [
                        {caption: $L("Normal "), value: "Day"},
                        {caption: $L("Inverted"), value: "Night"},
                        {caption: $L("Paperback"), value: "Paperback"},
                        {caption: $L("Green/Black"), value: "green"},
                        {caption: $L("Amber/Black"), value: "amber"},
                        
                    ]},
                ]},           
             ]},
             {kind: "RowGroup", components: [
                 {kind: "LabeledContainer", label: $L("Fixed width"), components: [
                     {kind: "CheckBox", name: "fixedWidth",onChange: "changedSomething"}
                 ]},
             ]},
             
            {layoutKind: "HFlexLayout", components: [
                {name: "addButton", kind: "ActivityButton", caption: $L("Done"), flex: 1, className: "enyo-button-affirmative", onclick: "onDone"},
            ]}
        ]},
    ],
    
    rendered : function() {
        this.inherited(arguments);
        
        // put values from storage in ui
        this.$.fontSizeSelector.setValue( Util.getSettings().fontsize );
        this.$.lineSpacingSelector.setValue( Util.getSettings().lineSpacing );
        this.$.fontFamilySelector.setValue( Util.getSettings().fontfamily );
        this.$.lightSelector.setValue( Util.getSettings().theme );
        this.$.fixedWidth.setChecked( Util.getSettings().fixedWidth );
        
    },
    
    changedSomething : function( ) {
        // var $article_container = $('#article_container');
        // $($article_container).css("font-size", this.$.fontSizeSelector.getValue() );    
        // $($article_container).css("font-family", this.$.fontFamilySelector.getValue() );    
        // $($article_container).css("line-height", this.$.lineSpacingSelector.getValue() );    
// 
        // if (this.$.lightSelector.getValue() == "Day") {
            // this.owner.$.scrollerArticle.applyStyle( "background-color", "#ffffff" )
            // this.owner.$.currentArticleView.applyStyle( "background-color", "#ffffff" )
            // $($article_container).css( "background-color", "#ffffff" );
            // $($article_container).css( "color", "#000000" );
        // } else if (this.$.lightSelector.getValue() == "Night") {
            // this.owner.$.scrollerArticle.applyStyle( "background-color", "#000000" )
            // this.owner.$.currentArticleView.applyStyle( "background-color", "#000000" )
            // $($article_container).css( "background-color", "#000000" );
            // $($article_container).css( "color", "#ffffff" );
        // } else if (this.$.lightSelector.getValue() == "Paperback") {
            // this.owner.$.scrollerArticle.applyStyle( "background-color", "#ddd2b2" )
            // this.owner.$.currentArticleView.applyStyle( "background-color", "#ddd2b2" )
            // $($article_container).css( "background-color", "#ddd2b2" );
            // $($article_container).css( "color", "#161616" );
        // } else if (this.$.lightSelector.getValue() == "green") {
            // this.owner.$.scrollerArticle.applyStyle( "background-color", "#000000 " )
            // this.owner.$.currentArticleView.applyStyle( "background-color", "#000000 " )
            // $($article_container).css( "background-color", "#000000 " );
            // $($article_container).css( "color", "#4dee28" );
        // } else if (this.$.lightSelector.getValue() == "amber") {
            // this.owner.$.scrollerArticle.applyStyle( "background-color", "#000000 " )
            // this.owner.$.currentArticleView.applyStyle( "background-color", "#000000 " )
            // $($article_container).css( "background-color", "#000000 " );
            // $($article_container).css( "color", "#ffcc44" );
        // }
// 
        // if (this.$.fixedWidth.getChecked() == true) {
            // $($article_container).css( "width", this.owner.getArticleMaxWidth() );    
        // } else {
            // $($article_container).css( "width", "95%" );    
        // } 
        
        // get values from ui
        var fontsize = this.$.fontSizeSelector.getValue( );
        var lineSpacing = this.$.lineSpacingSelector.getValue( );
        var fontfamily = this.$.fontFamilySelector.getValue( );
        var theme = this.$.lightSelector.getValue( );
        var fixedWidth = this.$.fixedWidth.getChecked( );
 
        // store values to storage
        localStorage.setItem( "fontsize", fontsize );
        localStorage.setItem( "lineSpacing", lineSpacing );
        localStorage.setItem( "fontfamily", fontfamily );
        localStorage.setItem( "theme", theme );
        localStorage.setItem( "fixedWidth", fixedWidth );
        Util.getSettings( true );

        this.owner.formatArticle();        

    },
    
    onDone : function() {

        // get values from ui
        var fontsize = this.$.fontSizeSelector.getValue( );
        var lineSpacing = this.$.lineSpacingSelector.getValue( );
        var fontfamily = this.$.fontFamilySelector.getValue( );
        var theme = this.$.lightSelector.getValue( );
        var fixedWidth = this.$.fixedWidth.getChecked( );
 
        // store values to storage
        localStorage.setItem( "fontsize", fontsize );
        localStorage.setItem( "lineSpacing", lineSpacing );
        localStorage.setItem( "fontfamily", fontfamily );
        localStorage.setItem( "theme", theme );
        localStorage.setItem( "fixedWidth", fixedWidth );
        Util.getSettings( true );
 
        this.close();
    },
    
    
});