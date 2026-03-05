export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const generateEventCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
