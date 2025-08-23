export const config = {
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    getWhatsAppUrl: (message: string) => {
      const encodedMessage = encodeURIComponent(message);
      return `https://wa.me/${config.whatsapp.number}?text=${encodedMessage}`;
    }
  },
};
