enyo.kind({
    name: "Welcome",
    kind: enyo.VFlexBox,
    style: "background-color: white;",
    components: [
        {kind: "Toolbar", pack: "center", components: [
            {kind: enyo.HFlexBox, flex: 1, components: [
                {kind: enyo.HtmlContent, content: "<center><table border=0><tr><td height=\"36\" valign=\"bottom\"><img width=\"26\" height=\"26\" border=\"0\" src=\"images/ReadOnTouch-32-r2.png\"></td><td height=\"25\" valign=\"middle\"><b>ReadOnTouch PRO</b>: "+$L("Quick-Start Guide")+"</td></tr></table></center>", style: " text-align: center; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: white; margin-left: 8px; ", flex: 1},
            ]}
        ]},
        /*{kind: "PageHeader", components: [{flex : 1}, {content: ""}, {flex : 1},]},*/
        {kind: "Scroller", flex: 1, components: [
            {kind: "HFlexBox", components: [
                {kind: "Spacer"},
                {kind: "VFlexBox", name: "flexBox", style: (Util.isTablet() == true) ? (Util.isTouchpad() ? "width: 690px;" : "width: 580px;") : ((Util.isPortraitMode() == true) ? "500px" : "300px") , components: [
                    {name: "firstLabel", style: "font-size: 20px; margin: 10px; padding: 0px;", kind: "HtmlContent", onLinkClick: "linkClicked", allowHtml: true, className:"enyo-paragraph"},
                    {name: "rowGroup", kind: "RowGroup", caption: $L("Instapaper Sign-In"), components: [
                         {kind: "RowGroup", components: [
                            {name: "modernAuthUrl", hint: $L("Auth URL"), kind: "Input", alwaysLooksFocused: false, disabled: true},
                         ]}, 
                         {kind: "RowGroup", components: [
                            {name: "modernAuthCode", hint: $L("Auth Code"), kind: "Input", alwaysLooksFocused: true, disabled: true, autoCapitalize: "uppercase"},
                         ]},
                         {kind: "HFlexBox", components: [
                            {name: "modernAuthButton", caption: $L("Check now"), kind: "ActivityButton", onclick: "checkModernAuthDone", className: "enyo-button", flex: 1},
                         ]},
                    ]},
                ]},
                {kind: "Spacer"},
              ]},
          ]},
        /* Vintage Auth Removed 2023-09-07
        {kind: "Scroller", flex: 1, components: [
            {kind: "HFlexBox", components: [
                {kind: "Spacer"},
                {kind: "VFlexBox", name: "flexBox", style: (Util.isTablet() == true) ? (Util.isTouchpad() ? "width: 690px;" : "width: 580px;") : ((Util.isPortraitMode() == true) ? "500px" : "300px") , components: [
                    {name: "firstLabel", style: "font-size: 20px; margin: 10px; padding: 0px;", kind: "HtmlContent", onLinkClick: "linkClicked", allowHtml: true, className:"enyo-paragraph"},
                    {name: "rowGroup", kind: "RowGroup", caption: $L("Pocket / ReadItLater.com - Account"), components: [
                         {kind: "RowGroup", components: [
                            {name: "username", hint: $L("Enter your username"), kind: "Input", alwaysLooksFocused: true, autoCapitalize: "uppercase", onkeypress: "keyPressedInUser", onkeyup: "keyUpInUser"},
                         ]},
                         {kind: "RowGroup", components: [
                            {name: "password", hint: $L("Enter your password"), kind: "PasswordInput", alwaysLooksFocused: true, onkeypress: "keyPressedInPassword", onkeyup: "keyUpInPassword"},
                         ]},
                         {kind: "HFlexBox", components: [
                            {name: "createButton", caption: $L("Create New Account"), kind: "ActivityButton", onclick: "createAccount", className: "enyo-button", flex: 1},
                            {name: "verifyButton", caption: $L("Verify!"), kind: "ActivityButton", onclick: "verifyAccount", className: "enyo-button-affirmative", flex: 1},
                         ]},
                    ]},
                ]},
                {kind: "Spacer"},
              ]},
          ]},
        */
        {kind: "Toolbar", components: [
            // The main sign-in CTA. Labeled "Verify" during the sign-in flow so it
            // matches the "press Verify" instruction on the app + broker web page;
            // reset to "Ok - let's start!" in the already-signed-in / quick-guide
            // paths (see rendered / startAsQuickGuideOnly), where "Verify" is wrong.
            {name: "saveButton", kind: "Button",
                content: $L("Verify"), onclick: "doneClick"},
        ]},
        {kind: "ModalDialog", name: "credDialog", caption: $L("Attention"), components:[
             {content: $L("You have to enter an username and a password in order to be able to create a new Pocket account!"), className: "enyo-paragraph"},
             {layoutKind: "HFlexLayout", components: [
                 {kind: "Button", caption: $L("Ok"), flex: 1, onclick: "closeCredDialog"},
             ]}
        ]},
        {kind: "ModalDialog", name: "wrongUserDialog", caption: $L("Error"), components:[
             {content: $L("The entered username already exists! Please try another one."), className: "enyo-paragraph"},
             {layoutKind: "HFlexLayout", components: [
                 {kind: "Button", caption: $L("Ok"), flex: 1, onclick: "closeWrongUserDialog"},
             ]}
        ]},
    ],

    published: {
        onlyQuickGuide: false,
    },

    // Brokered sign-in state (mirrors boxapp/.../views/login.js):
    //   _authCode    – the activation code the broker minted for us
    //   _pollTimer   – setInterval handle for background polling
    //   _pollMs      – how often to poll (from the broker's pollSeconds)
    //   _authDone    – set once tokens land, so a late poll can't re-fire
    //   _manualCheck – true while handling a user's "Verify" tap (so only then do
    //                  we surface "not complete yet"/error banners; the silent
    //                  background poll stays quiet)
    create : function() {
        this.inherited(arguments);
        this._authCode    = "";
        this._pollTimer   = null;
        this._pollMs      = 1500;   // poll aggressively so sign-in is detected fast
        this._authDone    = false;
        this._manualCheck = false;
    },

    rendered : function( ) {
        this.inherited(arguments);
        this.log("START");
        this.setOnlyQuickGuide( false );
        this.$.saveButton.setDisabled( true );
        var content = this.getQuickStartGuide();
        content += "<br><b><h4>"+$L("Important:")+"</h4></b>"+$L("To use this app you need a <b>free</b>")+" <a href=\"http://www.instapaper.com/\">Instapaper</a>"+$L(" account.")+"<br/> ";
        //content += $L("If you already have an account please enter your credentials below. If you don't have an account then you can signup now to get one.");
        content += $L("This app uses Instapaper as its reading list service. Sign-in requires a web browser on a <b>modern computer</b>: go to the address shown below, enter the code displayed here, and log in with your Instapaper username and password. This app checks automatically every couple of seconds; once it detects your sign-in, press the green <b>Verify</b> button at the bottom to continue. If it isn't detected, press <b>Check now</b>.");
        this.$.firstLabel.setContent( content );

        if (localStorage.getItem("accountVerified")+"" == "false") {
            this.$.saveButton.setContent($L("Verify"));   // sign-in flow: CTA is "Verify"
            this.getModernAuthCode();
        } else {
            this.$.modernAuthButton.setCaption($L("Connected!"));
            this.$.saveButton.setContent($L("Ok - let's start!"));   // already signed in
            Util.getSettings( true );
            this.$.saveButton.setDisabled( false );
        }
        this.log("END");
    },

    getModernAuthCode : function() {
        this.log("START MODERN AUTH");
        // Cancel any poll left over from a previous visit and reset sign-in state.
        this._stopAuthPolling();
        this._authCode = "";
        this._authDone = false;
        // remove everything from local storage
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.removeItem("accountVerified");
        this.owner.$.myservices.getAuthCode(this.owner.$.welcomePane, "grabGetAuthCodeSuccess", "grabGetAuthCodeFailed");
    },

    grabGetAuthCodeSuccess : function( response ) {
        if (!response || !response.code || !response.useUrl) {
            this.error("Auth response is not as expected!");
            this.grabGetAuthCodeFailed (response);
        } else {
            this.log("Auth response looks good...");
            this.log("response: " + JSON.stringify(response) );
            this.log("use code: " + response.code);
            this.log("use URL: " + response.useUrl);
            this.$.modernAuthUrl.setValue("Visit " + response.useUrl + " on your PC");
            this.$.modernAuthCode.setValue("Enter code: " + response.code);

            // Remember the code, then poll in the background like the Box app does
            // so the user shouldn't have to press anything. We poll faster than the
            // broker's suggested pollSeconds (3s) — sign-in should feel instant.
            this._authCode = response.code;
            this._pollMs   = 1500;
            this._authDone = false;
            this._startAuthPolling();
            this.log("Done parsing auth response; polling every " + this._pollMs + "ms");
        }
    },
    
    grabGetAuthCodeFailed : function( response ) {
        this.error("START: " + response);
        console.log("Couldn't get auth code from service!");
        enyo.windows.addBannerMessage($L("Could not connect to auth service!"),"{}","images/ReadOnTouch-24.png");
        this.$.modernAuthUrl.setValue("Auth service connect failure, check connectivity and restart app!");
        this.$.modernAuthCode.setActive( false );
        // this.$.verifyButton.setClassName("enyo-button-negative");
        this.owner.showFeedFailurePopup( response );
        this.error("END");
    },

    // User tapped "Verify" — an explicit, immediate check (banners allowed).
    checkModernAuthDone : function() {
        this.log("VERIFY MODERN AUTH (manual)");
        this._manualCheck = true;
        this.$.modernAuthButton.setActive( true );
        this._doCheck();
    },

    // ── Background polling (mirrors boxapp login.js _startPolling/_poll) ──────

    _startAuthPolling : function() {
        this._stopAuthPolling();
        this._pollTimer = setInterval(enyo.bind(this, "_pollAuth"), this._pollMs || 3000);
    },

    _stopAuthPolling : function() {
        if (this._pollTimer) {
            clearInterval(this._pollTimer);
            this._pollTimer = null;
        }
    },

    // A silent, automatic check — no banners unless the user asked (see flags).
    _pollAuth : function() {
        if (this._authDone) { this._stopAuthPolling(); return; }
        this._manualCheck = false;
        this._doCheck();
    },

    // Ask the broker whether the user has finished signing in on their PC.
    _doCheck : function() {
        var code = this._authCode;
        if (!code) {
            // Fallback: recover the code from the on-screen field.
            code = (this.$.modernAuthCode.getValue() || "").replace("Enter code: ", "");
        }
        if (!code) { this.log("no auth code to check yet"); return; }
        this.owner.$.myservices.checkAuthCode(code, this.owner.$.welcomePane, "grabGetAuthDoneSuccess", "grabGetAuthDoneFailed");
    },

    grabGetAuthDoneSuccess : function( response ) {
        this.log("START " + JSON.stringify(response) );
        if (response.username && response.oauth_token && response.oauth_token_secret) {
            this.log("login success for user: " + response.username);

            // Tokens are here — stop the background poll so a late tick can't re-fire.
            this._authDone = true;
            this._stopAuthPolling();

            // delete existing items from storage (maybe from previously installations)
            localStorage.clear();
            localStorage.removeItem("username");
            localStorage.removeItem("password");
            localStorage.removeItem("tokenSecret");
            localStorage.removeItem("accountVerified");
            localStorage.removeItem("lastVersion");

            // put success into local storage
            localStorage.setItem("username", response.username);
            localStorage.setItem("password", response.oauth_token);         // oauth_token
            localStorage.setItem("tokenSecret", response.oauth_token_secret); // oauth_token_secret
            localStorage.setItem("accountVerified", true);
            var appinfo = enyo.fetchAppInfo();
            localStorage.setItem("lastVersion", appinfo.version);
            this.$.modernAuthButton.setCaption($L("Connected!"));
            this.$.modernAuthButton.setDisabled( true );

            Util.getSettings( true );
            this.$.saveButton.setDisabled( false );
            // Make the auto-detected sign-in visible and point at the CTA.
            enyo.windows.addBannerMessage($L("Signed in! Press Verify to continue."),"{}","images/ReadOnTouch-24.png");
            this.log("END");
        } else {
            this.log("remote sign-in not complete yet — waiting for user to sign in on PC");
            // The background poll runs silently; only nag if the user pressed Verify.
            if (this._manualCheck) {
                enyo.windows.addBannerMessage($L("PC sign-in not complete yet!"),"{}","images/ReadOnTouch-24.png");
            }
        }
        this.$.modernAuthButton.setActive( false );
    },
    
    grabGetAuthDoneFailed : function( response ) {
        this.error("auth failed response: " + response);
        this.$.modernAuthButton.setActive( false );

        // The broker replies 404 when it no longer knows this code — it expired or
        // was already picked up. There's nothing to keep polling for; the user
        // needs a fresh code (re-open the sign-in screen / restart the app).
        var status = ("" + response).substr(0, 3);
        if (status == "404") {
            this._stopAuthPolling();
            this._authCode = "";
            if (this._manualCheck) {
                enyo.windows.addBannerMessage($L("This sign-in code expired. Please restart the app to get a new one."),"{}","images/ReadOnTouch-24.png");
            }
            this.error("END (code expired)");
            return;
        }

        // Anything else is treated as transient (e.g. a network blip): let the
        // background poll keep trying, and only bother the user if they tapped Verify.
        if (this._manualCheck) {
            this.owner.showFeedFailurePopup( response );
        }
        this.error("END");
    },
    
    startAsQuickGuideOnly : function( ) {
        this.setOnlyQuickGuide( true );
        this.$.saveButton.setDisabled( false );
        this.$.saveButton.setContent($L("Ok - let's start!"));   // not a sign-in flow
        var content = this.getQuickStartGuide();
        this.$.firstLabel.setContent( content );
        this.$.rowGroup.hide();
    },
    
    getQuickStartGuide : function( ) {
        var greetings = "<center><h3><b>"+$L("Thank you")+"</b>"+$L(" for purchasing this app!")+"</h3></center>";
        greetings += "";
        greetings += $L("I want to give you a short introduction to the app.")+" ";
        greetings += $L("Please keep in mind that I develop this app in my spare time, so this product may not be perfect. ");
        greetings += $L("Before giving my app a bad rating I would be very happy if you contact me and tell me what is wrong in your opinion. For contact details just have a look at the Help-Dialog. ");
        greetings += $L("I'm very interested in any kind of feedback!");
        greetings += "";
        greetings += "<br><b><h4>"+$L("What is ReadOnTouch PRO?")+"</h4></b>"+$L("With this application you are able to <b>view</b> (saved) <b>websites</b> on- and <b>offline</b>.")+" ";
        greetings += $L("All your stored websites can be found in the \"Article-List\" which is the left panel in the main screen. ");
        greetings += $L("You can filter them by unread or read state and sort them by the time beeing last updated.")+" <!--"+$L("You are also able to search your current list with keywords (looking for title and url), therefore you the search-field at top of the \"Article-List\".")+"--> ";
        greetings += $L("The right panel let you view your articles. It features a so called \"Article-View\" which is a mobile-optimized version of the website and the normal \"Web-View\" (only available when your device is online).")+" ";
        greetings += "";
        greetings += "";
        if (Util.isWebOS()) {
            greetings += "<br><b><h4>"+$L("How to use it:")+"</h4></b>"+$L("There are several ways to put Articles in your reading list. I will state the most common use-cases below:")+" <br> <table border=\"0\">";
            greetings += "<tr><td valign=\"top\">1.</td><td>"+$L("Install a plugin for your favorite desktop-browser and add every page you want on your computer")+" (<a href=\"http://readitlaterlist.com/apps/\">"+$L("link")+"</a>).</td></tr>";
            greetings += "<tr><td valign=\"top\">2.</td><td>"+$L("Use the famous")+" <a href=\"http://developer.palm.com/appredirect/?packageid=com.maklesoft.browser\">"+$L("AdvancedBrowser")+"</a> "+$L("(minimum version 1.2.6) and send links directly to <b>ReadOnTouch PRO</b>!")+"</td></tr>";
            greetings += "<tr><td valign=\"top\">3.</td><td>"+$L("Install my patch via Preware to your HP Touchpad (just search for \"ReadOnTouch\" in Preware). After that your standard browser can share links to <b>ReadOnTouch PRO</b>.")+"</td></tr>";
            greetings += "<tr><td valign=\"top\">4.</td><td>"+$L("Add it via the \"+\"-Icon in the \"Article-List\". You can enter it manually or paste it from another app!")+"</td></tr></table>";
        } else if (Util.isPlaybook()){
            greetings += "<br><b><h4>"+$L("How to use it:")+"</h4></b>"+$L("There are several ways to put Articles in your reading list. I will state the most common use-cases below:")+" <br> <table border=\"0\">";
            greetings += "<tr><td valign=\"top\">1.</td><td>"+$L("Install a plugin for your favorite desktop-browser and add every page you want on your computer")+" (<a href=\"http://readitlaterlist.com/apps/\">"+$L("link")+"</a>).</td></tr>";
            greetings += "<tr><td valign=\"top\">2.</td><td>"+$L("Save articles using the Instapaper bookmarklet or browser extension on your computer, then sync on this device.")+"</td></tr>";
            greetings += "<tr><td valign=\"top\">3.</td><td>"+$L("Use")+" <a href=\"http://appworld.blackberry.com/webstore/content/57703/\">"+$L("Newspile")+"</a>! "+$L("A fantastic Google Reader Client for the BlackBerry PlayBook, with the ability to share articles to Pocket!")+"</td></tr>";
            greetings += "<tr><td valign=\"top\">4.</td><td>"+$L("Add it via the \"+\"-Icon in the \"Article-List\". You can enter it manually or paste it from another app!")+"</td></tr></table>";
        }
        greetings += "";
        greetings += "";
        greetings += "<b><h4>"+$L("Known limitations:")+"</h4></b>"+$L("Because this app is a client of the Pocket-Webservice, it has some known limitations that you might want to know:")+" <br> <table border=\"0\">";
        // greetings += "<tr><td valign=\"top\">1.</td><td>Images from the articles are not shown in the Article-View because of a known bug at the Pocket-API.</td></tr>";
        greetings += "<tr><td valign=\"top\">1.</td><td>"+$L("It is not possible to delete articles from your list of already read articles. So if you want to delete an article you have to go to GetPocket.com and do it on their page.")+" ";
        greetings += $L("Anyway, you don't need to because I've implemented a feature that allows you to sync only unread articles.")+"</td></tr></table>";
        greetings += "";
        greetings += "<b><h4>"+$L("Notice:")+"</h4></b>"+$L("To read this Quick-Start Guide again, just go to the App-Menu and select")+" \""+$L("Quick-Start Guide")+"\".";
        greetings += "";
        return greetings;
    },
    
    /* Vintage Auth removed 2023-09-07
    verifyAccount : function( ) {
        this.log("START");
        // if (this.passwordCheckOkay() && this.$.username.getValue().trim() != "") {
        if (this.$.password.getValue().trim() != "" && this.$.username.getValue().trim() != "") {
            this.$.verifyButton.setActive( true );
            this.owner.$.myservices.verifyAccount( this.$.username.getValue(), this.$.password.getValue(), this.owner.$.welcomePane, "grabVerifyAccountSuccess", "grabVerifyAccountFailed" );
        }
        this.log("END");
    },
    
    passwordCheckOkay : function() {
        if (this.$.password.getValue().indexOf("#") != -1 || this.$.password.getValue().indexOf("+") != -1 || this.$.password.getValue().indexOf("$") != -1 || this.$.password.getValue().indexOf("&") != -1) {
            // this character is not allowed for RIL API
            this.owner.showFailurePopup2($L("The '#+$&' characters are currently not supported for external ReadItLater applications! Please change you password."), $L("Password Failure!"));
            return false;
        }
        return true;
    },
    */
    
    doneClick : function( ) {
        this.log("START");
        this._stopAuthPolling();   // leaving the sign-in screen — no more polling
        if (this.getOnlyQuickGuide() == true) {
            this.setOnlyQuickGuide( false );
            this.owner.$.pane.selectViewByName("feedSlidingPane");
        } else {
            this.owner.$.pane.selectViewByName("feedSlidingPane");
            this.owner.normalStart();
        }
        this.log("END");
    },
    
    linkClicked: function (inSender, inEvent) {
        this.log("inEvent: " + inEvent);
        // this.owner.$.myservices.callAppManService(inEvent);   
        Platform.browser( inEvent, this )();
    },
    
    /* Vintage Auth remove 2023-09-07
    grabVerifyAccountSuccess : function( ) {
        this.log("START");
        // this.$.verifyButton.className("enyo-button-affirmative");
        this.$.verifyButton.setCaption($L("Connected!"));
        // this.$.verifyButton.setStyle("background-color: green; color: #FFFFFF; font-weight:bold;");
        this.$.verifyButton.setActive( false );
        this.$.saveButton.setDisabled( false );
        // this.owner.$.preferences.saveData( this.$.username.getValue(), this.$.password.getValue() );
        
        // delete existing items from storage (maybe from previously installations)
        localStorage.clear();
        
        // put success into local storage
        localStorage.removeItem("username");
        localStorage.setItem("username", this.$.username.getValue() );
        localStorage.removeItem("password");
        localStorage.setItem("password", this.$.password.getValue() );
        localStorage.removeItem("accountVerified");
        localStorage.setItem("accountVerified", true);
        var appinfo = enyo.fetchAppInfo();
        localStorage.removeItem("lastVersion");
        localStorage.setItem("lastVersion", appinfo.version);
        // this.owner.$.preferences.writeDefaultValues();
        
        Util.getSettings( true );
        
        this.log("END");
    },
    
    grabVerifyAccountFailed : function( response ) {
        this.error("START: " + response);
        // remove everything from local storage
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.removeItem("accountVerified");
        
        this.$.verifyButton.setActive( false );
        // this.$.verifyButton.setClassName("enyo-button-negative");
        this.owner.showFeedFailurePopup( response );
        this.error("END");
    },
    */
    
    resetDialog : function( ) {
        this.$.modernAuthButton.setCaption($L("Check now"));
        this.$.modernAuthButton.setActive( false );
        this.$.saveButton.setDisabled( true );
    },

    /* Vintage Auth removed 2023-09-07
    createAccount: function() {
        if (this.$.username.getValue().trim() != "" && this.$.password.getValue().trim() != "") {
            if (this.passwordCheckOkay()) {
                this.$.createButton.setActive( true );
                this.owner.$.myservices.createAccount( this.$.username.getValue(), this.$.password.getValue(), this.owner.$.welcomePane, "grabCreateAccountSuccess", "grabCreateAccountFailed" );
            }
        } else {
            this.$.credDialog.openAtCenter();
        }
        // this.linkClicked( "Test", "http://getpocket.com/signup.php");  
    },
    
    grabCreateAccountSuccess : function( ) {
        this.log("START");
        // this.$.verifyButton.className("enyo-button-affirmative");
        this.$.verifyButton.setCaption($L("Connected!"));
        // this.$.verifyButton.setStyle("background-color: green; color: #FFFFFF; font-weight:bold;");
        this.$.verifyButton.setActive( false );
        this.$.createButton.setActive( false );
        this.$.saveButton.setDisabled( false );
        // this.owner.$.preferences.saveData( this.$.username.getValue(), this.$.password.getValue() );
        
        // delete existing items from storage (maybe from previously installations)
        localStorage.clear();
        
        // put success into local storage
        localStorage.removeItem("username");
        localStorage.setItem("username", this.$.username.getValue() );
        localStorage.removeItem("password");
        localStorage.setItem("password", this.$.password.getValue() );
        localStorage.removeItem("accountVerified");
        localStorage.setItem("accountVerified", true);
        var appinfo = enyo.fetchAppInfo();
        localStorage.removeItem("lastVersion");
        localStorage.setItem("lastVersion", appinfo.version);
        // this.owner.$.preferences.writeDefaultValues();
        
        Util.getSettings( true );
        
        this.log("END");
    },
    
    grabCreateAccountFailed : function( response ) {
        this.error("START: " + JSON.stringify(response));
        // remove everything from local storage
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.removeItem("accountVerified");
        
        this.$.createButton.setActive( false );
        // this.$.verifyButton.setClassName("enyo-button-negative");
        if (response.substr(0,3) == "401") {
            this.$.wrongUserDialog.openAtCenter();
        } else {
            this.owner.showFeedFailurePopup( response );
        }
        this.error("END");
    },
   
    keyPressedInUser : function( inSender, inEvent ) {
        this.log( "keyCode: " + inEvent.keyCode );
        if (inEvent.keyCode == 13) {
            this.$.password.forceFocusEnableKeyboard();  
        }
    },
    
    keyUpInUser : function( inSender, inEvent ) {
        this.log( "keyCode: " + inEvent.keyCode );
        if (!Util.isTablet() && inEvent.keyCode == 13) {
            this.$.password.forceFocusEnableKeyboard();  
        }
    },
    
    keyPressedInPassword : function( inSender, inEvent ) {
        this.log( "keyCode: " + inEvent.keyCode );
        if (inEvent.keyCode == 13) {
            this.verifyAccount();  
        }
    },
    
    keyUpInPassword : function( inSender, inEvent ) {
        this.log( "keyCode: " + inEvent.keyCode );
        if (!Util.isTablet() && inEvent.keyCode == 13) {
            this.verifyAccount();  
        }
    },

    */

    closeCredDialog : function() {
        this.$.credDialog.close();  
    },
    
    closeWrongUserDialog : function() {
        this.$.wrongUserDialog.close();  
    },
    
    
});