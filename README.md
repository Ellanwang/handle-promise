## 手撕promise

### promise 状态
promise的初始状态是pending

需要将resolve和reject的绑定this，保证this指向当前的MyPromise实例，防止随着执行环境的改变而改变

Promise有三种状态：
- pending：等待中，是初始状态
- fulfilled：成功状态
- rejected：失败状态

Promise只以第一次改变的状态为准；当状态从pending变为fulfilled或rejected，那么此Promise实例的状态就定死了

### then

Promise.then()接收两个回调参数：一个是成功回调，一个是失败回调

当Promise状态为fulfilled执行成功回调，当状态为rejecrejected执行失败回调

如resolve或reject在定时器中，则定时器结束后执行then()

then()支持链式调用，下一次then执行受上一次then返回值的影响

由于onFulfilled和onRejected要等this.value和this.reason有值了再执行，所以resolve()和reject()内部应该是异步执行
