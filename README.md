# Context-Aware Proofreader

AI-powered proofreading demos with context-aware correction and intelligent dictionary generation using Chrome's built-in AI APIs.

## 🚀 Live Demo

**GitHub Pages**: [https://yashrajbharti.github.io/Context-Aware-Proofreader/](https://yashrajbharti.github.io/Context-Aware-Proofreader/)

## ✨ Features

- **Basic Proofreader**: Inspired by Thomas Steiner's work using Prompt API
- **Advanced Proofreader Demo**: Comparing Proofreader API vs Prompt API
- **Context-Aware Proofreader**: Automatic topic detection with smart dictionary generation
- **AI Word Generation**: Topic detection and context word generation technology

## 🛠️ Development

### Prerequisites

- Chrome Canary (for AI API support)
- Any static file server (Live Server extension, Python http.server, etc.)

### Quick Start

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yashrajbharti/Context-Aware-Proofreader.git
   cd Context-Aware-Proofreader
   ```

2. **Serve the files**:
   - **VS Code**: Use "Go Live" with Live Server extension
   - **Python**: `python3 -m http.server 8000`
   - **Node**: `npx serve .`
   - **Any static server**: Point to the project root

3. **Open in browser**: Your server URL (e.g., <http://localhost:8000>)

## 🏗️ Architecture

This project uses:

- **Material Web Components** (pre-bundled in `dist/` folder)
- **Chrome's AI APIs** (Proofreader & Prompt APIs)
- **Static file serving** (no build system required)

### Project Structure

The Material Web components are pre-built and included in the `dist/` folder, so no npm installation or build process is required. Just serve the files statically and it works!

## 📁 Project Structure

```
├── dist/                    # Pre-built Material Web components
├── proofreader/            # Basic proofreader demo
├── proofreader-demo/       # API comparison demo  
├── demo-context/           # Context-aware proofreader
├── demo-generate/          # Word generation demo
├── index.html             # Main landing page
└── styles.css             # Global styles
```

## 🚢 Deployment

### GitHub Pages Setup

1. Go to repository Settings → Pages
2. Source: "Deploy from a branch"  
3. Branch: `main` / `/ (root)`
4. The site will be available at your GitHub Pages URL

No build process needed! The project runs directly from the repository files.

## 🔧 Browser Requirements

- **Chrome Canary** with AI APIs enabled
- Secure context (HTTPS) required for AI APIs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Inspired by Chrome team's [AI Experiments](https://github.com/GoogleChromeLabs/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make changes and test locally
4. Submit a pull request

---

**Note**: This project requires Chrome's experimental AI APIs which are currently only available in Chrome Canary with appropriate flags enabled.
