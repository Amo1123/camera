// api/ratelimit.js
const rateLimitMap = new Map(); // IPアドレスごとのアクセス記録
const LIMIT = 10;               // アクセス上限回数
const DURATION = 5 * 60 * 1000; // 5分 (ミリ秒換算)

// レートリミットを確認する関数
export function checkRateLimit(ip) {
    const now = Date.now();

    // 初回アクセスなら記録作成
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
        return { allowed: true };
    }

    const userData = rateLimitMap.get(ip);

    // 一定期間を過ぎたらリセット
    if (now - userData.startTime > DURATION) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
        return { allowed: true };
    }

    // アクセス回数を確認
    if (userData.count >= LIMIT) {
        return { allowed: false };  // 上限超過で禁止
    }

    // カウントを増やして許可
    userData.count++;
    return { allowed: true };
}
