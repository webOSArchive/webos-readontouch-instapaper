/*
 * OAuthHelper.js — OAuth 1.0a + HMAC-SHA1 for webOS (ES5, no external dependencies)
 * Used for signing all Instapaper API requests.
 */
var OAuthHelper = (function() {

    // ---- SHA-1 ----
    // Performs a 32-bit left rotation.
    function rotl(n, s) {
        return (n << s) | (n >>> (32 - s));
    }

    // SHA-1 hash of msg (string, chars used as bytes 0-255).
    // Returns 20-byte string.
    function sha1(msg) {
        var byteLen = msg.length;
        var numWords = (((byteLen + 8) >> 6) + 1) << 4;
        var M = [], i, j;
        for (i = 0; i < numWords; i++) { M[i] = 0; }
        for (i = 0; i < byteLen; i++) {
            M[i >> 2] |= (msg.charCodeAt(i) & 0xFF) << (24 - (i & 3) * 8);
        }
        M[byteLen >> 2] |= 0x80 << (24 - (byteLen & 3) * 8);
        M[numWords - 1] = byteLen * 8; // length in bits (valid for msg < 512 MB)

        var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
        var W = [];

        for (j = 0; j < numWords; j += 16) {
            var A = H[0], B = H[1], C = H[2], D = H[3], E = H[4];
            for (i = 0; i < 80; i++) {
                if (i < 16) {
                    W[i] = M[j + i] || 0;
                } else {
                    var n = W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16];
                    W[i] = rotl(n, 1);
                }
                var t = (rotl(A, 5) + E + W[i]) | 0;
                if      (i < 20) { t = (t + ((B & C) | (~B & D))            + 0x5A827999) | 0; }
                else if (i < 40) { t = (t + (B ^ C ^ D)                     + 0x6ED9EBA1) | 0; }
                else if (i < 60) { t = (t + ((B & C) | (B & D) | (C & D))   + 0x8F1BBCDC) | 0; }
                else             { t = (t + (B ^ C ^ D)                     + 0xCA62C1D6) | 0; }
                E = D; D = C; C = rotl(B, 30); B = A; A = t;
            }
            H[0] = (H[0] + A) | 0;
            H[1] = (H[1] + B) | 0;
            H[2] = (H[2] + C) | 0;
            H[3] = (H[3] + D) | 0;
            H[4] = (H[4] + E) | 0;
        }

        var result = "";
        for (i = 0; i < 5; i++) {
            var w = H[i];
            result += String.fromCharCode((w >>> 24) & 0xFF,
                                          (w >>> 16) & 0xFF,
                                          (w >>>  8) & 0xFF,
                                           w         & 0xFF);
        }
        return result;
    }

    // ---- HMAC-SHA1 ----
    // key and msg are strings (chars as bytes 0-255). Returns 20-byte string.
    function hmacSha1(key, msg) {
        var i;
        if (key.length > 64) { key = sha1(key); }
        while (key.length < 64) { key += "\x00"; }
        var ipad = "", opad = "";
        for (i = 0; i < 64; i++) {
            var k = key.charCodeAt(i);
            ipad += String.fromCharCode(k ^ 0x36);
            opad += String.fromCharCode(k ^ 0x5C);
        }
        return sha1(opad + sha1(ipad + msg));
    }

    // ---- Base64 ----
    var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    function base64(bytes) {
        var result = "", i, len = bytes.length;
        for (i = 0; i < len; i += 3) {
            var b0 = bytes.charCodeAt(i);
            var b1 = (i + 1 < len) ? bytes.charCodeAt(i + 1) : 0;
            var b2 = (i + 2 < len) ? bytes.charCodeAt(i + 2) : 0;
            result += B64.charAt(b0 >> 2);
            result += B64.charAt(((b0 & 3) << 4) | (b1 >> 4));
            result += (i + 1 < len) ? B64.charAt(((b1 & 15) << 2) | (b2 >> 6)) : "=";
            result += (i + 2 < len) ? B64.charAt(b2 & 63)                       : "=";
        }
        return result;
    }

    // ---- OAuth helpers ----

    // RFC 3986 percent encoding — stricter than encodeURIComponent
    // (also encodes ! * ' ( ) which encodeURIComponent leaves alone)
    function pct(str) {
        return encodeURIComponent(String(str)).replace(/[!'()*]/g, function(c) {
            return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        });
    }

    function makeNonce() {
        var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        var r = "";
        for (var i = 0; i < 32; i++) {
            r += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return r;
    }

    // ---- Public API ----

    // Build an OAuth 1.0a Authorization header for an API request.
    //
    // method       : "GET" or "POST"
    // url          : base URL without query string
    // reqParams    : object — POST body or GET query parameters for the request
    // consumerKey  : OAuth consumer key
    // consumerSecret : OAuth consumer secret
    // tokenKey     : user's oauth_token (pass "" for token-less requests)
    // tokenSecret  : user's oauth_token_secret (pass "" if none)
    //
    // Returns a string suitable for the Authorization HTTP header.
    function buildAuthHeader(method, url, reqParams, consumerKey, consumerSecret, tokenKey, tokenSecret) {
        var oauthParams = {
            "oauth_consumer_key":     consumerKey,
            "oauth_nonce":            makeNonce(),
            "oauth_signature_method": "HMAC-SHA1",
            "oauth_timestamp":        String(Math.floor(new Date().getTime() / 1000)),
            "oauth_version":          "1.0"
        };
        if (tokenKey) {
            oauthParams["oauth_token"] = tokenKey;
        }

        // Merge all params for signature base string
        var allParams = {}, key;
        for (key in reqParams) {
            if (reqParams.hasOwnProperty(key)) { allParams[key] = reqParams[key]; }
        }
        for (key in oauthParams) {
            if (oauthParams.hasOwnProperty(key)) { allParams[key] = oauthParams[key]; }
        }

        // Sort and percent-encode into parameter string
        var keys = [];
        for (key in allParams) {
            if (allParams.hasOwnProperty(key)) { keys.push(key); }
        }
        keys.sort();
        var paramStr = "";
        for (var i = 0; i < keys.length; i++) {
            if (i > 0) { paramStr += "&"; }
            paramStr += pct(keys[i]) + "=" + pct(allParams[keys[i]]);
        }

        // Signature base string
        var baseStr = method.toUpperCase() + "&" + pct(url) + "&" + pct(paramStr);

        // Signing key
        var sigKey = pct(consumerSecret || "") + "&" + pct(tokenSecret || "");

        // Sign and encode
        oauthParams["oauth_signature"] = base64(hmacSha1(sigKey, baseStr));

        // Build Authorization header value
        var ordered = [
            "oauth_consumer_key", "oauth_nonce", "oauth_signature",
            "oauth_signature_method", "oauth_timestamp", "oauth_token", "oauth_version"
        ];
        var parts = [];
        for (var j = 0; j < ordered.length; j++) {
            var k = ordered[j];
            var v = oauthParams[k];
            if (v !== undefined && v !== "") {
                parts.push(pct(k) + '="' + pct(v) + '"');
            }
        }
        return "OAuth " + parts.join(", ");
    }

    return { buildAuthHeader: buildAuthHeader };

})();
