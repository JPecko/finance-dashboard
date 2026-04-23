import { supabase } from '@/data/supabase'

type UserSettingsRow = {
  id: number
  user_id: string
  price_api_key: string | null
  created_at: string
}

export type UserSettings = {
  priceApiKey?: string
}

export const userSettingsRepo = {
  get: async (): Promise<UserSettings | null> => {
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .maybeSingle()
    if (!data) return null
    const row = data as UserSettingsRow
    return { priceApiKey: row.price_api_key ?? undefined }
  },

  upsert: async (settings: UserSettings): Promise<void> => {
    const { error } = await supabase
      .from('user_settings')
      .upsert({ price_api_key: settings.priceApiKey ?? null }, { onConflict: 'user_id' })
    if (error) throw error
  },
}
