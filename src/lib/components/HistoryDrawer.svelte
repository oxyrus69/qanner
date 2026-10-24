<script lang="ts">
    import { fly, fade } from 'svelte/transition';
    import { history } from '#lib/utils/history';
    import { X, Trash2, Clock, Copy, ScanLine } from '@lucide/svelte';

    let { isOpen = false, onClose } = $props<{
        isOpen: boolean;
        onClose: () => void;
    }>();

    function copy(text: string) {
        navigator.clipboard.writeText(text);
    }
</script>

{#if isOpen}
    <div 
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" 
        onclick={onClose}
        transition:fade
    ></div>

    <div 
        class="fixed inset-y-0 right-0 w-full max-w-sm bg-charcoal border-l border-white/10 p-6 z-[111] shadow-2xl flex flex-col"
        transition:fly={{ x: 400, duration: 400 }}
    >
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold text-white">History</h2>
            <button 
                onclick={onClose}
                class="p-2 text-slate-500 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {#if $history.length === 0}
                <div class="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                    <Clock size={48} strokeWidth={1} />
                    <p>No recent scans</p>
                </div>
            {:else}
                {#each $history as item (item.id)}
                    <div class="bg-white/5 border border-white/5 rounded-2xl p-4 group transition-all hover:bg-white/10">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2 text-xs text-slate-400">
                                <span class="px-2 py-0.5 bg-white/5 rounded-full uppercase">{item.source}</span>
                                <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <button 
                                onclick={() => history.remove(item.id)}
                                class="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <p class="text-white text-sm font-mono break-all line-clamp-2 mb-3">
                            {item.result.raw}
                        </p>
                        <div class="flex gap-2">
                            <button 
                                onclick={() => copy(item.result.raw)}
                                class="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Copy size={14} /> Copy
                            </button>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>

        {#if $history.length > 0}
            <button 
                onclick={() => history.clear()}
                class="mt-6 py-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-colors flex items-center justify-center gap-2 font-semibold"
            >
                <Trash2 size={20} /> Clear All
            </button>
        {/if}
        
        <!-- PWA Install Suggestion -->
        <div class="mt-4 p-4 bg-pumpkin/10 rounded-2xl border border-pumpkin/20">
            <h4 class="text-white font-semibold text-sm mb-1">Pasang Qanner</h4>
            <p class="text-slate-400 text-xs mb-3">Tambahkan ke layar utama perangkat Anda untuk akses cepat dan pengalaman aplikasi asli.</p>
            <p class="text-pumpkin text-xs font-medium">Tip: Gunakan menu "Bagikan" > "Tambah ke Layar Utama" di browser Anda.</p>
        </div>
    </div>
{/if}

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }
</style>
