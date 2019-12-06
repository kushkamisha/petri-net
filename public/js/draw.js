'use strict'

function draw(elements) {
    window.cy = cytoscape({
        container: document.getElementById('cy'),

        layout: {
            name: 'preset', //'grid'
            padding: 100
        },
        
        style: [
            {
                selector: `node[type='place']`,
                css: {
                    'content': el => el.data('markers') > 0 ?
                        el.data('markers') : '',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'height': '40',
                    'width': '40',
                }
            },
            {
                selector: `node[type='transition']`,
                css: {
                    'content': el => el.data('delay') ?
                        `t=${el.data('delay')}` : '',
                    'shape': 'rectangle',
                    'height': '40',
                    'width': '10',
                }
            },
            {
                selector: 'edge',
                css: {
                    'line-color': 'black',
                    'target-arrow-color': 'black',
                    'target-arrow-shape': 'vee',
                    'curve-style': 'bezier',
                }
            },
            {
                selector: 'edge[weight]',
                css: {
                    'label': el => el.data('weight') > 1 ?
                        el.data('weight') : '',

                    // label background
                    'text-background-opacity': 1,
                    'color': '#fff',
                    'text-background-color': 'black',
                    'text-background-shape': 'roundrectangle',
                    'text-border-color': 'black',
                    'text-border-width': 2,
                    'text-border-opacity': 1
                }
            },
            {
                selector: 'edge:selected',
                style: {
                    'line-color': 'blue'
                }
            },

            // some style for the extension
            {
                selector: '.eh-handle',
                style: {
                    'background-color': 'red',
                    'width': 12,
                    'height': 12,
                    'shape': 'ellipse',
                    'overlay-opacity': 0,
                    'border-width': 12, // makes the handle easier to hit
                    'border-opacity': 0
                }
            },
            {
                selector: '.eh-hover',
                style: {
                    'background-color': 'red'
                }
            },
            {
                selector: '.eh-source',
                style: {
                    'border-width': 2,
                    'border-color': 'red'
                }
            },
            {
                selector: '.eh-target',
                style: {
                    'border-width': 2,
                    'border-color': 'red'
                }
            },
            {
                selector: '.eh-preview, .eh-ghost-edge',
                style: {
                    'background-color': 'red',
                    'line-color': 'red',
                    'target-arrow-color': 'red',
                    'source-arrow-color': 'red'
                }
            },
            {
                selector: '.eh-ghost-edge.eh-preview-active',
                style: {
                    'opacity': 0
                }
            }
        ],

        elements
    })

    // Add click handlers
    handleClicks()
}
