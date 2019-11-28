'use strict'

module.exports = class Transition {
    constructor({ id, probability, delay }) {
        this.id = id
        this.probability = probability ? probability : -1
        this.delay = delay ? delay : 0
    }
}
