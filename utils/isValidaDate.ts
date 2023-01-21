export default (value: any): boolean => value instanceof Date && !Number.isNaN(value.valueOf())
