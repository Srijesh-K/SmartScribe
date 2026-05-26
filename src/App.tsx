import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Layers, 
  Menu, 
  Plus, 
  Sparkles, 
  Trash2, 
  LayoutDashboard, 
  FileText, 
  Music, 
  Compass, 
  Settings, 
  ExternalLink,
  BrainCircuit,
  MessageSquareWarning,
  Loader2,
  X,
  PlusCircle,
  FolderMinus
} from "lucide-react";
import { NoteSession, QuizAttempt, QuizQuestion } from "./types";
import UploadZone from "./components/UploadZone";
import NotesViewer from "./components/NotesViewer";
import QuizView from "./components/QuizView";
import { motion, AnimatePresence } from "motion/react";

// Default Sample Session to maximize immediate comprehension and user delight
const SAMPLE_SESSION: NoteSession = {
  id: "sample-nn-notes",
  fileName: "Introduction_to_Neural_Networks.pdf",
  fileType: "pdf",
  fileSize: "1.2 MB",
  createdAt: new Date().toISOString(),
  title: "Introduction to Neural Networks & AI",
  summary: "An academic abstraction detailing artificial neural networks, backpropagation calculus gradients, and structural limits like vanishing gradients.",
  notesMarkdown: `# Introduction to Neural Networks & AI

Artificial neural networks (ANNs) are computational models inspired by the biological structure of brains. They form the bedrock of modern deep learning and generative artificial intelligence.

## 1. Core Mathematical Elements

Every artificial neuron takes inputs, computes a weighted sum, adds a bias term, and feeds the result into an activation function:

$$y = f\\left(\\sum_{i} w_i x_i + b\\right)$$

- **Weights ($w_i$)**: Control the strength or influence of specific inputs on the neuron.
- **Biases ($b$)**: Adjust the baseline trigger point for activation.
- **Activation Functions ($f$)**: Turn linear signals into non-linear signals.

### Activation Function Comparison
| Activation Function | Key Feature | Usage |
|---|---|---|
| **Sigmoid** | Smooth gradient, maps output precisely to (0,1) range | Probability generation & Binary |
| **ReLU** | Avoids vanishing gradient for positive values | Standard default inside Hidden Layers |
| **Softmax** | Multi-class outputs sum always equals 1.0 | Multi-class categorizations |

---

## 2. Training and Backpropagation

Training neural networks is the process of adjusting weights and biases to minimize a **Cost/Loss Function** (which measures the network's prediction errors). This is accomplished through two core steps:

1. **Forward Propagation**: Passing inputs through hidden layers to produce a final prediction.
2. **Backward Propagation (Backpropagation)**: Calculating the gradient of the loss function with respect to weights using the *multivariable calculus chain rule*.

> **Key Rule of Optimization**: Weights are iteratively updated via **Gradient Descent**:
> $$w \\leftarrow w - \\eta \\frac{\\partial L}{\\partial w}$$
> where $\\eta$ represents the "Learning Rate" hyperparameter.

---

## 3. Limits and Pitfalls

Modern deep models face multiple practical constraints:
- **Overfitting**: When the network memorizes noise in training data, scoring poorly on unseen test datasets. Prevented via *Dropout* or *Weight Regularization*.
- **Vanishing Gradients**: Occurs in deep architectures when gradients shrink exponentially as they propagate backward scale, halting the optimization process. ReLU largely mitigates this.`,
  keyConcepts: [
    { term: "Neural Network", definition: "A computational model inspired by the biological structure of brains, incorporating layers of interconnected units that process inputs and map relationships." },
    { term: "Backpropagation", definition: "A backward propagating gradient calculator using calculus chain rules to iteratively update network synapses (weights & biases) toward minimum loss." },
    { term: "Activation Function", definition: "A mathematical formula introducing non-linear transformations onto neuron metrics, permitting networks to grasp highly intricate target functions." },
    { term: "Learning Rate", definition: "A tuning hyperparameter governing step distance scaled along negative error slopes during gradient optimizations." }
  ],
  quiz: [
    {
      id: "q1",
      question: "Which activation function is widely integrated in hidden neural network layers to safeguard learning speed against vanishing gradients?",
      options: ["Sigmoid", "ReLU", "Softmax", "Tanh"],
      correctAnswer: "ReLU",
      explanation: "ReLU produces a constant gradient of 1 for any positive input, meaning derivatives are propagated down deep layers without suffering exponential decay."
    },
    {
      id: "q2",
      question: "Which mathematical mechanism produces appropriate backpropagation calculus adjustments through cascading composite layers?",
      options: ["The Calculus Chain Rule", "Fourier Transformation Matrix", "Taylor Series Approximations", "Vector Cross Multiplication"],
      correctAnswer: "The Calculus Chain Rule",
      explanation: "The calculus chain rule allows for computing derivative calculations of composite operations back step-by-step from output layer error back to the origin."
    },
    {
      id: "q3",
      question: "What occurs if the Learning Rate parameter is adjusted to a scale that is too large?",
      options: ["The network defaults to zero parameters", "Weight optimizations oscillate wildly or fail to converge to a minimum", "The activation function saturates to zero", "Dropout becomes non-functional"],
      correctAnswer: "Weight optimizations oscillate wildly or fail to converge to a minimum",
      explanation: "Too high a learning rate forces the optimizer to overshoot the valleys of the loss surface, generating diverging values or infinite parameter shifts."
    }
  ]
};

