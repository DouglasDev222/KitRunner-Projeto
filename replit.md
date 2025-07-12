# KitRunner - Event Kit Management System

## Overview

KitRunner is a mobile-first web application for managing event kit pickup and delivery orders. The system allows customers to browse upcoming events, identify themselves, confirm delivery details, and place orders for event kits with various payment options.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with custom configuration for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Storage**: DatabaseStorage implementation with persistent data
- **API Style**: RESTful API with JSON responses
- **Development**: Hot reload with Vite middleware integration

### Key Components

#### Database Schema
- **Events**: Store event details (name, date, time, location, participant limits)
- **Customers**: Customer information with CPF validation for Brazilian market
- **Orders**: Order tracking with status management and payment methods
- **Kits**: Individual kit details linked to orders (names, CPF, shirt sizes)

#### Core Features
1. **Event Management**: Browse and view event details
2. **Customer Identification**: CPF and birth date validation
3. **Address Confirmation**: Verify delivery address from customer data
4. **Cost Calculation**: Dynamic pricing based on distance and services
5. **Kit Configuration**: Multiple kit setup with individual details
6. **Payment Processing**: Multiple payment methods (credit, debit, PIX)
7. **Order Confirmation**: Complete order tracking and confirmation

#### Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly interface with appropriate sizing
- Brazilian Portuguese localization
- Currency formatting in Brazilian Real (BRL)

## Data Flow

1. **Event Selection**: Customer browses events and selects one
2. **Customer Authentication**: Identity verification via CPF and birth date
3. **Address Verification**: Confirm delivery address from customer database
4. **Cost Calculation**: Calculate delivery costs based on distance
5. **Kit Configuration**: Configure individual kits with names and sizes
6. **Payment Processing**: Select payment method and process order
7. **Order Confirmation**: Generate order confirmation with tracking

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Components**: Radix UI primitives, Lucide React icons
- **Form Management**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS, Class Variance Authority
- **Date Handling**: date-fns for Brazilian date formatting

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Server**: Express.js with middleware for JSON parsing
- **Database Provider**: Neon Database serverless driver
- **Validation**: Zod for request/response validation
- **Session Management**: Connect-pg-simple for PostgreSQL sessions

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support with strict mode
- **Development**: tsx for TypeScript execution, hot reload support

## Deployment Strategy

### Development Mode
- Vite dev server with hot module replacement
- Express server with middleware integration
- TypeScript compilation on-the-fly
- Database migrations via Drizzle Kit

### Production Build
- Vite builds client-side assets to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Static file serving from Express for production
- Environment variable configuration for database URL

### Database Management
- Drizzle Kit for schema management and migrations
- PostgreSQL schema defined in `shared/schema.ts`
- Automatic migration generation and deployment
- Database URL configuration via environment variables

### Key Design Decisions

1. **Monorepo Structure**: Shared types and schemas between client and server
2. **Mobile-First Approach**: Tailored for Brazilian mobile commerce patterns
3. **Session-Based Flow**: Multi-step order process with session storage
4. **Type Safety**: End-to-end TypeScript with shared validation schemas
5. **Brazilian Market Focus**: CPF validation, Portuguese localization, BRL currency
6. **Serverless Database**: Neon Database for scalable PostgreSQL hosting
7. **Component Library**: shadcn/ui for consistent, accessible UI components
8. **Database-First Storage**: Replaced in-memory storage with persistent PostgreSQL database

## Recent Changes

### Database Integration (December 2024)
- ✓ Added PostgreSQL database with Neon Database provider
- ✓ Created DatabaseStorage implementation replacing MemStorage
- ✓ Migrated from in-memory to persistent data storage
- ✓ Seeded database with initial events and customer data
- ✓ Maintained all existing API functionality with database backend

The application follows a progressive enhancement approach, starting with a solid server-side foundation and enhancing the user experience with modern client-side features.