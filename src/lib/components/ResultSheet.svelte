<script lang="ts">
    import { fly, fade } from 'svelte/transition';
    import { Copy, Share2, ExternalLink, Wifi, Mail, Phone, MessageSquare, MapPin, X } from '@lucide/svelte';
    import type { ScanResult } from '#lib/utils/parser';

    let { result = null, onClose } = $props<{
        result: ScanResult | null;
        onClose: () => void;
    }>();

    function copy() {
        if (result) navigator.clipboard.writeText(result.raw);
    }

    function share() {
        if (result && navigator.share) {
            navigator.share({
                title: 'Scanned QR Code',
                text: result.raw,
                url: result.type === 'url' ? result.data : undefined
            });
        }
    }
</script>

{#if result}
    <!-- Backdrop -->
    <div 
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
        onclick={onClose}
        transition:fade
    ></div>

    <!-- Sheet -->
    <div 
        class="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-slate-900 border-t border-white/10 rounded-t-[32px] p-8 pb-12 z-[101] shadow-2xl"
        transition:fly={{ y: 400, duration: 400 }}
    >
        <div class="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
        
        <div class="flex items-start justify-between mb-6">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-pumpkin/10 text-pumpkin rounded-2xl">
                    {#if result.type === 'url'}<ExternalLink size={24} />
                    {:else if result.type === 'wifi'}<Wifi size={24} />
                    {:else if result.type === 'email'}<Mail size={24} />
                    {:else if result.type === 'phone'}<Phone size={24} />
                    {:else if result.type === 'sms'}<MessageSquare size={24} />
                    {:else if result.type === 'geo'}<MapPin size={24} />
                    {:else}<ScanLine size={24} />{/if}
                </div>
                <div>
                    <h2 class="text-xl font-bold text-white capitalize">{result.type} Detected</h2>
                    <p class="text-slate-400 text-sm">Decoded successfully</p>
                </div>
            </div>
            <button 
                onclick={onClose}
                class="p-2 text-slate-500 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        <div class="bg-black/40 rounded-2xl p-4 mb-8 overflow-x-auto">
            {#if result.type === 'wifi'}
                <div class="space-y-2">
                    <p class="text-slate-400 text-xs uppercase tracking-wider font-semibold">SSID</p>
                    <p class="text-white font-mono">{result.data.ssid}</p>
                    <p class="text-slate-400 text-xs uppercase tracking-wider font-semibold mt-4">Password</p>
                    <p class="text-white font-mono">{result.data.password || 'None'}</p>
                </div>
            {:else}
                <p class="text-white font-mono break-all leading-relaxed">
                    {result.raw}
                </p>
            {/if}
        </div>

        <div class="grid grid-cols-2 gap-4">
            {#if result.type === 'url'}
                <a 
                    href={result.data} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="col-span-2 flex items-center justify-center gap-2 py-4 bg-pumpkin text-white font-bold rounded-2xl hover:bg-pumpkin/90 transition-colors"
                >
                    Visit Link <ExternalLink size={18} />
                </a>
            {/if}
            
            <button 
                onclick={copy}
                class="flex items-center justify-center gap-2 py-4 bg-white/5 text-white font-semibold rounded-2xl hover:bg-white/10 transition-colors border border-white/5"
            >
                <Copy size={18} /> Copy
            </button>

            <button 
                onclick={share}
                class="flex items-center justify-center gap-2 py-4 bg-white/5 text-white font-semibold rounded-2xl hover:bg-white/10 transition-colors border border-white/5"
            >
                <Share2 size={18} /> Share
            </button>
        </div>
    </div>
{/if}
