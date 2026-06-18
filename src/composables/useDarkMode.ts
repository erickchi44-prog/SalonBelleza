import { ref, watch } from 'vue'

const isDark = ref(false)

if (typeof document !== 'undefined') {
  const stored = localStorage.getItem('darkMode')
  if (stored === 'true') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
}

watch(isDark, (val) => {
  if (val) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', String(val))
})

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
