export interface Template {
  id: string
  name: string
  collection: string
  description: string | null
  prompt_template: string
  thumbnail_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Generation {
  id: string
  user_id: string
  template_id: string
  input_image_url: string
  generated_image_url: string | null
  user_inputs: Record<string, any> | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface UserQuota {
  id: string
  user_id: string
  period_start: string
  period_end: string
  generations_used: number
  generations_limit: number
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      templates: {
        Row: Template
        Insert: Omit<Template, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Template, 'id' | 'created_at' | 'updated_at'>>
      }
      generations: {
        Row: Generation
        Insert: Omit<Generation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Generation, 'id' | 'created_at' | 'updated_at'>>
      }
      user_quotas: {
        Row: UserQuota
        Insert: Omit<UserQuota, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserQuota, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
