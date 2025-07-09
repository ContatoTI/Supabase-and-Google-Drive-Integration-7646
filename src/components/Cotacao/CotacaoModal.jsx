import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useProductImage } from '../../hooks/useProductImage';

const { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingCart, FiSend, FiPackage, FiDollarSign, FiMail, FiPhone, FiUser } = FiIcons;

// Componente para item individual da cotação
const CotacaoItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { imageUrl, loading } = useProductImage(item.foto);

  const formatPrice = (price) => {
    if (!price) return 'Consulte';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
    >
      <div className="flex space-x-4">
        {/* Imagem do produto */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={item.descricao_produto}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <SafeIcon icon={FiPackage} className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Informações do produto */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-800 truncate">
                {item.codigo_produto}
              </h4>
              <p className="text-xs text-gray-600 truncate">
                {item.descricao_produto}
              </p>
              <p className="text-xs text-gray-500">
                {item.fabricante}
              </p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Remover item"
            >
              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
            </button>
          </div>

          {/* Controles de quantidade e preço */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
              >
                <SafeIcon icon={FiMinus} className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <SafeIcon icon={FiPlus} className="w-3 h-3" />
              </button>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold text-green-600">
                {formatPrice(item.preco)}
              </div>
              {item.preco && (
                <div className="text-xs text-gray-500">
                  Total: {formatPrice(item.preco * item.quantity)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CotacaoModal = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onClear, getTotalValue }) => {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'contact'
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Log quando o modal abre/fecha
  useEffect(() => {
    console.log('CotacaoModal - isOpen:', isOpen);
    console.log('CotacaoModal - items:', items?.length || 0);
  }, [isOpen, items]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleSubmitQuote = async () => {
    setIsSubmitting(true);
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Aqui você implementaria a lógica real para enviar a cotação
    const quoteData = {
      customer: customerInfo,
      items: items,
      total: getTotalValue(),
      date: new Date().toISOString()
    };
    
    console.log('Cotação enviada:', quoteData);
    alert('Cotação enviada com sucesso! Entraremos em contato em breve.');
    
    // Limpar e fechar
    setCustomerInfo({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: ''
    });
    setActiveTab('review');
    setIsSubmitting(false);
    onClear();
    onClose();
  };

  const handleContinueQuoting = () => {
    onClose();
  };

  const isFormValid = customerInfo.name && customerInfo.email && customerInfo.phone;

  // Se modal não está aberto, não renderizar nada
  if (!isOpen) {
    console.log('CotacaoModal - Modal não está aberto, não renderizando');
    return null;
  }

  console.log('CotacaoModal - Renderizando modal');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiShoppingCart} className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-semibold">Minha Cotação</h3>
                <p className="text-sm text-blue-100">
                  {items.length} itens • Total de {items.reduce((sum, item) => sum + item.quantity, 0)} produtos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {items.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-red-200 hover:text-red-100 text-sm underline"
                >
                  Limpar Tudo
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          /* Cotação Vazia */
          <div className="p-12 text-center">
            <SafeIcon icon={FiShoppingCart} className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-500 mb-3">Sua cotação está vazia</h3>
            <p className="text-gray-400 mb-6">Adicione produtos à sua cotação para continuar</p>
            <motion.button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continuar Cotando
            </motion.button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('review')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'review'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Revisar Cotação
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'contact'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Informações de Contato
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="flex h-[500px]">
              {activeTab === 'review' ? (
                /* Tab Revisão */
                <div className="w-full p-6 overflow-y-auto">
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <CotacaoItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemove}
                      />
                    ))}
                  </div>

                  {/* Resumo */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Total de itens:</span>
                      <span className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    {getTotalValue() > 0 && (
                      <div className="flex items-center justify-between text-lg font-semibold text-green-600 border-t pt-2">
                        <span>Valor total:</span>
                        <span>{formatPrice(getTotalValue())}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4 mt-6">
                    <motion.button
                      onClick={handleContinueQuoting}
                      className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SafeIcon icon={FiPlus} className="w-5 h-5" />
                      <span>Continuar Cotando</span>
                    </motion.button>
                    <motion.button
                      onClick={() => setActiveTab('contact')}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SafeIcon icon={FiSend} className="w-5 h-5" />
                      <span>Solicitar Cotação</span>
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* Tab Contato */
                <div className="w-full p-6 overflow-y-auto">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Suas Informações</h4>
                      <p className="text-sm text-gray-600">Preencha os dados para enviarmos sua cotação</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Completo *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Seu nome completo"
                          />
                          <SafeIcon icon={FiUser} className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="seu@email.com"
                          />
                          <SafeIcon icon={FiMail} className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone *
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="(11) 99999-9999"
                          />
                          <SafeIcon icon={FiPhone} className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          value={customerInfo.company}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nome da empresa"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mensagem
                        </label>
                        <textarea
                          value={customerInfo.message}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, message: e.target.value }))}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Informações adicionais sobre sua cotação..."
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-4 mt-8">
                      <motion.button
                        onClick={() => setActiveTab('review')}
                        className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Voltar
                      </motion.button>
                      <motion.button
                        onClick={handleSubmitQuote}
                        disabled={!isFormValid || isSubmitting}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        whileHover={{ scale: isFormValid && !isSubmitting ? 1.02 : 1 }}
                        whileTap={{ scale: isFormValid && !isSubmitting ? 0.98 : 1 }}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <SafeIcon icon={FiSend} className="w-5 h-5" />
                            <span>Enviar Cotação</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CotacaoModal;