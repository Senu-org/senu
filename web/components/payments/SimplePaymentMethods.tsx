export function SimplePaymentMethods() {
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Container principal estilo iPhone */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header estilo iOS */}
        <div className="relative px-4 py-6 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <button className="p-2 -ml-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-white">Método de Pago</h1>
              <p className="text-xs text-blue-100 mt-1">Selecciona tu método preferido</p>
            </div>
            <div className="w-9"></div>
          </div>
        </div>

        {/* Lista de métodos */}
        <div className="px-4 py-2 max-h-96 overflow-y-auto">
          {/* Tarjeta de Crédito/Débito - Seleccionado */}
          <div className="relative flex items-center p-4 mb-3 rounded-2xl bg-blue-50 border-2 border-blue-300 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mr-4 bg-blue-100">
              <span className="text-xl">💳</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-base font-semibold text-blue-900">
                  Tarjeta de Crédito/Débito
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  ⭐ Recomendado
                </span>
              </div>
              <p className="text-sm mb-2 text-blue-700">
                Pago seguro con tu tarjeta
              </p>

              <div className="flex space-x-1 mt-2">
                <div className="px-2 py-1 bg-white rounded text-xs font-bold text-gray-700 shadow-sm border">VISA</div>
                <div className="px-2 py-1 bg-white rounded text-xs font-bold text-gray-700 shadow-sm border">MC</div>
                <div className="px-2 py-1 bg-white rounded text-xs font-bold text-gray-700 shadow-sm border">AMEX</div>
              </div>
            </div>
            <div className="flex-shrink-0 ml-3">
              <div className="relative w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-500 shadow-lg">
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-30"></div>
                <svg className="absolute inset-0 w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {/* Indicador de selección */}
            <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 pointer-events-none">
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>



          {/* PayPal - Próximamente */}
          <div className="flex items-center p-4 mb-3 rounded-2xl bg-gray-50 border-2 border-transparent opacity-40 cursor-not-allowed">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mr-4 bg-white shadow-sm">
              <span className="text-xl">🅿️</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-base font-semibold text-gray-900">PayPal</h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                  🚧 Próximamente
                </span>
              </div>
              <p className="text-sm text-gray-600">Paga con tu saldo de PayPal</p>
            </div>
            <div className="flex-shrink-0 ml-3">
              <div className="w-6 h-6 rounded-full border-2 border-gray-200 bg-gray-100"></div>
            </div>
          </div>

          {/* Transferencia Bancaria */}
          <div className="flex items-center p-4 mb-3 rounded-2xl bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:shadow-md cursor-pointer transition-all duration-300">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mr-4 bg-white shadow-sm">
              <span className="text-xl">🏦</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 mb-1">Transferencia Bancaria</h3>
              <p className="text-sm text-gray-600 mb-2">Desde tu cuenta bancaria</p>
            </div>
            <div className="flex-shrink-0 ml-3">
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white"></div>
            </div>
          </div>

          {/* Criptomonedas */}
          <div className="flex items-center p-4 mb-3 rounded-2xl bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:shadow-md cursor-pointer transition-all duration-300">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mr-4 bg-white shadow-sm">
              <span className="text-xl">₿</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 mb-1">Criptomonedas</h3>
              <p className="text-sm text-gray-600 mb-2">Bitcoin, USDC, Ethereum</p>
            </div>
            <div className="flex-shrink-0 ml-3">
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white"></div>
            </div>
          </div>
        </div>

        {/* Resumen del método seleccionado */}
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center justify-center text-sm">
            <span className="text-blue-700 font-medium">Método seleccionado: </span>
            <span className="text-blue-900 font-semibold ml-1">Tarjeta de Crédito/Débito</span>
          </div>
        </div>

        {/* Footer con botón de acción */}
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-100">
          <button className="w-full py-4 rounded-2xl font-semibold text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
            Continuar con Tarjeta de Crédito
          </button>
          
          {/* Información de seguridad */}
          <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Protegido con encriptación SSL de 256 bits</span>
          </div>
        </div>
      </div>
    </div>
  );
}
