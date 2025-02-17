export default async function handler(req, res) {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
        return res.status(500).json({ error: 'Webhook URLが設定されていません' });
    }

    if (req.method === 'POST') {
        const { content } = req.body;

        try {
            const discordRes = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });

            if (!discordRes.ok) {
                throw new Error(`メッセージ送信失敗: ${discordRes.statusText}`);
            }

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('メッセージ送信エラー:', error);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
