export const config = {
    api: {
        bodyParser: true,  // JSON形式のリクエストボディを解析
    },
};

import { FormData } from 'formdata-node';
import { Blob } from 'buffer';
import { fetch } from 'undici';

const requestCounts = new Map();  // IPごとのリクエスト回数を管理
const LIMIT = 10;                 // 上限回数
const DURATION = 5 * 60 * 1000;   // 5分 (ミリ秒換算)

// レートリミットをチェックして処理
export default async function handler(req, res) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;  // クライアントIP取得
    const now = Date.now();
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
        return res.status(500).json({ error: 'Webhook URLが設定されていません' });
    }

    // レートリミットの確認と管理
    if (!requestCounts.has(clientIp)) {
        requestCounts.set(clientIp, { count: 1, startTime: now });
    } else {
        const userData = requestCounts.get(clientIp);
        if (now - userData.startTime > DURATION) {
            // 指定時間を過ぎたらカウントをリセット
            requestCounts.set(clientIp, { count: 1, startTime: now });
        } else if (userData.count >= LIMIT) {
            // 上限超過でアクセス禁止
            return res.status(429).json({ error: 'アクセス制限: しばらく待ってから再試行してください' });
        } else {
            userData.count++;
        }
    }

    // POSTメソッドのみ許可
    if (req.method === 'POST') {
        const { base64 } = req.body;

        if (!base64) {
            return res.status(400).json({ error: 'Base64データが送信されていません' });
        }

        try {
            // Base64をバイナリに変換してPNGに
            const buffer = Buffer.from(base64, 'base64');
            const blob = new Blob([buffer], { type: 'image/png' });

            // FormDataを作成して画像を添付
            const formData = new FormData();
            formData.set('file', blob, 'image.png');

            // Webhookに画像を送信
            const discordRes = await fetch(webhookUrl, {
                method: 'POST',
                body: formData,
                headers: formData.headers,
            });

            const resultText = await discordRes.text();

            // 送信結果の確認
            if (!discordRes.ok) {
                throw new Error(`画像送信失敗: ${discordRes.statusText} - ${resultText}`);
            }

            // 成功レスポンス
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('エラー:', error);
            res.status(500).json({ error: error.message });
        }
    } else {
        // 許可されていないメソッドの場合
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
