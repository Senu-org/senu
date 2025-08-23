import { CreditCardMethod } from './methods/CreditCardMethod';
import { StripeMethod } from './methods/StripeMethod';
import { PayPalMethod } from './methods/PayPalMethod';
import { BankTransferMethod } from './methods/BankTransferMethod';
import { CryptoMethod } from './methods/CryptoMethod';
import { MobilePaymentMethod } from './methods/MobilePaymentMethod';

export function PaymentMethods() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 md:mb-12 text-center">
        Métodos de Pago Disponibles
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <CreditCardMethod />
        <StripeMethod />
        <PayPalMethod />
        <BankTransferMethod />
        <CryptoMethod />
        <MobilePaymentMethod />
      </div>
    </div>
  );
}
