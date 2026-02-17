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
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  letter-spacing: -0.01em;
}

.app-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm { padding: 0.4rem 0.85rem; font-size: 0.8rem; }
.btn-md { padding: 0.55rem 1.15rem; font-size: 0.875rem; }
.btn-lg { padding: 0.7rem 1.5rem; font-size: 1rem; }

.btn-primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 1px 2px rgba(79, 70, 229, 0.3);
}
.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.35);
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--bg);
  border-color: var(--text-muted);
}

.btn-danger {
  background: var(--danger);
  color: white;
  box-shadow: 0 1px 2px rgba(239, 68, 68, 0.3);
}
.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.35);
  transform: translateY(-1px);
}

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
