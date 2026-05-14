

var Util = (function() {
    
    return {
        
        platform: "",
        deviceName: "",
        screenWidth: 0,
        screenHeight: 0,
        settings: null,
        touchpad: null,
        touchpadOrPre3: null,
        pre3: null,
        playbook: null,
        webOS: null,
        blackberry: null,
        tablet: null,
        browser: null,
    
        isWebOS : function( ) {
            // console.log("this.platform: " + this.platform);
            if (this.webOS == null) {
                this.webOS = Platform.isWebOS();
                console.log("this.webOS: " + this.webOS);
            }
            return this.webOS;
        },
        
        isBlackBerry : function( ) {
            // console.log("this.platform: " + this.platform);
            if (this.blackberry == null) {
                this.blackberry = Platform.isBlackBerry();
                console.log("this.blackberry: " + this.blackberry);
            }
            return this.blackberry;
        },
        
        isTouchpad : function() {
            //console.log("*** device: " + this.deviceName);
            if (this.touchpad == null) {
                this.touchpad = Platform.isWebOS() && this.deviceName == "TouchPad" || this.deviceName == "Emulator";
                console.log("this.touchpad: " + this.touchpad);
            }
            return this.touchpad;
        },
        
        isTouchpadOrPre3 : function() {
            // console.log("deviceName: " + this.deviceName);
            if (this.touchpadOrPre3 == null) {
                this.touchpadOrPre3 = Platform.isWebOS() && this.deviceName == "TouchPad" || this.deviceName == "Pre3" || this.deviceName == "Emulator" || this.deviceName == "TouchPad Go";
                console.log("this.touchpadOrPre3: " + this.touchpadOrPre3);
            }
            return this.touchpadOrPre3;
        },
        
        isPre3 : function() {
            // console.log("deviceName: " + this.deviceName);
            if (this.pre3 == null) {
                this.pre3 = Platform.isWebOS() && this.deviceName == "Pre3" || this.deviceName == "Emulator";
                console.log("this.pre3: " + this.pre3);
            }
            return this.pre3;
        },
        
        isPlaybook : function() {
            if (this.playbook == null) {
                this.playbook = Platform.isBlackBerry() && this.deviceName == "playbook";
                console.log("this.playbook: " + this.playbook);
            }
            return this.playbook;
        },
        
        isTablet: function( ) {
            if (this.tablet == null) {
                this.tablet = Util.isTouchpad() || Util.isPlaybook() || Util.isBrowser();
                console.log("this.tablet: " + this.tablet);
            }
            return this.tablet;
        },
        
        isBrowser : function( ) {
            if (this.browser == null) {
                this.browser = Platform.isBrowser();
                console.log("this.browser: " + this.browser);
            }
            return this.browser;
        },
        
        isDebug : function( ) {
            if (this.getSettings().debugOutput == true || this.getSettings().debugOutput == "true") {
                return true;
            }
            return false;
        }, 
        
        getElementFromArrayById : function( myArray, id ) {
            // console.log("myArray.length: " + myArray.length);
            // console.log("id: " + id);
            for (key in myArray) {
                var obj = myArray[key];
                // console.log("obj.item_id: " + obj.item_id);
                if (obj.item_id == id) {
                    // console.log(" FOUND IT!!!");
                    return obj;
                }
            }
            return null;
        },
        
        getElementFromArray : function( myArray, id ) {
            // console.log("myArray.length: " + myArray.length);
            // console.log("id: " + id);
            for (key in myArray) {
                var obj = myArray[key];
                // console.log("obj.item_id: " + obj.item_id);
                if (obj == id) {
                    // console.log(" FOUND IT!!!");
                    return obj;
                }
            }
            return null;
        },
        
        isURLinArray : function( myArray, url ) {
            // console.log("myArray.length: " + myArray.length);
            // console.log("id: " + id);
            for (key in myArray) {
                var obj = myArray[key];
                // console.log("obj.item_id: " + obj.item_id);
                if (obj == url) {
                    // console.log(" FOUND IT!!!");
                    return true;
                }
            }
            return false;
        },
        
        getElementFromArrayByFilename : function( myArray, filename ) {
            // console.log("myArray.length: " + myArray.length);
            // console.log("id: " + id);
            for (key in myArray) {
                var obj = myArray[key];
                if (obj.targetFilename == filename) {
                    return obj;
                }
            }
            return null;
        },
        
        days_between : function (date1, date2) {
            // The number of milliseconds in one day
            var ONE_DAY = 1000 * 60 * 60 * 24;
        
            // Convert both dates to milliseconds
            var date1_ms = date1.getTime();
            var date2_ms = date2.getTime();
        
            // Calculate the difference in milliseconds
            var difference_ms = Math.abs(date1_ms - date2_ms);
            
            // Convert back to days and return
            return Math.round(difference_ms/ONE_DAY);
        },
    
        hours_between : function (date1, date2) {
            // The number of milliseconds in one day
            var ONE_DAY_IN_HOURS = 1000 * 60 * 60;
        
            // Convert both dates to milliseconds
            var date1_ms = date1.getTime();
            var date2_ms = date2.getTime();
        
            // Calculate the difference in milliseconds
            var difference_ms = Math.abs(date1_ms - date2_ms);
            
            // Convert back to days and return
            return Math.round(difference_ms/ONE_DAY_IN_HOURS);
        },
        
        minutes_between : function (date1, date2) {
            // The number of milliseconds in one day
            var ONE_DAY_IN_MINUTES = 1000 * 60;
        
            // Convert both dates to milliseconds
            var date1_ms = date1.getTime();
            var date2_ms = date2.getTime();
        
            // Calculate the difference in milliseconds
            var difference_ms = Math.abs(date1_ms - date2_ms);
            
            // Convert back to days and return
            return Math.round(difference_ms/ONE_DAY_IN_MINUTES);
        },
        
        seconds_between : function (date1, date2) {
            
            if (date1 === undefined || date2 === undefined) {
                return 0;
            }
            
            // The number of milliseconds in one day
            var ONE_DAY_IN_SECONDS = 1000;
        
            // Convert both dates to milliseconds
            var date1_ms = date1.getTime();
            var date2_ms = date2.getTime();
        
            // Calculate the difference in milliseconds
            var difference_ms = Math.abs(date1_ms - date2_ms);
            
            // Convert back to days and return
            return Math.round(difference_ms/ONE_DAY_IN_SECONDS);
        },
        
        ms_between : function (date1, date2) {
            
            if (date1 === undefined || date2 === undefined) {
                return 0;
            }
            
            // Convert both dates to milliseconds
            var date1_ms = date1.getTime();
            var date2_ms = date2.getTime();
        
            // Calculate the difference in milliseconds
            var difference_ms = Math.abs(date1_ms - date2_ms);
            
            // Convert back to days and return
            return difference_ms;
        },
        
        getHostname : function ( str ) {
            // console.log("str: " + str);
            var hostname = "";
            if (str != null) {
                var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
                var ergebnis = str.match(re);
                if (ergebnis != null) {
                    // console.log("ergebnis.length: " + ergebnis.length);
                    var index = 1;
                    if (ergebnis.length <2) {
                        index = 0;
                    }
                    
                    for (key in ergebnis) {
                        // console.log("ergebnis[key]: " + ergebnis[key]);
                    }
                    
                    hostname = str.match(re)[index].toString();
                    if (hostname.indexOf("www.") == 0) {
                        hostname = hostname.substr(4, hostname.length);
                    } 
                }
            } 
            return hostname;
        },
    
        getFilenameFromURL : function( url ) {
            if (url !== undefined && url != null) {
                // console.log("url: " + JSON.stringify(url));
                return url.replace(/^.*[\\\/]/, '');
            }
            return "";
        },
    
        getRandomString : function () {
            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var string_length = 8;
            var randomstring = '';
            for (var i=0; i<string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
            }
            return randomstring;
        },
        
        isElementInArray : function( myArray, url, prop ) {
            for (var key in myArray)
            {
                var obj = myArray[key];
                // this.log("obj.item_id: " + obj.item_id);
                if (prop !== undefined && prop != null) {
                    if (obj[prop] == url) {
                        // this.log("found and removed item " + item.item_id + " from " + myArray);
                        return true
                    }
                    
                } else {
                    if (obj == url) {
                        // this.log("found and removed item " + item.item_id + " from " + myArray);
                        return true
                    }
                }
            }
            return false;
        },
        
        removeElement : function( myArray, item ) {
            // console.log("item: " + JSON.stringify(item));
            var pos = -1;
            var i=0;
            for (var key in myArray)
            {
                var obj = myArray[key];
                // this.log("obj.item_id: " + obj.item_id);
                if (obj.item_id == item.item_id) {
                    // console.log("found and removed item " + item.item_id);
                    pos = i;
                    break;
                }
                i++;
            }
            if (pos != -1) {
                myArray.splice( pos, 1);  
            } else {
                // console.log("not found item " + item.item_id + " in " + myArray);
            } 
        },
        
        removeElementByIndex : function( myArray, index ) {
            var pos = -1;
            var i=0;
            myArray.splice( index, 1);  
        },
        
        stripHTML : function (oldString) {
            oldString = oldString.replace(/<.*?>/g, '');
            oldString = oldString.replace(/&auml;/g, 'ä');
            oldString = oldString.replace(/&uuml;/g, 'ü');
            oldString = oldString.replace(/&ouml;/g, 'ö');
            oldString = oldString.replace(/&Auml;/g, 'Ä');
            oldString = oldString.replace(/&Uuml;/g, 'Ü');
            oldString = oldString.replace(/&Ouml;/g, 'Ö');
            oldString = oldString.replace(/&nbsp;/g, ' ');
            oldString = oldString.replace(/&szlig;/g, 'ß');
            oldString = oldString.replace(/&hellip;/g, '…');
            oldString = oldString.replace(/&lsquo;/g, '‘');
            oldString = oldString.replace(/&rsquo;/g, '’');
            oldString = oldString.replace(/&ldquo;/g, '“');
            oldString = oldString.replace(/&rdquo;/g, '”');
            return oldString;
        },
        
        stripHtmlCodes : function ( str ) {
            console.log("before: " + str);
            // str.replace(/<[/]?(font|span|xml|del|ins|[ovwxp]:\w+)[^>]*?>/gi, "");  
            // str.replace(/<([^>]*)(?:class|lang|style|size|face|[ovwxp]:\w+)=(?:'[^']*'|""[^""]*""|[^\s>]+)([^>]*)>/gi, "");  
            // str.replace(/<!--(.*?)-->/gi, "");  
            // str.replace(/<[^\/>][^>]*><\/[^>]+>/gi, "");  
            
            str = str.replace(/\^I/gi, "");

            //remove line breaks 
            str = str.replace(/\r\n/gi, "");
            str = str.replace(/\n/gi, "");
            str = str.replace(/\r/gi, "");  
            //strip class, style, align 
            str = str.replace(/ class=[^\s|>]*/i, "");
            str = str.replace(/ style=\"[^>]*\"/i, "");
            str = str.replace(/ align=[^\s|>]*/i, "");  
            //clean formatting tags 
            str = str.replace(/<b [^>]*>/i, "");  
            str = str.replace(/<i [^>]*>/i, "");  
            str = str.replace(/<li [^>]*/i, "");  
            str = str.replace(/<ul [^>]*/i, "");  
            //kill unwanted tags 
            str = str.replace(/<\?xml:[^>]*>/gi, "");  
            str = str.replace(/<\/?st1:[^>]*>/gi, "");  
            str = str.replace(/<\/?[a-z]\:[^>]*>/gi, "");  
            str = str.replace(/<\/?font[^>]*>/i, "");  
            str = str.replace(/<\/?span[^>]*>/i, "");  
            str = str.replace(/<\/?div[^>]*>/i, "");  
            str = str.replace(/<\/?pre[^>]*>/i, "");  
            //kill empty tags 
            str = str.replace(/<strong>\s*<\/strong>/i, "");  
            str = str.replace(/<i>\s*<\/i>/i, "");  
            str = str.replace(/<p[^>]*><strong>\s*<\/strong><\/p>/i, "");  
            str = str.replace(/<p>[\s|&nbsp;]*<\/p>/i, "");  

            
            console.log("after: " + str);
            return str;
        },
        
        loadFile : function ( filename, title, contentOnly ) 
        { 
            // console.log("filename: " + filename);
            var xmlHTTP = new XMLHttpRequest(); 
            try 
            { 
                xmlHTTP.open("GET", filename, false); 
                xmlHTTP.send(null); 
            } 
            catch (e) { 
                console.error("error: " + e);
                return null; 
            } 
            
            if (contentOnly !== undefined && contentOnly == true) {
                return this.stripHtmlCodes( xmlHTTP.responseText.trim() );
            }
            
            var str = "<center><div id=\"article_container\">";
            
            /*if (title !== undefined && this.isTouchpad() == false) {
                str += "<h2>" + title + "</h2>";
            }*/
            
            // var contentSize = 0;
            // if (xmlHTTP.responseText != undefined && xmlHTTP.responseText != null) {
                // contentSize = xmlHTTP.responseText.trim().length;
            // }            
                                   
            // console.log("contentSize: " + contentSize);
            // console.log("content: " + xmlHTTP.responseText.replace(/\^I/i, "") );
                       
            return str + xmlHTTP.responseText + "</div></center>"; 
        },
        
        isPortraitMode : function( ) {
            if (this.webOS == true) {
                var orientation = enyo.getWindowOrientation();
                // console.log("orientation: " + orientation);
                if (orientation == "left" || orientation == "right") {
                    console.log("true");
                    return true;
                }
            } else {
                var orientation = window.orientation;
                // console.log("orientation: " + orientation);
                if (orientation != 0 && orientation != 180) { // landscape mode
                    console.log("true");
                    return true;
                }
            }
            console.log("false");
            return false;
        },

        getItem : function( name, defValue ) {
            // console.log("name: " + name + ", defValue: " + defValue);
            var result = localStorage.getItem( name );
            if (result == undefined || result == null || result.trim().length == 0) {
                // console.log("property '" + name + "' was not stored");
            	localStorage.setItem( name, defValue );
                return defValue;
            }
            // console.log("read property value: " + result );
            return result;
        },
        
        setItem: function( name, value ) {
            localStorage.setItem( name, value);   
        },
        
        getBooleanItem : function ( name, defValue ) {
            // console.log("name: " + name + ", defValue: " + defValue);
            var result = localStorage.getItem( name );
            if (result == undefined || result == null || result.trim().length == 0) {
                // console.log("property '" + name + "' was not stored");
                localStorage.setItem( name, defValue );
                return defValue;
            }
            // console.log("read property value: '" + result + "'");
            // if (Util.isWebOS() && !Util.isTouchpad()) {
                // return result == "true" ? false : true;
            // }
            return result == "true" ? true : false;
        },
        
        getDaysUntilDate : function () {
            var oneMinute = 60 * 1000;
            var oneHour = oneMinute * 60;
            var oneDay = oneHour * 24;
            var today = new Date();
            var nextXmas = new Date();
            nextXmas.setMonth(0); // 11 = december, 10 = november, ...
            nextXmas.setDate(14);
            console.log("nextXmas.year: " + nextXmas.getYear()); // 2011 == 111
            if (today.getMonth() >= 1 && today.getDate() >= 0 && today.getYear() > 111  ) {
                return 0;
            }
            var diff = nextXmas.getTime() - today.getTime();
            diff = Math.floor(diff/oneDay);
            return diff;
        },
        
        encodeString : function ( s ) {
            
            s = encodeURIComponent(s);
            // Now replace the values which encodeURIComponent doesn't do
            // encodeURIComponent ignores: - _ . ! ~ * ' ( )
            // OAuth dictates the only ones you can ignore are: - _ . ~
            // Source: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
            // s = s.replace(/\#/g, "%23");
            // s = s.replace(/\*/g, "%2A");
            // s = s.replace(/\'/g, "%27");
            // s = s.replace(/\(/g, "%28");
            // s = s.replace(/\)/g, "%29");
            
            
            return s;        
        },
        
        // Instapaper OAuth 1.0a consumer credentials.
        // Obtain from Instapaper by emailing api@instapaper.com.
        getApiKey : function() {
            return {
                key:    "260c37b0c3a843459a192795b5ef9f06",
                secret: "a782e8ca837b415d9b47311e102177b1"
            };
        },

        // Base URL of the instapaper-auth companion server (no trailing slash).
        getAuthServiceUrl : function() {
            return "https://instapaper.wosa.link";
        },

        // URL of the article-text proxy endpoint on the companion server.
        getTextProxyUrl : function() {
            return "https://instapaper.wosa.link/get-text.php";
        },
        
        // collect data from storage   
        getSettings : function( forceReload ) {
            
            if (this.settings == null || forceReload == true) {
                this.settings = {
                    accountVerified : Util.getBooleanItem("accountVerified", false),
                    username    : Util.getItem("username", ""),
                    password    : Util.getItem("password", ""),    // oauth_token
                    tokenSecret : Util.getItem("tokenSecret", ""), // oauth_token_secret
                    useAdvancedBrowser : Util.getBooleanItem("useAdvancedBrowser", false),
                    maximizeView : Util.getBooleanItem("maximizeView", (Util.isTouchpad() ? false : true)),
                    bgSyncInterval : Util.getItem("bgSyncInterval", "never"),
                    autoSync : Util.getBooleanItem("autoSync", false),
                    autoDownloadArticles : true,
                    downloadOnlyUnreadArticles : Util.getBooleanItem("downloadOnlyUnreadArticles", true),
                    articleLimit : Util.getItem("articleLimit", 50),
                    lastVersion : Util.getItem("lastVersion", enyo.fetchAppInfo().version),
                    online : Util.getBooleanItem("online", false),
                    itemState : Util.getItem("itemState", "unread"),
                    filterTags : Util.getItem("filterTags", ""),
                    fontsize : Util.getItem("fontsize", "19px"),
                    lineSpacing : Util.getItem("lineSpacing", "1.25"),
                    fontfamily : Util.getItem("fontfamily", (Util.isWebOS() ? "Prelude" : "DejaVu Serif")),
                    theme : Util.getItem("theme", "Paperback"),
                    fixedWidth : Util.getBooleanItem("fixedWidth", false),
                    syncInProgress : Util.getBooleanItem("syncInProgress", false),
                    lastActivity : Util.getItem("lastActivity", ""),
                    sortOrder : Util.getItem("sortOrder", 1),
                    lastRead: Util.getItem("lastRead", ""),
                    lastRow: Util.getItem("lastRow", -1),
                    scrollerArticle: Util.getItem("scrollerArticle", 0),
                    useRotationLock: Util.getBooleanItem("useRotationLock", true),
                    showImages : Util.getBooleanItem("showImages", true),
                    previewPrefered : (Util.isPre3() ? false : Util.getBooleanItem("previewPrefered", true)),
                    syncAfterAddingLink : Util.getBooleanItem("syncAfterAddingLink", true),
                    lastClickDate : Util.getItem("lastClickDate", ""),
                    clickCount : Util.getItem("clickCount", JSON.stringify([])),
                    showListScrollbar : Util.getBooleanItem("showListScrollbar", (Util.isTouchpad() || Util.isBrowser() ? true : false)),
                    debugOutput : Util.getBooleanItem("debugOutput", true),
                };
            }
            
            return this.settings;
        },
        
        getAlarmTimeFromSettings : function( ) {
            if (this.getSettings().bgSyncInterval == "never") {
                return null;
            }
            var pos = this.getSettings().bgSyncInterval.indexOf("S");
            if (pos != -1) {
                return "00:00:" + this.getSettings().bgSyncInterval.substr(0, pos);
            } 
            pos = this.getSettings().bgSyncInterval.indexOf("M");
            if (pos != -1) {
                return "00:" + this.getSettings().bgSyncInterval.substr(0, pos) + ":00";
            } 
            pos = this.getSettings().bgSyncInterval.indexOf("H");
            if (pos != -1) {
                var str = this.getSettings().bgSyncInterval.substr(0, pos);
                if (str.length < 2) {
                    str = "0" + str;
                }
                return  str + ":00:00";
            }
            return null; 
        },
        
        syncIsStillActive : function( ) {
            if (Util.getSettings().lastActivity == "") {
                localStorage.setItem("syncInProgress", false);
                Util.getSettings( true );
                return false;
            }
            
            var ts = new Date();
            
            var oldDate = new Date();
            oldDate.setTime(Util.getSettings().lastActivity);
            
            var diff = Util.minutes_between(ts, oldDate);
            // console.log("last activity " + diff + " minutes ago...");
            if (diff > 1) {
                localStorage.setItem("syncInProgress", false);
                Util.getSettings( true );
                return false;
            } 

            return true;
        },
        
        sort : function( list, sortOrder ) {
            // console.log("list: " + list);
            console.log("sortOrder: " + sortOrder);
            if (list == undefined || sortOrder == undefined) {
                return null;
            }
            
            if (list.length == 0) {
                return list;
            }
            
            // console.log("1");
            switch (Number(sortOrder)) {
                case 1: 
                    console.log("sortOrder: newest");
                    // sort array of items depending on time_updated!
                    return list.sort(function(a,b) {  
                        // this.log(" +----> b: " + b.time_updated + ", a: " + a.time_updated);
                        return b.time_updated - a.time_updated;
                    }); 
                    break;
                case 2:
                    console.log("sortOrder: oldest");
                    // sort array of items depending on time_updated!
                    return list.sort(function(a,b) {  
                        // this.log(" +----> b: " + b.time_updated + ", a: " + a.time_updated);
                        return a.time_updated - b.time_updated;
                    }); 
                    break;
                case 3:
                    console.log("sortOrder: title");
                    // sort array of items depending on time_updated!
                    return list.sort(function(a,b) {  
                        // this.log(" +----> b: " + b.time_updated + ", a: " + a.time_updated);
                        // return a.oldTitle > b.oldTitle;
                        var A = a.oldTitle.toLowerCase();
                        var B = b.oldTitle.toLowerCase();
                        if (A < B){
                           return -1;
                        }else if (A > B){
                          return  1;
                        }else{
                          return 0;
                        }
                    }); 
                    break;
                case 4:
                    console.log("sortOrder: url");
                    // sort array of items depending on time_updated!
                    return list.sort(function(a,b) {  
                        // console.log(" +----> a: " + Util.getHostname(a.url) + ", b: " + Util.getHostname(b.url));
                        // console.log("a.url > b.url: " + a.url > b.url);
                        
                        var A = a.url.toLowerCase();
                        var B = b.url.toLowerCase();
                        if (A < B){
                           return -1;
                        }else if (A > B){
                          return  1;
                        }else{
                          return 0;
                        }
                        
                        
                        // return Util.getHostname(a.url) > Util.getHostname(b.url);
                    }); 
                    break;
/*                default: 
                    console.error("unknown sortOrder: " + sortOrder);
                    break;*/
            } 
            
            return list;
        },

        getClassName : function( className ) {
            if (this.isTouchpad() == true) {
                return className;
            }
            return className + "-mobile";
        },
        
        base64ArrayBuffer: function (arrayBuffer) {
          var base64    = ''
          var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        
          var bytes         = new Uint8Array(arrayBuffer)
          var byteLength    = bytes.byteLength
          var byteRemainder = byteLength % 3
          var mainLength    = byteLength - byteRemainder
        
          var a, b, c, d
          var chunk
        
          // console.log("mainLength: " + mainLength);
        
          // Main loop deals with bytes in chunks of 3
          for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
        
            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
            d = chunk & 63               // 63       = 2^6 - 1
        
            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
          }
        
          // Deal with the remaining bytes and padding
          if (byteRemainder == 1) {
            chunk = bytes[mainLength]
        
            a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
        
            // Set the 4 least significant bits to zero
            b = (chunk & 3)   << 4 // 3   = 2^2 - 1
        
            base64 += encodings[a] + encodings[b] + '=='
          } else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
        
            a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
        
            // Set the 2 least significant bits to zero
            c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
        
            base64 += encodings[a] + encodings[b] + encodings[c] + '='
          }
          
          return base64
        },    
        
        applyFilterHighlight : function( inText, inSearchString, className) {
            
            if (inText === undefined || inText == "undefined") {
                return "";
            }
            // console.log("inText: " + inText);
            // console.log("inSearchString: " + inSearchString);
            // console.log("className: " + className);
            // applyFilterHighlight( this.inhalt, "in", "searchResult")
            // while(inText.indexOf(inSearchString) != -1) {
                // inText = inText.replace(inSearchString, "<span class=\"" + className + "\">" + inSearchString + "</span>");
            // } 
            
            // 1. match
            var regex = new RegExp(inSearchString,"gi");
            var regex2 = new RegExp(inSearchString,"i");
            if (regex.test(inText)) {
                // 2. search
                var original = inText.match(regex);
                // console.log("original: " + original);
                
                var newString = "";
                var tmpString = "";
                var restString = inText;
                var counter = 0;
                var pos = inText.search(regex);
                while (pos != -1 && counter < original.length) {
                    tmpString = restString.substring(0, Number(pos)+ Number(inSearchString.length));
                    // console.log("tmpString: " + tmpString);
                    tmpString = tmpString.replace(regex2,"<span class=\"" + className + "\">" + original[counter] + "</span>");
                    // console.log("tmpString: " + tmpString);
                    newString += tmpString;
                    // console.log("newString: " + newString);
                    
                    restString = restString.substring(Number(pos)+ Number(inSearchString.length), restString.length);
                    // console.log("restString: " + restString);

                    counter++;
                    pos = restString.search(regex);
                }
                
                return newString + restString;
            }
            
            return inText;
        },
        
        init : function( ) {
            // console.log("Util init - START");
            
            try {
                if (window.blackberry !== undefined) {
                    // console.log("blackberry detected...");
                    // alert("blackberry detected...");
                    Util.platform = "blackberry";
                    Util.deviceName = "playbook";
                    var orientation = window.orientation;
                    console.log("orientation: " + orientation);
                    if ((orientation != 0 && orientation != 180)) { // landscape mode
                        console.log("portrait active");
//                        Util.screenWidth = 600;
//                        Util.screenHeight = 1024;
                        Util.screenWidth = screen.width;
                        Util.screenHeight = screen.height;
                    } else {
                        console.log("landscape active");
//                        Util.screenWidth = 1024;
//                        Util.screenHeight = 600;
                        Util.screenWidth = screen.width;
                        Util.screenHeight = screen.height;
                    }
                }
            } catch(e) { 
                // console.log("no blackberry");
            }
            
            if (Util.platform == "") {
                try {
                    Util.platform = device.platform.toLowerCase();
                    // alert("phonegap active");
                    // console.log("phonegap active");
                    Util.deviceName = device.name;
                    Util.screenWidth = window.innerWidth;
                    Util.screenHeight = window.innerHeight;
                } catch(e) { 
                    // console.log("no phonegap active...");
                    if(window.PalmSystem) {
                        // console.log("webos detected...");
                        Util.platform = "webos";
                        var info = enyo.fetchDeviceInfo();
                        // console.log(enyo.json.stringify(info));
                        Util.deviceName = info.modelNameAscii;
                        Util.screenWidth = info.screenWidth;
                        Util.screenHeight = info.screenHeight;
                    } else {
                        // console.log("");
                        // alert("webbrowser detected...");
                        Util.platform = "web";
                        Util.deviceName = "browser";
                        Util.screenWidth = window.innerWidth;
                        Util.screenHeight = window.innerHeight;
                    }
                }
            }
            
            // console.log("platform: " + Util.platform);
            // console.log("deviceName: " + Util.deviceName);
             console.log("screenWidth: " + Util.screenWidth);
             console.log("screenHeight: " + Util.screenHeight);
//             console.log("screen.width: " + screen.width);
            // console.log("Util init - END");
        }

    };

})();

Util.init();

// /usr/palm/command-resource-handlers.json is inaccessible via XHR on this webOS
// build (cross-origin file:// restriction). The redirects were never loaded anyway,
// so replace addSystemRedirects with a no-op to eliminate the console noise.
if (enyo && enyo.WebView && enyo.WebView.prototype) {
    enyo.WebView.prototype.addSystemRedirects = function() {};
}
