export const formatDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export const formatTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
