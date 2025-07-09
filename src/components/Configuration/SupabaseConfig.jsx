import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { saveSupabaseConfig, getSupabaseConfig } from '../../config/storage';
import { initializeSupabase, testConnection, createRequiredTables, syncUsers } from '../../config/database';

const { FiDatabase, FiSave, FiTestTube, FiEye, FiEyeOff, FiCheck, FiX, FiRefreshCw, FiUsers, FiCopy, FiCode } = FiIcons;

const SupabaseConfig = () => {
  const [config, setConfig] = useState({
    url: '',
    anonKey: '',
    secretKey: ''
  });
  const [showKeys, setShowKeys] = useState({
    anonKey: false,
    secretKey: false
  });
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
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
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
      setTestResult({
        success: false,
        message: error.message
      });
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
      // Criar tabelas
      const createResult = await createRequiredTables();
      
      if (createResult.success) {
        // Sincronizar usuários
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
    setShowKeys(prev => ({
      ...prev,
      [keyType]: !prev[keyType]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Supabase
            </label>
            <input
              type="url"
              value={config.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://seu-projeto.supabase.co"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ANON KEY
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SECRET KEY (Opcional)
            </label>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiSave} className="w-5 h-5" />
              <span>{saved ? 'Salvo' : 'Salvar'}</span>
            </motion.button>

            <motion.button
              onClick={handleTest}
              disabled={loading || !config.url || !config.anonKey}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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

export default SupabaseConfig;