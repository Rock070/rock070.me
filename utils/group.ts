export default function<S extends string | number, T>(
  list: T[],
  callbackfn: (value: T, index: number, array: T[]) => S,
) {
  return list.reduce((obj, current, index, array) => {
    const key = callbackfn(current, index, array)
    if (key in obj)
      obj[key].push(current)

    else
      obj[key] = [current]

    return obj
  }, {} as Record<S, T[]>)
}
