'use strict'

const {
    intersectionOfArrays,
    getRandomWithProbability
} = require('./utils/netUtils')

module.exports = class Net {
    constructor({ network, timeLimit }) {
        this.network = network
        this.netState = {} // object(place id <-> number of markers)
        this.timeLimit = timeLimit ? timeLimit : 1
        this.areMarkersConsumed = false
        this.consumerIds = [] // Ids of trans that consumed markers on the step

        this.validTransIds = []
        this.getNetState()
    }

    getNetState() {
        for (const transition of this.network) {
            for (const elem of transition.elems) {
                this.netState[elem.place.id] = elem.place.markers
            }
        }
        // console.dir(this.netState, { depth: null })
    }

    launch() {
        while(this.timeLimit > 0) {
            if (!this.areMarkersConsumed)
                this.validTransIds = this.getOnlyValidMoves()
            this.makeMove(this.validTransIds)
            if (!this.areMarkersConsumed) this.timeLimit--
        }

        return this.netState
    }
    
    next() {
        if (this.timeLimit > 0) {
            if (!this.areMarkersConsumed)
                this.validTransIds = this.getOnlyValidMoves()
            this.makeMove(this.validTransIds)
            if (!this.areMarkersConsumed) this.timeLimit--
        }

        return this.netState
    }

    // @return ids of transitions that can be executed now
    getOnlyValidMoves() {
        const validTransIds = []
        for (const transition of this.network) {
            const inArcsForTrans = transition.elems.filter(
                elem => elem.arc.direction === 'in')
            const validMovesForTrans = inArcsForTrans.filter(
                elem => elem.place.markers >= elem.arc.weight)
            if (validMovesForTrans.length === inArcsForTrans.length)
                validTransIds.push(transition.trans.id)
        }
        
        return validTransIds
    }

    getConflictsResolvingMethod(confs) {
        let resolvingWithEqlProb = true
        for (let trans in confs) {
            const trObj = this.network
                .filter(obj => obj.trans.id === trans)[0].trans
            if (trObj.probability !== -1) resolvingWithEqlProb = false
        }

        return resolvingWithEqlProb ? 'with equal probability' : 'by priority'
    }

    // @returns ids of conflict places along with conflict transition ids
    checkForConflicts(validTransIds) {
        const transAndPlaces = {}
        for (const transition of this.network) {
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

    resolveConflicts(conflicts, validTransIds) {
        // Pre remove all conflict transitions from validTransIds
        for (const key in conflicts)
            validTransIds = validTransIds.filter(x => x !== key)

        const resolvingMethod = this.getConflictsResolvingMethod(conflicts)
        let execTransId = ''

        if (resolvingMethod === 'with equal probability') {
            const numOfConflictTrans = Object.keys(conflicts).length
            execTransId = Object.keys(conflicts)
            [getRandomWithProbability(numOfConflictTrans)]
        } else if (resolvingMethod == 'by priority') {
            throw Error('Resolving conflicts by priority is not implemented yet')
        }

        // { 'tr-2': [ 'pl-10' ], 'tr-4': [ 'pl-10' ], 'tr-6': [ 'pl-10' ] }
        // const lostInConflicts = []
        // for (const id in conflicts)
        //     if (id !== execTransId) lostInConflicts.push(id)
        // console.log({ lostInConflicts })
        
        return [...validTransIds, execTransId]
    }

    consume(validTransIds) {

        const conflicts = this.checkForConflicts(validTransIds)
        let noConflicts = true
        for (const tr in conflicts)
            if (conflicts[tr].length) noConflicts = false

        console.log(`No conflicts: ${noConflicts}`)
        console.log(`before: ${validTransIds}`)
        console.log(conflicts)
        if (!noConflicts)
            validTransIds = this.resolveConflicts(conflicts, validTransIds)
        console.log(`after: ${validTransIds}`)

        for (const item of this.network) {
            if (!validTransIds.includes(item.trans.id)) continue

            for (const elem of item.elems) {
                if (elem.arc.direction === 'in' &&
                        elem.place.markers >= elem.arc.weight) {
                    elem.place.markers -= elem.arc.weight
                    console.log(`Id: ${elem.place.id} Markers: ${elem.place.markers}`)
                    this.netState[elem.place.id] = elem.place.markers
                    this.consumerIds.push(item.trans.id)
                }
            }
        }
    }

    produce(validTransIds) {
        console.log(`Produce: ${validTransIds}`)
        for (const item of this.network) {
            if (!validTransIds.includes(item.trans.id) ||
                !this.consumerIds.includes(item.trans.id)) continue

            this.consumerIds = this.consumerIds.filter(x => x !== item.trans.id)

            for (const elem of item.elems) {
                if (elem.arc.direction === 'out') {
                    elem.place.markers += elem.arc.weight
                    this.netState[elem.place.id] = elem.place.markers
                }
            }
        }
    }

    makeMove(validTransIds) {
        if (this.areMarkersConsumed) {
            this.produce(validTransIds)
            this.areMarkersConsumed = false
        } else {
            this.consume(validTransIds)
            this.areMarkersConsumed = true
        }
    }
}
