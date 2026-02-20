<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  icon?: object
}>()

const model = defineModel<string | number>()

const hasIcon = computed(() => !!props.icon)
</script>

<template>
  <div class="form-group">
    <label class="form-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <div class="input-wrapper" :class="{ 'has-icon': hasIcon }">
      <component v-if="icon" :is="icon" class="input-icon" :size="16" :stroke-width="2" />
      <input
        v-model="model"
        :type="type ?? 'text'"
        :placeholder="placeholder"
        class="form-input"
        :class="{ 'input-error': error, 'with-icon': hasIcon }"
      />
    </div>
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

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted);
  pointer-events: none;
  transition: color var(--transition);
}

.input-wrapper:focus-within .input-icon {
  color: var(--primary);
}

.form-input {
  width: 100%;
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--text);
  background: white;
  transition: all var(--transition);
}

.form-input.with-icon {
  padding-left: 2.35rem;
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
}

.input-error {
  border-color: var(--danger);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);
}

.error-text {
  font-size: 0.75rem;
  color: var(--danger);
}
</style>
