export function FundingHero() {
  return (
    <div className="text-center space-y-6">
      {/* Clean iOS-style header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Financiar Envío</h2>
      </div>

      {/* iOS-style title and description */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Elige tu Método de Pago
        </h1>
        <p className="text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
          Selecciona cómo quieres financiar tu transferencia de dinero de forma segura y conveniente.
        </p>
      </div>

      {/* iOS-style feature badges */}
      <div className="flex justify-center space-x-2">
        <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 rounded-full">
          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-green-700">Seguro</span>
        </div>
        <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 rounded-full">
          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-blue-700">Rápido</span>
        </div>
        <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 rounded-full">
          <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-purple-700">Encriptado</span>
        </div>
      </div>
    </div>
  );
}
