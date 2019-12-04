'use strict'

const path = require('path')
const { createNet } = require('../petri-net')
const config = require('../data/config')

const dirName = path.join(__dirname, '..', 'data')
let _timelimit = 50
let net = undefined

const getNet = (filename, recreate=false, timelimit=_timelimit) => {
    if (typeof filename === 'undefined')
        filename = path.join(dirName, 'forClient', config.filename)

    if (typeof net === 'undefined' || recreate) {
        console.log('the net is undefined')
        net = createNet(filename, timelimit)
    } else
        console.log('the net is defined')
    
    return net
}

module.exports = getNet
