/*
 * 配置文件
 */

var delay = 2800;                           // time delay for message animate
var host = "http://www.bookist.org";        // API url
// var host = "http://192.168.1.231";

var statusDict = {                          // 订单状态转换
    "create": "创建",
    "pending": "待发货",
    "waiting": "待收货",
    "commenting": "待评价",
    "done": "已完成",
    "canceled": "已取消"
};