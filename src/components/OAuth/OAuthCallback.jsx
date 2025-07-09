import React, { useEffect, useState } from 'react';
import { getGoogleDriveConfig, saveGoogleDriveConfig } from '../../config/storage';

const OAuthCallback = () => {
  const [status, setStatus] = useState('Processando...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setStatus('Verificando parâmetros...');
        
        // Verificar se estamos em uma janela popup
        const isPopup = window.opener && window.opener !== window;
        
        // Obter parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('OAuth Callback - Parâmetros:', { code, state, error });

        if (error) {
          throw new Error(`OAuth Error: ${error}`);
        }

        if (!code) {
          throw new Error('Código de autorização não encontrado na URL');
        }

        setStatus('Validando estado...');

        // Verificar estado
        const savedState = localStorage.getItem('oauth_state');
        if (state !== savedState) {
          throw new Error('Estado OAuth inválido - possível ataque CSRF');
        }

        setStatus('Obtendo configuração...');

        // Obter configuração atual
        const config = getGoogleDriveConfig();
        if (!config || !config.clientId || !config.clientSecret) {
          throw new Error('Configuração OAuth incompleta. Verifique Client ID e Client Secret.');
        }

        setStatus('Trocando código por token...');

        // Construir URL de redirect correta
        const redirectUri = isPopup ? 
          window.location.origin + '/#/oauth/callback' : 
          window.location.origin + '/oauth/callback';

        console.log('Redirect URI:', redirectUri);

        // Trocar código por access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code: code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error('Token Response Error:', errorData);
          throw new Error(`Erro ao obter token: ${errorData.error_description || errorData.error}`);
        }

        const tokenData = await tokenResponse.json();
        console.log('Token obtido com sucesso:', { ...tokenData, access_token: '***' });

        setStatus('Salvando configuração...');

        // Salvar access token na configuração
        const updatedConfig = {
          ...config,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenType: tokenData.token_type,
          expiresIn: tokenData.expires_in,
          tokenObtainedAt: Date.now()
        };

        saveGoogleDriveConfig(updatedConfig);

        setStatus('Autenticação concluída com sucesso!');

        // Limpar estado
        localStorage.removeItem('oauth_state');

        // Se estiver em popup, fechar após 2 segundos
        if (isPopup) {
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          // Se não estiver em popup, redirecionar para a página principal
          setTimeout(() => {
            window.location.href = window.location.origin;
          }, 2000);
        }

      } catch (error) {
        console.error('Erro no callback OAuth:', error);
        setError(error.message);
        setStatus('Erro na autenticação');
        
        // Fechar popup mesmo em caso de erro
        if (window.opener && window.opener !== window) {
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        {!error ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Autenticação OAuth</h2>
            <p className="text-gray-600 mb-4">{status}</p>
            <div className="text-sm text-gray-500">
              {status.includes('sucesso') ? 
                'Esta janela será fechada automaticamente.' : 
                'Aguarde enquanto processamos sua autenticação...'
              }
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">✗</span>
            </div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Erro na Autenticação</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="text-sm text-gray-500">
              Esta janela será fechada automaticamente.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;