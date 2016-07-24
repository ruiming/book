(function() {
    "use strict";

    angular
        .module('index')
        .factory('booklistservice', booklistservice);

    booklistservice.$inject = ['$http'];

    function booklistservice($http) {

        return {
            collectBooklist: collectBooklist,
            getHotBooklists: getHotBooklists,
            getBooklistDetail: getBooklistDetail,
            getBooklists: getBooklists
        };

        function collectBooklist(id) {
            return $http.post(host + '/collect', {
                type: 'booklist',
                id: id
            }).then(response => response.data);
        }

        function getBooklistDetail(id) {
            return $http.get(host + '/booklist?id=' + id)
                .then(response => response.data)
        }

        function getHotBooklists() {
            return $http.get(host + '/booklist?type=hot')
                .then(response => response.data)
        }

        function getBooklists(type) {
            this.list = [];
            this.busy = false;
            this.url = host + '/booklist';
            this.params =  {
                type: type,
                page: 1
            };
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