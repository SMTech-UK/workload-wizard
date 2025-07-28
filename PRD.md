# Product Requirements Document (PRD)
## WorkloadWizard - Academic Workload Management Platform

**Version:** 1.0  
**Date:** December 2024  
**Status:** Draft  

---

## 1. Project Purpose

### Primary Objectives
- **Eliminate Excel-based allocation methods** - Replace manual spreadsheet workflows with automated, centralized system
- **Improve transparency and balance** - Provide clear visibility into workload distribution across departments
- **Enable lecturer visibility** - Allow lecturers to view their assignments and submit preferences
- **Simplify multi-site, multi-cohort planning** - Streamline complex academic team coordination

### Problem Statement
Academic institutions currently rely on complex Excel spreadsheets for workload allocation, leading to:
- Inconsistent data across departments
- Limited transparency for lecturers
- Difficulty in managing multi-site and multi-cohort scenarios
- Time-consuming manual processes prone to errors
- Lack of audit trails and version control

---

## 2. Stakeholders

### Primary Stakeholders
- **Admin/Developer** - System administrators and technical team
- **Professional Leads / Department Admins** - Academic department leadership
- **Lecturers** - Teaching staff receiving workload allocations
- **Academic Managers / Reviewers** - Senior academic leadership and quality assurance

### Stakeholder Responsibilities
| Role | Primary Responsibilities | System Access Level |
|------|------------------------|-------------------|
| Admin/Developer | System maintenance, user management, data integrity | Full access |
| Professional Leads | Workload planning, lecturer management, reporting | Department-level access |
| Lecturers | View assignments, submit preferences, track hours | Personal data access |
| Academic Managers | Review allocations, approve changes, strategic oversight | Read-only + approval |

---

## 3. User Roles & Permissions

### Admin/Developer
- **Full system access** - Manage all data, users, and settings
- **System configuration** - Configure departments, sites, academic years
- **User management** - Create, edit, and deactivate user accounts
- **Data maintenance** - Import/export data, system backups
- **Audit oversight** - Monitor system usage and activity logs

### Professional Leads/Department Admins
- **Lecturer management** - Create, edit, and maintain lecturer profiles
- **Module administration** - Set up modules and module iterations
- **Cohort management** - Create and configure student cohorts
- **Workload allocation** - Assign teaching hours and responsibilities
- **Reporting access** - Generate department-level reports and analytics

### Lecturers
- **Personal workload view** - Access to individual assignment details
- **Preference submission** - Submit availability and teaching preferences
- **Hours tracking** - Monitor allocated hours vs. actual hours
- **Profile management** - Update personal information and preferences
- **Notification access** - Receive updates on allocation changes

### Academic Managers/Reviewers
- **Read-only access** - View all allocations and reports
- **Approval workflows** - Approve significant allocation changes
- **Strategic oversight** - Monitor department utilization and trends
- **Quality assurance** - Review allocation fairness and balance

---

## 4. Functional Requirements (User Stories)

### Lecturer Management
- **As a** Professional Lead  
  **I want to** create and edit lecturer profiles  
  **So that** I can maintain accurate staff information for workload planning

- **As a** Professional Lead  
  **I want to** view lecturer contract details and FTE information  
  **So that** I can ensure allocations align with contractual obligations

### Module & Iteration Management
- **As a** Professional Lead  
  **I want to** create modules with default hour allocations  
  **So that** I can establish consistent baseline requirements

- **As a** Professional Lead  
  **I want to** create module iterations linked to specific cohorts and semesters  
  **So that** I can manage multi-site, multi-cohort delivery

### Workload Allocation
- **As a** Professional Lead  
  **I want to** assign teaching, marking, CPD, and leadership hours  
  **So that** I can create comprehensive workload profiles

- **As a** Professional Lead  
  **I want to** allocate lecturers to modules based on group calculations  
  **So that** I can optimize resource utilization across sites

