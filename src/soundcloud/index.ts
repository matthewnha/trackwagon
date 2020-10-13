import axios, { AxiosError } from 'axios'
import { api, endpoints } from './api'
import rl from '../rate-limiter'
import { EventEmitter } from 'events'
import logger from '../logger'
import {
  FetchLikesOpts, FetchLikesOptsDefault,
  FetchLikersOpts, FetchLikersOptsDefault,
  PaginatedOpts, PaginatedOptsDefault,
} from '../interfaces'

const CLIENT_ID = process.env.SC_CLIENT_ID;

export const resolveUrl = async function (url: String) {
  try {
    const endpoint = endpoints.resolve(url);
    let params = { client_id: CLIENT_ID }
    const response = await api.get(endpoint, { params });

    return response.data;
  } catch (err) {

    // TODO: handle errors nicely. 404 if bad url inserted

    if (err && err.response) {
      logger.error("soundcloud.resolveUrl.error", { err });
      // const axiosErr = err as AxiosError<ServerError>;
      const axiosErr = err as AxiosError;
      return axiosErr.response.data;
    }


    throw err;
  }
}

/**
 * Fetches a user's likes.
 * Return EventEmitter.
 * @param opts: FetchLikesOpts
 */
export const fetchUserLikes = async function (opts: FetchLikesOpts) {
  const config = { ...FetchLikesOptsDefault, ...opts };
  const { userId, ee, isScraping } = config;

  const endpoint = endpoints.userLikes(userId);
  const getOpts: PaginatedOpts = {
    url: `${endpoints.baseUrl}${endpoint}?client_id=${CLIENT_ID}`,
    ee,
    isScraping: isScraping
  }

  return getPaginated(getOpts);
}



/**
 * Fetches the likers of a track.
 * Return EventEmitter.
 * @param opts: FetchLikersOpts
 */
export const fetchLikersOfTrackById = async function (opts: FetchLikersOpts) {
  const config = { ...FetchLikersOptsDefault, ...opts };
  const { trackId, ee, isScraping } = config;

  const endpoint = endpoints.trackLikes(trackId);
  const getOpts: PaginatedOpts = {
    url: `${endpoints.baseUrl}${endpoint}?client_id=${CLIENT_ID}`,
    ee,
    isScraping
  }

  return getPaginated(getOpts);
}

/**
 * Performs a paginated API request.
 * Returns data through EventEmitter.
 * @param opts: PaginatedOpts
 */

const getPaginated = async function (opts: PaginatedOpts) {

  const config = { ...PaginatedOptsDefault, ...opts };
  const { url, isScraping, limit, ee } = config;

  try {

    let nextHref = url;
    let currPriority = isScraping ? 3 : 2;

    while (nextHref) {
      let params = { limit, linked_partitioning: 1, client_id: CLIENT_ID }

      const req = () => axios.get(nextHref, { params });
      const { data } = await rl.request(req, currPriority);

      logger.debug(`soundcloud.runPaginatedGet.emit.partial ${{ config }}`);
      
      ee.emitData(data['collection']);
      nextHref = data['next_href'];
      
      if (!isScraping) {
        currPriority = 1; // Elevate priority of subsequent requests
      }
    }

    logger.debug(`soundcloud.runPaginatedGet.emit.done ${{ config }}`);
    ee.done();

  } catch (err) {

    if (err && err.response) {
      logger.error(`soundcloud.runPaginatedGet.error ${url} ${{ err }.toString()}`);
      ee.error(err);
      const axiosErr = err as AxiosError;
      throw axiosErr.response.data;
    }


    throw err;
  }
}