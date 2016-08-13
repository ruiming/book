(function(){
    'use strict';

    angular
        .module('index')
        .controller('SuggestCtrl', SuggestCtrl);

    SuggestCtrl.$inject = ['userservice', '$timeout', 'user'];

    function SuggestCtrl(userservice, $timeout, user) {
        let vm = this;
        vm.user = user;

        vm.post = post;

        function post(){
            if(vm.suggestion === void 0 || vm.suggestion == '') {
                return;
            }
            return userservice.postSuggestion(vm.suggestion).then(() => {
                notie.alert(1, '谢谢您的反馈！', 0.3);
                $timeout(() => {
                    history.back();
                }, 300);
            });
        }
    }
})();
