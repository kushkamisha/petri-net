'use strict'

const winston = require('winston')

module.exports = winston.createLogger({
    transports: [
        new winston.transports.Console(winston.format.simple()),
        new winston.transports.File({ filename: 'logs.log' })
    ]
})
