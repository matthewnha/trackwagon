require('dotenv').config()
import logger from './logger'

import http from 'http';
import createRestServer from './rest-server';
import createWsServer from './ws-server';


const httpServer = http.createServer();
const restServer = createRestServer();
httpServer.on('request', restServer);

createWsServer(httpServer);

const port = process.env.EXPRESS_PORT;
httpServer.listen(port, () => {
  logger.debug(`app.listen.success listening on ${port}`);
  logger.info(`Server is now listening on ${port}`);
});