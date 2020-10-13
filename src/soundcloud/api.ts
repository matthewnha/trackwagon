import axios, {AxiosError} from 'axios'


const baseUrl = `http://api.soundcloud.com`

export const api = axios.create({
    baseURL: baseUrl,
    responseType: 'json',
    headers: {
        'Content-Type': 'application/json',
    }
})

export const endpoints = {
    baseUrl: baseUrl,

    resolve: (url) => `/resolve?url=${url}`,
    latestTracks: `/tracks`,
    track: (trackId) => `/tracks/${trackId}`,
    trackLikes: (trackId) => `/tracks/${trackId}/favoriters`,
    user: (userId) => `/users/${userId}`,
    userLikes: (userId) => `/users/${userId}/favorites`,
    trendingFullUrl: `https://api-v2.soundcloud.com/charts?kind=trending&genre=soundcloud%3Agenres%3Aall-music&region=soundcloud%3Aregions%3AUS&high_tier_only=false`

}