# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Senu" is a WhatsApp remittance system - a fintech application that enables international money transfers through WhatsApp messaging, focusing on the Costa Rica → Nicaragua corridor. The project combines Web3 technology with traditional fintech to create a seamless user experience.

## Tech Stack

### Frontend (Next.js PWA)
- **Framework**: Next.js 15.5.0 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query for server state
- **Authentication**: Custom JWT + middleware
- **PWA Features**: Service Worker, push notifications, offline support

### Backend & APIs
- **API Routes**: Next.js API routes in `/app/api/`
- **Database**: Supabase (PostgreSQL)
- **Authentication**: bcrypt + JWT tokens
- **Push Notifications**: Web Push API

### Web3 Integration
- **Blockchain**: Monad network
- **Wallet Management**: Para SDK (invisible wallets), Reown AppKit
- **Web3 Libraries**: wagmi v2, viem v2, ethers v6
- **Wallet Connection**: WalletConnect v2

### External Services
- **WhatsApp**: Twilio SDK integration
- **Notifications**: Native push notifications

## Architecture

### Monorepo Structure
```
/
├── package.json (workspace root)
├── turbo.json (build orchestration)
├── web/ (Next.js application)
│   ├── app/ (App Router)
│   │   ├── api/ (API routes)
│   │   ├── funding/ (funding pages)
│   │   ├── receive/ (receive money pages)
│   │   └── offline/ (PWA offline page)
│   ├── components/ (React components)
│   │   ├── funding/
│   │   ├── home/
│   │   ├── receive/
│   │   ├── pwa/
│   │   └── shared/
│   ├── lib/ (utilities and services)
│   │   ├── services/ (business logic)
│   │   ├── repository/ (data access)
│   │   ├── config/ (configuration)
│   │   └── types/ (TypeScript definitions)
│   ├── hooks/ (React hooks)
│   └── public/ (static assets + PWA manifest)
├── project-specs/ (feature specifications)
└── specs/ (product documentation)
```

## Development Commands

### Root Level
- `yarn dev` - Start development servers
- `yarn build` - Build all packages
- `yarn lint` - Run linting
- `yarn test` - Run tests
- `yarn type-check` - TypeScript checking
- `yarn format` - Format code with Prettier

### Web App Specific
- `yarn web:dev` - Start Next.js dev server
- `yarn web:build` - Build Next.js app
- `yarn web:start` - Start production server

## Feature Specification System

The project maintains a three-phase structured workflow for feature development:

### Phase 1: Requirements Gathering
- Transform feature ideas into structured requirements using EARS format
- Generate user stories and acceptance criteria
- Document: `project-specs/{feature-name}/requirements.md`

### Phase 2: Design Document  
- Create technical designs based on approved requirements
- Include architecture, components, data models, error handling, and testing strategy
- Document: `project-specs/{feature-name}/design.md`

### Phase 3: Task List
- Convert design into actionable coding tasks
- Focus exclusively on test-driven development and coding activities
- Document: `project-specs/{feature-name}/tasks.md`

### Key Workflow Rules
- Each phase requires explicit user approval before proceeding
- Always read all three specification documents before executing tasks
- Execute one task at a time during implementation
- Maintain traceability from requirements through tasks

## Testing Strategy

- **Test Runner**: Jest with Next.js integration
- **Coverage Targets**: 70% global, 80% for critical services (transaction.ts)
- **Test Types**: Unit tests for services and API routes
- **Setup**: `jest.setup.js` for test configuration

## Development Guidelines

When working on this project:

1. **Mobile-First**: Always design and develop with mobile as the primary target
2. **PWA Standards**: Ensure all features work offline and with push notifications
3. **Web3 Integration**: Use Para SDK for invisible wallets, Reown for external wallet connections
4. **Security**: Never expose private keys, use environment variables for sensitive data
5. **Database**: Use Supabase repository pattern for data access
6. **API Design**: Follow RESTful conventions in `/app/api/` routes
7. **Component Architecture**: Use shadcn/ui components, follow the existing folder structure
8. **TypeScript**: Maintain strict typing, use proper interfaces
9. **Testing**: Write tests for new services and API endpoints

## Key Business Context

- **Target Users**: Nicaraguan immigrants in Costa Rica sending money home
- **Primary Flow**: WhatsApp → Mini App → Payment → Bank transfer
- **MVP Focus**: Costa Rica → Nicaragua remittance corridor
- **Technology Demo**: Using Monad blockchain for internal fund management before full banking integration