import Link from 'next/link';

export function PaymentsHeader() {
  return (
    <div className="flex justify-between items-center mb-8 md:mb-12 lg:mb-16">
      <Link href="/" className="text-xl md:text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
        ← Senu
      </Link>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          Métodos de Pago
        </div>
        <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors duration-200">
          <span className="text-sm md:text-base text-gray-600">?</span>
        </button>
      </div>
    </div>
  );
}
