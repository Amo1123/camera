export default function handler(req, res) {
    return res.status(403).json({ error: 'Access denied' }); // Webhook URL を漏洩させない
}
