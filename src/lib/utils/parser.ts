export type ScanResult = {
    type: 'url' | 'wifi' | 'email' | 'phone' | 'sms' | 'geo' | 'text';
    data: any;
    raw: string;
};

export function parseResult(raw: string): ScanResult {
    // WiFi: WIFI:S:SSID;T:WPA;P:PASSWORD;;
    if (raw.startsWith('WIFI:')) {
        const ssid = raw.match(/S:([^;]+)/)?.[1];
        const type = raw.match(/T:([^;]+)/)?.[1] || 'nopass';
        const password = raw.match(/P:([^;]+)/)?.[1];
        return {
            type: 'wifi',
            data: { ssid, type, password },
            raw
        };
    }

    // URL
    if (/^https?:\/\//i.test(raw) || /^www\./i.test(raw)) {
        const url = raw.startsWith('www.') ? `https://${raw}` : raw;
        return {
            type: 'url',
            data: url,
            raw
        };
    }

    // Email: mailto:
    if (raw.toLowerCase().startsWith('mailto:')) {
        return { type: 'email', data: raw, raw };
    }

    // Phone: tel:
    if (raw.toLowerCase().startsWith('tel:')) {
        return { type: 'phone', data: raw, raw };
    }

    // SMS: sms:
    if (raw.toLowerCase().startsWith('sms:')) {
        return { type: 'sms', data: raw, raw };
    }

    // Geo: geo:
    if (raw.toLowerCase().startsWith('geo:')) {
        return { type: 'geo', data: raw, raw };
    }

    return { type: 'text', data: raw, raw };
}
