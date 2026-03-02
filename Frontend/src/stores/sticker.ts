import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface StickerPack {
  id: string
  slug: string
  title: string
  author: string
  trayIcon: string
  stickers: string[]
  downloads: number
}

export const useStickerStore = defineStore('sticker', () => {
  const packs = ref<StickerPack[]>([])
  const loading = ref(false)

  const fetchPacks = async () => {
    loading.value = true
    // TODO: 调用后端 API 获取贴纸包列表
    setTimeout(() => {
      loading.value = false
    }, 1000)
  }

  return {
    packs,
    loading,
    fetchPacks
  }
})
