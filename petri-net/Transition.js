'use strict'

module.exports = class Transition {
    constructor({ id, probability }) {
        this.id = id
        this.probability = probability ? probability : -1
    }
}
