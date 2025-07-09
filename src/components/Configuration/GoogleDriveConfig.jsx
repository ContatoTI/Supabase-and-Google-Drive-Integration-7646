import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { saveGoogleDriveConfig, getGoogleDriveConfig } from '../../config/storage';

const { FiCloud, FiSave, FiEye, FiEyeOff, FiKey, FiFolder, FiCheck, FiX, FiExternalLink, FiInfo } = FiIcons;

const GoogleDriveConfig = () => {
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    apiKey: '',
    folderId: '',
    accessToken: ''
  });
  const [showKeys, setShowKeys] = useState({
    clientSecret: false,
    apiKey: false,
    accessToken: false
  });
  const [saved, setSaved] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const savedConfig = getGoogleDriveConfig();
    if (savedConfig) {
      setConfig(savedConfig);
      setSaved(true);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!config.clientId) {
      alert('Client ID é obrigatório');
      return;
    }

    saveGoogleDriveConfig(config);
    setSaved(true);
    alert('Configuração do Google Drive salva com sucesso!');
  };

  const handleOAuthLogin = async () => {
    if (!config.clientId) {
      alert('Configure o Client ID primeiro');
      return;
    }

    setIsAuthenticating(true);

    try {
      // Salvar configuração atual antes de iniciar OAuth
      saveGoogleDriveConfig(config);

      // Configurar parâmetros OAuth
      const redirectUri = window.location.origin + '/#/oauth/callback';
      const scope = 'https://www.googleapis.com/auth/drive.readonly';
      const responseType = 'code';
      const state = Date.now().toString();

      // Salvar estado para verificação
      localStorage.setItem('oauth_state', state);

      console.log('Iniciando OAuth com redirect URI:', redirectUri);

      // URL de autorização do Google
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(config.clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=${responseType}&` +
        `access_type=offline&` +
        `state=${state}`;

      console.log('URL de autorização:', authUrl);

      // Abrir popup para autenticação
      const popup = window.open(
        authUrl, 
        'google-auth', 
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Verificar se o popup foi bloqueado
      if (!popup || popup.closed) {
        throw new Error('Popup foi bloqueado pelo navegador. Permita popups para este site.');
      }

      // Aguardar retorno do OAuth
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsAuthenticating(false);
          
          // Verificar se o token foi salvo
          setTimeout(() => {
            const savedConfig = getGoogleDriveConfig();
            if (savedConfig?.accessToken) {
              setConfig(savedConfig);
              setSaved(true);
              alert('Autenticação realizada com sucesso!');
            } else {
              console.log('Token não encontrado após fechamento do popup');
            }
          }, 1000);
        }
      }, 1000);

    } catch (error) {
      console.error('Erro na autenticação:', error);
      alert('Erro na autenticação: ' + error.message);
      setIsAuthenticating(false);
    }
  };

  const toggleKeyVisibility = (keyType) => {
    setShowKeys(prev => ({ ...prev, [keyType]: !prev[keyType] }));
  };

  // URLs que devem ser cadastradas no Google Console
  const redirectUris = [
    window.location.origin + '/oauth/callback',
    window.location.origin + '/#/oauth/callback'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <SafeIcon icon={FiCloud} className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Configuração Google Drive</h2>
            <p className="text-gray-600">Configure as credenciais para acessar o Google Drive</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* URLs de Redirecionamento */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiInfo} className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">URLs de Redirecionamento</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  Cadastre AMBAS as URLs no Google Cloud Console:
                </p>
                {redirectUris.map((uri, index) => (
                  <div key={index} className="mb-2">
                    <div className="bg-white p-2 rounded border text-sm font-mono break-all">
                      {uri}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(uri)}
                      className="mt-1 text-xs text-yellow-600 hover:text-yellow-800 underline"
                    >
                      Copiar URL {index + 1}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client ID *
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                placeholder="seu-client-id.googleusercontent.com"
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <SafeIcon icon={FiKey} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Secret *
            </label>
            <div className="relative">
              <input
                type={showKeys.clientSecret ? 'text' : 'password'}
                value={config.clientSecret}
                onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                placeholder="seu-client-secret"
                className="w-full px-4 py-3 pr-12 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <SafeIcon icon={FiKey} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('clientSecret')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={showKeys.clientSecret ? FiEyeOff : FiEye} className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Necessário para autenticação OAuth
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key (Opcional)
            </label>
            <div className="relative">
              <input
                type={showKeys.apiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="sua-api-key"
                className="w-full px-4 py-3 pr-12 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <SafeIcon icon={FiKey} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('apiKey')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={showKeys.apiKey ? FiEyeOff : FiEye} className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Usado como fallback quando OAuth não estiver disponível
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID da Pasta (Opcional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.folderId}
                onChange={(e) => handleInputChange('folderId', e.target.value)}
                placeholder="ID da pasta onde ficam as imagens"
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <SafeIcon icon={FiFolder} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Deixe em branco para usar a pasta raiz
            </p>
          </div>

          {/* Status do Access Token */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Status da Autenticação</h3>
                <p className="text-sm text-gray-600">
                  {config.accessToken ? 'Autenticado com OAuth' : 'Não autenticado'}
                </p>
              </div>
              <SafeIcon 
                icon={config.accessToken ? FiCheck : FiX} 
                className={`w-6 h-6 ${config.accessToken ? 'text-green-500' : 'text-red-500'}`} 
              />
            </div>
          </div>

          {/* Configuração Manual do Access Token */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token (Opcional - Configuração Manual)
            </label>
            <div className="relative">
              <input
                type={showKeys.accessToken ? 'text' : 'password'}
                value={config.accessToken}
                onChange={(e) => handleInputChange('accessToken', e.target.value)}
                placeholder="Token OAuth obtido manualmente"
                className="w-full px-4 py-3 pr-12 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <SafeIcon icon={FiKey} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('accessToken')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={showKeys.accessToken ? FiEyeOff : FiEye} className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Use o botão "Autenticar com Google" ou cole um token manualmente
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Como configurar no Google Cloud Console:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Acesse o <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>2. Crie um projeto ou selecione um existente</li>
              <li>3. Ative a API do Google Drive</li>
              <li>4. Crie credenciais OAuth 2.0</li>
              <li>5. Adicione as URLs de redirecionamento mostradas acima</li>
              <li>6. Copie o Client ID e Client Secret</li>
            </ol>
          </div>

          <div className="flex space-x-4">
            <motion.button
              onClick={handleSave}
              disabled={!config.clientId}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiSave} className="w-5 h-5" />
              <span>{saved ? 'Salvo' : 'Salvar Configuração'}</span>
            </motion.button>

            <motion.button
              onClick={handleOAuthLogin}
              disabled={!config.clientId || !config.clientSecret || isAuthenticating}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiExternalLink} className="w-5 h-5" />
              <span>{isAuthenticating ? 'Autenticando...' : 'Autenticar com Google'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GoogleDriveConfig;