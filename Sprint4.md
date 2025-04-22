# ✨ Impacta - Crowdfunding for Small Causes
Impacta is a crowdfunding platform designed to help individuals contribute to *meaningful causes*, ensuring transparency and ease of donation.

---

## 🚀 Project Overview (Sprint 4)
Our backend team focused on user engagement and system monitoring enhancements. We implemented email notification functionality via SMTP to notify users upon key events like registration and campaign creation. The notification system includes customizable HTML templates for improved branding and user experience. Sensitive operations like user registration and campaign creation now trigger asynchronous email dispatches using Go routines to ensure non-blocking performance.

Additionally, the backend was structured for Grafana and Prometheus integration, laying the groundwork for system observability and performance tracking in future sprints. Routes and handlers were modularized further, and response consistency was improved across endpoints. With these additions, Impacta now offers a more interactive and responsive experience, backed by robust backend operations and proactive communication features. 


---

### Feature Highlights

| Feature | Description | Trigger Event |
|--------|-------------|----------------|
| **Welcome Email** | Sends a personalized welcome message to new users with Impacta branding and message styling. | On successful user registration |
| **Campaign Created Email** | Notifies campaign creators that their campaign has been created and provides a link to their campaign dashboard. | On successful campaign creation |

---

### Backend Integration

| Issue # | Task Description | Assigned To | Status |
|---------|------------------|-------------|--------|
 | *Backend Tasks* |                                                                                                  |                     | 
| S4-B01 | Integrate SMTP-based email notifications using `net/smtp` | Shruthi | ✅ Completed |
| S4-B02 | Trigger welcome email upon user registration | Shruthi | ✅ Completed |
| S4-B03 | Trigger campaign confirmation email with campaign details and dashboard link | Shruthi | ✅ Completed |
| S4-B04  | Set up Go metrics endpoints for Prometheus integration                                            | Chandan     | ✅ Completed |
| S4-B05  | Integrate Prometheus and configure Grafana dashboards                                             | Chandan     | ✅ Completed |
| S4-B06  | Add **Go Metrics Dashboard** in Grafana for request tracking                                      | Chandan     | ✅ Completed |
| S4-B07  | Add **Node Exporter Dashboard** for server performance insights                                   | Chandan     | ✅ Completed |
| S4-B08  | Add **System Health Dashboard** for CPU, memory, and disk monitoring                              | Chandan     | ✅ Completed |
 | *Frontend Tasks* |                                                                                                  |                     | 
 | S4-F01   | Add Real-Time Campaign Search: Search bar filters campaigns by title/description instantly (no API call).     | Deepthi         | ✅ Completed |
| S4-F02   | Add Category Filter Tabs: Tabs for categories like education, health, etc. for quick filtering.                | Deepthi         | ✅ Completed |
| S4-F03   | Add Status Toggle Filters: Toggle buttons to filter by campaign status (pending / active / inactive).         | Deepthi         | ✅ Completed |
| S4-F04   | Implement Social Share Button: Allow users to share campaigns via WhatsApp, Twitter, or Instagram.            | Deepthi         | ✅ Completed |
| S4-F05    | Developed “Ask Question” form with fields (question, type, priority, optional campaign), inline validation, and POST integration to support API | Vennela     | ✅ Completed |
| S4-F06    | Created Support Ticket Dashboard for admins to view and answer tickets with inline editing and status update                                     | Vennela     | ✅ Completed |
| S4-F07    | Implemented “My Questions” tab to show user’s submitted tickets and dynamic answer visibility after admin updates                               | Vennela     | ✅ Completed |
| S4-F08    | Built static FAQs tab loading common questions from `/api/faqs`, added filters by Type and Priority for better user experience                 | Vennela     | ✅ Completed |
| S4-F09    | Added Vitest unit tests and Cypress E2E tests for support ticket form, dashboard views, admin answer flow, and user ticket updates             | Vennela     | ✅ Completed |

---

### 📧 Email Template Overview

Emails are sent in **HTML format** with inline CSS for enhanced readability and aesthetics. Templates include:

- ✅ Clean typography
- ✅ Responsive layout
- ✅ Dynamic content injection (e.g., user name, campaign title, deadline)
- ✅ Fallback styling for email clients

### ⚙️ Backend Technical Details

- **SMTP Provider:** Gmail (via `smtp.gmail.com:587`)
- **Authentication:** `smtp.PlainAuth` with credentials from environment variables
- **Email Logic File:** `utils/email.go`
- **Integration Points:** `controllers/user_controller.go`, `controllers/campaign_controller.go`
- **Non-blocking Sending:** Email sending runs in a background goroutine to avoid blocking API responses

To strengthen infrastructure monitoring, we integrated **Prometheus and Grafana** with support for **Go metrics exposure** and **node-level system diagnostics**. Three detailed Grafana dashboards were created:

- **Go App Metrics Dashboard** – for monitoring HTTP request rates, latencies, and error counts.
- **Node Exporter Dashboard** – for viewing real-time hardware metrics such as CPU usage, memory, disk I/O.
- **System Health Dashboard** – for analyzing system-level performance including CPU load, RAM usage, and network bandwidth.

---

 ## 👥 Contributors

- **Vennela** - Frontend Development
- **Deepthi** - Frontend Development
- **Chandan** - Backend Development
- **Shruthi** - Backend Development

## 🎬 Frontend Walkthrough Video
📽️ Watch the full frontend walkthrough here: [Frontend Walkthrough Video](https://youtu.be/ETTYZHYcN4E)



## 🎬 Backend Walkthrough Video
📽️ Watch the full backend walkthrough here: [Backend Walkthrough Video](https://youtu.be/yIxtH9PpRfg)


🚀 **Impacta - Empowering Small Causes, One Donation at a Time!**
