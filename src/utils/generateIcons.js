// Utilitário para gerar ícones PWA a partir da imagem da FalconTruck
export const generatePWAIcons = async () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Carregar a imagem original
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
      const icons = {};
      
      sizes.forEach(size => {
        canvas.width = size;
        canvas.height = size;
        
        // Limpar canvas com fundo branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        // Calcular dimensões para manter proporção
        const padding = size * 0.1; // 10% de padding
        const drawSize = size - (padding * 2);
        
        // Desenhar a imagem centralizada
        ctx.drawImage(img, padding, padding, drawSize, drawSize);
        
        // Converter para base64
        const dataURL = canvas.toDataURL('image/png');
        icons[size] = dataURL;
      });
      
      resolve(icons);
    };
    
    img.onerror = reject;
    img.src = 'https://falcontruck.com.br/wp-content/uploads/2025/07/favicon-falcontruck-2.png';
  });
};

// Função para baixar os ícones gerados
export const downloadGeneratedIcons = async () => {
  try {
    const icons = await generatePWAIcons();
    
    Object.entries(icons).forEach(([size, dataURL]) => {
      const link = document.createElement('a');
      link.download = `icon-${size}x${size}.png`;
      link.href = dataURL;
      link.click();
    });
    
    console.log('Ícones PWA gerados e baixados com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar ícones:', error);
  }
};