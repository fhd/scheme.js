scheme.utils = (function(scheme) {
    return {
        forEach: function(array, f) {
            var i;
            for (i = 0; i < array.length; i++)
                f(array[i]);
        },
        map: function(array, f) {
            var newArray = [], i;
            for (i = 0; i < array.length; i++)
                newArray.push(f(array[i]));
            return newArray;
        },
        isArray: function(x) {
            return Object.prototype.toString.call(x) === '[object Array]';
        },
        isFunction: function(f) {
            return f && {}.toString.call(f) === "[object Function]";
        },
        httpGet: function(uri, callback, async) {
            var httpRequest;
            if (window.XMLHttpRequest)
                httpRequest = new XMLHttpRequest;
            else if (window.ActiveXObject)
                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState !== 4)
                    return;
                var status = httpRequest.status;
                if (status === 0 || status === 200)
                    callback(httpRequest.responseText);
                else
                    throw "Unable to load scheme script from: " + uri +
                        ", status: " + statusText;
            };
            httpRequest.open("GET", uri, async);
            httpRequest.send();
        }
    };
})(scheme);
