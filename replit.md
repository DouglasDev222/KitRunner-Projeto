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
2. **User Authentication**: Persistent login system with CPF and birth date validation
3. **Profile Management**: Comprehensive user profile with personal data and address management
4. **Address Management**: Multiple addresses with default address functionality (only one default per user)
5. **Cost Calculation**: Dynamic pricing based on distance and services
6. **Kit Configuration**: Multiple kit setup with individual details
7. **Payment Processing**: Multiple payment methods (credit, debit, PIX)
8. **Order Management**: Complete order tracking and history for authenticated users
9. **Simplified Ordering**: Logged-in users skip identification steps

#### Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly interface with appropriate sizing
- Brazilian Portuguese localization
- Currency formatting in Brazilian Real (BRL)

## Data Flow

### For New Users
1. **Event Selection**: Customer browses events and selects one
2. **Customer Authentication**: Identity verification via CPF and birth date or registration
3. **Address Verification**: Confirm delivery address from customer database or add new
4. **Cost Calculation**: Calculate delivery costs based on distance
5. **Kit Configuration**: Configure individual kits with names and sizes
6. **Payment Processing**: Select payment method and process order
7. **Order Confirmation**: Generate order confirmation with tracking

### For Authenticated Users
1. **Event Selection**: Customer browses events and selects one (login persisted)
2. **Address Confirmation**: Uses saved addresses or add new ones
3. **Cost Calculation**: Calculate delivery costs based on distance
4. **Kit Configuration**: Configure individual kits with names and sizes
5. **Payment Processing**: Select payment method and process order
6. **Order Confirmation**: Generate order confirmation with tracking

### Profile Management
- **Login**: Persistent authentication with localStorage
- **Profile View**: Complete user data display (name, CPF, birth date, phone, email)
- **Address Management**: Add, edit, delete addresses with default management
- **Order History**: View all previous orders with details
- **Logout**: Clear session and return to public flow

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

### Pricing Structure Overhaul & Data Consistency (January 2025)
- ✓ Complete pricing structure overhaul - removed pickup base costs (R$ 15.00) from all calculations
- ✓ Updated server-side pricing logic to use delivery costs instead of pickup costs
- ✓ Fixed client-side pricing displays in payment and kit information screens
- ✓ Replaced obsolete event edit form with standardized structure matching creation form
- ✓ Added proper form validation and field alignment with current database schema
- ✓ Cleaned event details page by removing non-existent fields (time, participants)
- ✓ Fixed date formatting to display properly in Brazilian format (DD/MM/YYYY)
- ✓ Enhanced pricing breakdown to separate retirada (pickup) and entrega (delivery) costs
- ✓ Added donation display integration in order summaries
- ✓ Resolved all TypeScript errors and improved type safety across pricing components

### Admin Dashboard Implementation (January 2025)
- ✓ Complete database schema migration with new pricing model
- ✓ Added comprehensive admin dashboard with responsive design for mobile/desktop
- ✓ Implemented customer, orders, and events management interfaces
- ✓ Created event creation form with full pricing configuration
- ✓ Added support for donation requirements and coupon system
- ✓ Implemented provisional distance-based pricing algorithm
- ✓ Added admin statistics dashboard with total customers, orders, revenue
- ✓ Integrated admin panel access from main events page
- ✓ Added admin authentication system with login credentials
- ✓ Created responsive lateral menu for admin panel navigation
- ✓ Fixed event details page participants field error
- ✓ Implemented AdminLayout component for consistent admin interface

### Authentication System Implementation (January 2025)
- ✓ Added persistent login system with localStorage for session management
- ✓ Created comprehensive profile page with user data and address management
- ✓ Implemented proper address default management (only one default per user)
- ✓ Added login/logout functionality with auth context provider
- ✓ Enhanced address editing with isDefault checkbox functionality
- ✓ Updated My Orders to work with authenticated users
- ✓ Simplified order flow for logged-in users (skip CPF/birth date entry)
- ✓ Added footer with easy access to Profile and My Orders from events page

### Database Integration (December 2024)
- ✓ Added PostgreSQL database with Neon Database provider
- ✓ Created DatabaseStorage implementation replacing MemStorage
- ✓ Migrated from in-memory to persistent data storage
- ✓ Seeded database with initial events and customer data
- ✓ Maintained all existing API functionality with database backend

The application follows a progressive enhancement approach, starting with a solid server-side foundation and enhancing the user experience with modern client-side features.