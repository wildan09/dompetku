import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isLoggedIn = computed(() => !!user.value)
  const displayName = computed(() => profile.value?.full_name || user.value?.email?.split('@')[0] || 'User')
  const avatarUrl = computed(() => profile.value?.avatar_url)
  const currency = computed(() => profile.value?.currency || 'IDR')

  async function init() {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        user.value = session.user
        await fetchProfile()
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user || null
      if (session?.user) {
        await fetchProfile()
      } else {
        profile.value = null
      }
    })
  }

  async function fetchProfile() {
    if (!user.value) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    profile.value = data
  }

  async function updateProfile(updates) {
    if (!user.value) return
    const { data, error: err } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.value.id)
      .select()
      .single()
    if (err) throw err
    profile.value = data
    return data
  }

  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      user.value = data.user
      await fetchProfile()
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(email, password, fullName) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password })
      if (err) throw err
      user.value = data.user

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          currency: 'IDR',
        })
        await fetchProfile()
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    const { data, error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (err) throw err
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  async function uploadAvatar(file) {
    if (!user.value) return
    const ext = file.name.split('.').pop()
    const filePath = `avatars/${user.value.id}.${ext}`
    const { error: err } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })
    if (err) throw err
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
    await updateProfile({ avatar_url: publicUrl })
    return publicUrl
  }

  return {
    user, profile, loading, error,
    isLoggedIn, displayName, avatarUrl, currency,
    init, fetchProfile, updateProfile,
    login, register, loginWithGoogle, logout, uploadAvatar
  }
})
