export const config = {
    api: {
        bodyParser: false, // FormData対応のため無効化
    },
};

import { IncomingForm } from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl || !/^https:\/\/discord\.com\/api\/webhooks\//.test(webhookUrl)) {
        return res.status(500).json({ error: 'Invalid Webhook URL' });
    }

    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err || !files.file) {
            return res.status(400).json({ error: 'Invalid file upload' });
        }

        const filePath = files.file[0].filepath;
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
            await unlinkAsync(filePath);
        }
    });
}
