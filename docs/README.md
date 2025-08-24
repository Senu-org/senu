# Senu Documentation

Welcome to the Senu documentation. This directory contains comprehensive guides and references for developers working with the Senu WhatsApp remittance application.

## 📚 Documentation Index

### Getting Started
- **[Development Guide](./development.md)** - Complete setup and development workflow
- **[Twilio Setup](./twilio-setup.md)** - WhatsApp Business API configuration
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

### Technical Reference
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Architecture Overview](../README.md#architecture-overview)** - System architecture and design decisions

## 🚀 Quick Navigation

### For New Developers
1. Start with the [Development Guide](./development.md) for environment setup
2. Follow the [Twilio Setup](./twilio-setup.md) for WhatsApp integration
3. Reference the [API Documentation](./api-reference.md) while building features

### For Troubleshooting
- Check [Common Issues](./troubleshooting.md#common-issues) first
- Review [Error Codes Reference](./troubleshooting.md#error-codes-reference)
- Use [Debugging Tools](./troubleshooting.md#debugging-tools) for investigation

### For Integration
- Review [API Endpoints](./api-reference.md#api-endpoints) for available services
- Check [Authentication](./api-reference.md#authentication) requirements
- Understand [Conversation States](./api-reference.md#conversation-states) for WhatsApp bot

## 🏗️ Architecture Overview

Senu is a WhatsApp-based remittance system with the following key components:

- **Progressive Web App (PWA)**: Mobile-first interface built with Next.js
- **WhatsApp Bot**: Conversational interface via Twilio Business API
- **Blockchain Integration**: Monad network with Para SDK for custodial wallets
- **Payment Processing**: On-ramp/off-ramp integrations for fiat conversion
- **Real-time Notifications**: Push notifications for transaction updates

## 🔧 Technology Stack

### Frontend
- Next.js 15.5.0 with TypeScript
- Tailwind CSS + shadcn/ui components
- PWA with Service Worker and push notifications

### Backend
- Next.js API routes
- Supabase (PostgreSQL) database
- JWT authentication with bcrypt

### Web3 & Blockchain
- Monad blockchain network
- Para SDK for invisible wallets
- wagmi v2 + viem v2 for blockchain interactions
- Reown AppKit for external wallet connections

### External Services
- Twilio for WhatsApp Business API
- SINPE for Costa Rica/Nicaragua banking
- Envio for blockchain indexing

## 📋 Development Workflow

1. **Setup**: Follow [Development Guide](./development.md#installation-steps)
2. **Configure**: Set up [Twilio integration](./twilio-setup.md)
3. **Develop**: Use [API Reference](./api-reference.md) for implementation
4. **Debug**: Check [Troubleshooting Guide](./troubleshooting.md) for issues
5. **Deploy**: Follow deployment instructions in [Development Guide](./development.md#deployment)

## 🔍 Key Features

### User Flow
- **Senders**: Landing page → WhatsApp bot → Funding page → Payment completion
- **Recipients**: WhatsApp notification → Receive page → Withdrawal process

### WhatsApp Bot Commands
- `/send` - Initiate money transfer
- `/status` - Check transaction status
- `/confirm` - Confirm pending transaction
- `/cancel` - Cancel pending transaction

### Transaction States
1. **INITIATED** → **PAYMENT_PENDING** → **PAYMENT_CONFIRMED**
2. **BLOCKCHAIN_PENDING** → **BLOCKCHAIN_CONFIRMED**
3. **WITHDRAWAL_PENDING** → **COMPLETED**

## 🛠️ Development Tools

### Testing
- **WhatsApp Bot**: Use Twilio sandbox for development
- **API Endpoints**: Postman collection available in `/postman/`
- **PWA Features**: Test offline functionality and push notifications
- **Blockchain**: Use Monad testnet for transaction testing

### Debugging
- **Logs**: Structured logging throughout the application
- **Browser DevTools**: Network, Console, Application tabs
- **Database**: Direct SQL queries via Supabase dashboard
- **Webhook Testing**: ngrok for local development

## 📞 Support

### Documentation Issues
If you find issues with this documentation:
1. Check if the information is outdated
2. Create an issue with specific details
3. Submit a pull request with corrections [[memory:6999961]]

### Technical Support
For technical issues:
1. Check [Troubleshooting Guide](./troubleshooting.md) first
2. Review relevant documentation sections
3. Contact the development team with detailed error information

### Contributing
See the [Development Guide](./development.md#contributing) for contribution guidelines and coding standards.

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainers**: Senu Development Team
