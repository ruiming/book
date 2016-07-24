(function(){
    "use strict";

    angular
        .module('index')
        .controller('SuggestCtrl', function(userservice, $timeout){

            let vm = this;
            
            vm.required = true;
            vm.WAIT_OPERATING = false;

            getUserInfo();
            vm.post = post;

            function getUserInfo() {
                userservice.getUserInfo().then(response => {
                    vm.user = response;
                });
            }

            function post(){
                if(this.suggestBox.suggestion.$invalid) {
                    return;
                }
                vm.WAIT_OPERATING = true;
                userservice.postSuggestion(vm.suggestion).then(() => {
                    notie.alert(1, '谢谢您的反馈！', 0.3);
                    $timeout(() => {
                        vm.WAIT_OPERATING = false;
                        history.back();
                    }, 300)
                });
            }

        });
})();
