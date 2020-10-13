import {EventEmitter} from 'events'
import { PaginatedGetCallbacks } from './interfaces'

export class PaginatedGetEvents extends EventEmitter {

    onData;
    onDone;
    onErr;

    constructor(callbacks: PaginatedGetCallbacks) {
        super();

        const { onData, onDone, onErr } = callbacks;
        
        this.onData = onData;
        this.onDone = onDone;
        this.onErr = onErr;

        if (onData) this.on('data', this.onData);
        if (onDone) this.on('done', this.onDone);
        if (onErr)  this.on('error', this.onErr);
    }

    emitData(data) {
        this.emit('data', data);
    }

    done(msg?) {
        this.emit('done', msg);
    }

    error(err) {
        this.emit('error', err);
    }

}