import isValidateDate from '~/utils/isValidaDate'

const defaultOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

interface Options {
  locale: string
  format: Intl.DateTimeFormatOptions
}

const dateFormatter = (date: Date, options?: Options) => {
  if (!isValidateDate(date))
    return ''
  let implOption = defaultOptions
  let implLocale = 'en'

  if (options && options.format !== undefined)
    implOption = options.format

  if (options && options.locale !== undefined)
    implLocale = options.locale

  return date.toLocaleDateString(implLocale, implOption)
}

export default dateFormatter
