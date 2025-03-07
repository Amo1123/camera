export const config = {
    api: {
        bodyParser: false,
    },
};

import { IncomingForm } from 'formidable';
import { FormData } from 'formdata-node';
import { fetch } from 'undici';

export default async function handler(req, res) {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
        return res.status(500).json({ error: 'Webhook URLが設定されていません' });
    }

    if (req.method === 'POST') {
        const form = new IncomingForm();

        form.parse(req, async (err, fields) => {
            if (err) {
                return res.status(500).json({ error: 'ファイル解析エラー', details: err.message });
            }

            const base64Data = fields.base64;
            if (!base64Data) {
                return res.status(400).json({ error: 'Base64データが送信されていません' });
            }

            try {
                const buffer = Buffer.from(base64Data, 'base64');
                const formData = new FormData();
                const fileBlob = new Blob([buffer], { type: 'image/png' });

                formData.set('file', fileBlob, 'image.png');

                const discordRes = await fetch(webhookUrl, {
                    method: 'POST',
                    body: formData,
                    headers: formData.headers,
                });

                const resultText = await discordRes.text();

                if (!discordRes.ok) {
                    throw new Error(`画像送信失敗: ${discordRes.statusText} - ${resultText}`);
                }

                res.status(200).json({ success: true });
            } catch (error) {
                console.error('エラー:', error);
                res.status(500).json({ error: error.message });
            }
        });
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
