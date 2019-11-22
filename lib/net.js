'use strict'

const fs = require('fs')
const { netFile } = require('./config')
const { createNet } = require('../petri-net')


let _filename = netFile // `${__dirname}/../data/client-data.json`
let _timelimit = 5
let net = undefined

const getNet = (filename=_filename, recreate=false, timelimit=_timelimit) => {
    if (typeof net === 'undefined' || recreate)
        // Create a network
        net = createNet(filename, timelimit)
    
    return net
}

module.exports = getNet
