import { PaginatedGetEvents } from './events';


export interface PaginatedGetCallbacks {
    onData?: (...args: any[]) => void,
    onDone?: (...args: any[]) => void,
    onErr?: (...args: any[]) => void,
}

export interface FetchLikesOpts {
    userId: number,
    ee: PaginatedGetEvents,
    isScraping?: boolean,
}

export const FetchLikesOptsDefault: FetchLikesOpts = {
    userId: undefined,
    ee: undefined,
    isScraping: false,
}


export interface FetchLikersOpts {
    trackId: number,
    ee: PaginatedGetEvents,
    isScraping?: boolean,
}

export const FetchLikersOptsDefault: FetchLikersOpts = {
    trackId: undefined,
    ee: undefined,
    isScraping: false,
}

export interface PaginatedOpts {
    url: string,
    ee: PaginatedGetEvents,
    isScraping: boolean
    limit?: number,
}

export const PaginatedOptsDefault: PaginatedOpts = {
    url: undefined,
    ee: undefined,
    isScraping: undefined,
    limit: 200,
}

export interface WebSocketMessage {
    type: string,
    utf8Data: string
}