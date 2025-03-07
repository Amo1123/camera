// api/ratelimit.js
const requestCounts = new Map();  // IPごとのリクエスト回数を管理
const LIMIT = 10;                 // 上限回数
const DURATION = 5 * 60 * 1000;   // 5分 (ミリ秒換算)

// レートリミットをチェックして結果を返す関数
export function checkRateLimit(ip) {
    const now = Date.now();

    if (!requestCounts.has(ip)) {
        // 初回アクセスなら記録作成
        requestCounts.set(ip, { count: 1, startTime: now });
        return { allowed: true };
    }

    const userData = requestCounts.get(ip);

    // 指定時間を過ぎたらカウントをリセット
    if (now - userData.startTime > DURATION) {
        requestCounts.set(ip, { count: 1, startTime: now });
        return { allowed: true };
    }

    // 上限超えたらアクセス禁止
    if (userData.count >= LIMIT) {
        return { allowed: false };
    }

    // カウントを増やして許可
    userData.count++;
    return { allowed: true };
}
