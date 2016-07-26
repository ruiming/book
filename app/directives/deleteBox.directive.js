(function() {
    'use strict';

    let deleteBox = () => {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                content: '=',
                commit: '&',
                cancel: '=',
            },
            template:
            `
            <div>
            <div class="modal-dialog">
                <div class="modal-header">
                    <h4 class="modal-title">你确认要删除吗?</h4>
                </div>
                <div class="modal-body">
                    <p>{{content}}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" promise-btn
                            ng-click="commit()">确认</button>
                    <button class="btn btn-warning"
                            ng-click="cancel = false">取消</button>
                </div>
            </div>
            <div class="modal-backdrop fade" style="z-index: 1040;"></div>
            </div>
            `
        };
    };

    angular
        .module('index')
        .directive('deleteBox', deleteBox);
})();
