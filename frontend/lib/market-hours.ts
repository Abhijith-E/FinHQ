/**
 * Market Hours Utility
 * Indian markets (NSE/BSE) are open:
 * - Monday to Friday
 * - 9:15 AM to 3:30 PM IST
 *
 * All times are computed in IST (UTC+5:30) regardless of client's local timezone.
 */

// IST offset in milliseconds (UTC+5:30)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Get current time in IST as a Date object
 */
function getISTTime(): Date {
    return new Date(Date.now() + IST_OFFSET_MS);
}

export function isMarketOpen(): boolean {
    const now = getISTTime();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const dayInMinutes = hours * 60 + minutes;

    // Weekends are closed
    if (day === 0 || day === 6) {
        return false;
    }

    // Market hours: 9:15 AM (555 mins) to 3:30 PM (930 mins)
    const marketOpen = 9 * 60 + 15; // 555
    const marketClose = 15 * 60 + 30; // 930

    return dayInMinutes >= marketOpen && dayInMinutes < marketClose;
}

export function getMarketStatus(): 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'POST_MARKET' {
    const now = getISTTime();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const dayInMinutes = hours * 60 + minutes;

    // Weekend
    if (day === 0 || day === 6) {
        return 'CLOSED';
    }

    const marketOpen = 9 * 60 + 15;
    const marketClose = 15 * 60 + 30;

    if (dayInMinutes < marketOpen) {
        return 'PRE_MARKET';
    } else if (dayInMinutes >= marketClose) {
        return 'POST_MARKET';
    } else {
        return 'OPEN';
    }
}

export function getNextMarketOpen(): Date {
    const now = getISTTime();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const dayInMinutes = hours * 60 + minutes;

    const marketOpen = 9 * 60 + 15;
    const marketClose = 15 * 60 + 30;

    let daysToAdd = 0;
    if (dayInMinutes >= marketClose) {
        daysToAdd = day === 5 ? 3 : 1; // Skip weekend if Friday
    } else if (day === 0 || day === 6) {
        // If weekend, find next Monday
        daysToAdd = day === 6 ? 2 : 1;
    }

    const nextOpen = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    nextOpen.setHours(9, 15, 0, 0);
    return nextOpen;
}
