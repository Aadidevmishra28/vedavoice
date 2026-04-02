export type ActionType = 'UDHAAR' | 'PAYMENT' | 'UNKNOWN'
 
export interface Transaction {
  id: string
  user_id: string
  name: string
  amount: number
  amount_raw: string | null
  action: ActionType
  confidence: number
  transcript: string
  created_at: string
}
 
export interface ExtractResult {
  name: string | null
  amount_raw: string | null
  amount_int: number | null
  action: ActionType
  confidence: number
  raw: object[]
}

export interface Shop {
  id: string
  user_id: string
  shop_name: string
  owner_name: string
  phone: string | null
  created_at: string
}

export interface Prediction {
  id: string
  user_id: string
  transcript: string
  predicted_name: string | null
  predicted_amount: number | null
  predicted_action: ActionType
  confidence: number
  is_correct: boolean
  corrected_name?: string | null
  raw_output: any
  created_at: string
}

export interface Customer {
  name: string
  total_udhaar: number
  total_payment: number
  net_balance: number
  last_txn: string
  txn_count: number
}
 
