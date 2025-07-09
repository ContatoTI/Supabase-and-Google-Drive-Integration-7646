import { getGoogleDriveConfig } from './storage';

/**
 * Classe para gerenciar a API do Google Drive
 */
class GoogleDriveAPI {
  constructor() {
    this.config = null;
    this.imageCache = new Map(); // Cache para URLs de imagens
    this.loadConfig();
  }

  loadConfig() {
    this.config = getGoogleDriveConfig();
  }

  /**
   * Verifica se a configuração está válida
   */
  isConfigured() {
    return this.config && this.config.clientId;
  }

  /**
   * Verifica se tem access token OAuth
   */
  hasOAuthToken() {
    return this.config && this.config.accessToken;
  }

  /**
   * Verifica se tem API Key como fallback
   */
  hasApiKey() {
    return this.config && this.config.apiKey;
  }

  /**
   * Retorna os headers de autenticação apropriados
   */
  getAuthHeaders() {
    if (!this.config) {
      throw new Error('Google Drive não configurado');
    }

    // Priorizar OAuth token
    if (this.config.accessToken) {
      return {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      };
    }

    // Usar API Key como fallback
    if (this.config.apiKey) {
      return {
        'Content-Type': 'application/json'
      };
    }

    throw new Error('Nenhum método de autenticação disponível');
  }

  /**
   * Constrói URL da API com autenticação apropriada
   */
  buildApiUrl(endpoint, params = {}) {
    const baseUrl = 'https://www.googleapis.com/drive/v3';
    const url = new URL(`${baseUrl}${endpoint}`);

    // Adicionar parâmetros
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    // Se não tem OAuth token, usar API Key
    if (!this.config.accessToken && this.config.apiKey) {
      url.searchParams.append('key', this.config.apiKey);
    }

    return url.toString();
  }

  /**
   * Faz requisição para a API do Google Drive
   */
  async makeRequest(endpoint, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Google Drive não configurado');
    }

    const url = this.buildApiUrl(endpoint, options.params);
    const headers = this.getAuthHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro na API do Google Drive: ${error.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição Google Drive:', error);
      throw error;
    }
  }

  /**
   * Busca um arquivo específico por nome
   */
  async findFileByName(fileName) {
    // Verificar cache primeiro
    if (this.imageCache.has(fileName)) {
      return this.imageCache.get(fileName);
    }

    try {
      const params = {
        q: `name='${fileName}' and trashed=false`,
        fields: 'files(id,name,mimeType,thumbnailLink,webViewLink)',
        pageSize: 1
      };

      // Filtrar por pasta se especificada
      if (this.config.folderId) {
        params.q = `'${this.config.folderId}' in parents and name='${fileName}' and trashed=false`;
      }

      const result = await this.makeRequest('/files', { params });
      
      if (result.files && result.files.length > 0) {
        const file = result.files[0];
        const fileInfo = {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          thumbnailLink: file.thumbnailLink,
          webViewLink: file.webViewLink,
          downloadUrl: null
        };

        // Obter URL de download
        try {
          fileInfo.downloadUrl = await this.getFileDownloadUrl(file.id);
        } catch (downloadError) {
          console.warn(`Erro ao obter URL de download para ${fileName}:`, downloadError);
          // Usar thumbnail como fallback
          fileInfo.downloadUrl = file.thumbnailLink;
        }

        // Cachear resultado
        this.imageCache.set(fileName, fileInfo);
        return fileInfo;
      }

      return null;
    } catch (error) {
      console.error(`Erro ao buscar arquivo ${fileName}:`, error);
      return null;
    }
  }

  /**
   * Lista arquivos de uma pasta
   */
  async listFiles(folderId = null, pageToken = null) {
    const params = {
      fields: 'nextPageToken,files(id,name,mimeType,thumbnailLink,webViewLink,size,createdTime)',
      pageSize: 50
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    // Filtrar por pasta se especificada
    if (folderId || this.config.folderId) {
      const targetFolderId = folderId || this.config.folderId;
      params.q = `'${targetFolderId}' in parents and trashed=false`;
    } else {
      params.q = 'trashed=false';
    }

    // Filtrar apenas imagens
    params.q += " and (mimeType contains 'image/')";

    return await this.makeRequest('/files', { params });
  }

  /**
   * Obtém informações de um arquivo específico
   */
  async getFile(fileId) {
    const params = {
      fields: 'id,name,mimeType,thumbnailLink,webViewLink,size,createdTime,parents'
    };

    return await this.makeRequest(`/files/${fileId}`, { params });
  }

  /**
   * Obtém URL de download direto de um arquivo
   */
  async getFileDownloadUrl(fileId) {
    if (this.hasOAuthToken()) {
      // Com OAuth, pode usar URL de download direto
      return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    } else if (this.hasApiKey()) {
      // Com API Key, usar thumbnail ou webViewLink
      const file = await this.getFile(fileId);
      return file.thumbnailLink || file.webViewLink;
    } else {
      throw new Error('Nenhum método de autenticação disponível');
    }
  }

  /**
   * Busca múltiplas imagens por uma lista de nomes de arquivos
   */
  async findMultipleFiles(fileNames) {
    const results = {};
    
    // Processar em lotes para evitar muitas requisições simultâneas
    const batchSize = 5;
    for (let i = 0; i < fileNames.length; i += batchSize) {
      const batch = fileNames.slice(i, i + batchSize);
      const promises = batch.map(async (fileName) => {
        try {
          const result = await this.findFileByName(fileName);
          return { fileName, result };
        } catch (error) {
          console.error(`Erro ao buscar ${fileName}:`, error);
          return { fileName, result: null };
        }
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ fileName, result }) => {
        results[fileName] = result;
      });

      // Pequena pausa entre lotes para não sobrecarregar a API
      if (i + batchSize < fileNames.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Limpa o cache de imagens
   */
  clearCache() {
    this.imageCache.clear();
  }

  /**
   * Testa a conexão com a API
   */
  async testConnection() {
    try {
      // Tentar listar arquivos para testar
      const result = await this.listFiles();
      return {
        success: true,
        message: `Conexão OK! Encontradas ${result.files?.length || 0} imagens.`,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error
      };
    }
  }
}

// Instância singleton
const googleDriveAPI = new GoogleDriveAPI();

export default googleDriveAPI;