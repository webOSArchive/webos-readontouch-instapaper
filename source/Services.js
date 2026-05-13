enyo.kind({
    name : "ReadOnTouch.Services",
    kind: "BasicService",
    components : [
        {name: "AppManService", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
        {name: "verifyAccountCall", kind: "WebService", contentType: "application/json; charset=utf-8", onSuccess: "handleVerifyAccountSuccess", onFailure: "handleVerifyAccountFailed"},
        {name: "createAccountCall", kind: "WebService", contentType: "application/json; charset=utf-8", onSuccess: "handleCreateAccountSuccess", onFailure: "handleCreateAccountFailed"},
        /*Modern Auth Services*/
        {name: "getAuthCodeCall", kind: "WebService", contentType: "application/json; charset=utf-8", onSuccess: "handleGetAuthCodeSuccess", onFailure: "handleGetAuthCodeFailed"},
        {name: "checkAuthCodeCall", kind: "WebService", contentType: "application/json; charset=utf-8", onSuccess: "handleCheckAuthCodeSuccess", onFailure: "handleCheckAuthCodeFailed"},
    ],
    
    published: {
        extHandleVerifyAccountSuccess: "",
        extHandleVerifyAccountFailed: "",
        scopeVerifyAccount: "",
        
        extHandleCreateAccountSuccess: "",
        extHandleCreateAccountFailed: "",
        scopeCreateAccount: "",

        extHandleGetAuthCodeSuccess: "",
        extHandleGetAuthCodeFailed: "",
        scopeGetAuthCode: "",

        extHandleCheckAuthCodeSuccess: "",
        extHandleCheckAuthCodeFailed: "",
        scopeCheckAuthCode: "",
    },
    
    verifyAccount : function( username, password, scope, handleSuccess, handleFailed ) {
        // Legacy Read It Later / Pocket direct auth — no longer used.
        // Instapaper auth is handled via the code-based flow in Welcome.js.
        this.error("verifyAccount: not supported — use getAuthCode / checkAuthCode flow");
        if (handleFailed !== undefined && scope !== undefined) {
            var fn = enyo.bind(scope, handleFailed);
            fn("Legacy auth not supported");
        }
        return false;
    },
    
    handleVerifyAccountSuccess : function( a, b ) {
        this.log( a +", " +b);
        if (this.getExtHandleVerifyAccountSuccess() != "") {
            var fn = enyo.bind(this.getScopeVerifyAccount(), this.getExtHandleVerifyAccountSuccess());
            fn();
        } else {
            this.error("no success handler defined!");
        }
    },

    handleVerifyAccountFailed : function(inSender, inResponse, inRequest) {
        this.error("inResponse: " + inResponse);
        if (this.getExtHandleVerifyAccountFailed() != "") {
            var fn = enyo.bind(this.getScopeVerifyAccount(), this.getExtHandleVerifyAccountFailed());
            fn( inResponse );
        } else {
            this.error("no failure handler defined!");
        }
    },
    
    createAccount : function( username, password, scope, handleSuccess, handleFailed ) {
        // Instapaper does not offer public account creation via API.
        this.error("createAccount: not supported — sign up at instapaper.com");
        if (handleFailed !== undefined && scope !== undefined) {
            var fn = enyo.bind(scope, handleFailed);
            fn("Account creation not supported");
        }
        return false;
    },
    
    handleCreateAccountSuccess : function( a, b ) {
        this.log( a +", " +b);
        if (this.getExtHandleCreateAccountSuccess() != "") {
            var fn = enyo.bind(this.getScopeCreateAccount(), this.getExtHandleCreateAccountSuccess());
            fn();
        } else {
            this.error("no success handler defined!");
        }
    },

    handleCreateAccountFailed : function(inSender, inResponse, inRequest) {
        this.error("inResponse: " + inResponse);
        if (this.getExtHandleCreateAccountFailed() != "") {
            var fn = enyo.bind(this.getScopeCreateAccount(), this.getExtHandleCreateAccountFailed());
            fn( inResponse );
        } else {
            this.error("no failure handler defined!");
        }
    },
    
    callAppManService : function( params ) {
        this.$.AppManService.call({target: params});  
    },
  
    /* Modern Auth Functions */
    getAuthCode : function(scope, handleSuccess, handleFailed ) {
        if (handleSuccess !== undefined && handleFailed !== undefined) {
            this.setExtHandleGetAuthCodeSuccess( handleSuccess );
            this.setExtHandleGetAuthCodeFailed( handleFailed );
            this.setScopeGetAuthCode( scope );

            // this.error("Util.encodeString(username): " + Util.encodeString(username));
            // this.error("Util.encodeString(password): " + Util.encodeString(password));

            // this.log("encodeURIComponent(#): " + encodeURIComponent("#"));

            var url = Util.getAuthServiceUrl() + "/get-code.php";
            this.log("url: " + url);
            this.$.getAuthCodeCall.setUrl(encodeURI(url));
            this.$.getAuthCodeCall.call();
            return true;
        }
        this.error("call not valid");
        this.log("END");
        return false;
    },
    
    handleGetAuthCodeSuccess : function( inSender, inResponse ) {
        this.log( inSender +", " +inResponse);
        if (this.getExtHandleGetAuthCodeSuccess() != "") {
            var fn = enyo.bind(this.getScopeGetAuthCode(), this.getExtHandleGetAuthCodeSuccess());
            fn( inResponse );
        } else {
            this.error("no success handler defined!");
        }
    },

    handleGetAuthCodeFailed : function(inSender, inResponse, inRequest) {
        this.error("inResponse: " + inResponse);
        if (this.getExtHandleGetAuthCodeFailed() != "") {
            var fn = enyo.bind(this.getScopeGetAuthCode(), this.getExtHandleGetAuthCodeFailed());
            fn( inResponse );
        } else {
            this.error("no failure handler defined!");
        }
    },

    checkAuthCode : function(authCode, scope, handleSuccess, handleFailed ) {
        if (handleSuccess !== undefined && handleFailed !== undefined) {
            this.setExtHandleCheckAuthCodeSuccess( handleSuccess );
            this.setExtHandleCheckAuthCodeFailed( handleFailed );
            this.setScopeCheckAuthCode( scope );

            var url = Util.getAuthServiceUrl() + "/check-code.php?code=" + authCode;
            this.log("url: " + url);
            this.$.checkAuthCodeCall.setUrl(encodeURI(url));
            this.$.checkAuthCodeCall.call();
            return true;
        }
        this.error("call not valid");
        this.log("END");
        return false;
    },
    
    handleCheckAuthCodeSuccess : function( inSender, inResponse ) {
        this.log( inSender +", " + JSON.stringify(inResponse));
        if (this.getExtHandleCheckAuthCodeSuccess() != "") {
            var fn = enyo.bind(this.getScopeCheckAuthCode(), this.getExtHandleCheckAuthCodeSuccess());
            fn( inResponse );
        } else {
            this.error("no success handler defined!");
        }
        this.log("callback done");
    },

    handleCheckAuthCodeFailed : function(inSender, inResponse, inRequest) {
        this.error("inResponse: " + inResponse);
        if (this.getExtHandleCheckAuthCodeFailed() != "") {
            var fn = enyo.bind(this.getScopeCheckAuthCode(), this.getExtHandleCheckAuthCodeFailed());
            fn( inResponse );
        } else {
            this.error("no failure handler defined!");
        }
    },
    
});
