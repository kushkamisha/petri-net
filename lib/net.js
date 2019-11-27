'use strict'

const path = require('path')
const { createNet } = require('../petri-net')
const config = require('../data/config')

const dirName = path.join(__dirname, '..', 'data')
let _timelimit = 5
let net = undefined

const getNet = (filename, recreate=false, timelimit=_timelimit) => {
    if (typeof filename === 'undefined')
        filename = path.join(dirName, 'server', config.filename)

    if (typeof net === 'undefined' || recreate)
        net = createNet(filename, timelimit)
    
    return net
}

module.exports = getNet
