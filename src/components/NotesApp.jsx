import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AIService } from '../lib/ai-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { 
  Search, 
  Plus, 
  LogOut, 
  Trash2, 
  Wand2, 
  FileText, 
  Zap, 
  MessageSquare,
  Sparkles,
  Menu,
  Star,
  Clock,
  MoreHorizontal,
  ChevronDown,
  Palette,
  Moon,
  Sun,
  Settings,
  Home,
  Folder,
  Calendar,
  Languages,
  Mail,
  PenTool,
  Lightbulb,
  BookOpen,
  GraduationCap,
  Brush
} from 'lucide-react';

export default function NotesApp({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedAIAction, setSelectedAIAction] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [renamingNote, setRenamingNote] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  // Keyboard shortcut for opening command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.relative')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const loadNotes = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const updateNote = async (note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: note.title,
          content: note.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', note.id);

      if (error) throw error;
      loadNotes();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      setNotes(notes.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const renameNote = async (noteId, newTitle) => {
    try {
      // Check if this is a new temporary note
      const note = notes.find(n => n.id === noteId);
      if (note && note.isNew) {
        // Create a new note in the database
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data, error } = await supabase
          .from('notes')
          .insert([{
            title: newTitle,
            content: '',
            user_id: user.user.id,
          }])
          .select()
          .single();

        if (error) throw error;
        
        // Remove the temporary note and add the real one
        setNotes([data, ...notes.filter(n => n.id !== noteId)]);
        setSelectedNote(data);
      } else {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({
            title: newTitle,
            updated_at: new Date().toISOString(),
          })
          .eq('id', noteId);

        if (error) throw error;
        
        // Update the note in the local state and move it to the top
        const updatedNotes = notes.map(n => 
          n.id === noteId ? { ...n, title: newTitle, updated_at: new Date().toISOString() } : n
        );
        const updatedNote = updatedNotes.find(n => n.id === noteId);
        const otherNotes = updatedNotes.filter(n => n.id !== noteId);
        setNotes([updatedNote, ...otherNotes]);
        
        if (selectedNote?.id === noteId) {
          setSelectedNote({ ...selectedNote, title: newTitle });
        }
      }
      
      setRenamingNote(null);
      setRenameTitle('');
    } catch (error) {
      console.error('Error with note:', error);
      // If creation/rename failed, remove temporary note
      const note = notes.find(n => n.id === noteId);
      if (note && note.isNew) {
        setNotes(notes.filter(n => n.id !== noteId));
      }
      setRenamingNote(null);
      setRenameTitle('');
    }
  };

  const handleAIAction = async (action, prompt = null) => {
    if (!selectedNote?.content && !prompt) return;

    setSelectedAIAction(action);
    setLoading(true);
    try {
      let result = '';
      const targetText = selectedNote?.content || '';
      
      switch (action) {
        case 'fix-grammar':
          result = await AIService.fixGrammar(targetText);
          break;
        case 'summarize':
          result = await AIService.summarize(targetText);
          break;
        case 'expand':
          result = await AIService.expand(targetText);
          break;
        case 'professional':
          result = await AIService.adjustTone(targetText, 'professional');
          break;
        case 'casual':
          result = await AIService.adjustTone(targetText, 'casual');
          break;
        case 'academic':
          result = await AIService.adjustTone(targetText, 'academic');
          break;
        case 'creative':
          result = await AIService.adjustTone(targetText, 'creative');
          break;
        case 'generate-email':
          result = await AIService.generateEmail(prompt || 'Write a professional email');
          break;
        case 'generate-blog':
          result = await AIService.generateBlogPost(prompt || 'Write a blog post about this topic');
          break;
        case 'generate-outline':
          result = await AIService.generateOutline(prompt || 'Create an outline for this content');
          break;
        case 'generate-ideas':
          result = await AIService.generateIdeas(prompt || 'Generate ideas related to this topic');
          break;
        case 'translate-spanish':
          result = await AIService.translate(targetText, 'Spanish');
          break;
        case 'translate-french':
          result = await AIService.translate(targetText, 'French');
          break;
        case 'translate-german':
          result = await AIService.translate(targetText, 'German');
          break;
        case 'translate-chinese':
          result = await AIService.translate(targetText, 'Chinese');
          break;
        default:
          return;
      }

      if (selectedNote) {
        const updatedNote = { ...selectedNote, content: result };
        setSelectedNote(updatedNote);
        await updateNote(updatedNote);
      } else if (prompt) {
        // Create a new note with generated content
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const { data, error } = await supabase
            .from('notes')
            .insert([{
              title: 'AI Generated Content',
              content: result,
              user_id: user.user.id,
            }])
            .select()
            .single();

          if (!error) {
            setNotes([data, ...notes]);
            setSelectedNote(data);
          }
        }
      }
    } catch (error) {
      console.error('AI action failed:', error);
    }
    setLoading(false);
    // Clear selection after a brief moment to show completion
    setTimeout(() => setSelectedAIAction(null), 1000);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleCommandSelect = (value) => {
    setCommandOpen(false);
    
    // Handle different command types
    switch (value) {
      case 'new-note':
        // Create a new note directly in sidebar
        const newNote = {
          id: 'temp-' + Date.now(),
          title: '',
          content: '',
          isNew: true
        };
        setNotes([newNote, ...notes]);
        setRenamingNote(newNote.id);
        setRenameTitle('');
        break;
      case 'toggle-dark':
        toggleDarkMode();
        break;
      case 'logout':
        onLogout();
        break;
      case 'collapse-sidebar':
        setSidebarCollapsed(!sidebarCollapsed);
        break;
      case 'fix-grammar':
      case 'summarize':
      case 'expand':
      case 'professional':
      case 'casual':
      case 'academic':
      case 'creative':
      case 'translate-spanish':
      case 'translate-french':
      case 'translate-german':
      case 'translate-chinese':
        if (selectedNote) {
          handleAIAction(value);
        }
        break;
      case 'generate-email':
      case 'generate-blog':
      case 'generate-outline':
      case 'generate-ideas':
        const prompt = window.prompt('Enter your prompt:');
        if (prompt) {
          handleAIAction(value, prompt);
        }
        break;
      default:
        // Handle note selection
        if (value.startsWith('note-')) {
          const noteId = value.replace('note-', '');
          const note = notes.find(n => n.id === noteId);
          if (note) {
            setSelectedNote(note);
          }
        }
    }
  };

  return (
    <>
      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Actions">
            <CommandItem value="new-note" onSelect={handleCommandSelect}>
              <Plus className="mr-2 h-4 w-4" />
              New Note
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem value="toggle-dark" onSelect={handleCommandSelect}>
              {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              Toggle {darkMode ? 'Light' : 'Dark'} Mode
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem value="collapse-sidebar" onSelect={handleCommandSelect}>
              <Menu className="mr-2 h-4 w-4" />
              {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {selectedNote && (
            <>
              <CommandSeparator />
              <CommandGroup heading="AI Enhancement">
                <CommandItem value="fix-grammar" onSelect={handleCommandSelect}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Fix Grammar & Style
                </CommandItem>
                <CommandItem value="summarize" onSelect={handleCommandSelect}>
                  <FileText className="mr-2 h-4 w-4" />
                  Summarize Content
                </CommandItem>
                <CommandItem value="expand" onSelect={handleCommandSelect}>
                  <Zap className="mr-2 h-4 w-4" />
                  Expand & Elaborate
                </CommandItem>
              </CommandGroup>
              
              <CommandSeparator />
              <CommandGroup heading="Tone Adjustment">
                <CommandItem value="professional" onSelect={handleCommandSelect}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Professional Tone
                </CommandItem>
                <CommandItem value="casual" onSelect={handleCommandSelect}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Casual & Friendly
                </CommandItem>
                <CommandItem value="academic" onSelect={handleCommandSelect}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Academic Style
                </CommandItem>
                <CommandItem value="creative" onSelect={handleCommandSelect}>
                  <Brush className="mr-2 h-4 w-4" />
                  Creative & Engaging
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />
              <CommandGroup heading="Translation">
                <CommandItem value="translate-spanish" onSelect={handleCommandSelect}>
                  <Languages className="mr-2 h-4 w-4" />
                  Translate to Spanish
                </CommandItem>
                <CommandItem value="translate-french" onSelect={handleCommandSelect}>
                  <Languages className="mr-2 h-4 w-4" />
                  Translate to French
                </CommandItem>
                <CommandItem value="translate-german" onSelect={handleCommandSelect}>
                  <Languages className="mr-2 h-4 w-4" />
                  Translate to German
                </CommandItem>
                <CommandItem value="translate-chinese" onSelect={handleCommandSelect}>
                  <Languages className="mr-2 h-4 w-4" />
                  Translate to Chinese
                </CommandItem>
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="AI Content Generation">
            <CommandItem value="generate-email" onSelect={handleCommandSelect}>
              <Mail className="mr-2 h-4 w-4" />
              Generate Email
              <CommandShortcut>📧</CommandShortcut>
            </CommandItem>
            <CommandItem value="generate-blog" onSelect={handleCommandSelect}>
              <PenTool className="mr-2 h-4 w-4" />
              Generate Blog Post
              <CommandShortcut>📝</CommandShortcut>
            </CommandItem>
            <CommandItem value="generate-outline" onSelect={handleCommandSelect}>
              <BookOpen className="mr-2 h-4 w-4" />
              Create Outline
              <CommandShortcut>📋</CommandShortcut>
            </CommandItem>
            <CommandItem value="generate-ideas" onSelect={handleCommandSelect}>
              <Lightbulb className="mr-2 h-4 w-4" />
              Brainstorm Ideas
              <CommandShortcut>💡</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {notes.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Notes">
                {notes.slice(0, 8).map((note) => (
                  <CommandItem key={note.id} value={`note-${note.id}`} onSelect={handleCommandSelect}>
                    <FileText className="mr-2 h-4 w-4" />
                    {note.title || 'Untitled'}
                    <CommandShortcut>
                      <Clock className="h-3 w-3" />
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="System">
            <CommandItem value="logout" onSelect={handleCommandSelect}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
              <CommandShortcut>⌘Q</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <div className={`flex h-screen notion-content notion-text ${darkMode ? 'dark' : ''}`}>
        {/* Enhanced Sidebar with simplified styling */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} notion-transition notion-sidebar flex flex-col relative`}>
          {/* Sidebar Header */}
          <div className="p-3 border-b" style={{ borderColor: darkMode ? '#3c3c3c' : '#e5e5e5' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  variant="ghost"
                  size="sm"
                  className="notion-button-ghost p-1 h-7 w-7"
                >
                  <Menu className="w-4 h-4" />
                </Button>
                {!sidebarCollapsed && (
                  <h1 className="text-sm font-semibold flex items-center gap-2 notion-text">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <img 
                        src="/Logo.svg" 
                        alt="Fira AI" 
                        className="w-5 h-5"
                        style={{ 
                          filter: darkMode ? 'brightness(0) saturate(100%) invert(100%)' : 'none' 
                        }}
                      />
                    </div>
                    Fira AI
                  </h1>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="flex items-center">
                  <Button onClick={toggleDarkMode} variant="ghost" size="sm" className="notion-button-ghost p-1 h-7 w-7">
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                  <Button onClick={onLogout} variant="ghost" size="sm" className="notion-button-ghost p-1 h-7 w-7">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {!sidebarCollapsed && (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkMode ? '#a3a3a3' : '#666666' }} />
                <Input
                  placeholder="Search... (⌘K for command palette)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm border rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  style={{ 
                    color: darkMode ? '#ffffff' : '#111111',
                    backgroundColor: darkMode ? '#1d1d1f' : '#ffffff',
                    borderColor: darkMode ? '#3c3c3c' : '#e5e5e5'
                  }}
                />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {!sidebarCollapsed && (
            <div className="px-3 py-2">
              <Button
                onClick={() => {
                  // Create a new note directly and put it in rename mode
                  const newNote = {
                    id: 'temp-' + Date.now(),
                    title: '',
                    content: '',
                    isNew: true
                  };
                  setNotes([newNote, ...notes]);
                  setRenamingNote(newNote.id);
                  setRenameTitle('');
                }}
                className="w-full h-8 text-sm font-medium"
                size="sm"
                style={{ backgroundColor: '#1d1d1f', color: '#ffffff' }}
              >
                <Plus className="w-4 h-4 mr-1" />
                New Note
              </Button>
            </div>
          )}

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {!sidebarCollapsed && (
              <div className="px-2 py-1 text-xs font-medium notion-subtext uppercase tracking-wide">
                Notes
              </div>
            )}
            <div className="space-y-0">
              {filteredNotes.map(note => (
                <div key={note.id} className="relative">
                  <div
                    className={`group cursor-pointer notion-sidebar-item flex items-center gap-2 ${
                      selectedNote?.id === note.id ? 'active' : ''
                    } ${sidebarCollapsed ? 'justify-center p-2' : 'px-2 py-1'}`}
                    onClick={() => {
                      if (renamingNote !== note.id) {
                        setSelectedNote(note);
                      }
                    }}
                  >
                    {sidebarCollapsed ? (
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1d1d1f' }}>
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1d1d1f' }}>
                          <FileText className="w-2.5 h-2.5 text-white" />
                        </div>
                        {renamingNote === note.id ? (
                          <Input
                            value={renameTitle}
                            onChange={(e) => setRenameTitle(e.target.value)}
                            onBlur={() => {
                              if (renameTitle.trim()) {
                                renameNote(note.id, renameTitle);
                              } else {
                                // If empty and it's a new note, remove it
                                if (note.isNew) {
                                  setNotes(notes.filter(n => n.id !== note.id));
                                }
                                setRenamingNote(null);
                                setRenameTitle('');
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (renameTitle.trim()) {
                                  renameNote(note.id, renameTitle);
                                } else {
                                  // If empty and it's a new note, remove it
                                  if (note.isNew) {
                                    setNotes(notes.filter(n => n.id !== note.id));
                                  }
                                  setRenamingNote(null);
                                  setRenameTitle('');
                                }
                              }
                              if (e.key === 'Escape') {
                                // If it's a new note, remove it
                                if (note.isNew) {
                                  setNotes(notes.filter(n => n.id !== note.id));
                                }
                                setRenamingNote(null);
                                setRenameTitle('');
                              }
                            }}
                            className="flex-1 text-sm h-6 px-1"
                            autoFocus
                          />
                        ) : (
                          <span className="flex-1 text-sm truncate">
                            {note.title || 'Untitled'}
                          </span>
                        )}
                        {!note.isNew && (
                          <div className="relative">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 notion-transition p-1 h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDropdownOpen(dropdownOpen === note.id ? null : note.id);
                              }}
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                            
                            {dropdownOpen === note.id && (
                              <div 
                                className="absolute right-0 top-6 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="py-1">
                                <button
                                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  onClick={() => {
                                    setRenameTitle(note.title || '');
                                    setRenamingNote(note.id);
                                    setDropdownOpen(null);
                                  }}
                                >
                                  <PenTool className="w-3 h-3" />
                                  Rename
                                </button>
                                <button
                                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this note?')) {
                                      deleteNote(note.id);
                                    }
                                    setDropdownOpen(null);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area with simplified styling */}
        <div className="flex-1 flex flex-col notion-content">
          {selectedNote ? (
            <div className="flex-1 flex flex-col">
              {/* Simplified Header for Selected Note */}
              <div className="px-6 py-4" style={{ borderBottom: `1px solid ${darkMode ? '#3c3c3c' : '#e5e5e5'}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#1d1d1f' }}>
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                  <h1 className="flex-1 notion-title text-xl font-semibold" style={{ color: darkMode ? '#ffffff' : '#111111' }}>
                    {selectedNote.title || 'Untitled'}
                  </h1>
                </div>
              </div>
              
              {/* Enhanced AI Toolbar with simplified colors */}
              <div className="px-6 py-3" style={{ borderBottom: `1px solid ${darkMode ? '#3c3c3c' : '#e5e5e5'}`, backgroundColor: darkMode ? '#1d1d1f' : '#fafafa' }}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                  </div>
                  <div className="flex gap-1 overflow-x-auto">
                    {[
                      { action: 'fix-grammar', icon: Wand2, label: 'Fix Grammar', color: '#1d1d1f' },
                      { action: 'summarize', icon: FileText, label: 'Summarize', color: '#1d1d1f' },
                      { action: 'expand', icon: Zap, label: 'Expand', color: '#1d1d1f' },
                      { action: 'professional', icon: MessageSquare, label: 'Professional', color: '#1d1d1f' },
                      { action: 'casual', icon: MessageSquare, label: 'Casual', color: '#1d1d1f' },
                      { action: 'academic', icon: GraduationCap, label: 'Academic', color: '#1d1d1f' },
                      { action: 'creative', icon: Brush, label: 'Creative', color: '#1d1d1f' }
                    ].map(({ action, icon: Icon, label, color }) => {
                      const isSelected = selectedAIAction === action;
                      return (
                        <Button
                          key={action}
                          onClick={() => handleAIAction(action)}
                          disabled={loading}
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 h-8 px-3 py-1 text-xs font-medium transition-all duration-200 ease-in-out"
                          style={{
                            borderRadius: '20px',
                            backgroundColor: isSelected ? color : 'transparent',
                            color: isSelected ? '#ffffff' : (darkMode ? '#ffffff' : '#111111'),
                            border: `1px solid ${isSelected ? color : (darkMode ? '#3c3c3c' : '#e5e5e5')}`,
                            boxShadow: isSelected ? `0 2px 8px ${color}30` : 'none',
                            transform: isSelected ? 'translateY(-1px)' : 'translateY(0px)'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.target.style.backgroundColor = darkMode ? '#2a2a2a' : '#f5f5f5';
                              e.target.style.transform = 'translateY(-1px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.transform = 'translateY(0px)';
                            }
                          }}
                        >
                          <Icon className="w-3.5 h-3.5 mr-1.5" />
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="flex-1 px-6 py-4 relative">
                <Textarea
                  value={selectedNote.content}
                  onChange={(e) => {
                    const updated = { ...selectedNote, content: e.target.value };
                    setSelectedNote(updated);
                  }}
                  onBlur={() => updateNote(selectedNote)}
                  className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-base notion-text bg-transparent p-0"
                  disabled={loading}
                  placeholder="Start writing, or type '/' for commands..."
                  style={{ color: darkMode ? '#ffffff' : '#111111' }}
                />
                
                {/* Floating Status */}
                <div className="absolute bottom-4 right-4 text-xs notion-subtext backdrop-blur-sm px-2 py-1 rounded" 
                     style={{ 
                       backgroundColor: darkMode ? 'rgba(17, 17, 17, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
                       border: `1px solid ${darkMode ? '#3c3c3c' : '#e5e5e5'}` 
                     }}>
                  {new Date(selectedNote.updated_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              
              {loading && (
                <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-50" 
                     style={{ backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}>
                  <div className="rounded-lg p-4 shadow-lg" 
                       style={{ 
                         backgroundColor: darkMode ? '#111111' : '#ffffff', 
                         border: `1px solid ${darkMode ? '#3c3c3c' : '#e5e5e5'}` 
                       }}>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 rounded-full animate-spin" 
                           style={{ borderColor: '#1d1d1f', borderTopColor: 'transparent' }}></div>
                      <span className="text-sm notion-text">Fira AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <img 
                    src="/Logo.svg" 
                    alt="Fira AI" 
                    className="w-16 h-16"
                    style={{ filter: darkMode ? 'invert(1)' : 'none' }}
                  />
                </div>
                <h3 className="notion-heading text-lg mb-2">Notes that think with you.</h3>
                <p className="notion-subtext mb-4 leading-relaxed">
                  Automatically fix grammar, adjust tone, and enhance your content with AI-powered suggestions
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      // Create a new note directly in sidebar
                      const newNote = {
                        id: 'temp-' + Date.now(),
                        title: '',
                        content: '',
                        isNew: true
                      };
                      setNotes([newNote, ...notes]);
                      setRenamingNote(newNote.id);
                      setRenameTitle('');
                    }}
                    style={{ backgroundColor: '#1d1d1f', color: '#ffffff' }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New note
                  </Button>
                  <div className="text-xs notion-subtext">
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
