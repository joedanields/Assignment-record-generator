# 📝 Assignment Record Generator

A modern web application for generating professional Python programming assignment submission records in PDF format. Built with React and Vite, this tool allows students to submit their assignments with code, images, and justifications, automatically generating a structured PDF document with comprehensive rubrics.

![React](https://img.shields.io/badge/React-19.1.1-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.12-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **📄 Professional PDF Generation**: Create structured assignment PDFs with cover page, question pages, and comprehensive rubrics
- **💻 Code Input with Syntax Highlighting**: Enter Python code with proper formatting and syntax highlighting
- **🖼️ Image Upload Support**: Attach screenshots, diagrams, or output images for each question
- **✍️ Justification Section**: Explain your approach and reasoning for each solution
- **📊 Comprehensive Rubrics**: Automated marking criteria table for all 5 questions with:
  - VAO (Variable, Assignment, Operation) - 2 marks
  - Sequence - 2 marks
  - Conditionals - 2 marks
  - Iteration - 2 marks
  - Functions - 2 marks
  - Total: 10 marks per question
- **👨‍🏫 Evaluator Section**: Dedicated space for evaluator details (name, date, signature, remarks)
- **🎨 Modern UI**: Clean, responsive interface built with Tailwind CSS
- **📱 Drag & Drop**: Intuitive file upload with drag-and-drop support
- **🚀 Fast Development**: Lightning-fast HMR with Vite

## 📋 Assignment Questions

The application includes 5 Python programming questions covering fundamental concepts:

1. **Temperature Converter** (VAO & Sequence)
2. **Box Volume Calculation** (VAO, Sequence & Functions)
3. **Number Classification** (VAO, Conditionals & Functions)
4. **Pattern Printing** (VAO, Iteration & Functions)
5. **Simple Interest Function** (VAO, Functions & Sequence)

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/joedanields/Record_Generator_Custom.git
   cd Assignment-record-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This will automatically install client dependencies as well.

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized production build will be created in the `Client/dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI library with hooks
- **Vite 7.1.2** - Next-generation build tool
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **React Router DOM 7.8.2** - Client-side routing

### PDF Generation
- **jsPDF 3.0.2** - Client-side PDF generation
- **html2canvas 1.4.1** - HTML to canvas conversion for images

### File Handling
- **react-dropzone 14.3.8** - Drag-and-drop file uploads

### Code Display
- **react-syntax-highlighter 15.6.6** - Syntax highlighting for code blocks

## 📁 Project Structure

```
Assignment-record-generator/
├── Client/                          # Frontend application
│   ├── src/
│   │   ├── pages/
│   │   │   └── Template.jsx        # Main form and PDF generation logic
│   │   ├── assets/                 # Images and static assets
│   │   ├── App.jsx                 # Root component
│   │   ├── main.jsx                # Application entry point
│   │   └── index.css               # Global styles
│   ├── public/                     # Public assets
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite configuration
│   ├── eslint.config.js            # ESLint configuration
│   └── package.json                # Client dependencies
├── package.json                     # Root package configuration
└── README.md                        # Project documentation
```

## 📖 Usage Guide

1. **Fill Student Information**
   - Enter student name, registration number, and roll number
   - Fill in course details (code, title, semester, batch)

2. **Answer Each Question**
   - Write your Python code in the code editor
   - Upload a screenshot or output image (optional)
   - Provide a detailed justification of your approach

3. **Generate PDF**
   - Click the "Generate PDF" button
   - The PDF will be automatically downloaded with the structure:
     - Cover page with student details
     - 5 question pages (one per question)
     - Comprehensive rubrics page with all marking criteria
     - Evaluator section for assessment

## 🎨 PDF Output Structure

The generated PDF includes:

1. **Cover Page**
   - Institution logo
   - Course information
   - Student details
   - Assignment title

2. **Question Pages (5 pages)**
   - Question number and description
   - Student's code solution
   - Uploaded image/screenshot
   - Justification/explanation

3. **Comprehensive Rubrics Page**
   - Marking criteria for all 5 questions
   - Categories: VAO (2), Sequence (2), Conditionals (2), Iteration (2), Functions (2)
   - Subtotal for each question (10 marks)
   - Grand total (50 marks)
   - Evaluator section (name, date, signature, remarks)

## 🔧 Configuration

### Vite Configuration
Located in `Client/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### ESLint Configuration
Located in `Client/eslint.config.js` for code quality and consistency.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Author

**IPS Tech Community**

## 🙏 Acknowledgments

- Built for Python assignment submissions at IPS
- Designed to streamline the assignment submission and evaluation process
- Thanks to all contributors and users of this application

## 📞 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository:
[https://github.com/joedanields/Record_Generator_Custom](https://github.com/joedanields/Record_Generator_Custom)

---

**Made with ❤️ by IPS Tech Community**