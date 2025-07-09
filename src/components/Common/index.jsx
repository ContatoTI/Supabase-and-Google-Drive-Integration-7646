import React from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';

const {FiAlertTriangle} = FiIcons;

// SafeIcon Component
export const SafeIcon = ({icon, name, ...props}) => {
  let IconComponent;
  try {
    IconComponent = icon || (name && FiIcons[`Fi${name}`]);
  } catch (e) {
    IconComponent = null;
  }
  return IconComponent ? React.createElement(IconComponent, props) : <FiAlertTriangle {...props} />;
};

// Loading Component
export const Loading = ({size = 'md', text = 'Carregando...'}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <div className={`${sizes[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2`}></div>
        <p className="text-gray-600 text-sm">{text}</p>
      </div>
    </div>
  );
};

// Error Component
export const ErrorMessage = ({title = 'Erro', message, onRetry}) => (
  <motion.div
    initial={{opacity: 0, scale: 0.95}}
    animate={{opacity: 1, scale: 1}}
    className="p-4 bg-red-50 border border-red-200 rounded-lg"
  >
    <div className="flex items-center space-x-2 mb-2">
      <SafeIcon icon={FiIcons.FiAlertCircle} className="w-5 h-5 text-red-600" />
      <span className="font-medium text-red-800">{title}</span>
    </div>
    <p className="text-red-700 text-sm mb-3">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
      >
        Tentar Novamente
      </button>
    )}
  </motion.div>
);

// Empty State Component
export const EmptyState = ({icon = FiIcons.FiPackage, title, description, action}) => (
  <div className="text-center py-12">
    <SafeIcon icon={icon} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-500 mb-2">{title}</h3>
    {description && <p className="text-gray-400 mb-4">{description}</p>}
    {action}
  </div>
);

export default SafeIcon;