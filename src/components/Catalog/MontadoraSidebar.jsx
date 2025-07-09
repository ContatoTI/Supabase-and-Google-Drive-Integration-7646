import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiTruck, FiChevronRight, FiLoader } = FiIcons;

const MontadoraSidebar = ({ montadoras, selectedMontadora, onMontadoraSelect, loading }) => {
  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Loading State */}
      {loading && (
        <div className="p-3 text-center border-b border-gray-200 flex-shrink-0">
          <SafeIcon icon={FiLoader} className="w-5 h-5 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-xs text-gray-500">Carregando...</p>
        </div>
      )}

      {/* Lista de Montadoras - Scrollável */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Opção "Todas" */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onMontadoraSelect('')}
          className={`w-full text-left p-3 rounded-sm transition-colors mb-2 flex items-center justify-between ${
            selectedMontadora === ''
              ? 'bg-falcon-blue-100 text-falcon-blue-800 border border-falcon-blue-200'
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <span className="font-medium text-sm">Todas as Montadoras</span>
          {selectedMontadora === '' && (
            <SafeIcon icon={FiChevronRight} className="w-4 h-4" />
          )}
        </motion.button>

        {/* Montadoras individuais */}
        {montadoras.map((montadora) => (
          <motion.button
            key={montadora}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onMontadoraSelect(montadora)}
            className={`w-full text-left p-3 rounded-sm transition-colors mb-2 flex items-center justify-between ${
              selectedMontadora === montadora
                ? 'bg-falcon-blue-100 text-falcon-blue-800 border border-falcon-blue-200'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="truncate text-sm">{montadora}</span>
            {selectedMontadora === montadora && (
              <SafeIcon icon={FiChevronRight} className="w-4 h-4 flex-shrink-0" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 flex-shrink-0">
        <p className="text-xs text-gray-500 text-center">
          {montadoras.length} montadora{montadoras.length !== 1 ? 's' : ''} disponível{montadoras.length !== 1 ? 'eis' : ''}
        </p>
      </div>
    </div>
  );
};

export default MontadoraSidebar;