export default function App() {
  const [sessions, setSessions] = useState<NoteSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<'dashboard' | 'all-notes' | 'recent'>('dashboard');
  
  // API loading states
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Quiz assessment mode state
  const [isQuizMode, setIsQuizMode] = useState(false);

  // Initialize and load saved sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lumina_study_sessions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setSessions(parsed);
          setSelectedSessionId(parsed[0].id);
        } else {
          // If empty array, default in our Sample Session
          setSessions([SAMPLE_SESSION]);
          setSelectedSessionId(SAMPLE_SESSION.id);
        }
      } else {
        // Pre-populate on first load for optimal UI experience
        setSessions([SAMPLE_SESSION]);
        setSelectedSessionId(SAMPLE_SESSION.id);
        localStorage.setItem("lumina_study_sessions", JSON.stringify([SAMPLE_SESSION]));
      }
    } catch (e) {
      console.error("Local storage error:", e);
      setSessions([SAMPLE_SESSION]);
      setSelectedSessionId(SAMPLE_SESSION.id);
    }
  }, []);

  // Save sessions helper
  const saveSessions = (updated: NoteSession[]) => {
    setSessions(updated);
    localStorage.setItem("lumina_study_sessions", JSON.stringify(updated));
  };

  const activeSession = sessions.find(s => s.id === selectedSessionId);

  // Handle Note Synthesis response from server
  const handleFileUploaded = async (
    base64Data: string,
    mimeType: string,
    fileName: string,
    fileSize: string,
    fileType: 'pdf' | 'audio'
  ) => {
    setIsGeneratingNotes(true);
    setApiError(null);
    setIsQuizMode(false);

    try {
      const response = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Data, mimeType, fileName })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "File analysis failed. Make sure your GEMINI_API_KEY is configured in the Secrets panel.");
      }

      const parsedNotes = await response.json();

      const newSession: NoteSession = {
        id: "session-" + Date.now(),
        fileName,
        fileType,
        fileSize,
        createdAt: new Date().toISOString(),
        title: parsedNotes.title || "Untitled Lecture Note",
        summary: parsedNotes.summary || "",
        notesMarkdown: parsedNotes.notesMarkdown || "",
        keyConcepts: parsedNotes.keyConcepts || []
      };

      const updatedSessions = [newSession, ...sessions];
      saveSessions(updatedSessions);
      setSelectedSessionId(newSession.id);
      setActiveMenuTab('dashboard'); // Jump to main dashboard
    } catch (err: any) {
      console.error("Analysis generation error:", err);
      setApiError(err.message || "An unexpected networking or AI synthesis error occurred.");
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  // Handle Quiz generation base
  const handleGenerateQuiz = async () => {
    if (!activeSession) return;
    setIsGeneratingQuiz(true);
    setApiError(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeSession.title,
          notesMarkdown: activeSession.notesMarkdown,
          keyConcepts: activeSession.keyConcepts
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Quiz synthesis timed out. Try again.");
      }

      const quizQuestions = await response.json() as QuizQuestion[];

      // Bind to active session
      const updatedSessions = sessions.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            quiz: quizQuestions
          };
        }
        return s;
      });

      saveSessions(updatedSessions);
      setIsQuizMode(true);
    } catch (err: any) {
      console.error("Quiz generation error:", err);
      setApiError(err.message || "An issue popped up while compiling assessments.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Handle Quiz Completion
  const handleFinishQuiz = (attempt: QuizAttempt) => {
    // We could store metrics local or keep track.
    console.log("Quiz assess response complete:", attempt);
  };

  // Action: deletion of study notes
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    
    if (updated.length === 0) {
      saveSessions([SAMPLE_SESSION]);
      setSelectedSessionId(SAMPLE_SESSION.id);
    } else {
      saveSessions(updated);
      if (selectedSessionId === id) {
        setSelectedSessionId(updated[0].id);
      }
    }
    setIsQuizMode(false);
  };

  // Action: Make a clean session create trigger
  const handleAddNewManual = () => {
    setSelectedSessionId(""); // Clears current view, presenting clean source uploader
    setIsQuizMode(false);
  };

  return (
    <div id="app-viewport-wrapper" className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-0 z-40 lg:relative lg:translate-x-0 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:flex"}`}
      >
        {/* Logo and Brand */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shadow-indigo-200">
              L
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Lumina AI</span>
          </div>
          <button 
            type="button"
            className="lg:hidden p-1.5 hover:bg-slate-50 text-slate-400 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Actions */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Modes</p>
          
          <button
            id="nav-tab-dashboard"
            onClick={() => {
              setActiveMenuTab('dashboard');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left cursor-pointer
              ${activeMenuTab === 'dashboard'
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard Workspace</span>
          </button>

          <button
            id="nav-tab-all-notes"
            onClick={() => {
              setActiveMenuTab('all-notes');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left cursor-pointer
              ${activeMenuTab === 'all-notes'
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <span className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Study Materials</span>
            </span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-md font-mono text-slate-500 font-bold">
              {sessions.length}
            </span>
          </button>

          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">Personal Notebooks</p>

          <div className="space-y-1">
            {sessions.map(s => (
              <button
                id={`session-item-tab-${s.id}`}
                key={s.id}
                onClick={() => {
                  setSelectedSessionId(s.id);
                  setActiveMenuTab('dashboard');
                  setIsQuizMode(false);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition-all text-left group cursor-pointer
                  ${selectedSessionId === s.id && activeMenuTab === 'dashboard'
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {s.fileType === "pdf" ? (
                    <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  ) : (
                    <Music className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  )}
                  <span className="truncate">{s.title}</span>
                </div>
                
                {/* Delete option */}
                <button
                  id={`delete-btn-${s.id}`}
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove this session"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </button>
            ))}

            <button
              id="sidebar-add-source-btn"
              onClick={() => {
                handleAddNewManual();
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-all mt-2 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New Source</span>
            </button>
          </div>
        </nav>

        {/* Usage section / Swiss Gauge Widget */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Cloud Storage Limit</span>
              <span className="text-indigo-400 font-mono">PRO FREE</span>
            </div>
            
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (sessions.length / 10) * 100)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
              <span>{sessions.length} of 10 notebooks</span>
              <span className="font-bold text-white">{Math.round((sessions.length / 10) * 100)}%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600 hidden sm:block" />
              <h2 className="text-sm md:text-base font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                {activeSession ? activeSession.title : "Study Desk"}
              </h2>
              {activeSession && (
                <span className="hidden sm:inline-block px-2.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-wider">
                  Analyzed
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="header-create-source-btn"
              onClick={handleAddNewManual}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs sm:text-sm font-sans font-semibold rounded-xl shadow-sm shadow-indigo-100 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Material</span>
            </button>
          </div>
        </header>

        {/* Interactive Workspace Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Warning diagnostic if GEMINI_API_KEY is not configured yet */}
            <AnimatePresence>
              {apiError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl"
                  id="api-error-alert"
                >
                  <MessageSquareWarning className="w-5 h-5 mt-0.5 text-rose-500 shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-bold font-sans text-rose-950">AI Action Encountered an Obstacle</p>
                    <p className="font-sans mt-0.5">{apiError}</p>
                    <p className="font-sans opacity-75 mt-2 font-semibold">
                      Please verify your GEMINI_API_KEY inside the Secrets panel in AI Studio's UI interface.
                    </p>
                  </div>
                  <button 
                    onClick={() => setApiError(null)}
                    className="ml-auto p-1 hover:bg-rose-100 rounded-lg text-rose-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dashboard Workspace Overview */}
            {activeMenuTab === 'dashboard' ? (
              activeSession ? (
                /* Dynamic Workspace: Active Session with side tools OR Assessment quiz */
                isQuizMode && activeSession.quiz ? (
                  <QuizView
                    questions={activeSession.quiz}
                    noteTitle={activeSession.title}
                    onClose={() => setIsQuizMode(false)}
                    onFinishQuiz={handleFinishQuiz}
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Notes Viewer Section (tab options: structured note or key concepts cards) */}
                    <div className="lg:col-span-8 space-y-6">
                      <NotesViewer
                        session={activeSession}
                        onStartQuiz={
                          activeSession.quiz 
                            ? () => setIsQuizMode(true) 
                            : handleGenerateQuiz
                        }
                        isLoadingQuiz={isGeneratingQuiz}
                        hasQuiz={!!activeSession.quiz}
                      />
                    </div>

                    {/* Left/Right Context Toolbox column */}
                    <div className="lg:col-span-4 space-y-6">
                      {/* Active Session Stats widget */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-slate-400">Notebook metadata</h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Source Name</span>
                            <span className="text-slate-800 font-mono truncate max-w-[150px] font-medium">{activeSession.fileName}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Key Concepts</span>
                            <span className="text-slate-800 font-mono font-medium">{activeSession.keyConcepts.length} items</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Created Time</span>
                            <span className="text-slate-800 font-mono font-medium">
                              {new Date(activeSession.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Side Uploader Widget for instant upgrades */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-slate-400">Add another material</h4>
                        <UploadZone
                          onFileReady={handleFileUploaded}
                          isLoading={isGeneratingNotes}
                        />
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* Welcome Uploader / Empty State */
                <div className="max-w-2xl mx-auto text-center py-10 md:py-16 space-y-8">
                  <div className="space-y-3">
                    <div className="inline-flex items-center justify-center p-3.5 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
                      <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>
                    <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-slate-900 tracking-tight leading-none">
                      Lumina Study Desk
                    </h1>
                    <p className="font-sans text-sm md:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
                      Upload any PDF or Audio lecture material. Generates immediate interactive bullet outlines, active-recall key terms, and comprehensive practice assessments.
                    </p>
                  </div>

                  {/* Highlight Feature Tiles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="font-sans font-bold text-xs text-slate-900 mb-1">Synthesize Lecturing Details</h4>
                      <p className="font-sans text-[11px] text-slate-500">
                        Processes hours of slide formats or text outlines.
                      </p>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h4 className="font-sans font-bold text-xs text-slate-900 mb-1">Interactive Concept Flips</h4>
                      <p className="font-sans text-[11px] text-slate-500">
                        Rapid memory testing utilizing flip terms.
                      </p>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
                        <BrainCircuit className="w-4 h-4" />
                      </div>
                      <h4 className="font-sans font-bold text-xs text-slate-900 mb-1">Quiz Assessments</h4>
                      <p className="font-sans text-[11px] text-slate-500">
                        Interactive multiple choice queries backed by Gemini details.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <UploadZone
                      onFileReady={handleFileUploaded}
                      isLoading={isGeneratingNotes}
                    />
                  </div>
                </div>
              )
            ) : activeMenuTab === 'all-notes' ? (
              /* All Notes Grid Mode */
              <div className="space-y-6">
                <div>
                  <h1 className="font-sans font-bold text-2xl text-slate-900">Your Study Materials</h1>
                  <p className="font-sans text-sm text-slate-500 mt-0.5">Manage and navigate your processed notebooks and PDF guidelines.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => {
                        setSelectedSessionId(s.id);
                        setActiveMenuTab('dashboard');
                        setIsQuizMode(false);
                      }}
                      className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-5 shadow-sm hover:shadow transition-all group cursor-pointer flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider font-semibold">
                            {s.fileType}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{s.fileSize}</span>
                        </div>
                        
                        <h3 className="font-sans font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {s.title}
                        </h3>
                        
                        <p className="font-sans text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {s.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                        
                        <button
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-all cursor-pointer"
                          title="Delete material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Manual add slot */}
                  <div 
                    onClick={handleAddNewManual}
                    className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50"
                  >
                    <PlusCircle className="w-10 h-10 text-slate-400 mb-2 group-hover:text-indigo-500" />
                    <h3 className="font-sans font-bold text-sm text-slate-700">Add Another Source</h3>
                    <p className="font-sans text-xs text-slate-500 mt-1">Upload lecture slides, audio notes, or textbook chapters.</p>
                  </div>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      </main>

      {/* Loading Screen Overlay during file encoding processes */}
      <AnimatePresence>
        {isGeneratingNotes && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 text-center"
          >
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-100 space-y-6">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mx-auto">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="font-sans font-extrabold text-xl text-slate-900">
                  Compiling Study Manual...
                </h3>
                <p className="font-sans text-sm text-slate-500 leading-relaxed">
                  Our algorithm is analyzing your material with Gemini, extracting core structures, generating flashcard schemas, and phrasing assessment parameters. This usually takes 5-10 seconds.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5 text-left text-xs text-slate-500">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Generating rich Markdown notes and terminologies instantly.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
