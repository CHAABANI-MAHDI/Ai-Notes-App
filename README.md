<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>



# 📝 AI Notes App

A modern, full-stack note-taking application with AI-powered features built with React, TypeScript, Tailwind CSS, Supabase backend for secure storage, and Google AI Studio (Gemini API) for intelligent text enhancement.

![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Tailwind%20CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)
![Google%20AI](https://img.shields.io/badge/Google%20AI-Gemini-EA4335?logo=google)

## ✨ Features

### 📱 Core Features

- **Create & Edit Notes** - Rich text editor with Quill support
- **Note Organization** - View notes in grid or list format
- **Search & Filter** - Quick note search and filtering
- **Dark Mode** - Beautiful dark theme with CSS variables
- **Responsive Design** - Mobile-first, works seamlessly on all devices

### 🤖 Google AI Features

- **AI-Powered Text Enhancement** - Improve notes using Google Gemini API
- **Smart Suggestions** - Get intelligent writing suggestions
- **Content Optimization** - Enhance clarity and readability
- **Powered by Google AI Studio** - Enterprise-grade AI capabilities

### 🔐 Authentication & Security

- **Supabase Auth** - Secure user authentication
- **Private Storage** - Encrypted image storage in Supabase
- **Password Reset** - Secure password reset flow
- **Account Management** - User profile and account deletion

### 🖼️ Image Optimization

- **Signed URL Caching** - 55-minute TTL for faster image loads
- **Lazy Loading** - Images load on-demand
- **Responsive Images** - Automatically scaled for different screen sizes

### 🗑️ Note Management

- **Multi-Select Delete** - Bulk delete with confirmation modals
- **Single Note View** - Detailed note view with attachments
- **Edit & Update** - Full note editing capabilities
- **Attachment Support** - Upload and manage note attachments

## 🛠️ Tech Stack

### Frontend

- **React 19.2.4** - UI framework
- **TypeScript 5.8** - Type safety
- **Tailwind CSS 3** - Styling with dark mode support
- **Vite 6.2** - Lightning-fast build tool
- **React Router DOM 7.13** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Quill Editor** - Rich text editing (via CDN)

### AI & Integration

- **Google AI Studio (Gemini API)** - Advanced text enhancement
- **Supabase JS Client** - Backend integration library

### Database & Auth

- **Supabase** - PostgreSQL database, Auth, Storage
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Database-level access control

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase account ([Sign up here](https://supabase.io))
- Google AI Studio account ([Access here](https://ai.google.dev)) - for Gemini API

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/CHAABANI-MAHDI/AI-Notes-App.git
   cd ai-notes
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local` file for frontend:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_google_ai_studio_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
ai-notes/
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── SignIn.tsx
│   │   │   ├── SignUp.tsx
│   │   │   └── ResetPassword.tsx
│   │   └── dashboard/
│   │       ├── Home.tsx
│   │       ├── MyNotes.tsx
│   │       ├── SingleNote.tsx
│   │       └── CreateNote.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Editor.tsx
│   │       ├── Input.tsx
│   │       ├── StorageImage.tsx
│   │       └── ThemeToggle.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── layouts/
│   │   └── DashboardLayout.tsx
│   ├── services/
   │   ├── aiService.ts (Google Gemini integration)
   │   ├── noteService.ts
   │   └── storageService.ts
   ├── App.tsx
   └── index.tsx
```

## 🎯 Features in Detail

### Multi-Select Delete

- In MyNotes, select multiple notes with checkboxes
- Click "Delete Selected" button
- Confirm in modal dialog
- All selected notes deleted instantly

### Image Optimization

- Signed URLs cached for 55 minutes
- Reduces Supabase API calls
- Lazy loading for faster page loads
- Responsive scaling for all devices

### Dark Mode

- Toggle between light and dark themes
- Smooth transitions
- Persistent user preference
- Optimized colors for readability

## 📱 Responsive Design

- **Mobile** (< 640px) - Single column, optimized touch
- **Tablet** (640px - 1024px) - 2 columns, balanced layout
- **Desktop** (> 1024px) - 3 columns, full featured

## 🔐 Security Features

- Row Level Security on database tables
- Private image storage with signed URLs
- Password reset with email verification
- Secure session management
- Environment variable protection

## 🐛 Troubleshooting

### Images Not Loading

- Verify Supabase credentials in `.env.local`
- Check storage bucket permissions

### AI Features Not Working

- Ensure GEMINI_API_KEY is set in `.env.local`
- Get your key from [Google AI Studio](https://ai.google.dev)
- Verify Gemini API is enabled in your Google Cloud project

### Authentication Issues

- Check that Supabase credentials are correct
- Verify user is authenticated before accessing protected routes
- Check browser console for detailed error messages

## 📈 Performance Optimizations

- **React Memoization** - useCallback, useMemo for optimization
- **Code Splitting** - Lazy loaded routes
- **Image Caching** - Signed URL TTL (55 minutes)
- **Debounced Search** - Smooth search experience
- **Lazy Loading** - On-demand component loading

## 🤝 Contributing

Contributions welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License - Open source and free to use

## 👨‍💻 Author

**Mahdi Chaabani**

- GitHub: [@CHAABANI-MAHDI](https://github.com/CHAABANI-MAHDI)
- Project: [AI-Notes-App](https://github.com/CHAABANI-MAHDI/AI-Notes-App)

## 🎉 Getting Started Tips

1. **Configure Supabase** - Set up your database and auth
2. **Add Gemini API Key** - Enable AI features in your app
3. **Start Creating Notes** - Build your note collection
4. **Use Dark Mode** - Better for extended sessions
5. **Explore AI Features** - Enhance your notes with Gemini

---

**Made with ❤️ by Mahdi Chaabani** | Built with Supabase & Google AI Studio | Ready for intelligent note-taking!