### Filtering & Search
- **As a** Professional Lead  
  **I want to** filter allocations by cohort, semester, lecturer, module, and site  
  **So that** I can quickly find and modify specific assignments

### Dashboard & Reporting
- **As a** Professional Lead  
  **I want to** view department-level dashboards and summaries  
  **So that** I can monitor overall workload distribution and utilization

- **As a** Lecturer  
  **I want to** view my personal workload dashboard  
  **So that** I can understand my current assignments and hours

### Administrative Tracking
- **As a** Professional Lead  
  **I want to** track administrative hours per lecturer  
  **So that** I can ensure fair distribution of non-teaching responsibilities

- **As a** Professional Lead  
  **I want to** record assessment and external examiner requirements  
  **So that** I can maintain quality assurance standards

### Activity Monitoring
- **As a** Admin  
  **I want to** view recent activity and system metrics  
  **So that** I can monitor system usage and identify potential issues

---

## 5. Key Features

### Core Functionality
- **Multi-site and multi-group support** - Handle complex academic structures
- **Class size-driven group generation** - Automatically calculate groups based on enrollment
- **Lecturer preference system** - Allow staff to submit availability and preferences
- **Real-time dashboards** - Live updates of allocation status and metrics
- **Notes/comments per allocation** - Enable communication and context

### User Experience
- **Drag-and-drop reallocation** - Intuitive interface for workload adjustments
- **Export functionality** - CSV and ICS calendar export options
- **History/audit logs** - Complete tracking of all system changes
- **Responsive design** - Mobile-friendly interface for all devices

### Advanced Features
- **Version control** - Track changes and maintain allocation history
- **Bulk operations** - Efficient management of multiple allocations
- **Conflict detection** - Identify scheduling and capacity conflicts
- **Notification system** - Alert users to relevant changes and updates

---

## 6. Data Model

### Core Entities

#### `lecturers`
```typescript
{
  _id: Id<"lecturers">,
  name: string,
  email: string,
  contract_hours: number,
  fte: number,
  team: string,
  role: string,
  status: "active" | "inactive",
  preferences?: {
    preferred_modules: string[],
    availability: {
      [semester: string]: {
        available_hours: number,
        notes: string
      }
    }
  }
}
```

#### `modules`
```typescript
{
  _id: Id<"modules">,
  title: string,
  code: string,
  credits: number,
  leader: Id<"lecturers">,
  default_hours: {
    teaching: number,
    marking: number,
    cpd: number,
    leadership: number
  },
  level: "undergraduate" | "postgraduate"
}
```

#### `module_iterations`
```typescript
{
  _id: Id<"module_iterations">,
  module_id: Id<"modules">,
  cohort_id: Id<"cohorts">,
  semester: string,
  sites: string[],
  hours: {
    teaching: number,
    marking: number,
    cpd: number,
    leadership: number
  },
  assessments: {
    internal: boolean,
    external_examiner: boolean,
    requirements: string
  }
}
```

#### `module_allocations`
```typescript
{
  _id: Id<"module_allocations">,
  module_iteration_id: Id<"module_iterations">,
  lecturer_id: Id<"lecturers">,
  group: string,
  site: string,
  hours: {
    teaching: number,
    marking: number,
    cpd: number,
    leadership: number
  },
  notes?: string,
  created_at: number,
  updated_at: number
}
```

#### `cohorts`
```typescript
{
  _id: Id<"cohorts">,
  name: string,
  start_date: string,
  modules: Id<"modules">[]
}
```

#### `admin_allocations`
```typescript
{
  _id: Id<"admin_allocations">,
  lecturer_id: Id<"lecturers">,
  academic_year: string,
  category: "leadership" | "research" | "admin" | "other",
  hours: number,
  description: string
}
```

#### `dept_summary`
```typescript
{
  _id: Id<"dept_summary">,
  department: string,
  academic_year: string,
  utilisation_rate: number,
  capacity_hours: number,
  allocated_hours: number,
  overload_hours: number,
  last_updated: number
}
```

