import { WebSocketMessage } from './interfaces';
import ScDataManager from './data-manager';
import SongRecommendations from './analysis'
import logger from './logger';

export default class WSClient {
    connection;

    constructor(connection) {
        this.connection = connection;
        this.initConnection();
    }

    initConnection() {
        this.connection.on('message', this.handleMessage);

        this.connection.on('close', (reasonCode, desc) => {
            logger.info('Peer disconnected', { remoteAddress: this.connection.remoteAddress, reasonCode, desc });
        })
    }

    handleMessage(message: WebSocketMessage) {
        if ("utf8" != message.type) {
            logger.error("WS message received is not UTF-8", {
                type: message.type
            });
            return;
        }

        logger.info('WS message received.', message);

        let action;
        try {
            action = JSON.parse(message.utf8Data);
        } catch {
            logger.warn("Message payload is not JSON", message);
            return;
        }

        if ("startAnalysis" == action.title) {
            logger.info("startAnalysis", action.data);
            
            const data = new ScDataManager(); // todo: move to be exported as a singleton or pass down from app.ts
            let recommender = new SongRecommendations(action.data.trackId, data);
            recommender.run((entries) => {
              console.log(entries);
            });
            
        } else {
            logger.warn("Unkown message title", message);
        }
    }
}