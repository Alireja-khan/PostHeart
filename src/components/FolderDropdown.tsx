'use client';

import { useState, useEffect, useRef } from 'react';
import { FolderPlus, Folder, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FolderDropdownProps {
  itemId: string; // The URL or ID of the item
  mediaType: 'letters' | 'images' | 'songs' | 'voices';
}

interface CustomFolder {
  id: string;
  name: string;
  items: string[];
}

export default function FolderDropdown({ itemId, mediaType }: FolderDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [folders, setFolders] = useState<CustomFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/folders?type=${mediaType}`);
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFolder = async (folder: CustomFolder) => {
    const isAdded = folder.items.includes(itemId);
    const action = isAdded ? 'remove' : 'add';

    // Optimistic update
    setFolders(prev => prev.map(f => {
      if (f.id === folder.id) {
        return {
          ...f,
          items: isAdded ? f.items.filter(i => i !== itemId) : [...f.items, itemId]
        };
      }
      return f;
    }));

    try {
      await fetch('/api/folders/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: folder.id, itemId, action })
      });
      window.dispatchEvent(new CustomEvent('folderItemUpdated', { detail: { folderId: folder.id, action, itemId } }));
    } catch (e) {
      console.error(e);
      fetchFolders(); // revert
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim(), type: mediaType })
      });
      if (res.ok) {
        const newFolder = await res.json();
        setFolders([...folders, newFolder]);
        setNewFolderName('');
        setIsCreating(false);
        // auto add this item to the new folder
        await handleToggleFolder(newFolder);
        
        // Notify other components that a new folder was created
        window.dispatchEvent(new Event('folderUpdated'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1.5 rounded bg-black/40 hover:bg-[#c2410c] text-white/70 hover:text-white transition-colors border border-white/5 shadow-sm"
        title="Add to Folder"
      >
        <FolderPlus size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 right-0 w-48 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl p-2 z-50 origin-bottom-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2 px-2">Folders</div>
            
            {loading ? (
              <div className="px-2 py-3 text-xs text-white/30 text-center">Loading...</div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1 mb-2 custom-scrollbar">
                {folders.length === 0 && (
                  <div className="px-2 py-2 text-[10px] text-white/30 italic">No folders yet</div>
                )}
                {folders.map(folder => {
                  const isAdded = folder.items.includes(itemId);
                  return (
                    <button
                      key={folder.id}
                      onClick={() => handleToggleFolder(folder)}
                      className="w-full text-left px-2 py-1.5 flex items-center justify-between hover:bg-white/5 rounded text-xs text-white/80 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Folder size={12} className={isAdded ? "text-[#c2410c]" : "text-white/40"} />
                        <span className="truncate max-w-[100px]">{folder.name}</span>
                      </span>
                      {isAdded && <Check size={12} className="text-[#c2410c]" />}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="border-t border-white/10 pt-2">
              {isCreating ? (
                <div className="flex flex-col gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') setIsCreating(false);
                    }}
                    placeholder="Folder name..."
                    className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#c2410c] w-full"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleCreateFolder} className="flex-1 bg-[#c2410c] hover:bg-[#a3360a] text-white text-[10px] py-1 rounded transition-colors uppercase tracking-widest font-bold">Create</button>
                    <button onClick={() => setIsCreating(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[10px] py-1 rounded transition-colors uppercase tracking-widest font-bold">Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 text-xs text-white/50 hover:text-white px-2 py-1.5 hover:bg-white/5 rounded transition-colors"
                >
                  <Plus size={12} />
                  <span>New Folder</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
