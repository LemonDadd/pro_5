import { ref, watch } from 'vue'

const STORAGE_KEY = 'devbox_favorites'

interface FavoriteItem {
  toolId: string
  addedAt: number
}

const favorites = ref<FavoriteItem[]>(loadFavorites())

function loadFavorites(): FavoriteItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
  } catch {
    // ignore
  }
}

watch(favorites, saveFavorites, { deep: true })

export function useFavorites() {
  function isFavorite(toolId: string): boolean {
    return favorites.value.some(f => f.toolId === toolId)
  }

  function toggleFavorite(toolId: string) {
    const index = favorites.value.findIndex(f => f.toolId === toolId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push({
        toolId,
        addedAt: Date.now()
      })
    }
  }

  function addFavorite(toolId: string) {
    if (!isFavorite(toolId)) {
      favorites.value.push({
        toolId,
        addedAt: Date.now()
      })
    }
  }

  function removeFavorite(toolId: string) {
    const index = favorites.value.findIndex(f => f.toolId === toolId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    }
  }

  function getFavoriteToolIds(): string[] {
    return favorites.value.map(f => f.toolId)
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    getFavoriteToolIds
  }
}
