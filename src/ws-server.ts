import { server as WebSocketServer } from 'websocket';
import { Server } from 'http';
import logger from './logger';
import WSClient from './ws-client';

function createWsServer(httpServer: Server) {
    const wsServer = new WebSocketServer({
        httpServer: httpServer,
        autoAcceptConnections: false
    });

    function originIsAllowed(origin) {
        logger.info('ws-server.originIsAllowed', {origin})
        // todo: validate origin
        return true;
      }
    
    wsServer.on('request', (request) => {
        if (!originIsAllowed(request.origin)) {
            request.reject();
            logger.info(`Connection rejected.`, {origin: request.origin});
            return;
        }

        const connection = request.accept('echo-protocol', request.origin);
        logger.info('Connection accepted.');

        const wsconnection = new WSClient(connection);

    });

    return wsServer;
}

export default createWsServer;