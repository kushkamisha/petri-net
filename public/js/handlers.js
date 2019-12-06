'use strict'


function handleClicks() {
    arcDrawingHandler()

    window.cy.on('tap', e => {
        const trg = e.target
        if (isBackground(trg)) return backgroundClick(e)
        if (isTransition(trg)) return transitionClick(e)
        if (isPlace(trg)) return placeClick(e)
        if (isArc(trg)) return arcClick(e)
    })

    window.addEventListener('keypress', keyHandler, false)
    window.addEventListener('keyup', () => {
        window.pressedKey = undefined
        window.cy.autoungrabify(false)
        window.eh.disable()
    })

}

function backgroundClick(e) {
    console.log('background click')
    switch (window.pressedKey) {
        case 'q':
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
            break
        case 'w':
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
            break
    }

    console.log(cy.json().elements)
}

function transitionClick(e) {
    console.log('transition click')
    const id = e.target.id()
    let delay = prompt('Enter a time delay for the transition', 1)
    if (delay == null) return;
    while (isNaN(parseInt(delay)))
        delay = prompt(
            'The delay must be an integer above zero. Please, try again',
            1)
    delay = parseInt(delay)

    const net = window.cy.json().elements
    const transition = net.nodes.filter(x => x.data.id === id)[0]
    transition.data.delay = delay

    // update an image of the net
    draw(net)

    // update the file on server
    const timestamp = getCookie('timestamp')
    const data = JSON.stringify(net)
    socket.send(JSON.stringify({
        type: 'recreate',
        timestamp,
        data
    }))
}

function placeClick(e) {
    console.log('place click')
}

function arcClick(e) { console.log('arc click') }

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
}
