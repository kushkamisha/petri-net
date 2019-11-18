'use strict'

const {
    intersectionOfArrays,
    getRandomWithProbability,
    getObjectFromNetById
} = require('./netUtils')

const getConflictsResolvingMethod = (confs, network) => {
    let resolvingWithEqlProb = true
    for (let trans in confs) {
        const trObj = network
            .filter(obj => obj.trans.id === trans)[0].trans
        if (trObj.probability !== -1) resolvingWithEqlProb = false
    }

    return resolvingWithEqlProb ? 'with equal probability' : 'by priority'
}

// @returns ids of conflict places along with conflict transition ids
const checkForConflicts = (validTransIds, network) => {
    const transAndPlaces = {}
    for (const transition of network) {
        if (!validTransIds.includes(transition.trans.id)) continue
        transAndPlaces[transition.trans.id] = []

        for (const elem of transition.elems) {
            if (elem.arc.direction === 'out') continue
            transAndPlaces[transition.trans.id].push(elem.place.id)
        }
    }

    const places = []
    for (const key in transAndPlaces) places.push(transAndPlaces[key])

    const conflictPlaces = intersectionOfArrays(places)

    for (const trans in transAndPlaces)
        transAndPlaces[trans] = transAndPlaces[trans]
            .filter(pl => conflictPlaces.indexOf(pl) !== -1)

    // Remove transitions without conflicts
    for (const tr in transAndPlaces) {
        if (!transAndPlaces[tr].length)
            delete transAndPlaces[tr]
    }

    return transAndPlaces
}

const resolveConflicts = (conflicts, validTransIds, network) => {
    // Pre remove all conflict transitions from validTransIds
    for (const key in conflicts)
        validTransIds = validTransIds.filter(x => x !== key)

    const resolvingMethod = getConflictsResolvingMethod(conflicts, network)
    let execTransId = ''

    if (resolvingMethod === 'with equal probability') {
        const numOfConflictTrans = Object.keys(conflicts).length
        execTransId = Object.keys(conflicts)
        [getRandomWithProbability(numOfConflictTrans)]
    } else if (resolvingMethod == 'by priority') {
        throw Error('Resolving conflicts by priority is not implemented yet')
    }

    console.log({ execTransId })

    return [...validTransIds, execTransId]
}

module.exports = {
    checkForConflicts,
    resolveConflicts
}
