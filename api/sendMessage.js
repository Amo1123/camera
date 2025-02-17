export default async function handler(req, res) {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (req.method === 'POST') {
        try {
            const { message, image } = req.body;

            const payload = message
                ? { content: message }
                : { content: '画像をアップロードしました', files: [image] };

            const discordRes = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!discordRes.ok) throw new Error('送信失敗');

            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
