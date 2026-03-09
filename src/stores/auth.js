import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

// Single user credentials
const VALID_USERNAME = 'wildan_deva'
const VALID_PASSWORD = 'w12345678'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isLoggedIn = computed(() => !!user.value)
  const displayName = computed(() => profile.value?.full_name || user.value?.username || 'User')
  const avatarUrl = computed(() => profile.value?.avatar_url)
  const currency = computed(() => profile.value?.currency || 'IDR')

  async function init() {
    loading.value = true
    try {
      // Check localStorage for existing session
      const savedSession = localStorage.getItem('dompetku_session')
      if (savedSession) {
        const session = JSON.parse(savedSession)
        user.value = session.user
        profile.value = session.profile
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    // Profile is stored locally
    if (!user.value) return
    const savedSession = localStorage.getItem('dompetku_session')
    if (savedSession) {
      profile.value = JSON.parse(savedSession).profile
    }
  }

  async function updateProfile(updates) {
    if (!user.value) return
    profile.value = { ...profile.value, ...updates, updated_at: new Date().toISOString() }
    // Save to localStorage
    const savedSession = JSON.parse(localStorage.getItem('dompetku_session') || '{}')
    savedSession.profile = profile.value
    localStorage.setItem('dompetku_session', JSON.stringify(savedSession))
    return profile.value
  }

  async function login(username, password) {
    loading.value = true
    error.value = null
    try {
      if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
        throw new Error('Username atau password salah')
      }

      // Create a local user object
      const localUser = {
        id: 'local-user-wildan',
        username: VALID_USERNAME,
        email: 'wildan@dompetku.local',
      }

      const localProfile = {
        id: localUser.id,
        full_name: 'Wildan Deva',
        currency: 'IDR',
        avatar_url: null,
      }

      user.value = localUser
      profile.value = localProfile

      // Save session to localStorage
      localStorage.setItem('dompetku_session', JSON.stringify({
        user: localUser,
        profile: localProfile,
      }))

      return { user: localUser }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    localStorage.removeItem('dompetku_session')
    user.value = null
    profile.value = null
  }

  async function uploadAvatar(file) {
    if (!user.value) return
    // For local auth, we can still use Supabase storage if configured
    try {
      const ext = file.name.split('.').pop()
      const filePath = `avatars/${user.value.id}.${ext}`
      const { error: err } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })
      if (err) throw err
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await updateProfile({ avatar_url: publicUrl })
      return publicUrl
    } catch (err) {
      console.error('Avatar upload failed:', err)
      throw err
    }
  }

  return {
    user, profile, loading, error,
    isLoggedIn, displayName, avatarUrl, currency,
    init, fetchProfile, updateProfile,
    login, logout, uploadAvatar
  }
})
