import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiSearch, FiX, FiRefreshCw } = FiIcons;

const ProductSearch = ({
  filters,
  grupos,
  montadoras,
  onFiltersChange,
  onSearch,
  onClear,
  loading,
  disabled = false,
  compact = false
}) => {
  const handleInputChange = (field, value) => {
    if (disabled) return;
    onFiltersChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled) {
      onSearch();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !disabled) {
      onSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-50 p-4 rounded-sm ${disabled ? 'opacity-50' : ''}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campos de busca - Um por linha, largura completa */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Palavra-chave
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => handleInputChange('keyword', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Buscar na descrição..."
                disabled={disabled}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-falcon-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <SafeIcon icon={FiSearch} className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código/Nº Referência
            </label>
            <input
              type="text"
              value={filters.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Código do produto ou original..."
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-falcon-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {!compact && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fabricante
                </label>
                <input
                  type="text"
                  value={filters.fabricante}
                  onChange={(e) => handleInputChange('fabricante', e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nome do fabricante..."
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-falcon-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aplicação
                </label>
                <input
                  type="text"
                  value={filters.aplicacao}
                  onChange={(e) => handleInputChange('aplicacao', e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Aplicação do produto..."
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-falcon-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montadora
                </label>
                <select
                  value={filters.montadora}
                  onChange={(e) => handleInputChange('montadora', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-falcon-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Todas as montadoras</option>
                  {montadoras.map((montadora) => (
                    <option key={montadora} value={montadora}>
                      {montadora}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupo
                </label>
                <select
                  value={filters.grupo}
                  onChange={(e) => handleInputChange('grupo', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-falcon-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Todos os grupos</option>
                  {grupos.map((grupo) => (
                    <option key={grupo} value={grupo}>
                      {grupo}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            type="submit"
            disabled={loading || disabled}
            className="bg-falcon-green-600 text-white px-6 py-2 rounded-sm hover:bg-falcon-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
          >
            <SafeIcon icon={loading ? FiRefreshCw : FiSearch} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Buscando...' : 'Buscar'}</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={onClear}
            disabled={loading || disabled}
            className="bg-gray-600 text-white px-6 py-2 rounded-sm hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
          >
            <SafeIcon icon={FiX} className="w-4 h-4" />
            <span>{compact ? 'Limpar' : 'Limpar Campos'}</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductSearch;