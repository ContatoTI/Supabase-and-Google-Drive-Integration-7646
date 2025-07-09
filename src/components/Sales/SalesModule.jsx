import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../hooks/useAuth';

const { 
  FiShoppingCart, FiClipboard, FiUsers, FiBarChart2, 
  FiDollarSign, FiPackage, FiTruck, FiCalendar,
  FiStar, FiTrendingUp, FiClock, FiPhone
} = FiIcons;

const SalesModule = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  
  const isGerente = user?.role === 'gerente';
  const isVendedor = user?.role === 'vendedor';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <SafeIcon icon={FiShoppingCart} className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Módulo de Vendas</h2>
              <p className="text-gray-600">
                Bem-vindo, {user?.name} ({isGerente ? 'Gerente' : 'Vendedor'})
              </p>
            </div>
          </div>
          
          {/* Navegação interna */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeSection === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveSection('cotacoes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeSection === 'cotacoes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cotações
            </button>
            <button
              onClick={() => setActiveSection('clientes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeSection === 'clientes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Clientes
            </button>
            {isGerente && (
              <button
                onClick={() => setActiveSection('relatorios')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeSection === 'relatorios'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Relatórios
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Cards de estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <SafeIcon icon={FiClipboard} className="w-10 h-10 p-2 bg-blue-100 text-blue-600 rounded-lg" />
                    <span className="text-lg font-bold text-blue-600">12</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">Cotações Pendentes</h3>
                  <p className="text-xs text-gray-600">
                    Aguardando resposta
                  </p>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <SafeIcon icon={FiDollarSign} className="w-10 h-10 p-2 bg-green-100 text-green-600 rounded-lg" />
                    <span className="text-lg font-bold text-green-600">R$ 45.2K</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">Vendas do Mês</h3>
                  <p className="text-xs text-gray-600">
                    +15% vs mês anterior
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <SafeIcon icon={FiUsers} className="w-10 h-10 p-2 bg-purple-100 text-purple-600 rounded-lg" />
                    <span className="text-lg font-bold text-purple-600">156</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">Clientes Ativos</h3>
                  <p className="text-xs text-gray-600">
                    +8 novos este mês
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <SafeIcon icon={FiTruck} className="w-10 h-10 p-2 bg-orange-100 text-orange-600 rounded-lg" />
                    <span className="text-lg font-bold text-orange-600">28</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">Pedidos em Entrega</h3>
                  <p className="text-xs text-gray-600">
                    Próximas entregas
                  </p>
                </div>
              </div>

              {/* Atividades Recentes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividades Recentes</h3>
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <div className="divide-y divide-gray-200">
                    {[
                      { icon: FiClipboard, color: 'blue', title: 'Nova cotação recebida', subtitle: 'Transportes Rápidos Ltda - 15 itens', time: 'Há 2 horas' },
                      { icon: FiDollarSign, color: 'green', title: 'Venda finalizada', subtitle: 'R$ 3.450,00 - Auto Peças Silva', time: 'Há 4 horas' },
                      { icon: FiUsers, color: 'purple', title: 'Novo cliente cadastrado', subtitle: 'Logística Express LTDA', time: 'Ontem' },
                      { icon: FiTruck, color: 'orange', title: 'Pedido entregue', subtitle: 'Pedido #12345 - Transportadora ABC', time: 'Ontem' }
                    ].map((activity, index) => (
                      <div key={index} className="p-4 hover:bg-gray-100 transition">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 bg-${activity.color}-100 rounded-lg`}>
                            <SafeIcon icon={activity.icon} className={`w-4 h-4 text-${activity.color}-600`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.subtitle}</p>
                            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'cotacoes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Gestão de Cotações</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  Nova Cotação
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <SafeIcon icon={FiClipboard} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">Módulo de Cotações</h4>
                <p className="text-gray-500">
                  Aqui você poderá gerenciar todas as cotações de clientes, 
                  responder solicitações e acompanhar o status.
                </p>
                <p className="text-sm text-blue-600 mt-4">
                  • Visualizar cotações pendentes<br/>
                  • Responder com preços e prazos<br/>
                  • Acompanhar histórico de cotações
                </p>
              </div>
            </div>
          )}

          {activeSection === 'clientes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Gestão de Clientes</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                  Novo Cliente
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <SafeIcon icon={FiUsers} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">Gerenciamento de Clientes</h4>
                <p className="text-gray-500">
                  Controle completo da base de clientes, histórico de compras 
                  e relacionamento comercial.
                </p>
                <p className="text-sm text-green-600 mt-4">
                  • Cadastro e edição de clientes<br/>
                  • Histórico de pedidos e cotações<br/>
                  • Análise de comportamento de compra
                </p>
              </div>
            </div>
          )}

          {activeSection === 'relatorios' && isGerente && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Relatórios Gerenciais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: FiBarChart2, title: 'Vendas por Período', description: 'Análise detalhada de vendas mensais, trimestrais e anuais', color: 'blue' },
                  { icon: FiTrendingUp, title: 'Performance da Equipe', description: 'Desempenho individual dos vendedores', color: 'green' },
                  { icon: FiStar, title: 'Produtos Mais Vendidos', description: 'Ranking de produtos por volume de vendas', color: 'yellow' },
                  { icon: FiUsers, title: 'Análise de Clientes', description: 'Comportamento e segmentação da base de clientes', color: 'purple' },
                  { icon: FiClock, title: 'Tempo de Resposta', description: 'Métricas de atendimento e cotações', color: 'indigo' },
                  { icon: FiDollarSign, title: 'Margem de Lucro', description: 'Análise de rentabilidade por produto/cliente', color: 'red' }
                ].map((report, index) => (
                  <div key={index} className={`bg-${report.color}-50 border border-${report.color}-100 rounded-lg p-6 hover:shadow-md transition cursor-pointer`}>
                    <div className={`w-12 h-12 bg-${report.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                      <SafeIcon icon={report.icon} className={`w-6 h-6 text-${report.color}-600`} />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{report.title}</h4>
                    <p className="text-sm text-gray-600">{report.description}</p>
                    <button className={`mt-4 text-sm text-${report.color}-600 hover:text-${report.color}-800 font-medium`}>
                      Ver Relatório →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SalesModule;