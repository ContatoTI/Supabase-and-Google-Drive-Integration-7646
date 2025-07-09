import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useProductImage } from '../../hooks/useProductImage';

const { FiX, FiPackage, FiShoppingCart, FiImage, FiLoader, FiPlus, FiMinus, FiZoomIn } = FiIcons;

// Componente do Lightbox para a imagem
const ImageLightbox = ({ imageUrl, productName, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-4xl max-h-[90vh] bg-white rounded-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header do lightbox */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {productName}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-sm hover:bg-gray-100 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {/* Imagem */}
          <div className="p-4 flex items-center justify-center">
            <img
              src={imageUrl}
              alt={productName}
              className="max-w-full max-h-[70vh] object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden text-center py-8">
              <SafeIcon icon={FiImage} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Erro ao carregar a imagem</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ProductDetails = ({
  product,
  onClose,
  embedded = false,
  compact = false,
  onAddToCotacao,
  isInCotacao = false,
  cotacaoQuantity = 0
}) => {
  // Hook para buscar imagem do produto
  const { imageUrl, loading: imageLoading, error: imageError } = useProductImage(product?.foto);

  // Estados locais
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const formatPrice = (price) => {
    if (!price) return 'Consulte';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatWeight = (weight) => {
    if (!weight) return 'N/A';
    return `${weight} kg`;
  };

  const handleAddToCotacao = async () => {
    if (!onAddToCotacao || quantity < 1) return;

    setIsAdding(true);
    try {
      await onAddToCotacao(product, quantity);
      setQuantity(1);
    } catch (error) {
      console.error('Erro ao adicionar à cotação:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleImageClick = () => {
    if (imageUrl) {
      setShowLightbox(true);
    }
  };

  const content = (
    <div className={embedded ? '' : 'bg-white rounded-sm shadow-lg border border-gray-200 overflow-hidden'}>
      <div className={embedded ? '' : 'p-6'}>
        <div className="grid grid-cols-12 gap-4">
          {/* Left Side - Imagem (3/12) - Sempre quadrada e clicável */}
          <div className="col-span-3">
            <div
              className={`w-full h-36 bg-gray-100 rounded-sm border border-gray-200 flex items-center justify-center overflow-hidden ${
                imageUrl ? 'cursor-pointer hover:bg-gray-50' : ''
              } transition-colors relative group`}
              onClick={handleImageClick}
            >
              {imageLoading ? (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <SafeIcon icon={FiLoader} className="w-6 h-6 mb-2 animate-spin" />
                  <span className="text-xs">Carregando...</span>
                </div>
              ) : imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={product.descricao_produto}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', imageUrl);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Overlay para indicar que é clicável */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <SafeIcon icon={FiZoomIn} className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </>
              ) : imageError ? (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <SafeIcon icon={FiImage} className="w-6 h-6 mb-2" />
                  <span className="text-xs text-center">Não encontrada</span>
                  {product.foto && (
                    <span className="text-xs text-gray-300 text-center truncate w-full px-1">{product.foto}</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <SafeIcon icon={FiImage} className="w-6 h-6 mb-2" />
                  <span className="text-xs">Sem imagem</span>
                </div>
              )}

              {/* Fallback oculto */}
              <div className="hidden flex-col items-center justify-center text-gray-400">
                <SafeIcon icon={FiImage} className="w-6 h-6 mb-2" />
                <span className="text-xs">Erro ao carregar</span>
              </div>
            </div>
          </div>

          {/* Right Side - Informações (9/12) */}
          <div className="col-span-9 space-y-3">
            {/* PRIMEIRA LINHA - Código + Grid | Qtd/Unidade/Peso */}
            <div className="flex items-start justify-between">
              {/* Lado Esquerdo - Código e Título */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg font-bold text-gray-900">
                    {product.codigo_produto || 'N/A'}
                  </span>
                  {product.codigo_grid && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-sm">
                      Grid: {product.codigo_grid}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                  {product.descricao_produto || 'Sem descrição'}
                </h3>
              </div>

              {/* Lado Direito - Qtd/Unidade/Peso */}
              <div className="flex flex-col items-end space-y-1 ml-4">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Qtd: </span>
                  <span>{product.quantidade_embalagem || 'N/A'}</span>
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Un: </span>
                  <span>{product.unidade || 'UN'}</span>
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Peso: </span>
                  <span>{formatWeight(product.peso)}</span>
                </div>
              </div>
            </div>

            {/* PRIMEIRA LINHA DE DESCRIÇÃO - 3 Colunas: Similar/NCM/Fabricante */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 px-3 py-2 rounded-sm">
                <div className="text-xs font-medium text-gray-700 mb-1">Similar:</div>
                <div className="text-xs text-gray-900">{product.similar || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 px-3 py-2 rounded-sm">
                <div className="text-xs font-medium text-gray-700 mb-1">NCM:</div>
                <div className="text-xs text-gray-900">{product.ncm || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 px-3 py-2 rounded-sm">
                <div className="text-xs font-medium text-gray-700 mb-1">Fabricante:</div>
                <div className="text-xs text-gray-900">{product.fabricante || 'N/A'}</div>
              </div>
            </div>

            {/* SEGUNDA LINHA - Nº de Referência (largura total) */}
            <div className="bg-gray-50 px-3 py-2 rounded-sm">
              <div className="text-xs font-medium text-gray-700 mb-1">Nº de Referência:</div>
              <div className="text-xs text-gray-900 break-words">
                {product.codigo_original || 'N/A'}
              </div>
            </div>

            {/* TERCEIRA LINHA - Aplicação (largura total) */}
            <div className="bg-gray-50 px-3 py-2 rounded-sm">
              <div className="text-xs font-medium text-gray-700 mb-1">Aplicação:</div>
              <div className="text-xs text-gray-900 break-words">
                {product.aplicacao || 'N/A'}
              </div>
            </div>

            {/* Tags de Categoria */}
            <div className="flex flex-wrap gap-2">
              {product.grupo && (
                <span className="bg-falcon-blue-50 text-falcon-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {product.grupo}
                </span>
              )}
              {product.montadora && (
                <span className="bg-green-50 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {product.montadora}
                </span>
              )}
            </div>

            {/* Status na cotação */}
            {isInCotacao && (
              <div className="text-center bg-falcon-blue-50 px-3 py-2 rounded-sm border border-falcon-blue-200">
                <div className="text-xs text-falcon-blue-700 font-medium">
                  ✓ Na cotação: {cotacaoQuantity} unidade{cotacaoQuantity !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            {/* ÚLTIMA LINHA - Preço + Quantidade + Botão */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              {/* Preço */}
              <div className="text-lg font-bold text-green-600">
                {formatPrice(product.preco)}
              </div>

              {/* Controle de Quantidade + Botão */}
              <div className="flex items-center space-x-3">
                {/* Controle de quantidade */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <SafeIcon icon={FiMinus} className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-sm min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-8 h-8 flex items-center justify-center bg-falcon-green-600 text-white rounded-sm hover:bg-falcon-green-700 transition-colors"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  </button>
                </div>

                {/* Botão de ação */}
                <motion.button
                  onClick={handleAddToCotacao}
                  disabled={isAdding}
                  whileHover={{ scale: isAdding ? 1 : 1.05 }}
                  whileTap={{ scale: isAdding ? 1 : 0.95 }}
                  className="bg-falcon-green-600 text-white px-4 py-2 rounded-sm text-sm hover:bg-falcon-green-700 disabled:bg-gray-400 flex items-center space-x-2 transition-colors"
                >
                  {isAdding ? (
                    <>
                      <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin" />
                      <span>Adicionando...</span>
                    </>
                  ) : isInCotacao ? (
                    <>
                      <SafeIcon icon={FiPlus} className="w-4 h-4" />
                      <span>Adicionar Mais</span>
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiShoppingCart} className="w-4 h-4" />
                      <span>Adicionar</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Debug info - apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && product.foto && (
          <div className="mt-2 text-xs text-gray-400 text-center truncate">
            Debug: {product.foto}
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {showLightbox && imageUrl && (
        <ImageLightbox
          imageUrl={imageUrl}
          productName={`${product.codigo_produto} - ${product.descricao_produto}`}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {content}
    </motion.div>
  );
};

export default ProductDetails;