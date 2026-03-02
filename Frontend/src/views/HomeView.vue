<script setup lang="ts">
import { onMounted } from 'vue'
import { useStickerStore } from '../stores/sticker'

const store = useStickerStore()

onMounted(() => {
  store.fetchPacks()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8">Sticker Scraper</h1>
      <div class="text-center text-gray-600">
        <p>贴纸爬虫工具 - 正在开发中...</p>
      </div>
    </div>
  </div>
</template>
