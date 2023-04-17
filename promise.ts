const PROMISE_STATUS_PENDING = 'pending';// 等待状态
const PROMISE_STATUS_FULFILLED = 'fulfilled'; // 成功状态
const PROMISE_STATUS_REJECTED= 'rejected'; // 失败状态

class MyPromise {
    status: string;
    value: undefined;
    reason: undefined;
    onFulfilledFns: any[];
    onRejectedFns: any[];
    constructor(executer) {
        this.status = PROMISE_STATUS_PENDING; // 设置初始态为 pending
        this.value = undefined; // 成功的值
        this.reason = undefined; // 失败的值
        // 为了支持promise多次使用，将成功和失败的回调保存到数组中
        this.onFulfilledFns = [];
        this.onRejectedFns = [];

        const resolve = (value) => {
            if (this.status === PROMISE_STATUS_PENDING) {
                // 放到微任务，确保可以拿到onFulfilled
                queueMicrotask(() => {
                    if (this.status !== PROMISE_STATUS_PENDING) return;
                    this.status = PROMISE_STATUS_FULFILLED; // 确认成功的状态
                    this.value = value;
                    this.onFulfilledFns.forEach((fn: any) => fn(value))
                })
            }
        }

        const reject = (reason) => {
            if (this.status === PROMISE_STATUS_PENDING) {
                // 放到微任务，确保可以拿到onRejected
                queueMicrotask(() => {
                    if (this.status !== PROMISE_STATUS_PENDING) return;
                    this.status = PROMISE_STATUS_REJECTED; // 确认失败的状态
                    this.value = reason;
                    this.onRejectedFns.forEach((fn: any) => fn(reason))
                })
            }
        }

        try {
            executer(resolve, reject); // 创建实例时直接执行，执行回调函数
        } catch (error) {
            reject(error); // 如果传入的executor报错，就直接执行reject
        }
    }

    then(onFulfilled, onRejected) {
        // 如果onRejected没有传入，就将抛出异常给catch
        onRejected = onRejected || ((err) => {
            throw err;
        })

        // 如果fulfilled执行完then方法，会到catch中，但是为了避免断层（因为catch中onfulfilled是undefined）
        onFulfilled = onFulfilled || ((value) => {
            return value
        })

        // 返回promise为了能够达到链式调用与值穿透
        return new MyPromise((resolve, reject) => {
            // 异步使用promise的判断
            if (this.status === PROMISE_STATUS_FULFILLED) {
                try {
                    const value = onFulfilled(this.value); // 拿到返回值
                    resolve(value); // 传递到下一个promise中，下同
                } catch (error) {
                    reject(error);
                }
            }

            if (this.status === PROMISE_STATUS_REJECTED) {
                try {
                    const value = onFulfilled(this.reason); // 拿到返回值
                    resolve(value);
                } catch (error) {
                    reject(error);
                }
            }

            // 同步使用promise的判断：成功的回调和失败的回调保存到数组中
            if (this.status === PROMISE_STATUS_PENDING) {
                if (onFulfilled) {
                    // 通过push回调函数的方式，实现同步promise值穿透及链式调用
                    this.onFulfilledFns.push(() => {
                        try {
                            const value = onFulfilled(this.value);
                            resolve(value);
                        } catch (error) {
                            reject(error)
                        }
                    })
                }

                if (onRejected) {
                    this.onRejectedFns.push(() => {
                        try {
                            const reason = onRejected(this.reason);
                            resolve(reason);
                        } catch (error) {
                            reject(error)
                        }
                    })
                }
            }
        })
    }

    catch(onRejected) {
        const reason = this.then(undefined, onRejected);
        return reason;
    }

    finally(onFinally) {
        this.then(onFinally, onFinally)
    }
}
