/*
 * 配置文件
 */

var delay = 2800;                           // time delay for message animate
var host = "https://www.bookist.org";        // API url
// var host = "http://192.168.1.231";

var statusDict = {                       // 订单状态转换
    "create": "创建",                    // 订单创建，等同于待发货
    "pending": "待发货",                 // 订单创建后就处于待发货状态，用户可以取消订单
    "waiting": "待收货",                 // 订单已发货，待用户收货，不能取消订单
    "commenting": "待评价",              // 用户确认收货，进入待评价状态，用户可以申请售后
    "done": "已完成",                    // 用户评价完毕，已完成状态，用户可以申请售后
    "canceled": "已取消",                // 用户取消订单，订单终止
    "refund": "申请退款中",              // 用户申请退款
    "refunding": "退款中",               // 退款已受理
    "refunded": "退款完成",              // 退款完成，订单终止
    "replace": "申请换货中",             // 用户申请换货
    "replacing": "换货中",               // 换货已受理
    "replaced": "换货完成",              // 换货完成，根据用户是否评价订单，进入待评价状态或者已完成状态，用户可以再次申请售后
    "refund_refused": "退款失败",        // 不满足退款条件，比如书籍人为破损，[退款中]状态时，工作人员检查不满足退款条件进入该状态
    "replace_refused": "换货失败",       // 同上
    "closed": "已关闭"                   // 因某些原因被关闭的订单
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

/*
 * 积分机制
 * 初次登陆:            100分        所有用户第一次登陆默认获取
 * 第一次下单购买:        50分        仅限第一单，且订单完成不包含退款才计入
 * 购买一本图书：         10分        按本计，每本记一次
 * 评价一本图书：        2/5分        购买后评价5分，未购买评价2分
 * 评价获置顶:           20分         人工置顶，自动发消息通知并加分
 * 系统奖励:             xx分         提供接口，推送消息通知并发放奖励
 */

notie.setOptions({
    colorSuccess: '#57BF57',
    colorWarning: '#D6A14D',
    colorError: '#E1715B',
    colorInfo: '#4D82D6',
    colorNeutral: '#A0A0A0',
    colorText: '#FFFFFF',
    animationDelay: 300, // Be sure to also change "transition: all 0.3s ease" variable in .scss file
    backgroundClickDismiss: true
});