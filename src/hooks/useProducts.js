import { useState, useEffect } from 'react';
import { getSupabaseConfig } from '../config/storage';
import { initializeSupabase } from '../config/database';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [montadoras, setMontadoras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState(null);
  const [supabase, setSupabase] = useState(null);

  // Inicializar Supabase
  useEffect(() => {
    const initSupabase = () => {
      try {
        const config = getSupabaseConfig();
        if (config && config.url && config.anonKey) {
          const client = initializeSupabase(config);
          setSupabase(client);
          setError(null);
        } else {
          setError('Supabase não configurado. Configure as credenciais primeiro na página de configurações.');
        }
      } catch (err) {
        console.error('Erro ao inicializar Supabase:', err);
        setError(`Erro na configuração do Supabase: ${err.message}`);
      }
    };

    initSupabase();
  }, []);

  // Carregar montadoras únicas
  const loadMontadoras = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('montadora')
        .not('montadora', 'is', null)
        .not('montadora', 'eq', '');

      if (error) throw error;

      const uniqueMontadoras = [...new Set(data.map(item => item.montadora))].sort();
      setMontadoras(uniqueMontadoras);
    } catch (err) {
      console.error('Erro ao carregar montadoras:', err);
      // Não definir como erro crítico, apenas log
    }
  };

  // Carregar grupos únicos
  const loadGrupos = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('grupo')
        .not('grupo', 'is', null)
        .not('grupo', 'eq', '');

      if (error) throw error;

      const uniqueGrupos = [...new Set(data.map(item => item.grupo))].sort();
      setGrupos(uniqueGrupos);
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
      // Não definir como erro crítico, apenas log
    }
  };

  // Buscar produtos relacionados por grupo_visco
  const searchRelatedProducts = async (grupoVisco, currentProductId = null) => {
    if (!supabase || !grupoVisco) {
      setRelatedProducts([]);
      return;
    }

    setLoadingRelated(true);
    try {
      let query = supabase
        .from('produtos')
        .select(`
          id,
          codigo_produto,
          descricao_produto,
          fabricante,
          grupo_visco,
          foto,
          preco,
          unidade
        `)
        .eq('grupo_visco', grupoVisco)
        .order('codigo_produto', { ascending: true });

      // Excluir o produto atual da lista de relacionados
      if (currentProductId) {
        query = query.not('id', 'eq', currentProductId);
      }

      // Limitar para não sobrecarregar
      query = query.limit(20);

      const { data, error } = await query;

      if (error) throw error;

      setRelatedProducts(data || []);
    } catch (err) {
      console.error('Erro ao buscar produtos relacionados:', err);
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  };

  // Buscar produtos com filtros
  const searchProducts = async (filters = {}) => {
    if (!supabase) {
      setError('Supabase não está configurado. Configure as credenciais primeiro.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('produtos')
        .select(`
          id,
          codigo_produto,
          descricao_produto,
          fabricante,
          grupo,
          foto,
          unidade,
          codigo_grid,
          ncm,
          peso,
          quantidade_embalagem,
          preco,
          montadora,
          similar,
          codigo_original,
          aplicacao,
          grupo_visco
        `)
        .order('codigo_produto', { ascending: true });

      // Aplicar filtros
      if (filters.keyword) {
        query = query.ilike('descricao_produto', `%${filters.keyword}%`);
      }

      if (filters.code) {
        query = query.or(`codigo_produto.ilike.%${filters.code}%,codigo_original.ilike.%${filters.code}%`);
      }

      if (filters.fabricante) {
        query = query.ilike('fabricante', `%${filters.fabricante}%`);
      }

      if (filters.aplicacao) {
        query = query.ilike('aplicacao', `%${filters.aplicacao}%`);
      }

      if (filters.montadora) {
        query = query.eq('montadora', filters.montadora);
      }

      if (filters.grupo) {
        query = query.eq('grupo', filters.grupo);
      }

      // Limitar resultados para performance
      query = query.limit(100);

      const { data, error } = await query;

      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError(`Erro ao buscar produtos: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Limpar filtros
  const clearFilters = () => {
    setProducts([]);
    setRelatedProducts([]);
    setError(null);
  };

  // Carregar dados iniciais quando o Supabase estiver pronto
  useEffect(() => {
    if (supabase) {
      const initializeData = async () => {
        try {
          await Promise.all([
            loadMontadoras(),
            loadGrupos()
          ]);
        } catch (err) {
          console.error('Erro ao inicializar dados:', err);
          // Não definir como erro crítico se for apenas problema de dados
          if (err.message.includes('relation "produtos" does not exist')) {
            setError('Tabela "produtos" não encontrada. Crie a tabela no Supabase primeiro.');
          }
        }
      };

      initializeData();
    }
  }, [supabase]);

  return {
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
    isConfigured: !!supabase
  };
};