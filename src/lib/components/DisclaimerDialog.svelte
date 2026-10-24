<script lang="ts">
    import { fade } from 'svelte/transition';
    import { ScanLine, ShieldCheck } from '@lucide/svelte';

    let { isOpen, onAccept, onDecline } = $props<{
        isOpen: boolean;
        onAccept: () => void;
        onDecline: () => void;
    }>();
</script>

{#if isOpen}
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120]" transition:fade></div>

    <div class="fixed inset-0 z-[121] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
        <div class="w-full max-w-md bg-charcoal/95 border border-white/10 rounded-t-[32px] sm:rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90dvh] overflow-y-auto"
             transition:fade={{ duration: 200 }}>
            <!-- Grip handle on mobile -->
            <div class="sm:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0"></div>

            <!-- Header -->
            <div class="flex items-center gap-3 mb-6">
                <div class="w-11 h-11 bg-pumpkin/10 text-pumpkin rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h2 id="disclaimer-title" class="text-xl font-bold text-white leading-tight">Pernyataan Penggunaan</h2>
                    <p class="text-slate-400 text-sm">Qanner — QR Code Scanner</p>
                </div>
            </div>

            <!-- Body -->
            <div class="space-y-4 text-sm leading-relaxed text-slate-300">
                <p>
                    Qanner adalah aplikasi pemindai kode QR yang dirancang untuk satu tujuan: membaca dan mengartikan kode QR. Aplikasi tidak menyediakan fitur lain di luar fungsi tersebut.
                </p>
                <p>
                    Proses pemindaian berjalan sepenuhnya di perangkat Anda. Data pada kode QR yang dipindai tidak dikirim, disimpan, atau diakses oleh Qanner, pengembang, maupun pihak ketiga. Hasil pemindaian hanya tersedia untuk Anda, dan dapat dihapus kapan saja melalui riwayat.
                </p>
                <div class="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                    <p class="text-white font-semibold flex items-center gap-2">
                        <ScanLine size={16} class="text-pumpkin" />
                        Ruang lingkup penggunaan
                    </p>
                    <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
                        <li>Memindai kode QR dengan kamera perangkat</li>
                        <li>Memindai kode QR dari gambar yang diunggah, ditempel (Ctrl+V), atau dijatuhkan</li>
                        <li>Menyimpan hasil pemindaian di riwayat lokal perangkat untuk akses cepat</li>
                    </ul>
                </div>
                <p>
                    Dengan melanjutkan, Anda menyatakan memahami bahwa Qanner tidak menampilkan iklan, tidak mengumpulkan data pribadi, dan tidak bertanggung jawab atas isi kode QR yang Anda pindai. Konten kode QR tetap sepenuhnya menjadi tanggung jawab pembuat serta pengguna berdasarkan ketentuan yang berlaku.
                </p>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-3 mt-8">
                <button
                    onclick={onAccept}
                    class="w-full py-4 bg-pumpkin text-white font-bold rounded-2xl hover:bg-pumpkin/90 transition-colors active:scale-[0.98]"
                >
                    Saya Mengerti
                </button>
                <button
                    onclick={onDecline}
                    class="w-full py-3.5 text-slate-400 hover:text-white rounded-2xl transition-colors"
                >
                    Keluar
                </button>
            </div>
        </div>
    </div>
{/if}