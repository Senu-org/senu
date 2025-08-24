'use client';

interface BankAccountFormProps {
  mode?: 'funding' | 'receiving';
  onSubmit?: (data: any) => void;
}

export function BankAccountForm({ mode = 'funding', onSubmit }: BankAccountFormProps) {
  const isFunding = mode === 'funding';
  
  const description = isFunding 
    ? 'Transfiere directamente desde tu cuenta bancaria' 
    : 'Configura tu cuenta bancaria para recibir transferencias';
  
  const buttonText = isFunding 
    ? 'Procesar Transferencia' 
    : 'Guardar Cuenta Bancaria';
  
  const buttonColor = isFunding 
    ? 'bg-purple-500 hover:bg-purple-600' 
    : 'bg-purple-500 hover:bg-purple-600';

  return (
    <div className="p-4 bg-white space-y-4">
      {/* iOS-style form header */}
      <div className="text-center pb-2">
        <p className="text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>

      {/* iOS-style form fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Número de Cuenta
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234567890"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Banco
          </label>
          <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base appearance-none">
            <option value="">Selecciona tu banco</option>
            <option value="bncr">Banco Nacional de Costa Rica</option>
            <option value="bcr">Banco de Costa Rica</option>
            <option value="bac">BAC San José</option>
            <option value="scotiabank">Scotiabank</option>
            <option value="davivienda">Davivienda</option>
            <option value="promerica">Promerica</option>
          </select>
        </div>
        
        {!isFunding && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Nombre del Titular
              </label>
              <input
                type="text"
                placeholder="Juan Pérez Rodríguez"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Cédula de Identidad
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1-2345-6789"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
              />
            </div>
          </>
        )}
        
        {isFunding && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Monto a Transferir
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-base">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
              />
            </div>
          </div>
        )}
      </div>

      {/* iOS-style submit button */}
      <div className="pt-2">
        <button 
          onClick={() => onSubmit?.({})}
          className={`w-full py-4 ${buttonColor} text-white font-semibold rounded-2xl shadow-sm active:shadow-md transform active:scale-95 transition-all duration-150 text-base`}
        >
          {buttonText}
        </button>
      </div>

      {/* iOS-style security notice */}
      <div className="flex items-center justify-center space-x-2 pt-2">
        <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs text-gray-600">Información protegida con SSL</span>
      </div>
    </div>
  );
}
