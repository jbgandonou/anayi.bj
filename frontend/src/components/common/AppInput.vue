<script setup lang="ts">
defineProps<{
  label: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
}>()

const model = defineModel<string | number>()
</script>

<template>
  <div class="form-group">
    <label class="form-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <input
      v-model="model"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      class="form-input"
      :class="{ 'input-error': error }"
    />
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.required {
  color: var(--danger);
}

.form-input {
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--text);
  background: white;
  transition: all 0.2s;
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-error {
  border-color: var(--danger);
}

.error-text {
  font-size: 0.75rem;
  color: var(--danger);
}
</style>
