<template>
  <div class="space-y-6">
    <!-- Scan Button (Full) -->
    <div v-if="!previewUrl && !isScanning && !scanResult">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        @change="handleFile"
        class="hidden"
      />
      <div class="flex flex-col gap-3">
        <button
          @click="fileInput?.click()"
          class="w-full py-8 rounded-2xl border-2 border-dashed border-purple-500/30 bg-purple-500/5 flex flex-col items-center gap-3 hover:border-purple-400/50 transition-all active:scale-95"
        >
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-3xl animate-pulse-soft">
            📸
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-white">Ambil Foto atau Pilih Gambar</p>
            <p class="text-xs text-surface-400 mt-1">AI akan membaca struk secara otomatis</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="previewUrl && !isScanning && !scanResult" class="space-y-4">
      <div class="relative rounded-2xl overflow-hidden">
        <img :src="previewUrl" alt="Preview" class="w-full max-h-[300px] object-contain bg-surface-800 rounded-2xl" />
      </div>
      <div class="flex gap-3">
        <button @click="startScan" class="btn-primary flex-1 flex items-center justify-center gap-2">
          🔍 Analisis dengan AI
          <span class="badge-ai">AI</span>
        </button>
        <button @click="reset" class="btn-secondary px-4">✕</button>
      </div>
    </div>

    <!-- Scanning Animation -->
    <div v-if="isScanning" class="space-y-4">
      <div class="relative rounded-2xl overflow-hidden">
        <img :src="previewUrl" alt="Scanning" class="w-full max-h-[300px] object-contain bg-surface-800 rounded-2xl opacity-60" />
        <div class="scan-line"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="glass-card p-4 text-center">
            <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p class="text-sm font-semibold text-white">AI sedang membaca struk...</p>
            <p class="text-xs text-surface-400 mt-1">Mengekstrak nominal, tanggal, dan kategori</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="scanResult && !scanResult.error" class="space-y-4 animate-scale-in">
      <div class="flex items-center gap-2 text-primary">
        <span class="text-lg">✅</span>
        <h3 class="text-sm font-bold">Struk Berhasil Dibaca</h3>
      </div>

      <div class="glass-card space-y-3 p-4">
        <div class="flex justify-between items-center">
          <span class="text-xs text-surface-400">🏪 Merchant</span>
          <span class="text-sm font-medium text-white">{{ scanResult.merchant_name || '-' }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-surface-400">📅 Tanggal</span>
          <span class="text-sm font-medium text-white">{{ scanResult.date || '-' }}</span>
        </div>
        <div class="flex justify-between items-center border-t border-surface-700 pt-3">
          <span class="text-xs text-surface-400">💰 Total</span>
          <span class="text-lg font-bold text-primary">{{ formatCurrency(scanResult.total_amount) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-surface-400">🏷️ Kategori</span>
          <span class="text-sm font-medium text-white">{{ scanResult.category_suggestion || '-' }}</span>
        </div>

        <!-- Items -->
        <details v-if="scanResult.items?.length" class="mt-2">
          <summary class="text-xs text-surface-400 cursor-pointer hover:text-white transition-colors">
            📋 {{ scanResult.items.length }} item belanja
          </summary>
          <div class="mt-2 space-y-1 pl-2 border-l-2 border-surface-700">
            <div v-for="item in scanResult.items" :key="item.name" class="flex justify-between text-xs text-surface-300">
              <span>{{ item.name }} × {{ item.qty }}</span>
              <span>{{ formatCurrency(item.subtotal || item.price) }}</span>
            </div>
          </div>
        </details>

        <!-- Confidence -->
        <div class="flex items-center gap-2 mt-2 pt-2 border-t border-surface-700">
          <span class="text-xs" :class="'confidence-' + scanResult.confidence">
            Akurasi: {{ scanResult.confidence === 'high' ? 'Tinggi ✅' : scanResult.confidence === 'medium' ? 'Sedang ⚠️' : 'Rendah ❌' }}
          </span>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="$emit('apply', scanResult)" class="btn-primary flex-1">
          ✅ Gunakan Data Ini
        </button>
        <button @click="reset" class="btn-secondary px-4">🔄</button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="scanResult?.error || scanError" class="text-center py-6 animate-fade-in">
      <span class="text-4xl block mb-3">❌</span>
      <p class="text-sm text-surface-300 mb-4">{{ scanResult?.error || scanError }}</p>
      <button @click="reset" class="btn-secondary">Coba Lagi</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReceiptScanner } from '@/composables/useReceiptScanner'
import { formatCurrency } from '@/utils/currency'

const emit = defineEmits(['apply'])

const { isScanning, scanResult, scanError, previewUrl, scanReceipt, reset } = useReceiptScanner()
const fileInput = ref(null)

function handleFile(e) {
  const file = e.target.files[0]
  if (file) {
    previewUrl.value = URL.createObjectURL(file)
    window._selectedReceiptFile = file
  }
}

async function startScan() {
  const file = window._selectedReceiptFile
  if (file) {
    await scanReceipt(file)
  }
}
</script>
