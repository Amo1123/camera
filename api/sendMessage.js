export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl || !/^https:\/\/discord\.com\/api\/webhooks\//.test(webhookUrl)) {
        return res.status(500).json({ error: 'Invalid Webhook URL' });
    }

    const { content } = req.body;
    if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Invalid content' });
    }

    try {
        const discordRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });

        if (!discordRes.ok) throw new Error('Discord送信失敗');

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
