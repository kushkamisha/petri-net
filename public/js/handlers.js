'use strict'

// Save changes before page reloading
window.onbeforeunload = function (e) { if (window.netIsUnsaved) saveInWeb()}

function handleClicks() {
    arcDrawingHandler()

    window.cy.on('tap', e => {
        const trg = e.target
        if (isBackground(trg)) return backgroundClick(e)
        if (isTransition(trg)) return transitionClick(e)
        if (isPlace(trg)) return placeClick(e)
        if (isArc(trg)) return arcClick(e)
    })

    window.addEventListener('keydown', keyHandler)
    window.addEventListener('keyup', () => {
        window.pressedKey = undefined
        window.cy.autoungrabify(false)
        window.eh.disable()
    }, false)

}

function backgroundClick(e) {
    console.log('background click')

    if (window.pressedKey === 'q' || isActiveButton('place')) {
            cy.add([{
                group: 'nodes',
                data: {
                    // id: 'testid',
                    type: 'place'
                },
                renderedPosition: {
                    x: e.renderedPosition.x,
                    y: e.renderedPosition.y,
                },
            }])
            window.netIsUnsaved = true
    } else if (window.pressedKey === 'w' || isActiveButton('transition')) { 
            cy.add([{
                group: 'nodes',
                data: {
                    // id: 'testid',
                    type: 'transition'
                },
                renderedPosition: {
                    x: e.renderedPosition.x,
                    y: e.renderedPosition.y,
                },
            }])
            window.netIsUnsaved = true
    }

    console.log(cy.json().elements)
}

function transitionClick(e) {
    if (isActiveButton('remove')) deleteElement()

    // Only if in edit elements mode
    if (window.pressedKey !== 'r' && !isActiveButton('edit')) return
    window.pressedKey = undefined

    let delay = prompt('Enter the time delay for the transition', 1)
    if (delay == null) return;
    while (parseInt(delay) <= 0)
        delay = prompt(
            'The delay must be an integer above zero. Please, try again',
            1)
    delay = parseInt(delay)

    const id = e.target.id()
    const net = window.cy.json().elements
    const transition = net.nodes.filter(x => x.data.id === id)[0]
    transition.data.delay = delay

    // update an image of the net
    draw(net)
    window.netIsUnsaved = true
}

function placeClick(e) {
    if (isActiveButton('remove')) deleteElement()

    // Only if in edit elements mode
    if (window.pressedKey !== 'r' && !isActiveButton('edit')) return
    window.pressedKey = undefined

    let markers = prompt('Enter the number of markers', 1)
    if (markers == null) return;

    while (parseInt(markers) < 0)
        markers = prompt(
            'The number must be a non-negative integer. Please, try again',
            1)
    markers = parseInt(markers)

    const id = e.target.id()
    const net = window.cy.json().elements
    const place = net.nodes.filter(x => x.data.id === id)[0]
    place.data.markers = markers

    // update an image of the net
    draw(net)
    window.netIsUnsaved = true
}

function arcClick(e) {
    if (isActiveButton('remove')) deleteElement()

    // Only if in edit elements mode
    if (window.pressedKey !== 'r' && !isActiveButton('edit')) return
    window.pressedKey = undefined

    let weight = prompt('Enter the weight of the arc', 1)
    if (weight == null) return;
    while (parseInt(weight) <= 0)
        weight = prompt(
            'The weight must be an integer above zero. Please, try again',
            1)
    weight = parseInt(weight)

    const id = e.target.id()
    const net = window.cy.json().elements
    const arc = net.edges.filter(x => x.data.id === id)[0]
    // const arc = window.cy.$id(id).json()
    arc.data.weight = weight
    // console.log(arc.data)

    // update an image of the net
    draw(net)
    window.netIsUnsaved = true
}

function toggleArcMode() {
    if (!isActiveButton('arc')) {
        console.log('active arc')
        window.eh.enable()
        window.eh.enableDrawMode()
    } else {
        console.log('inactive arc')
        window.cy.autoungrabify(false)
        window.eh.disable()
    }
}

function deleteElement() {
    const elems = cy.$(':selected')
    elems.forEach(elem => cy.remove(elem))
    window.netIsUnsaved = true
}

function arcDrawingHandler() {
    const defaults = {
        preview: true, // whether to show added edges preview before releasing selection
        hoverDelay: 150, // time spent hovering over a target node before it is considered selected
        handleNodes: 'node', // selector/filter function for whether edges can be made from a given node
        snap: false, // when enabled, the edge can be drawn by just moving close to a target node
        snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
        snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
        noEdgeEventsInDraw: false, // set events:no to edges during draws, prevents mouseouts on compounds
        disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
        handlePosition: function (node) {
            return 'middle top'; // sets the position of the handle in the format of "X-AXIS Y-AXIS" such as "left top", "middle top"
        },
        handleInDrawMode: false, // whether to show the handle in draw mode
        edgeType: function (sourceNode, targetNode) {
            // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
            // returning null/undefined means an edge can't be added between the two nodes
            return 'flat';
        },
        loopAllowed: function (node) {
            // for the specified node, return whether edges from itself to itself are allowed
            return false;
        },
        nodeLoopOffset: -50, // offset for edgeType: 'node' loops
        nodeParams: function (sourceNode, targetNode) {
            // for edges between the specified source and target
            // return element object to be passed to cy.add() for intermediary node
            return {};
        },
        edgeParams: function (sourceNode, targetNode, i) {
            // for edges between the specified source and target
            // return element object to be passed to cy.add() for edge
            // NB: i indicates edge index in case of edgeType: 'node'
            return {};
        },
        ghostEdgeParams: function () {
            // return element object to be passed to cy.add() for the ghost edge
            // (default classes are always added for you)
            return {};
        },
        show: function (sourceNode) {
            // fired when handle is shown
        },
        hide: function (sourceNode) {
            // fired when the handle is hidden
        },
        start: function (sourceNode) {
            // fired when edgehandles interaction starts (drag on handle)
        },
        complete: function (sourceNode, targetNode, addedEles) {
            // fired when edgehandles is done and elements are added
            checkCreatedArc(sourceNode, targetNode, addedEles)
        },
        stop: function (sourceNode) {
            // fired when edgehandles interaction is stopped (either complete with added edges or incomplete)
        },
        cancel: function (sourceNode, cancelledTargets) {
            // fired when edgehandles are cancelled (incomplete gesture)
        },
        hoverover: function (sourceNode, targetNode) {
            // fired when a target is hovered
        },
        hoverout: function (sourceNode, targetNode) {
            // fired when a target isn't hovered anymore
        },
        previewon: function (sourceNode, targetNode, previewEles) {
            // fired when preview is shown
        },
        previewoff: function (sourceNode, targetNode, previewEles) {
            // fired when preview is hidden
        },
        drawon: function () {
            // fired when draw mode enabled
        },
        drawoff: function () {
            // fired when draw mode disabled
        }
    }

    window.eh = window.cy.edgehandles(defaults)
    window.eh.disable()
}

function checkCreatedArc(src, trg, added) {
    if (!isArcValid(src, trg))
        window.cy.remove(added)
    else
        window.netIsUnsaved = true
}
