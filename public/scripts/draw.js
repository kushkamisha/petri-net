function draw(elements) {
    window.cy = cytoscape({
        container: document.getElementById('cy'),

        layout: {
            name: 'preset', //'grid'
            padding: 50
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
        ],

        elements
    })
}
