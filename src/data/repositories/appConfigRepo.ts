import { supabase } from '@/data/supabase'

export async function getRemoteAppVersion(): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'app_version')
    .single()

  if (error || !data) return null
  return data.value as string
}
