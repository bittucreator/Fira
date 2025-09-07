# Fira - AI-Powered Notes App

A beautiful, Notion-inspired notes application built with Electron, React, and AI capabilities. Create, edit, and enhance your notes with the power of artificial intelligence.

![Fira Notes App](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🎨 Beautiful Design
- **Notion-inspired UI** with authentic color palette
- **Dark/Light mode** support
- **Responsive design** that works on all screen sizes
- **Smooth animations** and transitions

### 🤖 AI-Powered Features
- **Grammar correction** - Fix grammar and spelling errors
- **Content summarization** - Generate concise summaries
- **Text expansion** - Expand ideas and add details
- **Style conversion** - Switch between professional and casual tones
- **Smart suggestions** - AI-powered writing assistance

### 📝 Note Management
- **Create and organize** notes effortlessly
- **Real-time sync** with Supabase backend
- **Search functionality** to find notes quickly
- **Rich text editing** with markdown support
- **Auto-save** to never lose your work

### 🔐 Authentication
- **Google OAuth** integration
- **Secure login** with Supabase
- **User data protection** and privacy

## 🚀 Tech Stack

- **Frontend**: React 18.2.0 + JavaScript
- **Desktop**: Electron 32.0.0
- **Styling**: Tailwind CSS 3.3.5 + Shadcn/ui
- **Backend**: Supabase (Authentication & Database)
- **AI**: OpenAI GPT integration
- **Build**: Webpack 5 + Babel

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/bittucreator/Fira.git
   cd Fira
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📦 Scripts

- `npm run dev` - Start development server (React + Electron)
- `npm run dev-react` - Start React development server only
- `npm run dev-electron` - Start Electron app only
- `npm run build` - Build for production
- `npm run build-react` - Build React app
- `npm run electron` - Start Electron in production mode

## 🏗️ Project Structure

```
Fira/
├── electron/           # Electron main process files
│   ├── main.js        # Main Electron process
│   ├── preload.js     # Preload script
│   └── utils.js       # Utility functions
├── src/               # React source code
│   ├── components/    # React components
│   │   ├── LoginPage.jsx
│   │   └── NotesApp.jsx
│   ├── lib/          # Service libraries
│   │   ├── ai-service.js
│   │   ├── notes-service.js
│   │   └── supabase.js
│   ├── types/        # Type definitions
│   ├── App.js        # Main App component
│   ├── globals.css   # Global styles with Notion colors
│   └── index.js      # React entry point
├── public/           # Static assets
├── package.json      # Dependencies and scripts
└── webpack.config.js # Webpack configuration
```

## 🎨 Design System

The app uses an authentic Notion color palette:

### Light Mode Colors
- **Default**: #373530 (text) / #FFFFFF (background)
- **Blue**: #487CA5 / #E9F3F7
- **Green**: #548164 / #EEF3ED
- **Yellow**: #C29343 / #FAF3DD
- **Purple**: #8A67AB / #F6F3F8
- **Pink**: #B35488 / #F9F2F5

### Dark Mode Colors
- **Default**: #D4D4D4 (text) / #191919 (background)
- **Blue**: #447ACB / #1F282D
- **Green**: #4F9768 / #242B26
- **And corresponding dark variants...**

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Notion](https://notion.so) for design inspiration
- [Supabase](https://supabase.com) for backend services
- [OpenAI](https://openai.com) for AI capabilities
- [Shadcn/ui](https://ui.shadcn.com) for beautiful components

## 📧 Contact

**Venkat** - bittucreators@gmail.com

Project Link: [https://github.com/bittucreator/Fira](https://github.com/bittucreator/Fira)

---

**Built with ❤️ and AI**
