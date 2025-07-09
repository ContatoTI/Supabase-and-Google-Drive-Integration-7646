import React, {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import {SafeIcon, Loading, ErrorMessage} from '../Common';
import {saveSupabaseConfig, getSupabaseConfig, saveGoogleDriveConfig, getGoogleDriveConfig} from '../../config/storage';
import {initializeSupabase, testConnection, createRequiredTables, syncUsers} from '../../config/database';

const {FiDatabase, FiCloud, FiSave, FiTestTube, FiEye, FiEyeOff, FiCheck, FiX, FiRefreshCw, FiUsers, FiCopy, FiKey, FiFolder, FiExternalLink, FiInfo} = FiIcons;

// Supabase Configuration Component
export const SupabaseConfig = () => {
  const [config, setConfig] = useState({url: '', anonKey: '', secretKey: ''});
  const [showKeys, setShowKeys] = useState({anonKey: false, secretKey: false});
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [setupStatus, setSetupStatus] = useState(null);

  useEffect(() => {
    const savedConfig = getSupabaseConfig();
    if (savedConfig) {
      setConfig(savedConfig);
      setSaved(true);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setConfig(prev => ({...prev, [field]: value}));
    setSaved(false);
    setTestResult(null);
    setSetupStatus(null);
  };

  const handleSave = () => {
    if (!config.url || !config.anonKey) {
      alert('URL e ANON_KEY são obrigatórios');
      return;
    }
    saveSupabaseConfig(config);
    setSaved(true);
    alert('Configuração salva com sucesso!');
  };

  const handleTest = async () => {
    if (!config.url || !config.anonKey) {
      alert('Configure primeiro a URL e ANON_KEY');
      return;
    }

    setLoading(true);
    setTestResult(null);
    try {
      initializeSupabase(config);
      const result = await testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({success: false, message: error.message});
    } finally {
      setLoading(false);
    }
  };

  const handleSetupDatabase = async () => {
    if (!testResult?.success) {
      alert('Teste a conexão primeiro!');
      return;
    }

    setLoading(true);
    setSetupStatus(null);
    try {
      const createResult = await createRequiredTables();
      if (createResult.success) {
        const syncResult = await syncUsers();
        setSetupStatus({
          success: true,
          message: `Base de dados configurada! ${syncResult.message}`,
          showSql: false
        });
      } else {
        setSetupStatus({
          success: false,
          message: createResult.message,
          showSql: !!createResult.sqlToExecute,
          sqlToExecute: createResult.sqlToExecute
        });
      }
    } catch (error) {
      setSetupStatus({
        success: false,
        message: `Erro na configuração: ${error.message}`,
        showSql: false
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('SQL copiado para a área de transferência!');
  };

  const toggleKeyVisibility = (keyType) => {
    setShowKeys(prev => ({...prev, [keyType]: !prev[keyType]}));
  };

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <SafeIcon icon={FiDatabase} className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Configuração Supabase</h2>
            <p className="text-gray-600">Configure as credenciais do seu projeto Supabase</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL do Supabase</label>
            <input
              type="url"
              value={config.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://seu-projeto.supabase.co"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ANON KEY</label>
            <div className="relative">
              <input
                type={showKeys.anonKey ? 'text' : 'password'}
                value={config.anonKey}
                onChange={(e) => handleInputChange('anonKey', e.target.value)}
                placeholder="sua-anon-key"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('anonKey')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={showKeys.anonKey ? FiEyeOff : FiEye} className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SECRET KEY (Opcional)</label>
            <div className="relative">
              <input
                type={showKeys.secretKey ? 'text' : 'password'}
                value={config.secretKey}
                onChange={(e) => handleInputChange('secretKey', e.target.value)}
                placeholder="sua-secret-key"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('secretKey')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={showKeys.secretKey ? FiEyeOff : FiEye} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {testResult && (
            <motion.div
              initial={{opacity: 0, scale: 0.95}}
              animate={{opacity: 1, scale: 1}}
              className={`p-4 rounded-lg flex items-center space-x-2 ${
                testResult.success 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <SafeIcon icon={testResult.success ? FiCheck : FiX} className="w-5 h-5" />
              <div>
                <span className="font-medium">
                  {testResult.success ? 'Conexão Bem-sucedida!' : 'Erro na Conexão'}
                </span>
                <p className="text-sm">{testResult.message}</p>
              </div>
            </motion.div>
          )}

          {setupStatus && (
            <motion.div
              initial={{opacity: 0, scale: 0.95}}
              animate={{opacity: 1, scale: 1}}
              className={`p-4 rounded-lg ${
                setupStatus.success 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={setupStatus.success ? FiDatabase : FiX} className="w-5 h-5" />
                <span className="font-medium">
                  {setupStatus.success ? 'Configuração Concluída!' : 'Erro na Configuração'}
                </span>
              </div>
              <p className="text-sm">{setupStatus.message}</p>
              {setupStatus.showSql && setupStatus.sqlToExecute && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">SQL para executar manualmente:</span>
                    <button
                      onClick={() => copyToClipboard(setupStatus.sqlToExecute)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    >
                      <SafeIcon icon={FiCopy} className="w-4 h-4" />
                      <span className="text-sm">Copiar</span>
                    </button>
                  </div>
                  <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                    {setupStatus.sqlToExecute}
                  </pre>
                </div>
              )}
            </motion.div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Como obter as credenciais:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Acesse seu projeto no Supabase</li>
              <li>2. Vá em Settings → API</li>
              <li>3. Copie a URL do projeto</li>
              <li>4. Copie a chave anon/public</li>
              <li>5. Copie a chave service_role (opcional)</li>
            </ol>
          </div>

          <div className="flex space-x-4">
            <motion.button
              onClick={handleSave}
              disabled={!config.url || !config.anonKey}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              <SafeIcon icon={FiSave} className="w-5 h-5" />
              <span>{saved ? 'Salvo' : 'Salvar'}</span>
            </motion.button>

            <motion.button
              onClick={handleTest}
              disabled={loading || !config.url || !config.anonKey}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              <SafeIcon icon={FiTestTube} className="w-5 h-5" />
              <span>{loading ? 'Testando...' : 'Testar Conexão'}</span>
            </motion.button>
          </div>

          {testResult?.success && (
            <motion.button
              onClick={handleSetupDatabase}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              <SafeIcon icon={loading ? FiRefreshCw : FiDatabase} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Configurando...' : 'Configurar Base de Dados'}</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Google Drive Configuration Component
export const GoogleDriveConfig = () => {
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
    setConfig(prev => ({...prev, [field]: value}));
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
      saveGoogleDriveConfig(config);
      const redirectUri = window.location.origin + '/#/oauth/callback';
      const scope = 'https://www.googleapis.com/auth/drive.readonly';
      const responseType = 'code';
      const state = Date.now().toString();

      localStorage.setItem('oauth_state', state);
      console.log('Iniciando OAuth com redirect URI:', redirectUri);

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(config.clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=${responseType}&` +
        `access_type=offline&` +
        `state=${state}`;

      console.log('URL de autorização:', authUrl);

      const popup = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup || popup.closed) {
        throw new Error('Popup foi bloqueado pelo navegador. Permita popups para este site.');
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsAuthenticating(false);
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
    setShowKeys(prev => ({...prev, [keyType]: !prev[keyType]}));
  };

  const redirectUris = [
    window.location.origin + '/oauth/callback',
    window.location.origin + '/#/oauth/callback'
  ];

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Client ID *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret *</label>
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
            <p className="text-sm text-gray-500 mt-1">Necessário para autenticação OAuth</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key (Opcional)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">ID da Pasta (Opcional)</label>
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
            <p className="text-sm text-gray-500 mt-1">Deixe em branco para usar a pasta raiz</p>
          </div>

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
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              <SafeIcon icon={FiSave} className="w-5 h-5" />
              <span>{saved ? 'Salvo' : 'Salvar Configuração'}</span>
            </motion.button>

            <motion.button
              onClick={handleOAuthLogin}
              disabled={!config.clientId || !config.clientSecret || isAuthenticating}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
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