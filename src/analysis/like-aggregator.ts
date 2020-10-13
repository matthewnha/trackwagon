import { UserId, TrackId } from '../types';
import logger from "../logger";

// TODO: move to config
const NUM_TOP = 100;

export default class LikeAggregator {

  likes: Map<TrackId, Set<UserId>> = new Map();
  sortedLikes: Array<TrackId> = null;

  topN: Array<TrackId> = [];
  topNSet: Set<TrackId> = new Set();

  isSorted: boolean = false;

  numAdds: number = 0

  /**
   * Record a like. Returns the number of recorded likes for that song.
   * @param trackId 
   * @param userId 
   */
  add = (trackId: TrackId, userId: UserId): number => {
    if (!this.likes.has(trackId)) {
      logger.debug("server.analysis.likeagg.add unseen track, creating subset of likes", { trackId })
      this.likes.set(trackId, new Set<UserId>());
    }

    const trackLikers: Set<UserId> = this.likes.get(trackId);
    trackLikers.add(userId);
    logger.debug("server.analysis.likeagg.add user likes track", { userId, trackId });

    this.numAdds++;

    if (this.topNSet.has(trackId)) {
      return trackLikers.size;
    }

    if (this.topN.length < NUM_TOP) {
      this.topN.push(trackId);
      this.topNSet.add(trackId);
    } else {
      const lastTop: TrackId = this.topN[this.topN.length - 1];
      const lastTopNumLikers = this.getNumTrackLikes(lastTop);

      if (trackLikers.size >= lastTopNumLikers) {
        this.topN[this.topN.length - 1] = trackId;
        this.topNSet.add(trackId);
        this.topNSet.delete(lastTop);
        this.sortTopN();
      }
    }


    return trackLikers.size;
  }

  getNumTrackLikes = (trackId: TrackId): number => {
    const likes = this.likes.get(trackId);
    return (undefined == likes) ? 0 : likes.size;
  }

  getTopN = (): Array<TrackId> => {
    return this.topN;
  }

  sortTopN = (): void => {
    // todo: implement insertion sort?
    this.topN.sort((a, b) => this.getNumTrackLikes(b) - this.getNumTrackLikes(a));
    this.isSorted = true;
  }
}