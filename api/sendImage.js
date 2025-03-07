export const config = {
    api: {
        bodyParser: false,
    },
};

import { IncomingForm } from 'formidable';
import fs from 'fs';
import { FormData } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import { fetch } from 'undici';
import path from 'path';

export default async function handler(req, res) {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
        return res.status(500).json({ error: 'Webhook URLが設定されていません' });
    }

    if (req.method === 'POST') {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ error: 'ファイル解析エラー', details: err.message });
            }

            const base64Data = fields.base64;
            if (!base64Data) {
                return res.status(400).json({ error: 'Base64データが送信されていません' });
            }

            const buffer = Buffer.from(base64Data, 'base64');
            const tempFilePath = path.join('/tmp', `image_${Date.now()}.png`);

            try {
                // PNGとして保存
                fs.writeFileSync(tempFilePath, buffer);

                const formData = new FormData();
                const imageFile = await fileFromPath(tempFilePath, 'image.png', { type: 'image/png' });
                formData.set('file', imageFile);

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
            } finally {
                try {
                    fs.unlinkSync(tempFilePath);
                } catch (unlinkErr) {
                    console.warn('一時ファイル削除失敗:', unlinkErr.message);
                }
            }
        });
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
