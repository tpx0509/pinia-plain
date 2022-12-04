export function addSubscription(subscriptions,callback) {
    subscriptions.push(callback)
    
    const removeSubscription = () => {
        let idx = subscriptions.indexOf(callback)
        if(idx > -1) {
            subscriptions.splice(idx,1)
        }
    }
    return removeSubscription
}

export function triggerSubscriptions(subscributions,...args) {
    subscributions.slice().forEach((cb) => cb(...args))
}