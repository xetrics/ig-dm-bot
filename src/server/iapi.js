const { IgApiClient } = require("instagram-private-api");
const { withRealtime } = require("instagram_mqtt");
const EventEmitter = require("events");

class IAPI {
    constructor(proxy_url) {
        this._ig = withRealtime(new IgApiClient());
        if(proxy_url) this._ig.state.proxyUrl = proxy_url;
    }

    async Login(credentials) {
        this._ig.state.generateDevice(credentials.username);
       // await this._ig.simulate.preLoginFlow().catch((e) => { throw new Error(e) });
        await this._ig.account.login(credentials.username, credentials.password).catch((e) => { throw new Error(e) });
        await this._ig.simulate.postLoginFlow().catch((e) => { throw new Error(e) });
        await this._ig.realtime.connect().catch((e) => { throw new Error(e) });
        return true;
    }

    async MassSend(dm_array) {
        let dm_feed = await this._ig.feed.directInbox();
        let threads = await dm_feed.items();
        let thread_ids = threads.map((dm_thread) => dm_thread.thread_id).reverse();

        thread_ids.forEach((t, i) => {
            setTimeout((_this) => {
                _this._ig.realtime.direct.sendText({
                    text: dm_array[ Math.floor(Math.random() * dm_array.length) ],
                    clientContext: Date.now(),
                    threadId: t
                })
            }, 
            Math.floor(((Math.random() * 20) * 1000) * i) + 5, this);
        })

        return thread_ids.length;
    }
}

module.exports = { IAPI };