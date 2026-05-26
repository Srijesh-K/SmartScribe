# AI Notes Generator 📚🤖

An AI-powered Notes Generator that helps students and professionals quickly convert study materials into concise notes and interactive quizzes.

## 🚀 Features

- 📄 Upload PDF documents
- 🎙️ Upload audio recordings
- 📝 Automatic note generation using AI
- ✨ Smart text summarization
- ❓ AI-generated quizzes from uploaded content
- 📚 Organized study material management
- 📥 Download generated notes
- 🌐 User-friendly interface

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- TypeScript
- Vite

### Backend
- Node.js
- Express.js

### AI Integration
- OpenAI API / Gemini API

### Database
- MongoDB

### Storage
- Cloudinary / Local Storage

---

## 📂 Project Structure

```text
AI-Notes-Generator/
│
├── public/
│   ├── favicon.ico
│   └── assets/
│
├── src/
│   │
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   ├── PDFUploader/
│   │   ├── AudioUploader/
│   │   ├── NotesViewer/
│   │   ├── QuizGenerator/
│   │   ├── QuizCard/
│   │   └── LoadingSpinner/
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Upload.jsx
│   │   ├── Notes.jsx
│   │   ├── Quiz.jsx
│   │   └── About.jsx
│   │
│   ├── services/
│   │   ├── aiService.js
│   │   ├── pdfService.js
│   │   ├── audioService.js
│   │   └── quizService.js
│   │
│   ├── hooks/
│   │   └── useUpload.js
│   │
│   ├── utils/
│   │   ├── fileParser.js
│   │   ├── textFormatter.js
│   │   └── helpers.js
│   │
│   ├── context/
│   │   └── AppContext.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── server/
│   │
│   ├── controllers/
│   │   ├── notesController.js
│   │   ├── audioController.js
│   │   └── quizController.js
│   │
│   ├── routes/
│   │   ├── notesRoutes.js
│   │   ├── audioRoutes.js
│   │   └── quizRoutes.js
│   │
│   ├── services/
│   │   ├── aiService.js
│   │   ├── speechToText.js
│   │   └── summarizer.js
│   │
│   ├── middleware/
│   │   ├── uploadMiddleware.js
│   │   └── errorHandler.js
│   │
│   ├── models/
│   │   └── Notes.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── uploads/
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── LICENSE
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/AI-Notes-Generator.git
cd AI-Notes-Generator
```

### Install Dependencies

Frontend:

```bash
npm install
```

Backend:

```bash
cd server
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
OPENAI_API_KEY=your_api_key
```

### Start Development Server

Frontend:

```bash
npm run dev
```

Backend:

```bash
cd server
npm start
```

---

## 📖 How It Works

1. Upload a PDF document or audio file.
2. The system extracts text from the uploaded content.
3. AI summarizes the extracted information into structured notes.
4. Users can review, edit, and download notes.
5. The AI generates quizzes based on the summarized content.
6. Users can test their understanding through interactive quizzes.

---

## 🎯 Future Enhancements

- User Authentication
- Dark Mode
- Flashcard Generation
- Multi-language Support
- Voice-based Quiz Mode
- Export Notes as PDF/DOCX
- Study Progress Tracking
- AI Chat Assistant for Notes

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Srijesh K**

Computer Science Engineer | AI & Full-Stack Developer

If you found this project useful, consider giving it a ⭐ on GitHub!
