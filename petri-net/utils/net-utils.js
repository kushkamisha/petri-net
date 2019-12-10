'use strict'

const fs = require('fs')
const Place = require('../Place')
const Arc = require('../Arc')
const Transition = require('../Transition')

module.exports = {
    getNetworkFromJSON: filePath => {
        const rawdata = fs.readFileSync(filePath)
        const data = JSON.parse(rawdata)

        const net = []
        const places = []
        const transIds = []

        if (!data.nodes) return
        for (const node of data.nodes) {
            if (node.data.type === 'transition') {
                transIds.push(node.data.id)
                net.push({
                    trans: new Transition({ id: node.data.id, delay: parseFloat(node.data.delay) }),
                    elems: []
                })
            } else if (node.data.type === 'place')
                places.push(new Place({
                    id: node.data.id,
                    markers: node.data.markers
                }))
        }

        if (!data.edges) return
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
                        weight: arc.data.weight ? parseInt(arc.data.weight) : 1
                    })
                })
            }

            // Arc is out of the Transition
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
                        weight: arc.data.weight ? parseInt(arc.data.weight) : 1
                    })
                })
            }
        }

        return net
    },

    updClientNet: (clientPath, netState) => {
        const rawdata = fs.readFileSync(clientPath)
        const data = JSON.parse(rawdata)

        for (const node of data.nodes) {
            const id = node.data.id
            // If this is a place id
            if (netState[id] !== undefined) {
                if (netState[id] === 0) delete node.data.markers
                else node.data.markers = netState[id]
            }
        }

        // Rewrite the file
        fs.writeFileSync(clientPath, JSON.stringify(data))
    },

    // Find the same elements in two arrays or more
    intersectionOfArrays: arrs => {
        const intersection = []
        for (let i = 0; i < arrs.length; i++) {
            for (let j = 0; j < arrs.length; j++) {
                if (i === j) continue
                for (let k = 0; k < arrs[i].length; k++) {
                    if (arrs[j].indexOf(arrs[i][k]) !== -1 && 
                        intersection.indexOf(arrs[i][k]) === -1)
                        intersection.push(arrs[i][k])
                }
            }
        }

        return intersection
    },

    /**
     * Gets an index of the element by <probs>. If <probs> is an empty array -
     * generate equal probabilities using the <numOfElements>.
     */
    getRandomWithProbability: (numOfElems, probs) => {
        // If probs is undefined - generate equal probabilities using the number
        // of elements
        if (!probs)
            probs = new Array(numOfElems).fill(1 / numOfElems)

        // If probs is an empty array - push 1 into it 
        if (!probs.length)
            probs = [1]

        // If sum of probabilities is less than 1 - add new item, so that now
        // the sum would be 1
        const sumOfProbs = probs.reduce((acc, x) => acc += x)
        if (sumOfProbs < 1)
            probs.push(1 - sumOfProbs)

        const num = Math.random()
        let s = 0
        const lastIndex = probs.length - 1

        for (let i = 0; i < lastIndex; ++i) {
            s += probs[i]
            if (num < s) {
                return i
            }
        }

        return lastIndex
    },

    getObjectFromNetById: (id, network) => {
        for (const transition of network) {
            if (transition.trans.id === id) return transition.trans

            for (const elem of transition.elems) {
                if (elem.place.id === id) return elem.place
                if (elem.arc.id === id) return elem.arc
            }
        }

        return false
    },

    /**
     * Find all transitions with the closest time in the future
     */
    minTransIds: exitTimes => {
        let minVal = Infinity
        let minIds = []
        for (const elem of exitTimes) {
            if (elem.exitTime <= minVal) {
                minVal = elem.exitTime
                minIds.push(elem.transId)
            }
        }

        return [minIds, minVal]
    }
}
