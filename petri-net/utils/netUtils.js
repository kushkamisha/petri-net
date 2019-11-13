'use strict'

const fs = require('fs')
const Place = require('../Place')
const Arc = require('../Arc')
const Transition = require('../Transition')

module.exports = {
    getNetworkFromJSON: jsonName => {
        const rawdata = fs.readFileSync(jsonName)
        const data = JSON.parse(rawdata)

        const net = []
        const places = []
        const transIds = []

        for (const node of data.nodes) {
            if (node.data.type === 'transition') {
                transIds.push(node.data.id)
                net.push({ trans: new Transition({ id: node.data.id }), elems: [] })
            } else if (node.data.type === 'place')
                places.push(new Place({
                    id: node.data.id,
                    markers: node.data.markers ? node.data.markers : 0
                }))
        }

        for (const arc of data.edges) {
            // Arrow to the transition
            if (transIds.includes(arc.data.target)) {
                const currTransArr = net.filter(x => x.trans.id === arc.data.target)

                if (currTransArr === undefined)
                    throw new Error(
                        'Target id for transition in the edges array doesn\'t' +
                        ' match any transition in the nodes array.\n' +
                        'There must be a mistake when filling in "data.json" file'
                    )

                const currTrans = currTransArr[0]
                currTrans.elems.push({
                    place: places.filter(pl => pl.id === arc.data.source)[0],
                    arc: new Arc({
                        id: arc.data.id,
                        direction: 'in',
                        weight: arc.data.weight ? arc.data.weight : 1
                    })
                })
            }

            // Arrow from the transition
            else {
                const currTransArr = net.filter(x => x.trans.id === arc.data.source)

                if (currTransArr === undefined)
                    throw new Error(
                        'Source id for transition in the edges array doesn\'t' +
                        ' match any transition in the nodes array.\n' +
                        'There must be a mistake when filling in "data.json" file'
                    )

                const currTrans = currTransArr[0]
                currTrans.elems.push({
                    place: places.filter(pl => pl.id === arc.data.target)[0],
                    arc: new Arc({
                        id: arc.data.id,
                        direction: 'out',
                        weight: arc.data.weight ? arc.data.weight : 1
                    })
                })
            }
        }

        return net
    },

    rebuildClientData: (jsonName, netState) => {
        const rawdata = fs.readFileSync(jsonName)
        const data = JSON.parse(rawdata)

        console.log(jsonName)

        for (const node of data.nodes) {
            const id = node.data.id
            // If this is a place id
            if (netState[id] !== undefined) {
                if (netState[id] === 0) delete node.data.markers
                else node.data.markers = netState[id]
            }
        }

        // Rewrite client-data.json file
        fs.writeFileSync(jsonName, JSON.stringify(data))
    }
}
