<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <button
    class="app-btn"
    :class="[`btn-${variant ?? 'primary'}`, `btn-${size ?? 'md'}`]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner"></span>
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.app-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
.btn-md { padding: 0.5rem 1rem; font-size: 0.875rem; }
.btn-lg { padding: 0.65rem 1.25rem; font-size: 1rem; }

.btn-primary { background: #1a56db; color: white; }
.btn-primary:hover:not(:disabled) { background: #1648b8; }

.btn-secondary { background: #e5e7eb; color: #374151; }
.btn-secondary:hover:not(:disabled) { background: #d1d5db; }

.btn-danger { background: #dc2626; color: white; }
.btn-danger:hover:not(:disabled) { background: #b91c1c; }

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
