import { useEffect, useState } from 'react'
import http from '../api/client'
import { version as clientVersion } from '../../package.json'

export function useVersionCheck() {
  const [update, setUpdate] = useState(null) // null | { version, notes }

  useEffect(() => {
    if (import.meta.env.DEV) return
    http.get('/version')
      .then(r => {
        const server = r.data.version
        if (server && server !== clientVersion) {
          setUpdate({ version: server, notes: r.data.notes || [] })
        }
      })
      .catch(() => {})
  }, [])

  return { update, dismiss: () => setUpdate(null) }
}
