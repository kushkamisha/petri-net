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
                selector: 'node[type="place"]',
                css: {
                    'content': 'data(markers)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'height': '40',
                    'width': '40',
                }
            },
            {
                selector: 'node[type="transition"]',
                css: {
                    'content': ele => `t=${ele.data('delay')}`,
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
                selector: "edge[weight]",
                css: {
                    "label": "data(weight)",

                    // label background
                    "text-background-opacity": 1,
                    "color": "#fff",
                    "text-background-color": "black",
                    "text-background-shape": "roundrectangle",
                    "text-border-color": "black",
                    "text-border-width": 2,
                    "text-border-opacity": 1
                }
            }
        ],

        elements
    })
}
