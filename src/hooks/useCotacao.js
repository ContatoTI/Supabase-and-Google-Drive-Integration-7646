import { useState, useEffect } from 'react';

export const useCotacao = () => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Debug: Log para verificar mudanças de estado
  useEffect(() => {
    console.log('useCotacao - Modal isOpen changed:', isOpen);
  }, [isOpen]);

  useEffect(() => {
    console.log('useCotacao - Items changed:', items.length);
  }, [items]);

  // Carregar itens do localStorage ao inicializar
  useEffect(() => {
    const savedItems = localStorage.getItem('cotacao_items');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        setItems(parsedItems);
        console.log('useCotacao - Itens carregados do localStorage:', parsedItems.length);
      } catch (error) {
        console.error('Erro ao carregar cotação:', error);
        setItems([]);
      }
    }
  }, []);

  // Salvar itens no localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem('cotacao_items', JSON.stringify(items));
    console.log('useCotacao - Itens salvos no localStorage:', items.length);
  }, [items]);

  // Adicionar item à cotação
  const addItem = (product, quantity = 1) => {
    console.log('useCotacao - Adicionando item:', product.codigo_produto, 'Quantidade:', quantity);
    
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        // Se já existe, atualizar quantidade
        const updatedItems = [...prev];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + quantity
        };
        console.log('useCotacao - Item atualizado, nova quantidade:', updatedItems[existingIndex].quantity);
        return updatedItems;
      } else {
        // Se não existe, adicionar novo
        const newItem = {
          ...product,
          quantity,
          addedAt: new Date().toISOString()
        };
        console.log('useCotacao - Novo item adicionado:', newItem);
        return [...prev, newItem];
      }
    });
  };

  // Remover item da cotação
  const removeItem = (productId) => {
    console.log('useCotacao - Removendo item:', productId);
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  // Atualizar quantidade de um item
  const updateQuantity = (productId, newQuantity) => {
    console.log('useCotacao - Atualizando quantidade:', productId, 'Nova quantidade:', newQuantity);
    
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Limpar toda a cotação
  const clearCotacao = () => {
    console.log('useCotacao - Limpando cotação');
    setItems([]);
  };

  // Calcular total de itens
  const getTotalItems = () => {
    const total = items.reduce((total, item) => total + item.quantity, 0);
    console.log('useCotacao - Total de itens:', total);
    return total;
  };

  // Calcular valor total (se houver preços)
  const getTotalValue = () => {
    const total = items.reduce((total, item) => {
      const price = parseFloat(item.preco) || 0;
      return total + (price * item.quantity);
    }, 0);
    console.log('useCotacao - Valor total:', total);
    return total;
  };

  // Verificar se um produto está na cotação
  const isInCotacao = (productId) => {
    const inCotacao = items.some(item => item.id === productId);
    console.log('useCotacao - Produto', productId, 'está na cotação:', inCotacao);
    return inCotacao;
  };

  // Obter quantidade de um produto específico
  const getItemQuantity = (productId) => {
    const item = items.find(item => item.id === productId);
    const quantity = item ? item.quantity : 0;
    console.log('useCotacao - Quantidade do produto', productId, ':', quantity);
    return quantity;
  };

  // Função para forçar abertura do modal (debug)
  const forceOpenModal = () => {
    console.log('useCotacao - Forçando abertura do modal');
    setIsOpen(true);
  };

  return {
    items,
    isOpen,
    setIsOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCotacao,
    getTotalItems,
    getTotalValue,
    isInCotacao,
    getItemQuantity,
    forceOpenModal // função de debug
  };
};