#### `recent_activity`
```typescript
{
  _id: Id<"recent_activity">,
  action: string,
  entity_type: "lecturer" | "module" | "allocation" | "cohort",
  entity_id: string,
  user_id: string,
  timestamp: number,
  details: Record<string, any>
}
```

#### `users`
```typescript
{
  _id: Id<"users">,
  clerk_user_id: string,
  email: string,
  role: "admin" | "professional_lead" | "lecturer" | "academic_manager",
  department?: string,
  preferences: {
    notifications: boolean,
    theme: "light" | "dark",
    dashboard_layout: string
  }
}
```

---

## 7. Non-Functional Requirements

### Performance
- **Response time** - Dashboard loads within 2 seconds
- **Concurrent users** - Support 100+ simultaneous users
- **Data volume** - Handle 300+ module iterations annually
- **Scalability** - Architecture supports 10x growth

### Accessibility
- **WCAG 2.1 compliance** - AA level accessibility standards
- **Screen reader support** - Full compatibility with assistive technologies
- **Keyboard navigation** - Complete functionality without mouse
- **Color contrast** - Minimum 4.5:1 ratio for text elements

### Security
- **Authentication** - Secure user authentication via Clerk
- **Authorization** - Role-based access control
- **Data encryption** - All data encrypted in transit and at rest
- **Audit logging** - Complete audit trail for all data changes

### Reliability
- **Uptime** - 99.9% availability target
- **Backup** - Daily automated backups with 30-day retention
- **Error handling** - Graceful degradation and user-friendly error messages
- **Data integrity** - Validation and constraints to prevent data corruption

---

## 8. Tech Stack

### Frontend
- **Framework** - Next.js 14+ (App Router)
- **Styling** - Tailwind CSS with shadcn/ui components
- **State Management** - React hooks and context
- **Type Safety** - TypeScript

### Backend
- **Runtime** - Convex (TypeScript)
- **Database** - Convex DB
- **Authentication** - Clerk
- **Notifications** - Knock

### Development & Deployment
- **Version Control** - Git
- **Hosting** - Vercel
- **Monitoring** - Built-in Convex monitoring
- **Testing** - Jest + React Testing Library

---

## 9. Future Enhancements

### Phase 2 Features
- **Offline/local caching** - Work without internet connection
- **Advanced analytics** - Predictive workload modeling
- **Lecturer self-service** - Enhanced availability management
- **Timetable integration** - Sync with existing scheduling systems

### Phase 3 Features
- **HR platform integration** - Automatic staff data sync
- **LMS integration** - Connect with learning management systems
- **Advanced reporting** - Custom report builder
- **Mobile app** - Native iOS/Android applications

### Long-term Vision
- **AI-powered allocation** - Machine learning for optimal workload distribution
- **Predictive analytics** - Forecast workload needs and capacity
- **Multi-institution support** - SaaS model for multiple universities
- **API ecosystem** - Third-party integrations and extensions

---

## 10. Milestones & Phases

### MVP (Phase 1) - Q1 2025
**Duration:** 12 weeks
- ✅ Lecturer CRUD operations
- ✅ Module creation and management
- ✅ Basic allocation management
- ✅ Simple dashboards
- ✅ User authentication and roles
- ✅ Core data model implementation

**Success Criteria:**
- 90% reduction in spreadsheet usage
- All core allocation workflows functional
- Positive user feedback from pilot group

### Phase 2 - Q2 2025
**Duration:** 8 weeks
- 🔄 Notification system
- 🔄 Advanced reporting tools
- 🔄 CSV/ICS export functionality
- 🔄 Enhanced filtering and search
- 🔄 Audit logging and history

**Success Criteria:**
- Full feature parity with existing spreadsheet workflows
- Improved user satisfaction scores
- Reduced time spent on workload planning

### Phase 3 - Q3 2025
**Duration:** 10 weeks
- 🔄 Offline support and local caching
- 🔄 External integrations (HR, LMS)
- 🔄 Advanced analytics dashboards
- 🔄 Mobile-responsive optimization
- 🔄 Performance optimization

