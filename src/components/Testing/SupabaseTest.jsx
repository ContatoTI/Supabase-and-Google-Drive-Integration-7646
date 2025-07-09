import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { getSupabaseConfig } from '../../config/storage';
import { 
  initializeSupabase, 
  testConnection, 
  listAllTables, 
  getTableInfo,
  testTableConnection 
} from '../../config/database';

const { 
  FiDatabase, FiCheck, FiX, FiRefreshCw, FiPlus, FiEdit2, FiTrash2, 
  FiAlertCircle, FiInfo, FiUser, FiShield, FiTable, FiLock, FiUnlock,
  FiEye, FiSettings, FiChevronDown, FiChevronRight, FiGrid
} = FiIcons;

const SupabaseTest = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableInfo, setTableInfo] = useState({});
  const [expandedTables, setExpandedTables] = useState({});
  const [newRecord, setNewRecord] = useState({});
  const [editingRecord, setEditingRecord] = useState(null);
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    const supabaseConfig = getSupabaseConfig();
    setConfig(supabaseConfig);
    
    if (supabaseConfig && supabaseConfig.url && supabaseConfig.anonKey) {
      initializeClient(supabaseConfig);
    } else {
      console.warn('Configuração do Supabase não encontrada ou incompleta');
    }
  }, []);

  const initializeClient = async (supabaseConfig) => {
    try {
      console.log('Inicializando cliente Supabase...');
      const client = initializeSupabase(supabaseConfig);
      setSupabase(client);
      console.log('Cliente Supabase inicializado com sucesso');
      await testConnectionStatus();
    } catch (error) {
      console.error('Erro ao inicializar Supabase:', error);
      setConnectionStatus({
        success: false,
        message: `Erro na inicialização: ${error.message}`
      });
    }
  };

  const testConnectionStatus = async () => {
    setLoading(true);
    setConnectionStatus(null);
    
    try {
      console.log('Testando conexão...');
      const result = await testConnection();
      console.log('Resultado do teste:', result);
      setConnectionStatus(result);
      
      if (result.success) {
        await loadAllTables();
      }
    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      setConnectionStatus({
        success: false,
        message: `Erro no teste: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllTables = async () => {
    try {
      console.log('Carregando todas as tabelas...');
      const result = await listAllTables();
      
      if (result.success) {
        setTables(result.tables);
        console.log('Tabelas carregadas:', result.tables);
        
        // Carregar informações detalhadas de cada tabela
        const tableInfoPromises = result.tables.map(table => 
          getTableInfo(table.table_name)
        );
        
        const tableInfoResults = await Promise.all(tableInfoPromises);
        const tableInfoMap = {};
        
        tableInfoResults.forEach(info => {
          if (info.success) {
            tableInfoMap[info.tableName] = info;
          }
        });
        
        setTableInfo(tableInfoMap);
        console.log('Informações das tabelas carregadas:', tableInfoMap);
      }
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error);
    }
  };

  const loadTableData = async (tableName) => {
    if (!supabase || !tableName) {
      console.warn('Cliente Supabase ou nome da tabela não disponível');
      return;
    }

    setLoading(true);
    try {
      console.log(`Carregando dados da tabela: ${tableName}`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(10);

      if (error) {
        console.error(`Erro ao carregar dados da tabela ${tableName}:`, error);
        throw error;
      }

      console.log(`Dados carregados da tabela ${tableName}:`, data);
      setTableData(data || []);

      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        setTableColumns(columns);
        
        const emptyRecord = {};
        columns.forEach(col => {
          emptyRecord[col] = '';
        });
        setNewRecord(emptyRecord);
      } else {
        setTableColumns([]);
        setNewRecord({});
      }
    } catch (error) {
      console.error('Erro ao carregar dados da tabela:', error);
      setTableData([]);
      setTableColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (tableName) => {
    setSelectedTable(tableName);
    setEditingRecord(null);
    loadTableData(tableName);
  };

  const toggleTableExpansion = (tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const handleCreateRecord = async () => {
    if (!supabase || !selectedTable) return;

    setLoading(true);
    try {
      const recordToInsert = { ...newRecord };
      delete recordToInsert.id;
      delete recordToInsert.created_at;
      delete recordToInsert.updated_at;

      Object.keys(recordToInsert).forEach(key => {
        if (recordToInsert[key] === '') {
          delete recordToInsert[key];
        }
      });

      const { data, error } = await supabase
        .from(selectedTable)
        .insert(recordToInsert)
        .select();

      if (error) throw error;

      alert('Registro criado com sucesso!');
      await loadTableData(selectedTable);

      const emptyRecord = {};
      tableColumns.forEach(col => {
        emptyRecord[col] = '';
      });
      setNewRecord(emptyRecord);
    } catch (error) {
      console.error('Erro ao criar registro:', error);
      alert('Erro ao criar registro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async () => {
    if (!supabase || !selectedTable || !editingRecord) return;

    setLoading(true);
    try {
      const recordToUpdate = { ...editingRecord };
      delete recordToUpdate.id;
      delete recordToUpdate.created_at;

      const { data, error } = await supabase
        .from(selectedTable)
        .update(recordToUpdate)
        .eq('id', editingRecord.id)
        .select();

      if (error) throw error;

      alert('Registro atualizado com sucesso!');
      await loadTableData(selectedTable);
      setEditingRecord(null);
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      alert('Erro ao atualizar registro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!supabase || !selectedTable) return;
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      alert('Registro excluído com sucesso!');
      await loadTableData(selectedTable);
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      alert('Erro ao excluir registro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPolicyCommand = (cmd) => {
    const commands = {
      'r': 'SELECT',
      'a': 'INSERT',
      'w': 'UPDATE',
      'd': 'DELETE',
      '*': 'ALL'
    };
    return commands[cmd] || cmd;
  };

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <SafeIcon icon={FiAlertCircle} className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Supabase Não Configurado
          </h3>
          <p className="text-yellow-700">
            Configure as credenciais do Supabase primeiro para testar as funcionalidades.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiDatabase} className="w-8 h-8 text-blue-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Teste Supabase</h2>
                <p className="text-gray-600">Teste conexão, tabelas e permissões do Supabase</p>
              </div>
            </div>
            <motion.button
              onClick={testConnectionStatus}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border-2 ${config.url ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={config.url ? FiCheck : FiX} className={`w-5 h-5 ${config.url ? 'text-green-500' : 'text-red-500'}`} />
                <span className="font-medium">URL do Projeto</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {config.url ? 'Configurado' : 'Não configurado'}
              </p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${config.anonKey ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={config.anonKey ? FiCheck : FiX} className={`w-5 h-5 ${config.anonKey ? 'text-green-500' : 'text-red-500'}`} />
                <span className="font-medium">Anon Key</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {config.anonKey ? 'Configurado' : 'Não configurado'}
              </p>
            </div>
          </div>
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

        {/* Lista de Tabelas */}
        {tables.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Tabelas Disponíveis ({tables.length})
            </h3>
            <div className="space-y-4">
              {tables.map((table) => {
                const info = tableInfo[table.table_name];
                const isExpanded = expandedTables[table.table_name];
                
                return (
                  <div key={table.table_name} className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleTableExpansion(table.table_name)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <SafeIcon icon={isExpanded ? FiChevronDown : FiChevronRight} className="w-5 h-5" />
                        </button>
                        <SafeIcon icon={FiTable} className="w-6 h-6 text-blue-500" />
                        <div>
                          <h4 className="font-medium text-gray-800">{table.table_name}</h4>
                          <p className="text-sm text-gray-600">
                            {info?.recordCount !== undefined ? `${info.recordCount} registros` : 'Carregando...'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          info?.rlsEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <SafeIcon icon={info?.rlsEnabled ? FiLock : FiUnlock} className="w-3 h-3 inline mr-1" />
                          RLS {info?.rlsEnabled ? 'ON' : 'OFF'}
                        </div>
                        <button
                          onClick={() => handleTableClick(table.table_name)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Ver Dados
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && info && (
                      <div className="p-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Colunas */}
                          <div>
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                              <SafeIcon icon={FiGrid} className="w-4 h-4 mr-2" />
                              Colunas ({info.columns?.length || 0})
                            </h5>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {info.columns?.map((column, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="font-mono text-sm text-gray-800">{column.column_name}</span>
                                  <span className="text-xs text-gray-500">{column.data_type}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Políticas RLS */}
                          <div>
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                              <SafeIcon icon={FiShield} className="w-4 h-4 mr-2" />
                              Políticas RLS ({info.policies?.length || 0})
                            </h5>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {info.policies?.length > 0 ? (
                                info.policies.map((policy, index) => (
                                  <div key={index} className="p-2 bg-gray-50 rounded">
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-sm text-gray-800">{policy.policyname}</span>
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {formatPolicyCommand(policy.cmd)}
                                      </span>
                                    </div>
                                    {policy.qual && (
                                      <p className="text-xs text-gray-600 mt-1 font-mono">{policy.qual}</p>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500 italic">Nenhuma política RLS encontrada</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dados da Tabela Selecionada */}
        {selectedTable && tableData.length > 0 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Dados da Tabela: {selectedTable}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    {tableColumns.map((column) => (
                      <th key={column} className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                        {column}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={row.id || index} className="border-b hover:bg-gray-50">
                      {tableColumns.map((column) => (
                        <td key={column} className="px-4 py-3 text-sm text-gray-800">
                          {editingRecord && editingRecord.id === row.id ? (
                            <input
                              type="text"
                              value={editingRecord[column] || ''}
                              onChange={(e) => setEditingRecord(prev => ({
                                ...prev,
                                [column]: e.target.value
                              }))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="truncate block max-w-xs">
                              {column.includes('password') ? '••••••••' : String(row[column] || '')}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {editingRecord && editingRecord.id === row.id ? (
                            <>
                              <motion.button
                                onClick={handleUpdateRecord}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Salvar"
                              >
                                <SafeIcon icon={FiCheck} className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                onClick={() => setEditingRecord(null)}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Cancelar"
                              >
                                <SafeIcon icon={FiX} className="w-4 h-4" />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <motion.button
                                onClick={() => setEditingRecord(row)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Editar"
                              >
                                <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                onClick={() => handleDeleteRecord(row.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Excluir"
                              >
                                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mensagem quando não há tabelas */}
        {connectionStatus?.success && tables.length === 0 && (
          <div className="p-6 text-center">
            <SafeIcon icon={FiInfo} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma tabela encontrada</h3>
            <p className="text-gray-500">
              Use o botão "Configurar Base de Dados" na página de configuração do Supabase para criar as tabelas necessárias.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SupabaseTest;