export const config = {
    api: {
        bodyParser: false,
    },
};

import { IncomingForm } from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export default async function handler(req, res) {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
        return res.status(500).json({ error: 'Webhook URLが設定されていません' });
    }

    if (req.method === 'POST') {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('ファイル解析エラー:', err);
                return res.status(500).json({ error: 'ファイル解析エラー' });
            }

            const file = files.file?.[0];
            if (!file) {
                console.error('ファイルが見つからない:', files);
                return res.status(400).json({ error: '画像ファイルが見つかりません' });
            }

            const filePath = file.filepath;

            try {
                const formData = new FormData();
                formData.append('files[0]', fs.createReadStream(filePath), 'image.png');
                formData.append('payload_json', JSON.stringify({ content: '画像を送信します！' }));

                const discordRes = await fetch(webhookUrl, {
                    method: 'POST',
                    body: formData,
                    headers: formData.getHeaders(),
                });

                if (!discordRes.ok) {
                    const errorBody = await discordRes.text();
                    console.error('画像送信失敗:', discordRes.status, discordRes.statusText, errorBody);
                    throw new Error(`画像送信失敗: ${discordRes.statusText}`);
                }

                res.status(200).json({ success: true });
            } catch (error) {
                console.error('画像送信エラー:', error);
                res.status(500).json({ error: error.message });
            } finally {
                fs.unlinkSync(filePath);
            }
        });
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
