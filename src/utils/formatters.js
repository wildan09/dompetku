/**
 * Get greeting based on current time
 */
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Category icons map
 */
export const categoryIcons = {
  'Makanan & Minuman': '🍔',
  'Transportasi': '🚗',
  'Belanja': '🛍️',
  'Hiburan': '🎮',
  'Kesehatan': '🏥',
  'Pendidikan': '📚',
  'Tagihan': '📄',
  'Investasi': '📈',
  'Gaji': '💼',
  'Freelance': '💻',
  'Hadiah': '🎁',
  'Lainnya': '📦',
}

/**
 * Wallet type icons
 */
export const walletIcons = {
  cash: '💵',
  bank: '🏦',
  ewallet: '📱',
  investment: '📊',
  other: '💳',
}

/**
 * Wallet type labels
 */
export const walletTypeLabels = {
  cash: 'Tunai',
  bank: 'Bank',
  ewallet: 'E-Wallet',
  investment: 'Investasi',
  other: 'Lainnya',
}

/**
 * Color presets for categories/wallets
 */
export const colorPresets = [
  '#10B981', '#34D399', '#059669',
  '#3B82F6', '#60A5FA', '#2563EB',
  '#8B5CF6', '#A78BFA', '#7C3AED',
  '#F43F5E', '#FB7185', '#E11D48',
  '#F59E0B', '#FBBF24', '#D97706',
  '#EC4899', '#F472B6', '#DB2777',
  '#06B6D4', '#22D3EE', '#0891B2',
  '#84CC16', '#A3E635', '#65A30D',
]

/**
 * Generate percentage
 */
export function calcPercentage(current, total) {
  if (!total || total === 0) return 0
  return Math.min(100, Math.round((current / total) * 100))
}

/**
 * Truncate string
 */
export function truncate(str, len = 30) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
