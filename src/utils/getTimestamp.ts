export const getTimestamp = () => {
  return new Date()
    .toLocaleString('en-GB', {
      timeZone: 'Europe/Paris',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(/\//g, '-')
    .replace(/,/g, ':')
}
