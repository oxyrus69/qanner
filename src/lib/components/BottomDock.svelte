<script lang="ts">
    import { Camera, Image as ImageIcon, Zap, ZapOff, History, ScanLine, FlipHorizontal } from '@lucide/svelte';

    let { 
        onUpload, 
        onToggleHistory, 
        mode = 'camera', 
        onToggleMode, 
        onToggleFlash, 
        onToggleCamera,
        flash = false,
        camera = 'environment'
    } = $props<{
        onUpload: (file: File) => void;
        onToggleHistory: () => void;
        onToggleMode: () => void;
        onToggleFlash: () => void;
        onToggleCamera: () => void;
        mode: 'camera' | 'image';
        flash: boolean;
        camera: 'environment' | 'user';
    }>();

    let fileInput: HTMLInputElement;

    function handleFileChange(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) onUpload(file);
    }
</script>

<div class="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-charcoal/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50">
    <button 
        onclick={() => fileInput.click()}
        class="p-3 text-slate-400 hover:text-white transition-colors"
        aria-label="Upload Image"
    >
        <ImageIcon size={24} />
    </button>
    
    <button 
        onclick={onToggleMode}
        class="p-4 bg-pumpkin text-white rounded-full shadow-lg shadow-pumpkin/20 hover:scale-105 active:scale-95 transition-all"
        aria-label={mode === 'camera' ? 'Switch to Image' : 'Switch to Camera'}
    >
        {#if mode === 'camera'}
            <ScanLine size={28} />
        {:else}
            <Camera size={28} />
        {/if}
    </button>

    {#if mode === 'camera'}
        <button 
            onclick={onToggleFlash}
            class="p-3 {flash ? 'text-pumpkin' : 'text-slate-400'} hover:text-white transition-colors"
            aria-label="Toggle Flashlight"
        >
            {#if flash}
                <Zap size={24} />
            {:else}
                <ZapOff size={24} />
            {/if}
        </button>

        <button 
            onclick={onToggleCamera}
            class="p-3 text-slate-400 hover:text-white transition-colors"
            aria-label="Switch Camera"
        >
            <FlipHorizontal size={24} />
        </button>
    {/if}

    <div class="w-[1px] h-6 bg-white/10 mx-1"></div>

    <button 
        onclick={onToggleHistory}
        class="p-3 text-slate-400 hover:text-white transition-colors"
        aria-label="View History"
    >
        <History size={24} />
    </button>
</div>

<input 
    type="file" 
    accept="image/*" 
    bind:this={fileInput} 
    onchange={handleFileChange} 
    class="hidden" 
/>
