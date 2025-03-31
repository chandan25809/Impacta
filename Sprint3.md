# 🌟 Impacta - Crowdfunding for Small Causes
Impacta is a crowdfunding platform designed to help individuals contribute to **meaningful causes**, ensuring transparency and ease of donation.

---

## 🚀 Project Overview (Sprint 3)

In Sprint 3, we significantly enhanced our crowdfunding platform by integrating advanced analytics on the frontend and expanding robust API functionalities on the backend. On the frontend, we developed a comprehensive Admin Analytics Dashboard that features four key visualizations: a grouped bar chart displaying campaign performance by category (segregating approved, pending, and completed campaigns), a line chart that illustrates campaign creation trends over time, a donut chart that visualizes campaign success distribution, and a point chart that presents daily revenue by category. Additionally, we refined the navigation system by introducing both right-side and left-side navigation panels to manage restricted and unrestricted routes, while also enhancing the campaigns dashboard to allow admin-exclusive editing capabilities. On the backend, we extended functionality by implementing full CRUD endpoints for notifications, support tickets, payment transactions, and withdrawals—with role-based restrictions for critical updates and bulk deletions—and created comprehensive unit tests to ensure stability. These improvements collectively provide a dynamic, data-driven experience that enables efficient campaign management, robust communication, and secure financial tracking across the platform.
 
 ---
 
 
 ## 🏆 Sprint 3 Breakdown
 
 | Issue # | Task Description                                                                                                  | Assigned To         | Status        |
 |---------|-------------------------------------------------------------------------------------------------------------------|---------------------|---------------|
 | *Frontend Tasks* |                                                                                                  |                     |               |
 | S3-F01  | Created the Admin Analytics Dashboard with four key charts.                                             | Vennela             | ✅ Completed  |
| S3-F02  | Developed a grouped bar chart for Campaign Performance by Category (displaying counts of Approved, Pending, and Completed campaigns per category).                            | Vennela             | ✅ Completed  |
| S3-F03  | Developed a line chart for Campaign Creation Trends over time.                                                    | Vennela             | ✅ Completed  |
| S3-F04  | Developed a donut chart for Campaign Success Distribution                                                       | Vennela             | ✅ Completed  |
| S3-F05  | Developed a point (scatter) chart for Daily Revenue by Category                               | Vennela             | ✅ Completed  |
| S3-F06  | Integrated right-side navigation with API endpoints for notifications                                                                   | Vennela             | ✅ Completed  |
| S3-F07  | Created a left-side navigation panel for handling restricted and unrestricted routes.                                         | Deepthi             | ✅ Completed  |
| S3-F08  | Developed a Campaigns Dashboard where admin users can edit (approve/reject) campaigns and regular users have view-only access.                               | Deepthi             | ✅ Completed  |
| S3-F09  | Implemented admin functionality to edit campaigns (status updates defaulting to Pending with options to approve/reject). | Deepthi             | ✅ Completed  |
| S3-F10  | Implemented admin functionality to edit donations (status updates defaulting to Pending with options to approve/reject).                    | Deepthi             | ✅ Completed  |
| S3-F11  | Integrated long-press functionality on dashboard chart components for improved interactivity.                                          | Vennela             | ✅ Completed  |
| S3-F12  | Developed unit tests for the Analytics Dashboard components using Vitest and React Testing Library.                                                                             | Vennela             | ✅ Completed  |
| S3-F13  | Developed end-to-end tests for the Analytics Dashboard using Cypress                                                                      | Vennela             | ✅ Completed  |
 | *Backend Tasks*  |                                                                                                  |                     |               |
 | S3-B01      | Implement full CRUD endpoints for Notifications                                                            | Chandan         | ✅ Completed  |
| S3-B02      | Create unit tests for Notifications endpoints                                                              | Chandan         | ✅ Completed  |
| S3-B03      | Implement full CRUD endpoints for Support Tickets (including query & answer fields, with role checks)       | Chandan         | ✅ Completed  |
| S3-B04      | Create unit tests for Support Tickets endpoints                                                            | Chandan         | ✅ Completed  |
| S3-B05      | Implement full CRUD endpoints for Payment Transactions (admin-only update & bulk delete)                     | Shruthi         | ✅ Completed  |
| S3-B06      | Create unit tests for Payment Transactions endpoints                                                       | Shruthi         | ✅ Completed  |
| S3-B07      | Implement full CRUD endpoints for Withdrawals (admin-only update & bulk delete)                             | Shruthi         | ✅ Completed  |
| S3-B08      | Create unit tests for Withdrawal endpoints                                                                 | Shruthi         | ✅ Completed  |
 
 
### Sprint 3 Backend Development Summary

- Implemented full CRUD endpoints for *Notifications* with secure, role-based access control.
- Developed comprehensive *Support Tickets* endpoints with extended fields (query & answer) and restricted answer updates to admins.
- Added full CRUD functionality for *Payment Transactions*, including admin-only updates and bulk deletion.
- Created complete endpoints for *Withdrawals* to manage campaign fund disbursements with admin-controlled updates.
- Integrated unit tests for all new endpoints, improving error handling and logging for enhanced backend reliability.
 
 
 ### Frontend Development Summary
 
 Key improvements include:
 
 - *Comprehensive Dashboard:* Developed a detailed dashboard that displays all campaign and donation details, offering a complete view of platform activity.
 - *Unified Analytics:* Seamless Integrated a single analytics dashboard with four key graphs—grouped bar chart, line chart, donut chart, and point chart—to provide a holistic view of campaign performance and revenue trends.
 - *Real-Time API Integration:* Enabled dynamic data fetching so that campaign, donation, and notification information is updated in real time.
 - *Enhanced Navigation:* Implemented both right-side and left-side navigation panels to improve user flow and manage restricted versus unrestricted routes.
 - *Admin-Exclusive Editing:* Added functionality that allows only administrators to edit, approve, or reject campaigns and donations, ensuring controlled and secure data management.
 
 
 ---
 
 ## 👥 Contributors
 
 - *Vennela* - Frontend Development
 - *Deepthi* - Frontend Development
 - *Chandan* - Backend Development
 - *Shruthi* - Backend Development
 
   ## 🎬 Frontend Walkthrough Video
 📽️ Watch the full frontend walkthrough here: [Frontend Walkthrough Video](https://youtu.be/Rl5WHgtAUi4)
 
 ## 🎬 Backend Walkthrough Video
 📽️ Watch the full backend walkthrough here: [Backend Walkthrough Video](https://www.youtube.com/watch?v=25DhEfzo-fY)
 
 
 🚀 *Impacta - Empowering Small Causes, One Donation at a Time!*
