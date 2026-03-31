import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Trash2, NotebookPen, Maximize2 } from 'lucide-react';

const TASKS_STORAGE_KEY = 'fs_premium_tasks';

export default function Tasks() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null); // null = none, 'new' = creating, number = editing
  const [draftTitle, setDraftTitle] = useState('');
  const [draftTasks, setDraftTasks] = useState([]);
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [fontSize, setFontSize] = useState('text-base');
  
  // Mounted check to prevent hydration errors and safely use localStorage
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) {
        setNotes(JSON.parse(saved));
      }
    } catch(e) {
      console.error('Local storage read error:', e);
    }
    setMounted(true);
  }, []);

  const saveToStorage = (newNotes) => {
    setNotes(newNotes);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newNotes));
  };

  const openNewNotepad = () => {
    setActiveNoteId('new');
    setDraftTitle('');
    setDraftTasks([{ id: Date.now(), text: '', completed: false }]);
    setFontFamily('font-sans');
    setFontSize('text-base');
  };

  const openNotepad = (note) => {
    setActiveNoteId(note.id);
    setDraftTitle(note.title || '');
    setDraftTasks(note.tasks?.length ? note.tasks : [{ id: Date.now(), text: '', completed: false }]);
    setFontFamily(note.fontFamily || 'font-sans');
    setFontSize(note.fontSize || 'text-base');
  };

  const closeAndSave = () => {
    const validTasks = draftTasks.filter(t => t.text.trim().length > 0);
    const hasContent = validTasks.length > 0 || (draftTitle && draftTitle.trim().length > 0);
    
    if (!hasContent) {
      setActiveNoteId(null);
      return;
    }

    const newNote = {
      id: activeNoteId === 'new' ? Date.now() : activeNoteId,
      title: draftTitle.trim() || 'Untitled Note',
      tasks: validTasks,
      fontFamily,
      fontSize,
      updatedAt: new Date().toISOString(),
    };

    if (activeNoteId === 'new') {
      saveToStorage([newNote, ...notes]);
    } else {
      saveToStorage(notes.map(n => (n.id === activeNoteId ? newNote : n)));
    }
    setActiveNoteId(null);
  };

  const deleteNote = (e, id) => {
    e.stopPropagation();
    saveToStorage(notes.filter(n => n.id !== id));
  };

  const onTaskChange = (id, text) => {
    setDraftTasks(draftTasks.map(t => (t.id === id ? { ...t, text } : t)));
  };

  const onTaskKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newDrafts = [...draftTasks];
      newDrafts.splice(index + 1, 0, { id: Date.now(), text: '', completed: false });
      setDraftTasks(newDrafts);
      
      // Auto-focus logic
      setTimeout(() => {
        const inputs = document.querySelectorAll('.task-input');
        if (inputs[index + 1]) inputs[index + 1].focus();
      }, 50);
    } else if (e.key === 'Backspace' && draftTasks[index].text === '' && draftTasks.length > 1) {
      e.preventDefault();
      const newDrafts = draftTasks.filter((_, i) => i !== index);
      setDraftTasks(newDrafts);
      
      // Auto-focus previous
      setTimeout(() => {
        const inputs = document.querySelectorAll('.task-input');
        if (inputs[index - 1]) inputs[index - 1].focus();
      }, 50);
    }
  };

  const toggleTaskStatus = (id) => {
    setDraftTasks(draftTasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const toggleCardTask = (e, noteId, taskId) => {
    e.stopPropagation();
    const updated = notes.map(n => {
      if (n.id === noteId) {
        return {
          ...n,
          tasks: n.tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
        };
      }
      return n;
    });
    saveToStorage(updated);
  };

  // Wait until mounted on client to prevent hydration mismatch with LS
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-sky-200 w-full relative overflow-x-hidden flex flex-col font-sans">
      
      {/* Background Decor - clean gradient */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-sky-300 to-transparent pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12 flex-1 z-10 relative">
        
        {/* Header Section */}
        <header className="flex w-full items-center justify-between mb-12 pt-4">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">Your Tasks</h1>
            <p className="text-slate-700 text-lg">Organize your thoughts in a premium workspace.</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={openNewNotepad}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-7 py-3.5 rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all font-medium shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>New Notepad</span>
          </motion.button>
        </header>

        {/* Empty State */}
        {notes.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-slate-400"
          >
            <div className="bg-white p-6 rounded-full shadow-sm mb-6">
              <NotebookPen className="w-16 h-16 text-sky-200" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-700">No notes yet</h2>
            <p className="text-center text-slate-500 max-w-sm">Click "New Notepad" to create your first beautiful note and manage your tasks.</p>
          </motion.div>
        )}

        {/* Note Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 pb-32">
          <AnimatePresence>
            {notes.map(note => (
              <motion.div
                layoutId={`notepad-${note.id}`}
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                whileHover={{ y: -6, scale: 1.01 }}
                onClick={() => openNotepad(note)}
                className="group relative bg-[#fdfaf4] cursor-pointer rounded-3xl p-7 shadow-xl overflow-hidden flex flex-col h-[320px] transition-all hover:shadow-2xl border border-orange-50"
              >
                {/* Internal Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Card Header */}
                <div className="flex justify-between items-start mb-6 z-10 relative">
                  <h3 className="text-slate-900 text-xl font-bold line-clamp-1 pr-4 tracking-wide">{note.title}</h3>
                  <button 
                    onClick={(e) => deleteNote(e, note.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Tasks List Preview */}
                <div className="flex-1 overflow-hidden z-10 relative">
                  <div className="space-y-3.5">
                    {note.tasks.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-center gap-3">
                        <button 
                          onClick={(e) => toggleCardTask(e, note.id, task.id)}
                          className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                            task.completed ? 'bg-sky-500 border-sky-500' : 'border-slate-300 hover:border-sky-400 bg-white'
                          }`}
                        >
                          {task.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </button>
                        <span className={`text-sm truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                    {note.tasks.length > 5 && (
                      <div className="text-slate-400 text-xs italic pl-7 pt-1">
                        + {note.tasks.length - 5} more...
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-4 border-t border-orange-100/50 flex justify-between items-center text-xs text-slate-500 font-medium z-10 relative">
                  <span>{new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-full text-slate-600">
                    <Check className="w-3 h-3 text-sky-400" />
                    <span>{note.tasks.filter(t => t.completed).length}/{note.tasks.length}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* The Editing Modal/Notepad */}
        <AnimatePresence>
          {activeNoteId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
              
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={closeAndSave}
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              />

              {/* Cream Notepad Interface */}
              <motion.div
                layoutId={activeNoteId === 'new' ? undefined : `notepad-${activeNoteId}`}
                initial={activeNoteId === 'new' ? { opacity: 0, scale: 0.95, y: 20 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative z-10 w-full max-w-4xl bg-[#fdfaf4] rounded-[2rem] shadow-2xl flex flex-col h-[85vh] xl:h-[80vh] overflow-hidden border border-orange-100/50"
              >
                
                {/* Editor Header */}
                <div className="px-6 md:px-10 pt-8 pb-5 flex flex-col gap-5 z-20 border-b border-orange-100 shrink-0 bg-[#fdfaf4]">
                  <div className="flex justify-between items-start gap-4">
                    <input
                      type="text"
                      placeholder="Note Title..."
                      value={draftTitle}
                      onChange={e => setDraftTitle(e.target.value)}
                      className="text-3xl md:text-5xl font-bold text-slate-900 bg-transparent border-none outline-none placeholder-slate-300 w-full tracking-tight"
                    />
                    <button 
                      onClick={closeAndSave}
                      className="p-2.5 bg-orange-50 text-slate-500 hover:bg-orange-100 hover:text-slate-800 rounded-full transition-colors flex flex-shrink-0"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Toolbar */}
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium pb-2 overflow-x-auto">
                    <select 
                      value={fontFamily} onChange={e => setFontFamily(e.target.value)}
                      className="bg-white hover:bg-orange-50 border border-orange-100/50 rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-orange-300 transition-colors appearance-none pr-8 min-w-[120px]"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                    >
                      <option value="font-sans">Inter</option>
                      <option value="font-serif">Merriweather</option>
                      <option value="font-mono">Fira Code</option>
                    </select>
                    
                    <select 
                      value={fontSize} onChange={e => setFontSize(e.target.value)}
                      className="bg-white hover:bg-orange-50 border border-orange-100/50 rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-orange-300 transition-colors appearance-none pr-8 min-w-[120px]"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                    >
                      <option value="text-sm">Small pt</option>
                      <option value="text-base">Medium pt</option>
                      <option value="text-lg">Large pt</option>
                      <option value="text-xl">Extra Large</option>
                    </select>
                  </div>
                </div>

                {/* Editor Content */}
                <div className={`flex-1 overflow-y-auto px-6 md:px-10 py-6 ${fontFamily} relative bg-[#fdfaf4]`}>
                  <div className="max-w-3xl space-y-3 pb-20">
                    <AnimatePresence initial={false}>
                      {draftTasks.map((task, index) => (
                        <motion.div 
                          key={task.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-4 group bg-white/60 p-3 rounded-2xl border border-orange-50 shadow-sm hover:border-orange-200 hover:bg-white transition-colors"
                        >
                          <button 
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`mt-1 w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                              task.completed 
                                ? 'bg-slate-800 border-slate-800 scale-105' 
                                : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                            }`}
                          >
                            <AnimatePresence>
                              {task.completed && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                          
                          <input
                            type="text"
                            value={task.text}
                            onChange={(e) => onTaskChange(task.id, e.target.value)}
                            onKeyDown={(e) => onTaskKeyDown(e, index)}
                            placeholder={index === 0 && draftTasks.length === 1 ? "Start typing tasks here..." : "Press Enter for new line..."}
                            className={`task-input flex-1 bg-transparent border-none outline-none leading-relaxed transition-all placeholder-slate-300 mt-0.5 w-full min-w-0 ${fontSize} ${
                              task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                            }`}
                            autoFocus={index === draftTasks.length - 1}
                          />
                          <button
                            onClick={() => {
                              const newDrafts = [...draftTasks];
                              newDrafts.splice(index + 1, 0, { id: Date.now(), text: '', completed: false });
                              setDraftTasks(newDrafts);
                              
                              // Auto-focus new input
                              setTimeout(() => {
                                const inputs = document.querySelectorAll('.task-input');
                                if (inputs[index + 1]) inputs[index + 1].focus();
                              }, 50);
                            }}
                            className="mt-0.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 shrink-0"
                            title="Add new task below"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom Save Bar */}
                <div className="px-6 md:px-10 py-5 border-t border-orange-100 bg-[#fdfaf4] mt-auto flex justify-between items-center gap-4 shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.02)]">
                  <div className="text-slate-400 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    Updates auto-saved locally
                  </div>
                  <button
                    onClick={closeAndSave}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-slate-800 transition-all text-sm tracking-wide"
                  >
                    Save & Close
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}