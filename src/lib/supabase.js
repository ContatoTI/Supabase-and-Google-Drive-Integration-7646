import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config/storage';

let supabaseClient = null;

export const getSupabase = () => {
  if (!supabaseClient) {
    const config = getSupabaseConfig();
    
    if (config && config.url && config.anonKey) {
      // Desestruturar o objeto config corretamente
      const { url, anonKey } = config;
      
      try {
        supabaseClient = createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        
        console.log('Supabase client inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao criar cliente Supabase:', error);
        supabaseClient = null;
      }
    } else {
      console.warn('Configuração do Supabase não encontrada ou incompleta');
    }
  }
  
  return supabaseClient;
};

export default getSupabase();