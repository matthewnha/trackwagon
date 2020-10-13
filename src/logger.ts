import winston from 'winston'

const maxsize = 10000000;

const transports = {
    console: new winston.transports.Console({
        level: 'info'
    }),
    infoFile: new winston.transports.File({
        filename: './info.log',
        level: 'info',
        maxsize,
    }),
    debugFile: new winston.transports.File({
        filename: './debug.log',
        level: 'debug',
        maxsize,
    }),
    errorFile: new winston.transports.File({
        filename: './error.log',
        level: 'error',
        maxsize,
    }),
}

const logger = winston.createLogger({
    level: 'silly',
    transports: [
        transports.console,
        transports.infoFile,
        transports.debugFile,
        transports.errorFile
    ]
});

if (process.argv.includes("--debug")) {
    console.log("Starting in debug mode");
    transports.console.level = 'debug';
}

export default logger;