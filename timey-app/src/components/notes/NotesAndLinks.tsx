import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  ExternalLink,
  FileText,
  Globe,
  Monitor,
  Smartphone,
  File,
  Link2,
  Edit3,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Search,
  Tag,
  Clock,
  Star,
  MoreHorizontal
} from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { Task, ContextLink } from '@/types';
import { cn } from '@/lib/utils';

interface NoteEntry {
  id: string;
  content: string;
  timestamp: Date;
  tags: string[];
  taskId?: string;
  projectId?: string;
}

const LinkTypeIcons = {
  website: Globe,
  file: File,
  app: Monitor,
  document: FileText
};

const ContextLinkCard: React.FC<{
  link: ContextLink;
  onEdit: (link: ContextLink) => void;
  onDelete: (id: string) => void;
  onToggleAutoOpen: (id: string, autoOpen: boolean) => void;
}> = ({ link, onEdit, onDelete, onToggleAutoOpen }) => {
  const IconComponent = LinkTypeIcons[link.type];
  
  const handleOpen = () => {
    if (link.type === 'website') {
      window.open(link.url, '_blank');
    } else if (link.type === 'file') {
      // In Electron, this would use shell.openPath
      console.log('Opening file:', link.url);
    } else if (link.type === 'app') {
      // In Electron, this would use shell.openExternal
      console.log('Opening app:', link.url);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <IconComponent className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{link.title}</h4>
              {link.autoOpen && (
                <Badge variant="secondary" className="text-xs">
                  Auto-open
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground truncate mb-2">
              {link.url}
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpen}
                className="h-6 px-2 text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open
              </Button>
              
              <Switch
                checked={link.autoOpen}
                onCheckedChange={(checked) => onToggleAutoOpen(link.id, checked)}
                className="scale-75"
              />
              <Label className="text-xs text-muted-foreground">Auto</Label>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(link)}>
                <Edit3 className="w-3 h-3 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(link.url)}>
                <Copy className="w-3 h-3 mr-2" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(link.id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

const AddLinkDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (link: Omit<ContextLink, 'id'>) => void;
  editLink?: ContextLink;
}> = ({ open, onOpenChange, onAdd, editLink }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ContextLink['type']>('website');
  const [autoOpen, setAutoOpen] = useState(false);

  useEffect(() => {
    if (editLink) {
      setTitle(editLink.title);
      setUrl(editLink.url);
      setType(editLink.type);
      setAutoOpen(editLink.autoOpen || false);
    } else {
      setTitle('');
      setUrl('');
      setType('website');
      setAutoOpen(false);
    }
  }, [editLink, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && url) {
      onAdd({ title, url, type, autoOpen });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editLink ? 'Edit' : 'Add'} Context Link</DialogTitle>
          <DialogDescription>
            Add a link that will be easily accessible when working on this task
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Project Documentation"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL or Path</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... or /path/to/file"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(value: ContextLink['type']) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="app">Application</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-open"
              checked={autoOpen}
              onCheckedChange={setAutoOpen}
            />
            <Label htmlFor="auto-open">Auto-open when task starts</Label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editLink ? 'Update' : 'Add'} Link
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const NotesEditor: React.FC<{
  taskId: string;
  initialNotes?: string;
  onSave: (notes: string) => void;
}> = ({ taskId, initialNotes = '', onSave }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleSave = () => {
    onSave(notes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNotes(initialNotes);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes
          </CardTitle>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-6 px-2"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              ref={textareaRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes, ideas, or context for this task..."
              className="min-h-[120px] resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {notes ? (
              <div className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-3">
                {notes}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic text-center py-4">
                No notes yet. Click Edit to add some.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const NotesAndLinks: React.FC<{
  task: Task;
  onUpdateTask: (updates: Partial<Task>) => void;
}> = ({ task, onUpdateTask }) => {
  const [showAddLink, setShowAddLink] = useState(false);
  const [editingLink, setEditingLink] = useState<ContextLink | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLinks = task.contextLinks.filter(link =>
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddLink = (linkData: Omit<ContextLink, 'id'>) => {
    const newLink: ContextLink = {
      ...linkData,
      id: `link-${Date.now()}`
    };
    
    onUpdateTask({
      contextLinks: [...task.contextLinks, newLink]
    });
  };

  const handleEditLink = (updatedLink: Omit<ContextLink, 'id'>) => {
    if (editingLink) {
      const updatedLinks = task.contextLinks.map(link =>
        link.id === editingLink.id
          ? { ...updatedLink, id: editingLink.id }
          : link
      );
      
      onUpdateTask({ contextLinks: updatedLinks });
      setEditingLink(undefined);
    }
  };

  const handleDeleteLink = (linkId: string) => {
    const updatedLinks = task.contextLinks.filter(link => link.id !== linkId);
    onUpdateTask({ contextLinks: updatedLinks });
  };

  const handleToggleAutoOpen = (linkId: string, autoOpen: boolean) => {
    const updatedLinks = task.contextLinks.map(link =>
      link.id === linkId ? { ...link, autoOpen } : link
    );
    onUpdateTask({ contextLinks: updatedLinks });
  };

  const handleSaveNotes = (notes: string) => {
    onUpdateTask({ notes });
  };

  const handleOpenAllAutoLinks = () => {
    const autoOpenLinks = task.contextLinks.filter(link => link.autoOpen);
    autoOpenLinks.forEach(link => {
      if (link.type === 'website') {
        window.open(link.url, '_blank');
      }
      // In a real Electron app, you'd handle file and app opening here
    });
  };

  return (
    <div className="space-y-6">
      <AddLinkDialog
        open={showAddLink || !!editingLink}
        onOpenChange={(open) => {
          setShowAddLink(open);
          if (!open) setEditingLink(undefined);
        }}
        onAdd={editingLink ? handleEditLink : handleAddLink}
        editLink={editingLink}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Task Context</h3>
          <p className="text-sm text-muted-foreground">
            Notes and links for seamless task switching
          </p>
        </div>
        
        {task.contextLinks.some(link => link.autoOpen) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAllAutoLinks}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Auto Links
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes Section */}
        <div>
          <NotesEditor
            taskId={task.id}
            initialNotes={task.notes}
            onSave={handleSaveNotes}
          />
        </div>

        {/* Context Links Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Context Links ({task.contextLinks.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddLink(true)}
                  className="h-6 px-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              
              {task.contextLinks.length > 3 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    placeholder="Search links..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              {filteredLinks.length > 0 ? (
                filteredLinks.map(link => (
                  <ContextLinkCard
                    key={link.id}
                    link={link}
                    onEdit={setEditingLink}
                    onDelete={handleDeleteLink}
                    onToggleAutoOpen={handleToggleAutoOpen}
                  />
                ))
              ) : task.contextLinks.length > 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No links match your search
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No context links yet</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddLink(true)}
                    className="mt-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add your first link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowAddLink(true)}
              >
                <Globe className="w-4 h-4 mr-2" />
                Add Website Link
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setShowAddLink(true);
                  // Pre-select document type
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Add Document Link
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const allUrls = task.contextLinks.map(link => link.url).join('\n');
                  navigator.clipboard.writeText(allUrls);
                }}
                disabled={task.contextLinks.length === 0}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy All URLs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
