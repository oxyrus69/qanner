import QrScanner from 'qr-scanner';

export interface SmartScanResult {
    data: string;
    cornerPoints: { x: number; y: number }[];
}

export async function smartScan(image: HTMLImageElement | HTMLCanvasElement | File | Blob): Promise<SmartScanResult | null> {
    // Pass 1: Direct Scan
    try {
        const result = await QrScanner.scanImage(image, { returnDetailedScanResult: true });
        return {
            data: result.data,
            cornerPoints: result.cornerPoints as any
        };
    } catch (e) {
        // Direct scan failed, proceed to Pass 2
    }

    // Convert to Image for canvas manipulation if it's a file/blob
    let img: HTMLImageElement;
    if (image instanceof File || image instanceof Blob) {
        img = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const i = new Image();
                i.onload = () => resolve(i);
                i.onerror = reject;
                i.src = reader.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(image);
        });
    } else if (image instanceof HTMLCanvasElement) {
        img = new Image();
        img.src = image.toDataURL();
        await img.decode();
    } else {
        img = image;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    // Pass 2: Tiling/Cropping
    const crops = [
        { x: 0.2, y: 0.2, w: 0.6, h: 0.6 }, // Center 60%
        { x: 0, y: 0, w: 1, h: 0.5 },       // Top Half
        { x: 0, y: 0.5, w: 1, h: 0.5 },     // Bottom Half
        { x: 0, y: 0, w: 0.5, h: 0.5 },     // Top-Left
        { x: 0.5, y: 0, w: 0.5, h: 0.5 },   // Top-Right
        { x: 0, y: 0.5, w: 0.5, h: 0.5 },   // Bottom-Left
        { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }  // Bottom-Right
    ];

    for (const crop of crops) {
        canvas.width = img.width * crop.w;
        canvas.height = img.height * crop.h;
        ctx.drawImage(img, img.width * crop.x, img.height * crop.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        try {
            const result = await QrScanner.scanImage(canvas, { returnDetailedScanResult: true });
            // Map corner points back to original image
            const originalPoints = result.cornerPoints.map(p => ({
                x: p.x + img.width * crop.x,
                y: p.y + img.height * crop.y
            }));
            return { data: result.data, cornerPoints: originalPoints as any };
        } catch (e) {}
    }

    // Pass 3: Image Enhancement (Grayscale, Contrast, Invert)
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const enhance = (inverted = false) => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // High contrast thresholding
            const val = avg > 128 ? 255 : 0;
            const final = inverted ? 255 - val : val;
            data[i] = data[i + 1] = data[i + 2] = final;
        }
        ctx.putImageData(imageData, 0, 0);
    };

    // Try Enhanced Grayscale
    enhance(false);
    try {
        const result = await QrScanner.scanImage(canvas, { returnDetailedScanResult: true });
        return { data: result.data, cornerPoints: result.cornerPoints as any };
    } catch (e) {}

    // Try Inverted
    enhance(true);
    try {
        const result = await QrScanner.scanImage(canvas, { returnDetailedScanResult: true });
        return { data: result.data, cornerPoints: result.cornerPoints as any };
    } catch (e) {}

    return null;
}
