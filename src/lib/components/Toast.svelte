<script lang="ts">
    import { fade } from 'svelte/transition';
    import { AlertCircle } from '@lucide/svelte';

    let { message } = $props<{ message: string | null }>();
</script>

{#if message}
    <div 
        transition:fade
        class="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-charcoal border border-pumpkin/20 rounded-full shadow-2xl flex items-center gap-3 text-white"
    >
        <AlertCircle size={20} class="text-pumpkin" />
        <span class="text-sm font-medium">{message}</span>
    </div>
{/if}