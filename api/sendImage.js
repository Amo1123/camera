export const config = {
    api: {
        bodyParser: false,
    },
};

import { IncomingForm } from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';

export default async function handler(req, res) {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
        return res.status(500).json({ error: 'Webhook URLが設定されていません' });
    }

    if (req.method === 'POST') {
        const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ error: 'ファイル解析エラー', details: err.message });
            }

            const filePath = files.file?.[0]?.filepath;

            if (!filePath) {
                return res.status(400).json({ error: 'ファイルがアップロードされていません' });
            }

            try {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(filePath), 'image.png');

                const discordRes = await fetch(webhookUrl, {
                    method: 'POST',
                    body: formData,
                });

                if (!discordRes.ok) throw new Error('画像送信失敗');

                res.status(200).json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            } finally {
                fs.unlinkSync(filePath);
            }
        });
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
