(function() {
    "use strict";

    angular
        .module('index')
        .factory('timestampMarker', timestampMarker);

    function timestampMarker() {
        return {
            request: function (config) {
                config.requestTimestamp = new Date().getTime();
                return config;
            },
            response: function (response) {
                response.config.responseTimestamp = new Date().getTime();
                return response;
            }
        }
    }
})();