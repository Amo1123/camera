export default function handler(req, res) {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
        return res.status(500).json({ error: 'Webhook URL is not set.' });
    }

    res.status(200).json({ webhookUrl });
}
