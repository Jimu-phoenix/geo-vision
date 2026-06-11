import { useState, useEffect } from 'preact/hooks'
import { supabase } from '../supabase'

export function useTracker(groupId) {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!groupId) return

    const fetchDevices = async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('device_locations')
        .select('*')
        .eq('group_id', groupId)
        .order('updated_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setDevices(data)
      }
      setLoading(false)
    }

    fetchDevices()
  }, [groupId])

  useEffect(() => {
    if (!groupId) return

    const channel = supabase
      .channel(`device_locations_${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'device_locations', filter: `group_id=eq.${groupId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDevices((prev) => {
              if (prev.some((d) => d.id === payload.new.id)) return prev
              return [payload.new, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            setDevices((prev) =>
              prev.map((d) => (d.id === payload.new.id ? payload.new : d))
            )
          } else if (payload.eventType === 'DELETE') {
            setDevices((prev) => prev.filter((d) => d.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [groupId])

  const removeFromList = (deviceId) => {
    setDevices((prev) => prev.filter((d) => d.device_id !== deviceId))
  }

  return { devices, loading, error, removeFromList }
}
