const STORAGE_KEYS = {
  SUPABASE_CONFIG: 'supabase_config',
  GOOGLE_DRIVE_CONFIG: 'google_drive_config'
};

export const saveSupabaseConfig = (config) => {
  try {
    const configString = JSON.stringify(config);
    const encryptedConfig = btoa(configString);
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, encryptedConfig);
    console.log('Configuração do Supabase salva com sucesso');
  } catch (error) {
    console.error('Erro ao salvar configuração do Supabase:', error);
    // Fallback: salvar sem criptografia
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
  }
};

export const getSupabaseConfig = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
  if (!stored) return null;

  try {
    // Tentar decodificar como base64
    const decoded = atob(stored);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Erro ao decodificar configuração do Supabase:', error);
    try {
      // Fallback: tentar como JSON direto
      return JSON.parse(stored);
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError);
      // Limpar configuração corrompida
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_CONFIG);
      return null;
    }
  }
};

export const saveGoogleDriveConfig = (config) => {
  try {
    const configString = JSON.stringify(config);
    const encryptedConfig = btoa(configString);
    localStorage.setItem(STORAGE_KEYS.GOOGLE_DRIVE_CONFIG, encryptedConfig);
    console.log('Configuração do Google Drive salva com sucesso');
  } catch (error) {
    console.error('Erro ao salvar configuração do Google Drive:', error);
    // Fallback: salvar sem criptografia
    localStorage.setItem(STORAGE_KEYS.GOOGLE_DRIVE_CONFIG, JSON.stringify(config));
  }
};

export const getGoogleDriveConfig = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.GOOGLE_DRIVE_CONFIG);
  if (!stored) return null;

  try {
    // Tentar decodificar como base64
    const decoded = atob(stored);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Erro ao decodificar configuração do Google Drive:', error);
    try {
      // Fallback: tentar como JSON direto
      return JSON.parse(stored);
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError);
      // Limpar configuração corrompida
      localStorage.removeItem(STORAGE_KEYS.GOOGLE_DRIVE_CONFIG);
      return null;
    }
  }
};

export const clearAllConfigs = () => {
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_CONFIG);
  localStorage.removeItem(STORAGE_KEYS.GOOGLE_DRIVE_CONFIG);
  console.log('Todas as configurações foram removidas');
};