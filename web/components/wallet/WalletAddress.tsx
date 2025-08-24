'use client';

import { useState } from 'react';

interface WalletAddressProps {
  address: string;
  chainId?: number;
  showQR?: boolean;
  onCopy?: () => void;
}

export function WalletAddress({ address, chainId = 1337, showQR = true, onCopy }: WalletAddressProps) {
  const [copied, setCopied] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1337:
        return 'Monad Testnet';
      case 1:
        return 'Ethereum Mainnet';
      case 137:
        return 'Polygon';
      default:
        return `Chain ${chainId}`;
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      onCopy?.();
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 bg-purple-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Dirección de Wallet</h3>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {getChainName(chainId)}
          </span>
        </div>
      </div>

      {/* Address Display */}
      <div className="p-4 space-y-4">
        {/* Full Address */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-xs font-medium text-gray-500 mb-2">
            DIRECCIÓN COMPLETA
          </label>
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-gray-900 break-all">
              {address}
            </p>
            <button
              onClick={copyAddress}
              className="ml-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              {copied ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Short Address */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-xs font-medium text-gray-500 mb-2">
            DIRECCIÓN CORTA
          </label>
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-gray-900">
              {formatAddress(address)}
            </p>
            <button
              onClick={copyAddress}
              className="ml-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              {copied ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* QR Code */}
        {showQR && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Código QR</h4>
              <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                <span className="text-xs text-gray-500">QR Code</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Escanea para compartir tu dirección
              </p>
            </div>
          </div>
        )}

        {/* Copy Button */}
        <button
          onClick={copyAddress}
          className={`
            w-full py-3 px-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2
            ${copied
              ? 'bg-green-600 text-white'
              : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
            }
          `}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copiar Dirección</span>
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-gray-600">Dirección segura en blockchain</span>
        </div>
      </div>
    </div>
  );
}
