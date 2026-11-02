import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://vwdsnfmvrrjedygwcxhj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[STRIPPED 127 bytes].3Irnok13gqLsGE6HT5iFabI4Aad_OfDaX41ehvWr5mo'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
