'use strict'

const expect = require('chai').expect
const net = require('../../utils/netUtils')

describe('Intersection of arrays', () => {

    it('arrays [1, 2, 3] and [2, 8, 9]', () => {
        const res = net.intersectionOfArrays([[1, 2, 3], [2, 8, 9]])
        expect(res).to.eql([2])
    })

    it('arrays [1, 2, 3] and [2, 8, 9], [0, 8, 3], [5, 5, 5]', () => {
        const res = net.intersectionOfArrays([
            [1, 2, 3], [2, 8, 9], [0, 8, 3], [5, 5, 5]
        ])
        expect(res).to.eql([2, 3, 8])
    })

})
