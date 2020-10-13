import ScDataManager from "../data-manager";
import logger from "../logger";
import { FetchLikersOpts, FetchLikesOpts } from "../interfaces";
import { PaginatedGetEvents } from "../events";

import { UserId, TrackId } from '../types'
import LikeAggregator from "./like-aggregator";

export default class TrackRecommendations {

    timeStartedMs: number;

    trackId: TrackId;
    data: ScDataManager;
    onCompletion: (sortedTrackIds: Array<TrackId>) => void;

    likes: LikeAggregator = new LikeAggregator();
    usersToBeAnalyzed = new Set<UserId>();
    usersAnalyzed = new Set<UserId>();
    isDoneAddingLikers = false;

    constructor(trackId: TrackId, data: ScDataManager) {
        this.trackId = trackId;
        this.data = data;
    }

    run = (onCompletion: (sortedTrackIds: Array<TrackId>) => void) => {

        logger.info("Started analysis", { trackId: this.trackId });

        this.onCompletion = onCompletion;
        this.timeStartedMs = Date.now();

        const ee = new PaginatedGetEvents({
            onData: this.addNewLikers,
            // todo: implement done&err
            onDone: () => this.isDoneAddingLikers = true,
            onErr: (err) => {
                this.isDoneAddingLikers = true
            }
        });

        const opts: FetchLikersOpts = { trackId: this.trackId, ee };
        this.data.getTrackLikers(opts)
            .catch((err) => console.error(err));

        setTimeout(() => {
            this.printTop10();
        }, 10000);
    }

    /**
     * Begin fetching the likes of collection of users
     * @param collection 
     */
    addNewLikers = (collection) => {
        logger.debug("server.analysis.addNewLikers.begin", { collection }.toString());
        for (const liker of collection) {
            logger.debug("server.analysis.addNewLikers.call.getUserLikes", { liker });

            if (this.usersToBeAnalyzed.has(liker) || this.usersAnalyzed.has(liker)) {
                continue;
            }

            this.usersToBeAnalyzed.add(liker);
            
            this.getUserLikes(liker['id']);
        }
    }

    getUserLikes = (userId: UserId)  => {
        logger.debug("server.analysis.getUserLikes.begin", { userId })

        const ee = new PaginatedGetEvents({
            onData: (collection) => this.addTracksFromUser(collection, userId),
            onDone: () => this.onDoneAddingTracksFromUser(userId)
            // todo: implement done&err
            // onErr: (err) => this.onUserEventError(err, userId));
        })

        const opts: FetchLikesOpts = { userId, ee };

        this.data.getUserLikes(opts)
            .catch((err) => console.error(err));
    }

    /**
     * Add a user's liked tracks to the aggregate set of liked tracks
     * @param collection 
     * @param userId 
     */
    addTracksFromUser = (collection, userId) => {
        logger.debug("server.analysis.addNewTracks.begin", { collection, userId })
        for (let track of collection) {
            this.addTrackFromUser(track['id'], userId);
        }
    }

    addTrackFromUser = (trackId, userId) => {

        if (trackId == this.trackId) return;

        let numLikers = this.likes.add(trackId, userId);

        logger.verbose('server.analysis.addTrackFromUser', {userId, trackId, numLikers});
    }

    onDoneAddingTracksFromUser = (userId) => {
        this.usersToBeAnalyzed.delete(userId);
        this.usersAnalyzed.add(userId);

        if (!this.usersToBeAnalyzed.size && this.isDoneAddingLikers) {
            this.onDoneGatheringData();
        }
    }

    /**
     * Returns the currently observed number of likers of a track
     * @param trackId 
     */
    getNumTrackLikes = (trackId) => {
        return this.likes.getNumTrackLikes(trackId)
    }

    printTop10 = () => {
        const sortedByPopular = this.likes.getTopN();

        const topList = [];
        for (let i=0; i<10; i++) {
            let trackId = sortedByPopular[i];
            let numLikers = this.getNumTrackLikes(trackId);
            topList.push({rank: i+1, trackId, numLikers});
        }

        logger.info('server.analysis.printTop10', {
            topList,
            analyzed: this.usersAnalyzed.size,
            totalUsers: this.usersToBeAnalyzed.size + this.usersAnalyzed.size,
            numLikes: this.likes.numAdds,
            timeElapsedSec: (Date.now() - this.timeStartedMs)/1000,
        });

        setTimeout(() => {
            this.printTop10();
        }, 10000);
    }

    pushUpdate = () => {
        // TODO: push to client
        this.printTop10();
    }

    onDoneGatheringData = () => {
        this.pushUpdate();
        this.onCompletion(this.likes.getTopN());
    }
}