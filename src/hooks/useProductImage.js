import { useState, useEffect } from 'react';
import googleDriveAPI from '../config/googleDrive';

/**
 * Hook para buscar imagens de produtos no Google Drive
 */
export const useProductImage = (photoFileName) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      // Reset states
      setImageUrl(null);
      setError(null);

      // Verificar se há nome de arquivo
      if (!photoFileName || photoFileName.trim() === '') {
        return;
      }

      // Verificar se Google Drive está configurado
      if (!googleDriveAPI.isConfigured()) {
        setError('Google Drive não configurado');
        return;
      }

      setLoading(true);

      try {
        console.log(`Buscando imagem: ${photoFileName}`);
        
        // Buscar arquivo no Google Drive
        const fileInfo = await googleDriveAPI.findFileByName(photoFileName.trim());
        
        if (fileInfo && fileInfo.downloadUrl) {
          console.log(`Imagem encontrada: ${photoFileName}`, fileInfo);
          setImageUrl(fileInfo.downloadUrl);
        } else {
          console.warn(`Imagem não encontrada: ${photoFileName}`);
          setError('Imagem não encontrada');
        }
      } catch (err) {
        console.error(`Erro ao carregar imagem ${photoFileName}:`, err);
        setError(`Erro ao carregar imagem: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [photoFileName]);

  return { imageUrl, loading, error };
};

/**
 * Hook para buscar múltiplas imagens de produtos
 */
export const useMultipleProductImages = (products) => {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadImages = async () => {
      // Reset states
      setImages({});
      setError(null);

      // Verificar se há produtos
      if (!products || products.length === 0) {
        return;
      }

      // Verificar se Google Drive está configurado
      if (!googleDriveAPI.isConfigured()) {
        setError('Google Drive não configurado');
        return;
      }

      setLoading(true);

      try {
        // Extrair nomes únicos de arquivos
        const fileNames = [...new Set(
          products
            .map(product => product.foto)
            .filter(foto => foto && foto.trim() !== '')
            .map(foto => foto.trim())
        )];

        console.log(`Buscando ${fileNames.length} imagens:`, fileNames);

        // Buscar todas as imagens
        const results = await googleDriveAPI.findMultipleFiles(fileNames);
        
        // Converter para formato { fileName: downloadUrl }
        const imageMap = {};
        Object.entries(results).forEach(([fileName, fileInfo]) => {
          if (fileInfo && fileInfo.downloadUrl) {
            imageMap[fileName] = fileInfo.downloadUrl;
          }
        });

        console.log(`${Object.keys(imageMap).length} imagens encontradas de ${fileNames.length}`);
        setImages(imageMap);
      } catch (err) {
        console.error('Erro ao carregar múltiplas imagens:', err);
        setError(`Erro ao carregar imagens: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [products]);

  return { images, loading, error };
};

export default useProductImage;