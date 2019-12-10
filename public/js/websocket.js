const socket = new WebSocket('ws://127.0.0.1:16804')

socket.onopen = () => {
    console.log('connected')
    window.netIsUnsaved = false
    askNetData()
}

socket.onclose = () => {
    console.log('closed')
}

socket.onmessage = event => processEvent(event)
