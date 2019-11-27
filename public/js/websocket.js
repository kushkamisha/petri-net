const socket = new WebSocket('ws://127.0.0.1:16804')

socket.onopen = () => {
    console.log('connected')
    const timestamp = getCookie('timestamp')
    socket.send(JSON.stringify({ type: 'net-data', ...timestamp && {timestamp} }))
}

socket.onclose = () => {
    console.log('closed')
}

socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)
    draw(data)
}
