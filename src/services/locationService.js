import { supabase } from '../supabase'

export async function broadcastPosition({ deviceId, groupId, label, latitude, longitude, accuracy }) {
  const { error } = await supabase
    .from('device_locations')
    .upsert(
      {
        device_id: deviceId,
        group_id: groupId,
        label: label || deviceId,
        latitude,
        longitude,
        accuracy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'device_id' }
    )

  if (error) throw error
}

export async function removeDevice(deviceId, groupId) {
  let query = supabase.from('device_locations').delete().eq('device_id', deviceId)
  if (groupId) {
    query = query.eq('group_id', groupId)
  }
  const { error } = await query
  if (error) throw error
}
