'use client';

interface BankAccountFormProps {
  mode?: 'funding' | 'receiving';
  onSubmit?: (data: any) => void;
}

export function BankAccountForm({ mode = 'funding', onSubmit }: BankAccountFormProps) {
  const isFunding = mode === 'funding';
  
  const title = isFunding ? 'Transferencia Bancaria' : 'Cuenta Bancaria';
  const description = isFunding 
    ? 'Transfiere directamente desde tu cuenta bancaria' 
    : 'Configura tu cuenta bancaria para recibir transferencias';
  
  const buttonText = isFunding 
    ? 'Procesar Transferencia' 
    : 'Guardar Cuenta Bancaria';
  
  const buttonColor = isFunding 
    ? 'bg-green-500 hover:bg-green-600' 
    : 'bg-blue-500 hover:bg-blue-600';

  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 mb-4">
          {description}
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Cuenta
          </label>
          <input
            type="text"
            placeholder="1234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banco
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Selecciona tu banco</option>
            <option value="bancolombia">Bancolombia</option>
            <option value="davivienda">Davivienda</option>
            <option value="bbva">BBVA</option>
            <option value="banco_bogota">Banco de Bogotá</option>
            <option value="banco_popular">Banco Popular</option>
            <option value="scotiabank">Scotiabank</option>
          </select>
        </div>
        
        {!isFunding && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Titular
              </label>
              <input
                type="text"
                placeholder="Juan Pérez"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cuenta
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Selecciona el tipo</option>
                <option value="ahorros">Cuenta de Ahorros</option>
                <option value="corriente">Cuenta Corriente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento de Identidad
              </label>
              <input
                type="text"
                placeholder="1-2345-6789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}
        
        {isFunding && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a Transferir
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>
      <button 
        onClick={() => onSubmit?.({})}
        className={`w-full py-3 ${buttonColor} text-white font-semibold rounded-lg transition-colors`}
      >
        {buttonText}
      </button>
    </div>
  );
}
