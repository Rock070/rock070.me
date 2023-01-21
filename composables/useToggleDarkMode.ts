import { useToggle } from '@vueuse/core'

import { onMounted } from 'vue'

const useToggleDarkMode = () => {
  const [isDark, useToggleDark] = useToggle(true)

  const toggleDarkClass = (val: boolean) => {
    const root = document.querySelector('html')
    if (!root)
      return
    if (val) {
      root?.classList.add('dark')
      return
    }
    root?.classList.remove('dark')
  }

  const toggleDark = () => {
    useToggleDark(!isDark.value)
    toggleDarkClass(isDark.value)
  }

  const themeModeIcon = computed(() =>
    isDark.value ? 'ri:sun-line' : 'ri:moon-fill',
  )

  onMounted(() => {
    toggleDarkClass(isDark.value)
  })

  return {
    iconName: themeModeIcon,
    isDark,
    toggleDark,
  }
}

export default useToggleDarkMode
