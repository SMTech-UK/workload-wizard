# WorkloadWizard

A comprehensive academic workload management system built with Next.js 14+, TypeScript, Convex, and Clerk authentication.

## 🎯 Overview

WorkloadWizard is a modern web application designed for higher education institutions to manage academic workloads, module allocations, and staff utilization. Built with a profile-based database architecture, it provides real-time collaboration, comprehensive reporting, and intelligent workload optimization.

## ✨ Features

### 📊 Core Functionality
- **Academic Workload Management**: Comprehensive FTE calculations and workload tracking
- **Module Allocations**: Drag-and-drop interface for assigning lecturers to modules
- **Real-time Collaboration**: Live updates across all users with Convex
- **Profile-based Architecture**: Flexible lecturer profiles with academic year scoping
- **Multi-tenant Support**: Organisation-based data isolation and management

### 🎓 Academic Features
- **Course Management**: Complete course lifecycle management
- **Cohort Tracking**: Student cohort progression and management
- **Team Management**: Academic team organization and workload distribution
- **Reference Data**: Comprehensive academic year, faculty, and department management

### 📈 Analytics & Reporting
- **Workload Analytics**: Utilization tracking and optimization insights
- **Custom Reports**: Flexible reporting with multiple export formats
- **Audit Trail**: Complete activity logging and compliance tracking
- **Performance Metrics**: Real-time dashboard with key performance indicators

### 🔔 Notifications & Alerts
- **Smart Notifications**: Context-aware alerts for workload issues
- **Email Integration**: Automated email notifications via Knock
- **Real-time Updates**: Live notifications for allocation changes
- **Customizable Settings**: User-configurable notification preferences

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icons

### Backend
- **Convex** - Real-time database and backend
- **Clerk** - Authentication and user management
- **Knock** - Notification service integration

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Sentry** - Error monitoring and performance tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Convex account
- Clerk account
- Knock account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/workload-wizard.git
   cd workload-wizard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_JWT_ISSUER_DOMAIN=your_clerk_jwt_issuer_domain
   
   # Convex Backend
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   CONVEX_DEPLOY_KEY=your_convex_deploy_key
   
   # Knock Notifications (optional)
   KNOCK_API_KEY=your_knock_api_key
   KNOCK_WORKFLOW_ID=your_knock_workflow_id
   
   # Sentry Monitoring (optional)
   SENTRY_DSN=your_sentry_dsn
   ```

4. **Set up Convex**
   ```bash
   npx convex dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
workload-wizard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── lecturer-management/ # Lecturer management
│   │   ├── module-management/  # Module management
│   │   ├── course-management/  # Course management
│   │   ├── cohort-management/  # Cohort management
│   │   ├── team-management/    # Team management
│   │   ├── reports/           # Reporting pages
│   │   └── admin/             # Admin pages
│   ├── components/            # Reusable React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── features/         # Feature-specific components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utility functions and hooks
│   │   ├── utils.ts          # General utilities
│   │   ├── academic-workload.ts # Academic calculations
│   │   ├── calculator.ts     # Workload calculations
│   │   ├── course-utils.ts   # Course utilities
│   │   ├── cohort-utils.ts   # Cohort utilities
│   │   ├── team-utils.ts     # Team utilities
│   │   ├── report-utils.ts   # Reporting utilities
│   │   ├── audit-utils.ts    # Audit logging utilities
│   │   └── notification-utils.ts # Notification utilities
│   └── hooks/                # Custom React hooks
├── convex/                   # Convex backend functions
│   ├── schema.ts            # Database schema
│   ├── auth.config.ts       # Authentication configuration
│   └── functions/           # Backend functions
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🗄️ Database Schema

WorkloadWizard uses a profile-based database architecture with the following key features:

- **Profile-based Design**: Lecturer profiles separate from academic year data
- **Academic Year Scoping**: All data scoped to specific academic years
- **Normalized Structure**: Efficient data relationships and queries
- **Audit Trail**: Complete change tracking and compliance logging

See [DATABASE_SCHEMA_REFERENCE.md](./DATABASE_SCHEMA_REFERENCE.md) for detailed schema documentation.

## 🧪 Testing

### Run Tests
```bash
npm test
# or
yarn test
```

### Run Tests with Coverage
```bash
npm run test:coverage
# or
yarn test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
# or
yarn test:watch
```

## 📚 Documentation

- [Product Requirements Document](./PRD.md) - Detailed product specifications
- [API Documentation](./API_DOCUMENTATION.md) - Backend API reference
- [Component Documentation](./COMPONENT_DOCUMENTATION.md) - Frontend component guide
- [Database Schema Reference](./DATABASE_SCHEMA_REFERENCE.md) - Database design documentation
- [Testing Guide](./TESTING.md) - Testing strategies and best practices
- [Development Tools](./DEV_TOOLS.md) - Development environment setup

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow conventional commit messages
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](./docs) directory
- **Issues**: Report bugs and feature requests via [GitHub Issues](https://github.com/your-org/workload-wizard/issues)
- **Discussions**: Join the conversation in [GitHub Discussions](https://github.com/your-org/workload-wizard/discussions)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Convex](https://convex.dev/) for real-time backend infrastructure
- [Clerk](https://clerk.com/) for authentication and user management
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

Built with ❤️ for the academic community
