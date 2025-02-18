export const config = {
    api: {
        bodyParser: false,
    },
};

import { IncomingForm } from 'formidable';
import fs from 'fs';
import { FormData, Blob } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import { fetch } from 'undici';

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

            const file = files.file;
            if (!file) {
                return res.status(400).json({ error: 'ファイルがアップロードされていません' });
            }

            const uploadedFile = Array.isArray(file) ? file[0] : file;
            const filePath = uploadedFile.filepath || uploadedFile.path;

            if (!filePath) {
                return res.status(400).json({ error: 'ファイルパスが取得できません' });
            }

            try {
                const formData = new FormData();
                const imageFile = await fileFromPath(filePath, uploadedFile.originalFilename || 'image.png', {
                    type: 'image/png', // 必要に応じて変更
                });

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
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.warn('一時ファイル削除失敗:', unlinkErr.message);
                }
            }
        });
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
