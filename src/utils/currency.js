/**
 * Format number to Indonesian Rupiah currency
 */
export function formatCurrency(amount, currency = 'IDR') {
  if (amount === null || amount === undefined) return 'Rp 0'

  const num = Number(amount)
  if (isNaN(num)) return 'Rp 0'

  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Parse currency string back to number
 */
export function parseCurrency(str) {
  if (!str) return 0
  return Number(String(str).replace(/[^\d.-]/g, ''))
}

/**
 * Format number with dots as thousands separator (ID format)
 */
export function formatNumber(num) {
  if (!num) return '0'
  return new Intl.NumberFormat('id-ID').format(Number(num))
}

/**
 * Abbreviate large numbers (e.g., 1.5jt, 2.3M)
 */
export function abbreviateNumber(num) {
  if (!num) return '0'
  const n = Number(num)
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'M'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'jt'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'rb'
  return n.toString()
}
