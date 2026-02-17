<script setup lang="ts">
defineProps<{
  hasMore: boolean
  loading?: boolean
}>()

defineEmits<{
  loadMore: []
}>()
</script>

<template>
  <div class="pagination">
    <button
      v-if="hasMore"
      class="load-more-btn"
      :disabled="loading"
      @click="$emit('loadMore')"
    >
      {{ loading ? 'Chargement...' : 'Charger plus' }}
    </button>
    <p v-else class="no-more">Tous les résultats sont affichés</p>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.load-more-btn {
  padding: 0.5rem 1.5rem;
  background: #1a56db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.load-more-btn:hover:not(:disabled) {
  background: #1648b8;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-more {
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
