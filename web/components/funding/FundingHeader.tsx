import Link from 'next/link';

export function FundingHeader() {
  return (
    <div className="flex justify-between items-center mb-8 md:mb-12 lg:mb-16">
      <Link href="/" className="text-xl md:text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
        ← Senu
      </Link>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          Métodos de Financiamiento
        </div>
      </div>
    </div>
  );
}
