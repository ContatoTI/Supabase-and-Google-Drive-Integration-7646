import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useProductImage } from '../../hooks/useProductImage';

const { FiLink, FiPackage, FiLoader, FiChevronRight, FiImage, FiX } = FiIcons;

const RelatedProductItem = ({ product, onProductSelect, isSelected = false }) => {
  const { imageUrl, loading: imageLoading } = useProductImage(product.foto);

  const formatPrice = (price) => {
    if (!price) return 'Consulte';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`cursor-pointer p-3 rounded-lg border transition-all ${
        isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
      onClick={() => onProductSelect(product)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex space-x-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {imageLoading ? (
            <SafeIcon icon={FiLoader} className="w-3 h-3 text-gray-400 animate-spin" />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={product.descricao_produto}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : (
            <SafeIcon icon={FiImage} className="w-3 h-3 text-gray-400" />
          )}
          <SafeIcon icon={FiPackage} className="hidden w-3 h-3 text-gray-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-800 truncate">
              {product.codigo_produto || 'N/A'}
            </h4>
            {isSelected && (
              <SafeIcon icon={FiChevronRight} className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 mb-1">
            {product.descricao_produto || 'Sem descrição'}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {product.fabricante || 'N/A'}
            </span>
            {product.preco && (
              <span className="text-xs font-medium text-green-600">
                {formatPrice(product.preco)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RelatedProductsSidebar = ({ selectedProduct, relatedProducts, loading, onProductSelect, showCloseButton = false, onClose }) => {
  if (!selectedProduct) {
    return (
      <div className="h-full bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiLink} className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-500 mb-1">
            Produtos Relacionados
          </h3>
          <p className="text-gray-400 text-sm">
            Selecione um produto para ver produtos relacionados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border border-gray-200 rounded-lg flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiLink} className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-800">
              Produtos Relacionados
            </h3>
          </div>
          {showCloseButton && onClose && (
            <motion.button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SafeIcon icon={FiX} className="w-4 h-4 text-gray-500" />
            </motion.button>
          )}
        </div>
        <div className="bg-blue-50 px-3 py-2 rounded-lg">
          <div className="text-xs text-blue-700 mb-1">
            <span className="font-medium">Produto atual:</span>
          </div>
          <div className="text-sm font-medium text-blue-900 truncate">
            {selectedProduct.codigo_produto}
          </div>
          <div className="text-xs text-blue-600 truncate">
            {selectedProduct.descricao_produto}
          </div>
          {selectedProduct.grupo_visco && (
            <div className="text-xs text-blue-500 mt-1">
              Grupo Visco: {selectedProduct.grupo_visco}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-gray-600">Carregando produtos relacionados...</p>
            </div>
          </div>
        ) : !selectedProduct.grupo_visco ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <SafeIcon icon={FiLink} className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">Sem grupo visco</p>
              <p className="text-xs text-gray-400">
                Este produto não possui grupo visco definido
              </p>
            </div>
          </div>
        ) : relatedProducts.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <SafeIcon icon={FiPackage} className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">Nenhum produto relacionado</p>
              <p className="text-xs text-gray-400">
                Não há outros produtos com grupo visco {selectedProduct.grupo_visco}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600">
                {relatedProducts.length} produto{relatedProducts.length !== 1 ? 's' : ''} relacionado{relatedProducts.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-gray-500">
                Grupo {selectedProduct.grupo_visco}
              </span>
            </div>
            {relatedProducts.map((product) => (
              <RelatedProductItem
                key={product.id}
                product={product}
                onProductSelect={onProductSelect}
                isSelected={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {relatedProducts.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-shrink-0">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Produtos com mesmo grupo visco
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatedProductsSidebar;