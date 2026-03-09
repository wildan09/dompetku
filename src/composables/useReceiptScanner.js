import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useReceiptScanner() {
  const isScanning = ref(false)
  const scanResult = ref(null)
  const scanError = ref(null)
  const previewUrl = ref(null)

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height
        const maxDim = 1920
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim
            width = maxDim
          } else {
            width = (width / height) * maxDim
            height = maxDim
          }
        }
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(resolve, 'image/jpeg', 0.85)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const scanReceipt = async (imageFile) => {
    isScanning.value = true
    scanError.value = null
    scanResult.value = null

    try {
      previewUrl.value = URL.createObjectURL(imageFile)
      const compressed = await compressImage(imageFile)
      const base64 = await fileToBase64(compressed)

      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: {
          image: base64,
          mimeType: 'image/jpeg'
        }
      })

      if (error) throw error
      scanResult.value = data
      return data
    } catch (err) {
      scanError.value = 'Gagal membaca struk. Pastikan foto jelas dan terang.'
      console.error('Scan error:', err)
      return null
    } finally {
      isScanning.value = false
    }
  }

  const reset = () => {
    scanResult.value = null
    scanError.value = null
    previewUrl.value = null
    isScanning.value = false
  }

  return {
    isScanning, scanResult, scanError, previewUrl,
    scanReceipt, reset
  }
}
