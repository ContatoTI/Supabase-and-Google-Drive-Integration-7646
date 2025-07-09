import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useProductImage } from '../../hooks/useProductImage';

const { FiChevronRight, FiPackage, FiImage, FiLoader } = FiIcons;

const ProductThumbnail = ({ photoFileName, productName }) => {
  const { imageUrl, loading, error } = useProductImage(photoFileName);

  if (loading) {
    return (
      <div className="w-4 h-4 flex items-center justify-center">
        <SafeIcon icon={FiLoader} className="w-3 h-3 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={productName}
        className="w-4 h-4 rounded object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
    );
  }

  return <SafeIcon icon={FiImage} className="w-3 h-3 text-gray-400" />;
};

const ProductList = ({ products, selectedProduct, onProductSelect }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header fixo */}
      <div className="bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="grid grid-cols-12 gap-2 px-3 py-2">
          <div className="col-span-1">
            <span className="text-xs font-medium text-gray-600">Img</span>
          </div>
          <div className="col-span-2">
            <span className="text-xs font-medium text-gray-600">Código</span>
          </div>
          <div className="col-span-2">
            <span className="text-xs font-medium text-gray-600">Nº Original</span>
          </div>
          <div className="col-span-4">
            <span className="text-xs font-medium text-gray-600">Descrição</span>
          </div>
          <div className="col-span-2">
            <span className="text-xs font-medium text-gray-600">Fabricante</span>
          </div>
          <div className="col-span-1">
            <span className="text-xs font-medium text-gray-600">Un</span>
          </div>
        </div>
      </div>

      {/* Lista scrollável */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {products.map((product, index) => (
            <motion.div
              key={product.id || index}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
              className={`cursor-pointer hover:bg-blue-50 transition-colors border-l-2 ${
                selectedProduct?.id === product.id ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent hover:border-l-blue-300'
              }`}
              onClick={() => onProductSelect(product)}
            >
              <div className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
                <div className="col-span-1 flex items-center justify-center">
                  {product.foto ? (
                    <ProductThumbnail
                      photoFileName={product.foto}
                      productName={product.descricao_produto}
                    />
                  ) : (
                    <SafeIcon icon={FiImage} className="w-3 h-3 text-gray-300" />
                  )}
                </div>

                <div className="col-span-2">
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiPackage} className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-900 truncate">
                      {product.codigo_produto || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-xs text-gray-600 truncate block">
                    {product.codigo_original || 'N/A'}
                  </span>
                </div>

                <div className="col-span-4">
                  <span className="text-xs text-gray-900 truncate block">
                    {product.descricao_produto || 'Sem descrição'}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-xs text-gray-600 truncate block">
                    {product.fabricante || 'N/A'}
                  </span>
                </div>

                <div className="col-span-1 flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {product.unidade || 'UN'}
                  </span>
                  {selectedProduct?.id === product.id && (
                    <SafeIcon icon={FiChevronRight} className="w-3 h-3 text-blue-500" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;