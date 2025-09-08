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
  Calendar
} from 'lucide-react';

export default function NotesApp({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

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

  const createNote = async () => {
    if (!newTitle.trim()) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            title: newTitle,
            content: newContent,
            user_id: user.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setNotes([data, ...notes]);
      setSelectedNote(data);
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
    } catch (error) {
      console.error('Error creating note:', error);
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

  const handleAIAction = async (action) => {
    if (!selectedNote?.content) return;

    setLoading(true);
    try {
      let result = '';
      switch (action) {
        case 'fix-grammar':
          result = await AIService.fixGrammar(selectedNote.content);
          break;
        case 'summarize':
          result = await AIService.summarize(selectedNote.content);
          break;
        case 'expand':
          result = await AIService.expand(selectedNote.content);
          break;
        case 'professional':
          result = await AIService.adjustTone(selectedNote.content, 'professional');
          break;
        case 'casual':
          result = await AIService.adjustTone(selectedNote.content, 'casual');
          break;
        default:
          return;
      }

      const updatedNote = { ...selectedNote, content: result };
      setSelectedNote(updatedNote);
      await updateNote(updatedNote);
    } catch (error) {
      console.error('AI action failed:', error);
    }
    setLoading(false);
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
        setIsCreating(true);
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
        if (selectedNote) {
          handleAIAction(value);
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
              <CommandGroup heading="AI Actions">
                <CommandItem value="fix-grammar" onSelect={handleCommandSelect}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Fix Grammar
                </CommandItem>
                <CommandItem value="summarize" onSelect={handleCommandSelect}>
                  <FileText className="mr-2 h-4 w-4" />
                  Summarize
                </CommandItem>
                <CommandItem value="expand" onSelect={handleCommandSelect}>
                  <Zap className="mr-2 h-4 w-4" />
                  Expand Content
                </CommandItem>
                <CommandItem value="professional" onSelect={handleCommandSelect}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Make Professional
                </CommandItem>
                <CommandItem value="casual" onSelect={handleCommandSelect}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Make Casual
                </CommandItem>
              </CommandGroup>
            </>
          )}

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
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: '#0075de' }}>
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    AI Notes
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
                    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
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
                onClick={() => setIsCreating(true)}
                className="w-full h-8 text-sm font-medium"
                size="sm"
                style={{ backgroundColor: '#0075de', color: '#ffffff' }}
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
                <div
                  key={note.id}
                  className={`group cursor-pointer notion-sidebar-item flex items-center gap-2 ${
                    selectedNote?.id === note.id ? 'active' : ''
                  } ${sidebarCollapsed ? 'justify-center p-2' : 'px-2 py-1'}`}
                  onClick={() => setSelectedNote(note)}
                >
                  {sidebarCollapsed ? (
                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0075de' }}>
                      <FileText className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0075de' }}>
                        <FileText className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="flex-1 text-sm truncate">
                        {note.title || 'Untitled'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 notion-transition p-1 h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show options menu
                        }}
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area with simplified styling */}
        <div className="flex-1 flex flex-col notion-content">
          {isCreating ? (
            <div className="flex-1 flex flex-col">
              {/* Enhanced Header for New Note */}
              <div className="px-6 py-4" style={{ borderBottom: `1px solid ${darkMode ? '#3c3c3c' : '#e5e5e5'}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                  <Input
                    placeholder="Untitled"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 notion-title border-none bg-transparent focus-visible:ring-0 p-0 h-auto"
                    style={{ color: darkMode ? '#ffffff' : '#111111' }}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={createNote} 
                      size="sm" 
                      className="h-8"
                      style={{ backgroundColor: '#0075de', color: '#ffffff' }}
                    >
                      Done
                    </Button>
                    <Button 
                      onClick={() => setIsCreating(false)} 
                      variant="ghost" 
                      size="sm" 
                      className="notion-button-ghost h-8"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Content Editor */}
              <div className="flex-1 px-6 py-4">
                <Textarea
                  placeholder="Type '/' for commands..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-base notion-text bg-transparent p-0"
                  style={{ color: darkMode ? '#ffffff' : '#111111' }}
                />
              </div>
            </div>
          ) : selectedNote ? (
            <div className="flex-1 flex flex-col">
              {/* Enhanced Header for Selected Note */}
              <div className="px-6 py-4" style={{ borderBottom: `1px solid ${darkMode ? '#3c3c3c' : '#e5e5e5'}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#0075de' }}>
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                  <Input
                    value={selectedNote.title}
                    onChange={(e) => {
                      const updated = { ...selectedNote, title: e.target.value };
                      setSelectedNote(updated);
                    }}
                    onBlur={() => updateNote(selectedNote)}
                    className="flex-1 notion-title border-none bg-transparent focus-visible:ring-0 p-0 h-auto"
                    style={{ color: darkMode ? '#ffffff' : '#111111' }}
                  />
                    <Button
                      onClick={() => deleteNote(selectedNote.id)}
                      variant="ghost"
                      size="sm"
                      className="notion-button-ghost h-8"
                      style={{ color: '#dc2626' }}
                    >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Enhanced AI Toolbar with simplified colors */}
              <div className="px-6 py-3" style={{ borderBottom: `1px solid ${darkMode ? '#3c3c3c' : '#e5e5e5'}`, backgroundColor: darkMode ? '#111111' : '#fafafa' }}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: '#8b5cf6' }}>
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-sm font-medium notion-text">AI Assistant</span>
                  </div>
                  <div className="flex gap-1">
                    {[
                      { action: 'fix-grammar', icon: Wand2, label: 'Fix Grammar', color: '#0075de' },
                      { action: 'summarize', icon: FileText, label: 'Summarize', color: '#22c55e' },
                      { action: 'expand', icon: Zap, label: 'Expand', color: '#f59e0b' },
                      { action: 'professional', icon: MessageSquare, label: 'Professional', color: '#8b5cf6' },
                      { action: 'casual', icon: MessageSquare, label: 'Casual', color: '#ec4899' }
                    ].map(({ action, icon: Icon, label, color }) => (
                      <Button
                        key={action}
                        onClick={() => handleAIAction(action)}
                        disabled={loading}
                        variant="ghost"
                        size="sm"
                        className="notion-button-ghost h-7 text-xs px-2"
                      >
                        <div 
                          className="w-2 h-2 rounded-full mr-1.5" 
                          style={{ backgroundColor: color }}
                        />
                        <Icon className="w-3 h-3 mr-1" />
                        {label}
                      </Button>
                    ))}
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
                           style={{ borderColor: '#0075de', borderTopColor: 'transparent' }}></div>
                      <span className="text-sm notion-text">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm" 
                     style={{ backgroundColor: '#0075de' }}>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="notion-heading text-lg mb-2">Notes that think with you.</h3>
                <p className="notion-subtext mb-4 leading-relaxed">
                  Automatically fix grammar, adjust tone, and enhance your content with AI-powered suggestions
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => setIsCreating(true)}
                    style={{ backgroundColor: '#0075de', color: '#ffffff' }}
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
