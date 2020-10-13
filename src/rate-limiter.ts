import logger from './logger'

/**
 * Schedules REST API calls to avoid being rate limited
 */

export class RateLimiter {

    NUM_PRIORITY_LEVELS = 3
    queues: Array<Array<Object>>;

    isWorking = false;
    isRunning = false;
    // requestsPerMin = 750;
    requestsPerMin = 5000;
    delay = Math.floor(60 / this.requestsPerMin * 1000)

    constructor() {
        logger.debug("ratelimiter.constructor.begin", {delay: this.delay})

        this.queues = new Array(this.NUM_PRIORITY_LEVELS)
        for (let i=0; i < this.NUM_PRIORITY_LEVELS; i++) {
            this.queues[i] = new Array();
        }

        logger.debug("ratelimiter.constructor.end")
    }

    /**
     * Schedules a request
     * @param   {Promise<any>}  doJob       Action to be fulfilled
     * @param   {number}        priority    Priority level, 0: most important
     */
    request(func: Function, priority = 1): Promise<any> {
        return new Promise((res, rej) => {
            this.queues[priority].push({ func, res, rej })

            if (!this.isRunning) {
                this.dequeue();
            }
        })
    }

    onFinish() {
        this.isWorking = false;
        setTimeout(this.dequeue.bind(this), this.delay)
    }

    nextItem() {

        // TODO: takes an item at random. need to implement a less-random way
        
        let currItem;
        let priority;

        while (!currItem) {
            priority = Math.floor(Math.random() * (this.NUM_PRIORITY_LEVELS));
            const queue = this.queues[priority];
            const pop = queue.shift();
            if (pop) currItem = pop;
        }

        logger.debug(`ratelimiter.dequeue item (priority: ${priority} at ${Date.now()})`);

        return currItem;
    }

    dequeue(): boolean{
        
        this.isRunning = true;
        
        if (this.isWorking) {
            return false;
        }

        const currItem = this.nextItem();

        if (!currItem) {
            this.isRunning = false;
            return false;
        }


        currItem.func()
            .then((val) => {
                currItem.res(val);
            })
            .catch((err) => {
                currItem.rej(err);
            })
            .finally(() => {
                this.onFinish();
            })
    }
}

export default new RateLimiter();