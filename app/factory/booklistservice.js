(function() {
    "use strict";

    angular
        .module('index')
        .factory('booklistservice', booklistservice);

    booklistservice.$inject = ['$http'];

    function booklistservice($http) {

        return {
            getHotBooklists: getHotBooklists,
            getBooklists: getBooklists
        };

        function getHotBooklists() {
            return $http.get(host + '/booklist?type=hot')
                .then(response => response.data);
        }

        function getBooklists(url, params) {
            this.list = [];
            this.busy = false;
            this.url = url;
            this.params = params;
            this.continue = true;
            this.nextPage = function() {
                if(!this.continue){
                    this.busy = false;
                    return;
                }
                if(this.busy) {
                    return;
                }
                this.busy = true;
                $http({
                    method: 'GET',
                    url: this.url,
                    params: this.params
                }).success(function(response){
                    var list = response;
                    if(list.length < 5 ) {
                        this.continue = false;
                    }
                    for (var i = 0 ;i < list.length; i++){
                        list[i].star = Math.ceil(list[i].rate/2);
                        this.list.push(list[i]);
                    }
                    this.busy = false;
                    this.params.page += 1;
                }.bind(this));
            }.bind(this);
            this.nextPage();
            return this;
        }
    }

})();