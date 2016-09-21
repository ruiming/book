// TODO: Change to Angular's Constant
var host = 'https://www.bookist.org';        // API url
// var host = 'http://192.168.1.231';

var statusDict = {                       // 订单状态转换
    'create': '创建',                    // 订单创建，等同于待发货
    'pending': '待发货',                 // 订单创建后就处于待发货状态，用户可以取消订单
    'waiting': '待收货',                 // 订单已发货，待用户收货，不能取消订单
    'received': '待评价',              // 用户确认收货，进入待评价状态，用户可以申请售后
    'done': '已完成',                    // 用户评价完毕，已完成状态，用户可以申请售后
    'canceled': '已取消',                // 用户取消订单，订单终止
    'afterselling': '退换货订单',
    'refund': '申请退款中',              // 用户申请退款
    'refunding': '退款中',               // 退款已受理
    'refunded': '退款完成',              // 退款完成，订单终止
    'replace': '申请换货中',             // 用户申请换货
    'replacing': '换货中',               // 换货已受理
    'replaced': '换货完成',              // 换货完成，根据用户是否评价订单，进入待评价状态或者已完成状态，用户可以再次申请售后
    'refund_refused': '退款失败',        // 不满足退款条件，比如书籍人为破损，[退款中]状态时，工作人员检查不满足退款条件进入该状态
    'replace_refused': '换货失败',       // 同上
    'closed': '已关闭'                   // 因某些原因被关闭的订单
};

/* 状态流程
 *                                                            -> refund_refused
 *                                                            -> closed    -> refund_refused
 *                                          ->  ->  -> refund -> refunding -> refunded
 * create->pending -> waiting -> commenting -> done ->
 *                  -> canceled              ->  ->  -> replace -> replacing -> replaced(commenting/done) -> ...
 *                                                             -> closed    -> replace_refused
 *                                                             -> replaced_refused
 */
notie.setOptions({
    colorSuccess: '#57BF57',
    colorWarning: '#D6A14D',
    colorError: '#E1715B',
    colorInfo: '#4D82D6',
    colorNeutral: '#A0A0A0',
    colorText: '#FFFFFF',
    animationDelay: 300, // Be sure to also change 'transition: all 0.3s ease' variable in .scss file
    backgroundClickDismiss: true
});
var notices = {
    '216': '加入购物车成功'
};