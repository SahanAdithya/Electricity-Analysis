# ⚡ Electricity Analyst

A premium, high-performance energy intelligence platform designed to help users track, analyze, and optimize their electricity consumption. Built with a focus on visual excellence, sustainability, and data security.

![Vercel Deployment](https://img.shields.io/badge/Vercel-Live-brightgreen?style=for-the-badge&logo=vercel)
![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-OLED--Ready-blue?style=for-the-badge&logo=tailwind-css)

---

## 🚀 Live Demo
Check out the live application here:  
👉 [https://electricity-analysis-2zyk.vercel.app](https://electricity-analysis-2zyk.vercel.app)

---

## ✨ Key Features

### 📊 Energy Intelligence Dashboard
*   **Real-time Tracking**: Monitor current consumption metrics and cost trends.
*   **Visual Analysis**: Interactive charts showing kWh usage vs. cost over time.
*   **Efficiency Grading**: Automatic "A+ to C" grading based on consumption trends.

### 🌍 Sustainability & Impact
*   **Carbon Footprint**: Real-time calculation of CO2 emissions based on usage.
*   **Tree-Offset Metric**: Visualizing your environmental impact in "trees needed" to offset usage.
*   **Eco-Score**: Actionable potential scores to encourage energy reduction.

### 💰 Financial Management
*   **Budget Tracking**: Set monthly limits and track spending in real-time.
*   **Price Hike Detection**: Automatic alerts when utility rates increase between bills.
*   **Bill Management**: Track "Paid" vs. "Unpaid" status with a dedicated calendar view.

### 🛡️ Privacy & Security
*   **Fort Knox Security**: All data is stored in AES-256 encrypted vaults via Supabase.
*   **Secure Auth**: Industry-leading authentication powered by Clerk.
*   **Zero Sharing Policy**: We never sell or share your energy usage patterns.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (Turbopack enabled)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom OLED Dark Mode system)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [Supabase](https://supabase.com/)
- **AI Insights**: [Google Gemini AI](https://deepmind.google/technologies/gemini/)
- **Email Notifications**: [Resend](https://resend.com/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/home-bill-tracker.git
   cd home-bill-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   RESEND_API_KEY=your_resend_api_key
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 📖 How it Works

1.  **Sign Up**: Create an account via Clerk to secure your data.
2.  **Log Usage**: Enter your latest electricity bill data (Amount, kWh, Date).
3.  **Analyze**: View your consumption trends and environmental impact instantly.
4.  **Optimize**: Use the Appliance Breakdown tool to identify high-energy devices and set reduction goals.
5.  **Export**: Download PDF or CSV reports for your records.

---

## 📝 License
This project is for educational purposes. Feel free to use and modify it for your own personal bill tracking.

---

*Developed with ❤️ for a more sustainable future.*
