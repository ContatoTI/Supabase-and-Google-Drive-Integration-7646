import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useProducts } from '../../hooks/useProducts';
import { useCotacao } from '../../hooks/useCotacao';
import ProductSearch from './ProductSearch';
import ProductList from './ProductList';
import ProductDetails from './ProductDetails';
import MontadoraSidebar from './MontadoraSidebar';
import RelatedProductsSidebar from './RelatedProductsSidebar';

const { FiPackage, FiSearch, FiAlertCircle, FiLoader, FiSettings, FiArrowLeft, FiSidebar } = FiIcons;

const ProductCatalog = ({ onBackToHome }) => {
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    code: '',
    fabricante: '',
    aplicacao: '',
    montadora: '',
    grupo: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showRelatedSidebar, setShowRelatedSidebar] = useState(false);

  const {
    products,
    relatedProducts,
    montadoras,
    grupos,
    loading,
    loadingRelated,
    error,
    searchProducts,
    searchRelatedProducts,
    clearFilters,
    isConfigured
  } = useProducts();

  const {
    items: cotacaoItems,
    addItem: addToCotacao,
    isInCotacao,
    getItemQuantity
  } = useCotacao();

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1280);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSearch = async () => {
    if (!isConfigured) {
      return;
    }

    await searchProducts(searchFilters);
    setSelectedProduct(null);
    setShowResults(true);
  };

  const handleClearFilters = () => {
    setSearchFilters({
      keyword: '',
      code: '',
      fabricante: '',
      aplicacao: '',
      montadora: '',
      grupo: ''
    });
    clearFilters();
    setSelectedProduct(null);
    setShowResults(false);
    setShowRelatedSidebar(false);
  };

  const handleBackToSearch = () => {
    setShowResults(false);
    setSelectedProduct(null);
    setShowRelatedSidebar(false);
  };

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
    
    if (product.grupo_visco) {
      await searchRelatedProducts(product.grupo_visco, product.id);
    }
  };

  const handleMontadoraSelect = (montadora) => {
    setSearchFilters(prev => ({ ...prev, montadora: montadora }));
  };

  const handleAddToCotacao = async (product, quantity = 1) => {
    try {
      console.log('Adicionando produto à cotação:', product, 'Quantidade:', quantity);
      addToCotacao(product, quantity);
      alert(`${product.codigo_produto} adicionado à cotação!`);
    } catch (error) {
      console.error('Erro ao adicionar à cotação:', error);
      alert('Erro ao adicionar produto à cotação');
    }
  };

  const toggleRelatedSidebar = () => {
    setShowRelatedSidebar(!showRelatedSidebar);
  };

  // Se não estiver configurado, mostrar tela de configuração
  if (!isConfigured && !loading) {
    return (
      <div className="catalog-container flex items-center justify-center">
        <div className="bg-white rounded-sm shadow-lg p-8 text-center max-w-md">
          <SafeIcon icon={FiSettings} className="w-16 h-16 text-falcon-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Supabase Não Configurado</h2>
          <p className="text-gray-600 mb-4">
            Configure as credenciais do Supabase primeiro para acessar o catálogo de produtos.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>1. Acesse "Configurar Supabase" no menu</p>
            <p>2. Insira a URL e as chaves do projeto</p>
            <p>3. Teste a conexão</p>
            <p>4. Configure a base de dados</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-container flex items-center justify-center">
        <div className="bg-white rounded-sm shadow-lg p-8 text-center max-w-md">
          <SafeIcon icon={FiAlertCircle} className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro ao Carregar Catálogo</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleSearch}
            className="bg-falcon-green-600 text-white px-6 py-2 rounded-sm hover:bg-falcon-green-700 mr-2"
          >
            Tentar Novamente
          </button>
          <button
            onClick={handleClearFilters}
            className="bg-gray-600 text-white px-6 py-2 rounded-sm hover:bg-gray-700"
          >
            Voltar à Busca
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    // TELA DE RESULTADOS - Lista em cima (50%) e Detalhes embaixo (50%)
    return (
      <div className="catalog-container flex pt-4 pb-2 px-4 gap-4">
        {/* Container Principal - Dividido em 50/50 (vertical) */}
        <div 
          className={`${isLargeScreen ? 'flex-1' : 'w-full'} bg-white rounded-sm shadow-sm border border-gray-200 flex flex-col`} 
          style={{ height: 'calc(100vh - 120px)' }}
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <SafeIcon icon={FiLoader} className="w-12 h-12 text-falcon-blue-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Buscando produtos...</p>
              </div>
            </div>
          ) : products.length > 0 ? (
            <div className="flex flex-col h-full">
              {/* SEÇÃO 1 - Lista de Produtos (50% da altura - TOPO) */}
              <div className="h-1/2 overflow-hidden border-b border-gray-200">
                <ProductList
                  products={products}
                  selectedProduct={selectedProduct}
                  onProductSelect={handleProductSelect}
                />
              </div>

              {/* SEÇÃO 2 - Detalhes do Produto (50% da altura - BAIXO) */}
              <div className="h-1/2 overflow-hidden">
                {selectedProduct ? (
                  <div className="h-full overflow-y-auto p-3">
                    <ProductDetails
                      product={selectedProduct}
                      embedded={true}
                      compact={true}
                      onAddToCotacao={handleAddToCotacao}
                      isInCotacao={isInCotacao(selectedProduct.id)}
                      cotacaoQuantity={getItemQuantity(selectedProduct.id)}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <SafeIcon icon={FiPackage} className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-500 mb-1">
                        Selecione um Produto
                      </h3>
                      <p className="text-gray-400">
                        Clique em um produto da lista para ver os detalhes
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <SafeIcon icon={FiSearch} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-500 mb-4">
                  Tente ajustar os filtros de busca ou usar termos diferentes.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-falcon-green-600 text-white px-6 py-2 rounded-sm hover:bg-falcon-green-700"
                >
                  Nova Busca
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Barra Lateral de Produtos Relacionados */}
        {((isLargeScreen && selectedProduct) || (!isLargeScreen && showRelatedSidebar)) && (
          <motion.div
            initial={{ x: isLargeScreen ? 0 : 300, opacity: isLargeScreen ? 1 : 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLargeScreen ? 0 : 300, opacity: isLargeScreen ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className={`${isLargeScreen ? 'w-80' : 'fixed top-16 right-0 bottom-0 z-40 w-80 shadow-2xl'}`}
            style={{ height: isLargeScreen ? 'calc(100vh - 120px)' : 'calc(100vh - 80px)' }}
          >
            <RelatedProductsSidebar
              selectedProduct={selectedProduct}
              relatedProducts={relatedProducts}
              loading={loadingRelated}
              onProductSelect={handleProductSelect}
              showCloseButton={!isLargeScreen}
              onClose={() => setShowRelatedSidebar(false)}
            />
          </motion.div>
        )}

        {/* Side Drawer Tab */}
        {!isLargeScreen && selectedProduct?.grupo_visco && (
          <motion.div
            initial={{ x: 60 }}
            animate={{ x: showRelatedSidebar ? 60 : 0 }}
            className="fixed top-1/2 right-0 transform -translate-y-1/2 z-30"
          >
            <motion.button
              onClick={toggleRelatedSidebar}
              className="bg-falcon-blue-600 text-white px-3 py-6 rounded-l-sm shadow-lg flex flex-col items-center space-y-2 hover:bg-falcon-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiSidebar} className="w-5 h-5" />
              <div className="text-xs font-medium writing-mode-vertical text-center">
                <div>Relacionados</div>
                {relatedProducts.length > 0 && (
                  <div className="mt-1 bg-white text-falcon-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {relatedProducts.length}
                  </div>
                )}
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Overlay para telas pequenas */}
        {!isLargeScreen && showRelatedSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setShowRelatedSidebar(false)}
          />
        )}

        {/* Botão Voltar */}
        <motion.button
          onClick={handleBackToSearch}
          className="fixed bottom-4 left-4 bg-gray-600 text-white px-4 py-2 rounded-sm hover:bg-gray-700 flex items-center space-x-2 shadow-lg z-30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
          <span>Voltar</span>
        </motion.button>
      </div>
    );
  }

  // TELA INICIAL DE BUSCA - Com altura limitada e paddings ajustados
  return (
    <div className="catalog-container flex pt-4 pb-4">
      {/* Sidebar de Montadoras - Largura fixa com padding superior */}
      <div className="w-64 h-full">
        <div className="h-full bg-white border-r border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 128px)' }}>
          <MontadoraSidebar
            montadoras={montadoras}
            selectedMontadora={searchFilters.montadora}
            onMontadoraSelect={handleMontadoraSelect}
            loading={loading}
          />
        </div>
      </div>

      {/* Conteúdo Principal - Resto da largura com padding ajustado */}
      <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100vh - 128px)' }}>
        {/* Header com formulário de busca */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiPackage} className="w-8 h-8 text-falcon-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Busca de Produtos</h1>
                  <p className="text-gray-600">Pesquise e encontre produtos automotivos</p>
                </div>
              </div>
            </div>

            <ProductSearch
              filters={searchFilters}
              grupos={grupos}
              montadoras={montadoras}
              onFiltersChange={setSearchFilters}
              onSearch={handleSearch}
              onClear={handleClearFilters}
              loading={loading}
              disabled={!isConfigured}
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;