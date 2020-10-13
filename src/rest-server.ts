import express from 'express';
import logger from './logger'

function startRestServer() {
    /**
     * Start express server
     */
    const app = express();
    
    app.get('/', (req, res) => {
      // SoundCloud.fetchLikersOfTrackByUrl("https://soundcloud.com/kultursound/let-it-be?in=ohmatthew/sets/the-track")
      res.send('The sedulous hyena ate the antelope!');
    });

    return app;
}

export default startRestServer;