**Success Criteria:**
- Seamless integration with existing institutional systems
- Enhanced user experience across all devices
- Measurable productivity improvements

---

## 11. Integration Points

### Current Integrations
- **Clerk Authentication** - User management and SSO
- **Knock Notifications** - Real-time user notifications
- **Convex Backend** - Database and real-time sync

### Planned Integrations
- **HR Systems** - Automatic staff data synchronization
- **Calendar Systems** - ICS export for timetable integration
- **LMS Platforms** - Module and enrollment data sync
- **SSO/LDAP** - Enterprise authentication options

### API Development
- **REST API** - For third-party integrations
- **Webhook Support** - Real-time data synchronization
- **OAuth 2.0** - Secure third-party access
- **GraphQL** - Flexible data querying

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **FTE** | Full-Time Equivalent - Standard measure of workload (typically 37.5 hours/week) |
| **CPD** | Continuing Professional Development - Ongoing learning and development activities |
| **Module Iteration** | Specific instance of a module delivered to a particular cohort in a given semester |
| **Cohort** | Student group per intake (e.g., "SEP 24" for September 2024 intake) |
| **Group** | Subdivision of a cohort per site/module (e.g., "SEP 24 London Campus") |
| **Site** | Physical or virtual location where teaching occurs |
| **Allocation** | Assignment of specific hours to a lecturer for a particular module iteration |
| **Utilization Rate** | Percentage of available hours allocated vs. total capacity |
| **Overload** | Hours allocated beyond contractual obligations |

---

## 13. Risks & Assumptions

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Convex scalability limits** | High | Monitor usage patterns, implement caching strategies |
| **Data migration complexity** | Medium | Phased migration approach, comprehensive testing |
| **Integration failures** | Medium | Robust error handling, fallback mechanisms |
| **Performance degradation** | Medium | Regular performance monitoring, optimization |

### Business Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| **User adoption resistance** | High | Comprehensive training, change management |
| **Manual data entry errors** | Medium | Validation rules, automated data import |
| **Admin training requirements** | Medium | Documentation, video tutorials, support system |
| **Lecturer engagement variation** | Low | Incentivize usage, demonstrate benefits |

### Assumptions
- **User Competency** - Users have basic computer literacy
- **Data Quality** - Existing spreadsheet data is reasonably accurate
- **Network Access** - Reliable internet connectivity in academic environments
- **Institutional Support** - Management backing for digital transformation
- **Regulatory Compliance** - System meets institutional data protection requirements

---

## 14. Success Metrics

### Quantitative Metrics
- **90% reduction in spreadsheet dependency** - Target achieved when <10% of workload planning uses Excel
- **50% reduction in allocation time** - Measure time from planning to final allocation
- **95% user adoption rate** - Percentage of target users actively using the system
- **<2 second dashboard load time** - Performance benchmark for user experience

### Qualitative Metrics
- **Increased transparency** - Measured through user satisfaction surveys
- **Improved workload balance** - Reduced variance in lecturer workload distribution
- **Enhanced communication** - Better coordination between academic teams
- **Positive user feedback** - Net Promoter Score (NPS) >50

### Operational Metrics
- **System uptime** - Target 99.9% availability
- **Data accuracy** - <1% error rate in workload calculations
- **Support ticket volume** - <5% of users requiring technical support
- **Training completion rate** - >90% of users complete onboarding

---

## 15. Appendix

### A. User Journey Maps
*[To be developed during UX design phase]*

### B. Wireframes & Mockups
*[To be developed during UI/UX phase]*

### C. API Documentation
*[To be developed during technical implementation]*

### D. Testing Strategy
*[To be developed during QA planning]*

### E. Deployment Checklist
*[To be developed during DevOps planning]*

---

**Document Control**
- **Created:** December 2024
- **Last Updated:** December 2024
- **Next Review:** January 2025
- **Owner:** Product Team
- **Stakeholders:** Development Team, Academic Leadership, IT Department 