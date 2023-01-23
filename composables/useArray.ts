import { ref } from 'vue'

const useArray = (arr: unknown[]) => {
  const clone = ref([...arr])

  const swap = (val: any, index: number) => {
    clone.value.splice(index, 1, val)
  }

  const append = (val: any, index?: number) => {
    if (index !== undefined && index + 1 <= clone.value.length)
      clone.value.splice(index, 0, val)
    else
      clone.value.push(val)
  }
  const prepend = (val: any, index?: number) => {
    if (index !== undefined && index - 1 >= 0)
      clone.value.splice(index, 0, val)
    else
      clone.value.unshift(val)
  }

  /**
   * pop exist value, push not exist value
   *
   * @param val: any
   * @param index: number
   * @returns
   */
  const toggle = (val: any, index = 0) => {
    const targetIndex = clone.value.findIndex(v => v === val)

    if (targetIndex !== -1)
      clone.value.splice(targetIndex, 1)
    else append(val, index)
  }

  return {
    values: clone,
    swap,
    append,
    prepend,
    toggle,
  }
}

export default useArray
