'use client';

export function BankTransferForm() {
  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-gray-800 mb-2">Transferencia Bancaria</h4>
        <p className="text-sm text-gray-600 mb-4">
          Transfiere directamente desde tu cuenta bancaria
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
          </select>
        </div>
      </div>
      <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
        Procesar Transferencia
      </button>
    </div>
  );
}
