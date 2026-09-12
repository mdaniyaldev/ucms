<div align="center">

# 🎓 University Complaint Management System (UCMS)

**A role-based platform for submitting, routing, and resolving university complaints — with real-time SMS and email notifications.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=vercel)](https://ucms-nu.vercel.app)
[![React](https://img.shields.io/badge/React.js-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white)](https://www.twilio.com/)

[**🔗 View Live Demo**](https://ucms-nu.vercel.app) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📖 Overview

UCMS lets students and faculty/staff submit complaints through a simple interface, which are then automatically routed to the relevant Department Coordinator based on category, with auto-escalation to Admin/University Management if unresolved within the defined timeframe. Each role gets its own dashboard, and users stay informed at every step via **SMS** and **email** notifications.

🚀 **Deployed and live on Vercel** — [try it here](https://ucms-nu.vercel.app).

✅ **Project Status:** Completed — developed across FYP 1 and FYP 2, and successfully evaluated as a Final Year Project.

## ✨ Features

| | |
| --- | --- |
| 🔐 **Authentication & Protected Routes** | Secure sign-in with access restricted by user role |
| 🧑‍🤝‍🧑 **Role-Based Dashboards** | Dedicated views for Students, Faculty/Staff, Department Coordinators, and Admin/University Management |
| 🔄 **Complaint Routing & Escalation** | Complaints are auto-routed to the relevant department, with status tracking (Pending → In Progress → Resolved) and automatic escalation if unresolved within the deadline |
| 🗃️ **Full CRUD Functionality** | Create, read, update, and manage complaints, backed by PostgreSQL |
| 📎 **Evidence Upload** | Attach photos/documents to complaints for more accurate reporting |
| 📊 **Analytics Dashboard** | Admin-facing view of complaint statistics for transparency and accountability |
| ⭐ **Feedback & Rating System** | Students can rate and give feedback on resolved complaints |
| 💡 **Suggestion Box & Polls** | Students can submit suggestions; admins can create polls for improvements |
| 🌐 **Multilingual Support** | Interface available in English and Urdu |
| 🧠 **AI-Powered Analytics** | Insights into recurring issues, department-wise complaint trends, and average resolution time |
| 📲 **SMS Notifications** | Real-time status updates sent via Twilio |
| 📧 **Transactional Emails** | Automated email notifications via Resend |
| 📱 **Responsive UI** | Built with Tailwind CSS and shadcn/ui for a consistent experience across devices |
| 🧪 **API Testing** | Endpoints validated with Postman during development |

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React.js, Tailwind CSS, shadcn/ui |
| Backend / Data | Supabase, PostgreSQL |
| Notifications | Twilio (SMS), Resend (Email) |
| Auth | Supabase Authentication |
| Tooling | Vite, Postman |
| Deployment | Vercel |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- A Supabase project (URL + API keys)
- Twilio account (for SMS notifications)
- Resend account (for transactional email)

### Installation

```bash
# Clone the repository
git clone https://github.com/mdaniyaldev/ucms.git
cd ucms

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_sms_number
RESEND_API_KEY=your_resend_api_key
```

> Adjust variable names to match how they're referenced in the codebase.

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
ucms/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/            # Route-level pages / dashboards
│   ├── lib/               # Supabase client, helpers, utilities
│   ├── hooks/            # Custom React hooks
│   └── App.jsx
├── public/
├── .env
└── package.json
```

> Update this structure to match your actual folder layout.

## 👥 Roles & Permissions

| Role | Access |
| --- | --- |
| 🎓 Student | Submit complaints, attach evidence, track status of own complaints |
| 🧑‍🏫 Faculty/Staff | Report issues related to their department |
| 🧑‍💼 Department Coordinator | Receive and resolve complaints for their department |
| 🛡️ Admin/University Management | Monitor all complaints, view analytics, and oversee department performance |

## 🗺️ Roadmap / Possible Improvements

All features proposed for FYP 1 and FYP 2 have been implemented. Potential future enhancements beyond the original scope:

- [ ] Additional export/reporting options for admin analytics
- [ ] Further UI/UX refinements based on user feedback

## 🤝 Contributing

This is currently a personal/academic project (Final Year Project). Suggestions and feedback are welcome via issues or pull requests.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 📬 Contact

**Muhammad Daniyal**

[![Email](https://img.shields.io/badge/Email-mdaniyal.tech%40gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:mdaniyal.tech@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-mdaniyaldev-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/mdaniyaldev)

---

<div align="center">

⭐ If you found this project interesting, consider giving it a star!

</div>
