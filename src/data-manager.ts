import { Pool } from 'pg'
import * as sc from './soundcloud' 
import rl from './rate-limiter'
import { FetchLikersOpts, FetchLikesOpts } from './interfaces'

/**
 * Postgres Interface
 * TODO: Cache data in db
 */

export default class ScDataManager {


    constructor() {}

    getTrackId = async (url: String) => {
        // TODO: Query db to see if it exists

        let data = await rl.request(() => sc.resolveUrl(url))

        // TODO: Check if we should add this data to db
        
        return data.id;
    }

    getTrackLikers = async (opts: FetchLikersOpts) => {
        
        // TODO: Query db to see if it exists

        const ee = sc.fetchLikersOfTrackById(opts);

        return ee;
    }

    getUserLikes = async (opts: FetchLikesOpts) => {
        
        // TODO: Query db to see if it exists

        const ee = sc.fetchUserLikes(opts);

        return ee;
    }

}