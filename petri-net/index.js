'use strict'

const Net = require('./Net')
const Place = require('./Place')
const Arc = require('./Arc')
const Transition = require('./Transition')

const place1 = new Place({ markers: 0 })
const place2 = new Place({ markers: 1 })
const place3 = new Place({ markers: 0 })

const arc1 = new Arc({ direction: 'in' })
const arc2 = new Arc({ direction: 'out' })
const arc3 = new Arc({ direction: 'in' })
const arc4 = new Arc({ direction: 'out' })
const arc5 = new Arc({ direction: 'out' })

const trans1 = new Transition({ id: 1 })
const trans2 = new Transition({ id: 2 })

const netParams = {
    network: [
        {
            trans: trans1,
            elems: [
                {
                    place: place1,
                    arc: arc1
                },
                {
                    place: place2,
                    arc:  arc2
                }
            ]
            
        },
        {
            trans: trans2,
            elems: [
                {
                    place: place2,
                    arc: arc3
                },
                {
                    place: place1,
                    arc: arc4
                },
                {
                    place: place3,
                    arc: arc5
                }
            ]
        }
    ]
}

const net = new Net(netParams)
net.launch()
