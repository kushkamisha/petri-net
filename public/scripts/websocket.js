const socket = new WebSocket('ws://127.0.0.1:16804')

socket.onopen = () => {
    console.log('connected')
}

socket.onclose = () => {
    console.log('closed')
}

socket.onmessage = event => {
    const data = JSON.parse(event.data)
    draw(data)
}
