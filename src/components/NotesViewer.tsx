import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { NoteSession } from "../types";
import { 
  BookOpen, 
  Layers, 
  ClipboardCheck, 
  Download, 
  Copy, 
  Check, 
  ArrowRight,
  HelpCircle,
  Clock,
  FileText,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NotesViewerProps {
  session: NoteSession;
  onStartQuiz: () => void;
  isLoadingQuiz: boolean;
  hasQuiz: boolean;
}

export default function NotesViewer({ session, onStartQuiz, isLoadingQuiz, hasQuiz }: NotesViewerProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards'>('notes');
  const [copied, setCopied] = useState(false);
  const [activeFlashcard, setActiveFlashcard] = useState<number | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `# ${session.title}\n\n## Summary\n${session.summary}\n\n${session.notesMarkdown}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy notes", err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob(
      [`# ${session.title}\n\n## Summary\n${session.summary}\n\n${session.notesMarkdown}`],
      { type: "text/markdown;charset=utf-8" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `${session.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-study-notes.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="notes-viewer-wrapper" className="space-y-6">
      {/* Session Header Card */}
      <div id="notes-session-header" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-indigo-700 bg-indigo-50 w-fit px-2.5 py-1 rounded-full border border-indigo-100">
              {session.fileType === "pdf" ? (
                <FileText className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              <span className="uppercase">{session.fileType} Analyzed</span>
              <span>•</span>
              <span>{session.fileSize}</span>
            </div>

            <h1 className="font-sans font-bold text-2xl md:text-3xl text-slate-900 tracking-tight leading-tight">
              {session.title}
            </h1>

            <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {new Date(session.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </span>
              <span>•</span>
              <span className="truncate max-w-xs">{session.fileName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="action-btn-copy"
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-sans font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Copy markdown content to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Notes</span>
                </>
              )}
            </button>

            <button
              id="action-btn-download"
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-sans font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Download Markdown file"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download MD</span>
            </button>

            <button
              id="action-btn-quiz"
              onClick={onStartQuiz}
              disabled={isLoadingQuiz}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-sans font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-100 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
            >
              {isLoadingQuiz ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                    className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full"
                  />
                  <span>Building Quiz...</span>
                </>
              ) : hasQuiz ? (
                <>
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Practice Quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4" />
                  <span>Generate Quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {session.summary && (
          <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl">
            <h4 className="font-sans font-semibold text-xs text-indigo-600 uppercase tracking-widest mb-1.5">Executive Summary</h4>
            <p className="font-sans text-sm text-slate-700 leading-relaxed italic">
              &ldquo;{session.summary}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Navigation and Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Tabs - Swiss Sidebar Look */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 space-y-2 lg:sticky lg:top-6">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Study Modes</p>
          
          <button
            id="tab-select-notes"
            onClick={() => setActiveTab('notes')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-sans font-medium transition-all text-left cursor-pointer
              ${activeTab === 'notes'
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Structured Notes</span>
          </button>

          <button
            id="tab-select-flashcards"
            onClick={() => setActiveTab('flashcards')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-sans font-medium transition-all text-left cursor-pointer
              ${activeTab === 'flashcards'
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <span className="flex items-center space-x-2">
              <Layers className="w-4 h-4 shrink-0" />
              <span>Key Concept cards</span>
            </span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${activeTab === 'flashcards' ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {session.keyConcepts.length}
            </span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'notes' ? (
              <motion.div
                key="notes-pane"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                id="notes-content-container"
                className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm prose prose-slate max-w-none"
              >
                <div className="study-notes-markdown leading-relaxed text-slate-700 space-y-4">
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h2 className="font-sans font-bold text-2xl text-slate-900 mt-6 mb-3 tracking-tight border-b pb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="font-sans font-bold text-xl text-slate-900 mt-6 mb-3 tracking-tight border-b pb-1.5" {...props} />,
                      h3: ({node, ...props}) => <h3 className="font-sans font-semibold text-lg text-slate-800 mt-4 mb-2 tracking-tight" {...props} />,
                      p: ({node, ...props}) => <p className="font-sans text-sm md:text-base leading-relaxed text-slate-600 my-3" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3 space-y-1.5 text-slate-600" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-3 space-y-1.5 text-slate-600" {...props} />,
                      li: ({node, ...props}) => <li className="font-sans text-sm md:text-base" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-sans font-semibold text-slate-800" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-slate-800" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 bg-slate-50 pl-4 py-2 my-4 italic text-slate-600 rounded-r-lg" {...props} />,
                      code: ({node, ...props}) => <code className="font-mono text-xs bg-slate-100 text-indigo-800 px-1.5 py-0.5 rounded" {...props} />,
                      table: ({node, ...props}) => <table className="min-w-full divide-y divide-slate-200 my-4 text-sm" {...props} />,
                      th: ({node, ...props}) => <th className="bg-slate-50 text-slate-700 font-mono text-xs font-semibold px-4 py-2 text-left" {...props} />,
                      td: ({node, ...props}) => <td className="px-4 py-2 border-t border-slate-100/80 font-sans text-slate-600" {...props} />
                    }}
                  >
                    {session.notesMarkdown}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="flashcards-pane"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div id="flashcards-intro" className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start space-x-3">
                  <span className="p-1 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                    <Layers className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="font-sans font-semibold text-sm text-indigo-900">Active Recall Cards</h4>
                    <p className="font-sans text-xs text-indigo-700 mt-0.5">
                      Review terminology or foundational formulas in flashcard format. Click cards to instantly flip and read definition schemas.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.keyConcepts.map((concept, idx) => {
                    const isFlipped = activeFlashcard === idx;
                    return (
                      <div
                        id={`flashcard-item-${idx}`}
                        key={idx}
                        onClick={() => setActiveFlashcard(isFlipped ? null : idx)}
                        className={`h-44 cursor-pointer relative perspectivized group select-none`}
                      >
                        <div
                          className={`w-full h-full duration-300 rounded-2xl shadow-sm flex items-center justify-center text-center p-6 border transition-all
                            ${isFlipped 
                              ? "bg-slate-900 border-slate-950 text-white" 
                              : "bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:shadow"
                            }`}
                        >
                          <AnimatePresence mode="wait">
                            {!isFlipped ? (
                              <motion.div
                                key="front"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col space-y-2 w-full"
                              >
                                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Concept #{idx + 1}</span>
                                <span className="font-sans font-bold text-base text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                                  {concept.term}
                                </span>
                                <span className="text-xs font-mono text-indigo-600 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to reveal definition
                                </span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="back"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col space-y-2 w-full"
                              >
                                <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-300">Definition</span>
                                <p className="font-sans text-sm text-slate-200 leading-relaxed max-h-28 overflow-y-auto pr-1">
                                  {concept.definition}
                                </p>
                                <span className="text-[10px] font-mono text-white/40 mt-1">
                                  Click to flip back
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
