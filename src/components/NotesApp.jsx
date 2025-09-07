import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AIService } from '../lib/ai-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  Sun
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

  useEffect(() => {
    loadNotes();
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

  return (
    <div className={`flex h-screen bg-background text-foreground notion-text ${darkMode ? 'dark' : ''}`}>
      {/* Enhanced Sidebar with Notion styling */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} notion-transition notion-sidebar flex flex-col relative`}>
        {/* Sidebar Header */}
        <div className="p-3 border-b border-border">
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
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
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
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm notion-input border-0 bg-rgba(55,53,47,0.06) focus:bg-white"
              />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {!sidebarCollapsed && (
          <div className="px-3 py-2">
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full h-8 notion-button text-sm font-medium"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              New page
            </Button>
          </div>
        )}

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {!sidebarCollapsed && (
            <div className="px-2 py-1 text-xs font-medium notion-subtext uppercase tracking-wide">
              Pages
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
                  <div className="w-5 h-5 notion-blue-bg rounded flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3 h-3 notion-blue" />
                  </div>
                ) : (
                  <>
                    <div className="w-4 h-4 notion-blue-bg rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="w-2.5 h-2.5 notion-blue" />
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

      {/* Main Content Area with Notion styling */}
      <div className="flex-1 flex flex-col bg-background">
        {isCreating ? (
          <div className="flex-1 flex flex-col">
            {/* Enhanced Header for New Note */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 notion-green-bg rounded flex items-center justify-center">
                  <Plus className="w-3 h-3 notion-green" />
                </div>
                <Input
                  placeholder="Untitled"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 notion-title border-none bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 p-0 h-auto"
                />
                <div className="flex gap-2">
                  <Button onClick={createNote} size="sm" className="notion-button h-8">
                    Done
                  </Button>
                  <Button onClick={() => setIsCreating(false)} variant="ghost" size="sm" className="notion-button-ghost h-8">
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
                className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-base notion-text bg-transparent placeholder:notion-subtext p-0"
              />
            </div>
          </div>
        ) : selectedNote ? (
          <div className="flex-1 flex flex-col">
            {/* Enhanced Header for Selected Note */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 notion-blue-bg rounded flex items-center justify-center">
                  <FileText className="w-3 h-3 notion-blue" />
                </div>
                <Input
                  value={selectedNote.title}
                  onChange={(e) => {
                    const updated = { ...selectedNote, title: e.target.value };
                    setSelectedNote(updated);
                  }}
                  onBlur={() => updateNote(selectedNote)}
                  className="flex-1 notion-title border-none bg-transparent focus-visible:ring-0 p-0 h-auto"
                />
                  <Button
                    onClick={() => deleteNote(selectedNote.id)}
                    variant="ghost"
                    size="sm"
                    className="notion-button-ghost h-8 notion-red hover:notion-red-bg"
                  >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Enhanced AI Toolbar with Notion colors */}
            <div className="px-6 py-3 border-b border-border bg-sidebar/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 notion-purple-bg rounded flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 notion-purple" />
                  </div>
                  <span className="text-sm font-medium notion-text">AI Assistant</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { action: 'fix-grammar', icon: Wand2, label: 'Fix Grammar', color: 'rgb(72, 124, 165)' },
                    { action: 'summarize', icon: FileText, label: 'Summarize', color: 'rgb(84, 129, 100)' },
                    { action: 'expand', icon: Zap, label: 'Expand', color: 'rgb(194, 147, 67)' },
                    { action: 'professional', icon: MessageSquare, label: 'Professional', color: 'rgb(138, 103, 171)' },
                    { action: 'casual', icon: MessageSquare, label: 'Casual', color: 'rgb(179, 84, 136)' }
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
              />
              
              {/* Floating Status */}
              <div className="absolute bottom-4 right-4 text-xs notion-subtext bg-card/90 backdrop-blur-sm px-2 py-1 rounded border border-border/50">
                {new Date(selectedNote.updated_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
            
            {loading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-card rounded-lg p-4 shadow-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm notion-text">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 notion-blue-bg rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Sparkles className="w-8 h-8 notion-blue" />
              </div>
              <h3 className="notion-heading text-lg mb-2">Welcome to your workspace</h3>
              <p className="notion-subtext mb-4 leading-relaxed">
                Get started by creating your first page. Click "New page" in the sidebar or use the button below.
              </p>
              <Button 
                onClick={() => setIsCreating(true)}
                className="notion-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                New page
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
