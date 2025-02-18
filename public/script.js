async function sendIP(ip) {
    await fetch('/api/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `IPアドレス: ${ip}` })
    });
}

async function sendImage(blob) {
    const formData = new FormData();
    formData.append('file', blob, 'image.png');

    await fetch('/api/sendImage', {
        method: 'POST',
        body: formData
    });
}
