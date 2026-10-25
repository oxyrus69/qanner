<script lang="ts">
    import { onDestroy } from 'svelte';
    import QrScanner from 'qr-scanner';
    import { Camera, X } from '@lucide/svelte';
    import { notify } from '#lib/utils/sound';

    let { onScan, onReset, mode = 'camera', imageFile = null, flash = false, camera = 'environment', points = null } = $props<{
        onScan: (data: string, points?: any) => void;
        onReset: () => void;
        mode: 'camera' | 'image';
        imageFile: File | null;
        flash: boolean;
        camera: 'environment' | 'user';
        points: {x: number, y: number}[] | null;
    }>();

    // Element refs are declared as $state so effects re-run the moment the
    // nodes are bound. With a plain `let`, a start effect that ran before the
    // binding never re-ran, leaving the camera black until a page reload.
    let videoElement = $state<HTMLVideoElement | null>(null);
    let canvasElement = $state<HTMLCanvasElement | null>(null);
    let imgElement = $state<HTMLImageElement | null>(null);

    let qrScanner: QrScanner | null = null;
    let isStarting = false;

    let isPermissionDenied = $state(false);
    let scannerReady = $state(false);
    let detectionPoints = $state<{x: number, y: number}[] | null>(null);

    $effect(() => {
        if (points) detectionPoints = points;
    });

    $effect(() => {
        if (detectionPoints && canvasElement && mode === 'image' && imgElement) {
            drawPoints();
        }
    });

    function drawPoints() {
        if (!canvasElement || !imgElement || !detectionPoints) return;
        const ctx = canvasElement.getContext('2d');
        if (!ctx) return;

        // Sync canvas size to image display size
        canvasElement.width = imgElement.clientWidth;
        canvasElement.height = imgElement.clientHeight;

        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Scale factors
        const scaleX = canvasElement.width / imgElement.naturalWidth;
        const scaleY = canvasElement.height / imgElement.naturalHeight;

        ctx.strokeStyle = '#fe7f2d'; // Pumpkin
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(detectionPoints[0].x * scaleX, detectionPoints[0].y * scaleY);
        for (let i = 1; i < detectionPoints.length; i++) {
            ctx.lineTo(detectionPoints[i].x * scaleX, detectionPoints[i].y * scaleY);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = 'rgba(254, 127, 45, 0.2)';
        ctx.fill();
    }

    // Start or stop the camera whenever the video node is bound or the mode
    // changes. Because `videoElement` is $state, this re-runs as soon as the
    // node exists, so the stream starts on the first load instead of the next.
    $effect(() => {
        if (mode === 'camera' && videoElement) {
            startCamera();
        } else {
            stopCamera();
        }
    });

    // Apply the torch state once the scanner instance exists.
    $effect(() => {
        if (scannerReady && mode === 'camera') {
            applyFlash(flash);
        }
    });

    // Switch the facing camera once the scanner instance exists.
    $effect(() => {
        if (scannerReady && mode === 'camera') {
            qrScanner?.setCamera(camera);
        }
    });

    async function applyFlash(wantOn: boolean) {
        if (!qrScanner) return;
        try {
            const hasFlash = await qrScanner.hasFlash();
            if (hasFlash && wantOn !== qrScanner.isFlashOn()) {
                await qrScanner.toggleFlash();
            }
        } catch (e) {
            console.error('Flash error', e);
        }
    }

    async function startCamera() {
        if (isStarting || !videoElement) return;
        isStarting = true;
        try {
            if (!qrScanner) {
                qrScanner = new QrScanner(
                    videoElement,
                    (result) => {
                        detectionPoints = result.cornerPoints as any;
                        notify();
                        onScan(result.data, result.cornerPoints);
                    },
                    {
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                        preferredCamera: camera
                    }
                );
                scannerReady = true;
            }
            await qrScanner.start();
            isPermissionDenied = false;
        } catch (e) {
            console.error('Failed to start camera', e);
            isPermissionDenied = true;
        } finally {
            isStarting = false;
        }
    }

    function stopCamera() {
        if (qrScanner) {
            qrScanner.stop();
            qrScanner.destroy();
        }
        qrScanner = null;
        scannerReady = false;
    }

    onDestroy(() => {
        stopCamera();
    });
</script>

<div class="relative w-full h-full bg-charcoal overflow-hidden">
    {#if mode === 'camera'}
        <!-- The video node is always mounted in camera mode, so retrying access
             never leaves the scanner without an element to attach the stream to. -->
        <video
            bind:this={videoElement}
            class="w-full h-full object-cover"
            aria-label="QR Scanner Camera View"
        >
            <track kind="captions" />
        </video>

        {#if isPermissionDenied}
            <div class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20 bg-charcoal">
                <div class="bg-pumpkin/10 p-4 rounded-full mb-4 text-pumpkin">
                    <Camera size={48} />
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Camera Access Required</h3>
                <p class="text-slate-400 mb-6 max-w-xs">
                    Please allow camera access to use the live scanner. Qanner scans QR codes locally and does not store or transmit your data.
                </p>
                <button
                    onclick={startCamera}
                    class="px-6 py-3 bg-pumpkin text-white font-bold rounded-full hover:bg-pumpkin/90 transition-colors"
                >
                    Retry Access
                </button>
            </div>
        {:else}
            <!-- Custom overlay for detection -->
            <div class="absolute inset-0 pointer-events-none border-2 border-pumpkin/20 m-12 rounded-3xl">
                 <div class="absolute inset-0 bg-pumpkin/5 animate-pulse"></div>
            </div>
        {/if}
    {:else if imageFile}
        <div class="w-full h-full flex items-center justify-center p-4 relative">
             <button
                onclick={onReset}
                class="absolute top-4 right-4 z-30 p-2 bg-charcoal/80 text-white rounded-full hover:bg-pumpkin transition-colors backdrop-blur-sm"
                aria-label="Close image"
             >
                <X size={24} />
             </button>
             <img
                bind:this={imgElement}
                src={URL.createObjectURL(imageFile)}
                alt="Uploaded for scanning"
                class="max-w-full max-h-full rounded-xl shadow-2xl"
             />
             <canvas
                bind:this={canvasElement}
                class="absolute pointer-events-none"
                style="width: {imgElement?.clientWidth}px; height: {imgElement?.clientHeight}px;"
             ></canvas>
        </div>
    {/if}
</div>
