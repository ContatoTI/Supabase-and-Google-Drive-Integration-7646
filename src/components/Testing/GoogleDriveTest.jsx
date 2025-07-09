import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import googleDriveAPI from '../../config/googleDrive';
import { getGoogleDriveConfig } from '../../config/storage';

const { FiCloud, FiImage, FiFolder, FiDownload, FiEye, FiRefreshCw, FiAlertCircle, FiCheck, FiX, FiSearch, FiZoomIn } = FiIcons;

const GoogleDriveTest = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pageToken, setPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  
  // Teste de busca por nome específico
  const [testFileName, setTestFileName] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    const driveConfig = getGoogleDriveConfig();
    setConfig(driveConfig);
    if (driveConfig) {
      testConnection();
    }
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setConnectionStatus(null);
    try {
      const result = await googleDriveAPI.testConnection();
      setConnectionStatus(result);
      if (result.success) {
        setFiles(result.data.files || []);
        setPageToken(result.data.nextPageToken);
        setHasMore(!!result.data.nextPageToken);
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testFileSearch = async () => {
    if (!testFileName.trim()) {
      alert('Digite o nome de um arquivo para testar');
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      console.log(`Testando busca por: ${testFileName}`);
      const result = await googleDriveAPI.findFileByName(testFileName.trim());
      
      if (result) {
        setTestResult({
          success: true,
          message: 'Arquivo encontrado!',
          file: result
        });
        console.log('Arquivo encontrado:', result);
      } else {
        setTestResult({
          success: false,
          message: 'Arquivo não encontrado',
          file: null
        });
      }
    } catch (error) {
      console.error('Erro no teste de busca:', error);
      setTestResult({
        success: false,
        message: `Erro: ${error.message}`,
        file: null
      });
    } finally {
      setTestLoading(false);
    }
  };

  const loadMoreFiles = async () => {
    if (!pageToken || loading) return;

    setLoading(true);
    try {
      const result = await googleDriveAPI.listFiles(currentFolder, pageToken);
      setFiles(prev => [...prev, ...result.files]);
      setPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
    } catch (error) {
      console.error('Erro ao carregar mais arquivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshFiles = async () => {
    setLoading(true);
    try {
      const result = await googleDriveAPI.listFiles(currentFolder);
      setFiles(result.files || []);
      setPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
    } catch (error) {
      console.error('Erro ao atualizar arquivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (file) => {
    setSelectedFile(file);
    if (file.mimeType.startsWith('image/')) {
      try {
        const downloadUrl = await googleDriveAPI.getFileDownloadUrl(file.id);
        setSelectedImage({
          ...file,
          downloadUrl
        });
        setShowImageModal(true);
      } catch (error) {
        console.error('Erro ao obter URL da imagem:', error);
        alert('Erro ao carregar imagem: ' + error.message);
      }
    }
  };

  const downloadFile = async (file) => {
    try {
      const downloadUrl = await googleDriveAPI.getFileDownloadUrl(file.id);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      link.click();
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      alert('Erro ao baixar arquivo: ' + error.message);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <SafeIcon icon={FiAlertCircle} className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Google Drive Não Configurado
          </h3>
          <p className="text-yellow-700">
            Configure as credenciais do Google Drive primeiro para testar as funcionalidades.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiCloud} className="w-8 h-8 text-green-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Teste Google Drive</h2>
                <p className="text-gray-600">Teste as funcionalidades de integração com Google Drive</p>
              </div>
            </div>
            <motion.button
              onClick={testConnection}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={loading ? FiRefreshCw : FiCheck} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Testando...' : 'Testar Conexão'}</span>
            </motion.button>
          </div>
        </div>

        {/* Status da Conexão */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status da Configuração</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${config.clientId ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={config.clientId ? FiCheck : FiX} className={`w-5 h-5 ${config.clientId ? 'text-green-500' : 'text-red-500'}`} />
                <span className="font-medium">Client ID</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {config.clientId ? 'Configurado' : 'Não configurado'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${config.accessToken ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={config.accessToken ? FiCheck : FiAlertCircle} className={`w-5 h-5 ${config.accessToken ? 'text-green-500' : 'text-yellow-500'}`} />
                <span className="font-medium">OAuth Token</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {config.accessToken ? 'Autenticado' : 'Não autenticado'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${config.apiKey ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={config.apiKey ? FiCheck : FiX} className={`w-5 h-5 ${config.apiKey ? 'text-blue-500' : 'text-gray-500'}`} />
                <span className="font-medium">API Key</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {config.apiKey ? 'Configurado (Fallback)' : 'Não configurado'}
              </p>
            </div>
          </div>
        </div>

        {/* Teste de Busca por Nome */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Teste de Busca por Nome de Arquivo</h3>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              value={testFileName}
              onChange={(e) => setTestFileName(e.target.value)}
              placeholder="Digite o nome do arquivo (ex: 123.jpg)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  testFileSearch();
                }
              }}
            />
            <motion.button
              onClick={testFileSearch}
              disabled={testLoading || !testFileName.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={testLoading ? FiRefreshCw : FiSearch} className={`w-5 h-5 ${testLoading ? 'animate-spin' : ''}`} />
              <span>{testLoading ? 'Buscando...' : 'Buscar'}</span>
            </motion.button>
          </div>

          {testResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg border ${testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={testResult.success ? FiCheck : FiX} className={`w-5 h-5 ${testResult.success ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.message}
                </span>
              </div>
              
              {testResult.file && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Nome: </span>
                      <span className="text-gray-900">{testResult.file.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">ID: </span>
                      <span className="text-gray-900 font-mono text-xs">{testResult.file.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tipo: </span>
                      <span className="text-gray-900">{testResult.file.mimeType}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">URL: </span>
                      <span className="text-green-600">✓ Disponível</span>
                    </div>
                  </div>
                  
                  {testResult.file.downloadUrl && testResult.file.mimeType.startsWith('image/') && (
                    <div className="mt-3">
                      <img
                        src={testResult.file.downloadUrl}
                        alt={testResult.file.name}
                        className="max-w-xs max-h-32 object-contain rounded border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-red-500 text-sm">Erro ao carregar preview</div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Resultado do Teste */}
        {connectionStatus && (
          <div className="p-6 border-b border-gray-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg flex items-center space-x-3 ${
                connectionStatus.success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <SafeIcon icon={connectionStatus.success ? FiCheck : FiX} className="w-6 h-6" />
              <div>
                <p className="font-medium">{connectionStatus.success ? 'Conexão Bem-sucedida!' : 'Erro na Conexão'}</p>
                <p className="text-sm">{connectionStatus.message}</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Lista de Arquivos */}
        {files.length > 0 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Arquivos Encontrados ({files.length})</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar arquivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
                <motion.button
                  onClick={refreshFiles}
                  disabled={loading}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SafeIcon icon={FiRefreshCw} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {file.mimeType.startsWith('image/') ? (
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <SafeIcon icon={FiImage} className="w-6 h-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <SafeIcon icon={FiFolder} className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(file.size)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(file.createdTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                    <div className="flex items-center space-x-2">
                      {file.mimeType.startsWith('image/') && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileClick(file);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Visualizar"
                        >
                          <SafeIcon icon={FiEye} className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(file);
                        }}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Download"
                      >
                        <SafeIcon icon={FiDownload} className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Carregar Mais */}
            {hasMore && (
              <div className="text-center mt-6">
                <motion.button
                  onClick={loadMoreFiles}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SafeIcon icon={loading ? FiRefreshCw : FiDownload} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Carregando...' : 'Carregar Mais'}</span>
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Visualização de Imagem */}
      {showImageModal && selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowImageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedImage.name}</h3>
                <p className="text-sm text-gray-600">{formatFileSize(selectedImage.size)}</p>
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto">
              <img
                src={selectedImage.downloadUrl}
                alt={selectedImage.name}
                className="max-w-full h-auto rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-center py-8">
                <SafeIcon icon={FiAlertCircle} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Erro ao carregar a imagem</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GoogleDriveTest;