'use strict'

const fs = require('fs')
const { createNet } = require('../petri-net')
const config = require('../data/config')

const dirname = `${__dirname}/../data`
let _timelimit = 5
let net = undefined

const getNet = (filename, recreate=false, timelimit=_timelimit) => {
    if (typeof filename === 'undefined') filename = `${dirname}/${config.filename}`
    console.log({ filename })
    if (typeof net === 'undefined' || recreate)
        // Create a network
        net = createNet(filename, timelimit)
    
    return net
}

module.exports = getNet
