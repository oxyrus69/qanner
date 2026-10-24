<script lang="ts">
    import { onMount } from 'svelte';
    import { ScanLine, ClipboardPaste, Upload } from '@lucide/svelte';
    import ScannerViewport from '#lib/components/ScannerViewport.svelte';
    import BottomDock from '#lib/components/BottomDock.svelte';
    import ResultSheet from '#lib/components/ResultSheet.svelte';
    import HistoryDrawer from '#lib/components/HistoryDrawer.svelte';
    import DisclaimerDialog from '#lib/components/DisclaimerDialog.svelte';
    import Toast from '#lib/components/Toast.svelte';
    import { parseResult, type ScanResult } from '#lib/utils/parser';
    import { history } from '#lib/utils/history';
    import { smartScan } from '#lib/utils/smartImageScanner';
    import { notify } from '#lib/utils/sound';

    let mode = $state<'camera' | 'image'>('camera');
    let imageFile = $state<File | null>(null);
    let currentResult = $state<ScanResult | null>(null);
    let isHistoryOpen = $state(false);
    let isFlashOn = $state(false);
    let preferredCamera = $state<'environment' | 'user'>('environment');
    let lastPoints = $state<{x: number, y: number}[] | null>(null);
    let isDisclaimerOpen = $state(false);
    let isDisclaimerDeclined = $state(false);
    let isDragging = $state(false);
    let toastMessage = $state<string | null>(null);

    // Auto-clear toast
    $effect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => toastMessage = null, 3000);
            return () => clearTimeout(timer);
        }
    });

    const DISCLAIMER_KEY = 'qanner-disclaimer-accepted-v1';

    function dismissDisclaimer() {
        isDisclaimerOpen = false;
    }

    function acceptDisclaimer() {
        try {
            localStorage.setItem(DISCLAIMER_KEY, 'true');
        } catch (e) {
            // Storage unavailable; accept for this session only
        }
        dismissDisclaimer();
    }

    function declineDisclaimer() {
        isDisclaimerOpen = false;
        isDisclaimerDeclined = true;
    }

    // Block camera/scan usage until the disclaimer is accepted
    $effect(() => {
        if (isDisclaimerDeclined) {
            isDisclaimerOpen = true;
        }
    });

    async function handleScan(data: string, source: 'camera' | 'image' = 'camera', points?: any) {
        const parsed = parseResult(data);
        currentResult = parsed;
        lastPoints = points;
        history.add(parsed, source);
        notify();
    }

    async function handleFileUpload(file: File) {
        imageFile = file;
        mode = 'image';
        lastPoints = null; // Reset points for new image
        const result = await smartScan(file);
        if (result) {
            handleScan(result.data, 'image', result.cornerPoints);
        } else {
            toastMessage = 'No QR code detected in this image.';
        }
    }

    function toggleMode() {
        mode = mode === 'camera' ? 'image' : 'camera';
        if (mode === 'camera') {
            imageFile = null;
            lastPoints = null;
        }
    }

    // Global Paste & Drop Support (Ctrl+V on desktop)
    onMount(() => {
        // Show disclaimer on first visit unless already accepted or previously declined
        let accepted = false;
        try {
            accepted = localStorage.getItem(DISCLAIMER_KEY) === 'true';
        } catch (e) {
            // ignore storage errors
        }
        if (!accepted && !isDisclaimerDeclined) {
            isDisclaimerOpen = true;
        }

        const handlePaste = async (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) await handleFileUpload(file);
                    break;
                }
            }
        };

        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            isDragging = true;
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            isDragging = false;
        };

        const handleDrop = async (e: DragEvent) => {
            e.preventDefault();
            isDragging = false;
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    await handleFileUpload(file);
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        document.addEventListener('dragenter', handleDragEnter);
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('dragleave', handleDragLeave);
        document.addEventListener('drop', handleDrop);

        return () => {
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('dragenter', handleDragEnter);
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('dragleave', handleDragLeave);
            document.removeEventListener('drop', handleDrop);
        };
    });
</script>

<main class="h-screen w-full bg-charcoal text-white overflow-hidden flex flex-col md:flex-row">
    <!-- Kolom Kiri: Scanner (Desktop: 60%, Mobile: Full) -->
    <div class="flex-1 h-full relative overflow-hidden md:border-r border-white/10">
        <ScannerViewport 
            {mode} 
            {imageFile} 
            flash={isFlashOn}
            camera={preferredCamera}
            points={lastPoints}
            onScan={(data, points) => handleScan(data, mode, points)} 
            onReset={toggleMode}
        />
        
        <!-- Header hanya terlihat di mobile -->
        <header class="md:hidden absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-pumpkin rounded-xl flex items-center justify-center shadow-lg shadow-pumpkin/20">
                    <ScanLine class="text-white" size={24} />
                </div>
                <h1 class="text-xl font-bold tracking-tight">Qanner</h1>
            </div>
        </header>

        <!-- Desktop Hint -->
        <div class="hidden md:flex absolute top-6 left-6 z-10 items-center gap-2 px-4 py-2 bg-charcoal/70 backdrop-blur-md border border-white/10 rounded-full text-xs text-slate-300">
            <ClipboardPaste size={14} class="text-pumpkin" />
            <span>Tempel gambar (Ctrl+V) atau seret ke sini</span>
        </div>
    </div>

    <!-- Kolom Kanan: Hasil & Riwayat (Hanya Desktop) -->
    <div class="hidden md:flex flex-col w-[400px] h-full bg-charcoal/50 p-6 gap-6 overflow-y-auto">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold">Hasil & Riwayat</h2>
        </div>
        
        <div class="space-y-4">
            {#if currentResult}
                <div class="bg-charcoal p-6 rounded-3xl border border-white/10">
                    <h3 class="font-bold text-lg mb-2">Hasil Terakhir</h3>
                    <p class="font-mono text-sm break-all text-pumpkin">{currentResult.raw}</p>
                </div>
            {:else}
                <div class="p-8 border-2 border-dashed border-white/10 rounded-3xl text-center text-slate-500">
                    Hasil scan akan muncul di sini
                </div>
            {/if}
        </div>

        <div class="flex-1 overflow-y-auto">
            <h4 class="font-bold text-lg mb-4">Riwayat</h4>
            <div class="space-y-3">
                {#each $history.slice(0, 10) as item (item.id)}
                    <div class="bg-white/5 border border-white/5 rounded-2xl p-4 text-sm">
                        <p class="font-mono truncate">{item.result.raw}</p>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- Navigation / Controls (Mobile) -->
    <div class="md:hidden">
        <BottomDock 
            {mode}
            flash={isFlashOn}
            camera={preferredCamera}
            onUpload={handleFileUpload}
            onToggleMode={toggleMode}
            onToggleHistory={() => isHistoryOpen = true}
            onToggleFlash={() => isFlashOn = !isFlashOn}
            onToggleCamera={() => preferredCamera = preferredCamera === 'environment' ? 'user' : 'environment'}
        />
    </div>

    <!-- Mobile Overlays -->
    <div class="md:hidden">
        <ResultSheet 
            result={currentResult} 
            onClose={() => currentResult = null} 
        />
        <HistoryDrawer 
            isOpen={isHistoryOpen} 
            onClose={() => isHistoryOpen = false} 
        />
    </div>

    <DisclaimerDialog
        isOpen={isDisclaimerOpen}
        onAccept={acceptDisclaimer}
        onDecline={declineDisclaimer}
    />

    <Toast message={toastMessage} />
</main>

<style>
    :global(body) {
        margin: 0;
        background: #020617;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
    }
</style>
