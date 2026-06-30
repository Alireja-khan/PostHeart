'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Send, Music, Mic, X, Clock, Feather, Globe, Keyboard as KeyboardIcon, Loader2, Folder, Plus } from 'lucide-react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'Bengali' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
];

// Global in-memory cache for maximum speed on repeated words
const transliterationCache = new Map<string, string>();

export default function WriteLetterPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [receiver, setReceiver] = useState('');
  const [delay, setDelay] = useState('5m');
  const [language, setLanguage] = useState('en');
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isDelayMenuOpen, setIsDelayMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransliterating, setIsTransliterating] = useState(false);
  const [hasInTransitLetter, setHasInTransitLetter] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [embeddedMemories, setEmbeddedMemories] = useState<Record<number, { images: string[], music: string[], audio: string[] }>>({});
  const [nextEmbedId, setNextEmbedId] = useState(1);
  const [selectedEmbedId, setSelectedEmbedId] = useState<number | null>(null);
  const [isEmbedGalleryOpen, setIsEmbedGalleryOpen] = useState(false);
  const [embedGalleryType, setEmbedGalleryType] = useState<'images' | 'music' | 'audio'>('images');
  const [isUploading, setIsUploading] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);

  const delayMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const keyboardRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const embedFileInputRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkActiveLetter = async () => {
      try {
        const res = await fetch('/api/letters/in-transit');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.isSender) {
            setHasInTransitLetter(true);
          }
        }
      } catch (err) {}
    };
    checkActiveLetter();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (delayMenuRef.current && !delayMenuRef.current.contains(event.target as Node)) {
        setIsDelayMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (galleryRef.current && !galleryRef.current.contains(event.target as Node)) {
        setIsGalleryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Virtual Keyboard Sync
  const onKeyboardChange = (input: string) => {
    setContent(input);
    if (textAreaRef.current) {
      textAreaRef.current.value = input;
      autoResizeTextarea();
    }
  };

  const autoResizeTextarea = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  const applyTransliteration = (translated: string, cursor: number, lastWordLength: number, textAfterCursor: string) => {
    const newContent = content.substring(0, cursor - lastWordLength) + translated + ' ' + textAfterCursor;
    setContent(newContent);
    if (keyboardRef.current) keyboardRef.current.setInput(newContent);
    
    setTimeout(() => {
      if (textAreaRef.current) {
        const newCursorPos = cursor - lastWordLength + translated.length + 1;
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const applyFallbackSpace = (textBeforeCursor: string, textAfterCursor: string, cursor: number) => {
    const newContent = textBeforeCursor + ' ' + textAfterCursor;
    setContent(newContent);
    if (keyboardRef.current) keyboardRef.current.setInput(newContent);
    
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const newCursorPos = cursor + 1;
        textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Phonetic Transliteration Logic
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (language !== 'en' && e.key === ' ' && !isTransliterating) {
      e.preventDefault();
      
      const target = e.target as HTMLTextAreaElement;
      const cursor = target.selectionStart;
      const textBeforeCursor = content.substring(0, cursor);
      const textAfterCursor = content.substring(cursor);
      
      const words = textBeforeCursor.split(/[\s\n]+/);
      const lastWordChunk = words[words.length - 1];

      // Extract optional prefix, the actual english word, and optional suffix (punctuation)
      const match = lastWordChunk.match(/^([^a-zA-Z]*)([a-zA-Z]+)([^a-zA-Z]*)$/);

      if (match && match[2].length > 0) {
        const prefix = match[1];
        const wordToTranslate = match[2];
        const suffix = match[3];
        const cacheKey = `${language}-${wordToTranslate.toLowerCase()}`;
        
        // INSTANT CACHE HIT
        if (transliterationCache.has(cacheKey)) {
          const finalReplacement = prefix + transliterationCache.get(cacheKey) + suffix;
          applyTransliteration(finalReplacement, cursor, lastWordChunk.length, textAfterCursor);
          return;
        }

        // DIRECT API FETCH (Bypass Next.js proxy for max speed)
        setIsTransliterating(true);
        try {
          const url = `https://inputtools.google.com/request?text=${encodeURIComponent(wordToTranslate)}&itc=${language}-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
          const res = await fetch(url);
          const data = await res.json();
          
          if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1] && data[1][0][1].length > 0) {
            const translated = data[1][0][1][0];
            transliterationCache.set(cacheKey, translated); // Save to instant cache
            const finalReplacement = prefix + translated + suffix;
            applyTransliteration(finalReplacement, cursor, lastWordChunk.length, textAfterCursor);
          } else {
            applyFallbackSpace(textBeforeCursor, textAfterCursor, cursor);
          }
        } catch (error) {
          applyFallbackSpace(textBeforeCursor, textAfterCursor, cursor);
        } finally {
          setIsTransliterating(false);
        }
      } else {
        applyFallbackSpace(textBeforeCursor, textAfterCursor, cursor);
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (keyboardRef.current) keyboardRef.current.setInput(val);
    autoResizeTextarea();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const filesArray = Array.from(e.target.files);
    
    // 1. Create immediate local preview URLs so UI updates instantly
    const localUrls = filesArray.map(f => URL.createObjectURL(f));
    setUploadingImages(prev => [...prev, ...localUrls]);

    // 2. Upload them in the background
    filesArray.forEach(async (file, index) => {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          setUploadedImages(prev => [...prev, data.url]);
        }
      } catch (err) {
        console.error("Upload error", err);
      } finally {
        // Remove this local URL from the uploading state once done
        setUploadingImages(prev => prev.filter(url => url !== localUrls[index]));
      }
    });
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Notice: We NO LONGER open the gallery automatically!
  };

  const handleEmbedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // If they already have an embed open, this means they're adding MORE images to the current memory!
    if (selectedEmbedId && isEmbedGalleryOpen) {
      const filesArray = Array.from(e.target.files);
      const localUrls = filesArray.map(f => URL.createObjectURL(f));
      
      setEmbeddedMemories(prev => {
        const next = {...prev};
        if (!next[selectedEmbedId]) {
          next[selectedEmbedId] = { images: [], music: [], audio: [] };
        }
        next[selectedEmbedId].images = [...next[selectedEmbedId].images, ...localUrls];
        return next;
      });
      
      if (embedFileInputRef.current) embedFileInputRef.current.value = '';

      filesArray.forEach(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success) {
            setEmbeddedMemories(prev => {
              const next = {...prev};
              if (next[selectedEmbedId]) {
                 next[selectedEmbedId].images = next[selectedEmbedId].images.map(url => url === localUrls[index] ? data.url : url);
              }
              return next;
            });
          }
        } catch(err) {
          console.error("Embed add upload error", err);
        }
      });
      return;
    }
    
    // Otherwise it's a NEW embed from text selection
    const start = textAreaRef.current?.selectionStart || 0;
    const end = textAreaRef.current?.selectionEnd || 0;
    
    if (start === end) {
      alert("Please highlight some text first to embed an image into it.");
      if (embedFileInputRef.current) embedFileInputRef.current.value = '';
      return;
    }

    const selectedText = content.substring(start, end);
    let cleanSelectedText = selectedText;
    const regex = /\u200C(\u200B+)(.*?)\u200D/g;
    let match;
    const oldIds: number[] = [];
    while ((match = regex.exec(selectedText)) !== null) {
      oldIds.push(match[1].length);
    }
    cleanSelectedText = cleanSelectedText.replace(/\u200C|\u200D|\u200B/g, '');

    const filesArray = Array.from(e.target.files);
    const localUrls = filesArray.map(f => URL.createObjectURL(f));
    
    const id = nextEmbedId;
    setNextEmbedId(id + 1);
    
    // Merge old memory contents if the new selection swallowed old memories
    setEmbeddedMemories(prev => {
      const mergedImages = [...localUrls];
      const mergedMusic: string[] = [];
      const mergedAudio: string[] = [];
      
      oldIds.forEach(oldId => {
        if (prev[oldId]) {
          mergedImages.push(...prev[oldId].images);
          mergedMusic.push(...prev[oldId].music);
          mergedAudio.push(...prev[oldId].audio);
        }
      });
      
      const next = {
        ...prev, 
        [id]: { images: mergedImages, music: mergedMusic, audio: mergedAudio }
      };
      
      // Clean up orphaned memories
      oldIds.forEach(oldId => delete next[oldId]);
      return next;
    });
    
    const encodedId = '\u200B'.repeat(id);
    const newText = content.substring(0, start) + '\u200C' + encodedId + cleanSelectedText + '\u200D' + content.substring(end);
    setContent(newText);
    if (keyboardRef.current) keyboardRef.current.setInput(newText);
    
    setTimeout(() => {
      if (textAreaRef.current) textAreaRef.current.focus();
    }, 0);
    
    setMousePos(null);
    if (embedFileInputRef.current) embedFileInputRef.current.value = '';

    // Upload in background
    filesArray.forEach(async (file, index) => {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setEmbeddedMemories(prev => {
            const next = {...prev};
            if (next[id]) {
               next[id].images = next[id].images.map(url => url === localUrls[index] ? data.url : url);
            }
            return next;
          });
        }
      } catch(err) {
        console.error("Embed new upload error", err);
      }
    });
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    
    let finalContent = content;
    const regex = /\u200C(\u200B+)(.*?)\u200D/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const id = match[1].length;
      const memory = embeddedMemories[id];
      if (memory && (memory.images.length > 0 || memory.music.length > 0 || memory.audio.length > 0)) {
        finalContent = finalContent.replace(match[0], `[[${match[2]}|${JSON.stringify(memory)}]]`);
      } else {
        finalContent = finalContent.replace(match[0], match[2]);
      }
    }
    finalContent = finalContent.replace(/\u200C|\u200D|\u200B/g, '');

    let delayMinutes = 24 * 60;
    if (delay === '5m') delayMinutes = 5;
    if (delay === '1h') delayMinutes = 60;
    if (delay === '7d') delayMinutes = 7 * 24 * 60;

    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: finalContent,
          images: uploadedImages,
          receiverName: receiver || 'My Love',
          delayMinutes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setContent('');
        setReceiver('');
        setUploadedImages([]);
        setEmbeddedUrls({});
        if (keyboardRef.current) keyboardRef.current.setInput('');
        window.dispatchEvent(new Event('letter-posted'));
        router.push('/scheduled');
      } else {
        alert(data.error || 'Failed to post letter');
        setIsSubmitting(false);
      }
    } catch (err) {
      alert('An error occurred.');
      setIsSubmitting(false);
    }
  };

  const getDelayText = (val: string) => {
    if (val === '5m') return '5m';
    if (val === '1h') return '1h';
    if (val === '24h') return '24h';
    return '7d';
  };

  const totalImages = uploadedImages.length + uploadingImages.length;
  const allImages = [...uploadedImages, ...uploadingImages];
  const lastImage = allImages.length > 0 ? allImages[allImages.length - 1] : null;
  const secondLastImage = allImages.length > 1 ? allImages[allImages.length - 2] : null;

  const renderRichText = (text: string) => {
    if (!text) return <span className="text-white/20 pointer-events-none">{isTransliterating ? "Translating..." : "What are you feeling right now?"}</span>;
    
    const parts = [];
    const regex = /\u200C(\u200B+)(.*?)\u200D/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
      }
      
      const id = match[1].length;
      const linkText = match[2];
      const memory = embeddedMemories[id];
      const matchString = match[0];
      
      parts.push(
        <span 
          key={`link-${match.index}`} 
          className="text-[#ff9f1c] cursor-pointer pointer-events-auto relative group transition-colors hover:text-[#ffd166]"
          onClick={() => {
            if (memory) setSelectedEmbedId(id);
          }}
        >
          {linkText}
          {memory && (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-[#f9f8f6] text-black text-[10px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity delay-100 pointer-events-none shadow-2xl z-50">
              See Memory
            </span>
          )}
        </span>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }
    if (text.endsWith('\n')) {
      parts.push(<br key="br-end" />);
    }
    return parts;
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-white relative flex flex-col items-center pt-24 pb-48 px-6 font-sans">
      
      {/* Ultra Minimal Boundless Writing Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl flex flex-col z-10 relative"
      >
        <div className="flex items-center gap-4 mb-12">
          <Feather size={20} className="text-white/20" strokeWidth={1} />
          <input 
            type="text" 
            placeholder="To my love..." 
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            disabled={hasInTransitLetter || isSubmitting}
            spellCheck="false"
            className="w-full bg-transparent border-none text-3xl md:text-5xl text-white/90 font-serif focus:outline-none placeholder-white/20"
          />
        </div>
        
        <div 
          className="relative w-full"
          onMouseUp={(e) => {
            if (textAreaRef.current && textAreaRef.current.selectionStart !== textAreaRef.current.selectionEnd) {
              setMousePos({ x: e.clientX, y: e.clientY });
            } else {
              setMousePos(null);
            }
          }}
        >
          {/* Backdrop for syntax highlighting inline images */}
          <div 
            className="absolute inset-0 w-full h-full text-xl md:text-2xl font-serif leading-relaxed md:leading-loose whitespace-pre-wrap break-words pointer-events-none z-10 p-0 m-0"
            style={{ color: isFocused || content ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)' }}
          >
            {renderRichText(content)}
          </div>

          <textarea 
            ref={textAreaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSelect={() => {
              if (textAreaRef.current && textAreaRef.current.selectionStart === textAreaRef.current.selectionEnd) {
                setMousePos(null);
              }
            }}
            disabled={hasInTransitLetter || isSubmitting}
            spellCheck="false"
            lang={language}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            className="w-full relative z-0 bg-transparent border-none text-xl md:text-2xl font-serif leading-relaxed md:leading-loose focus:outline-none resize-none transition-colors duration-500 min-h-[300px] overflow-hidden p-0 m-0 text-transparent caret-white"
            style={{ outline: 'none' }}
          />
          {isTransliterating && (
            <div className="absolute top-4 right-4 animate-spin text-white/20 z-20">
              <Loader2 size={16} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Floating Toolbar (Ultra Minimal) */}
      <AnimatePresence>
        {!hasInTransitLetter && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isFocused && !content ? 0.3 : 1, y: isFocused && !content ? 20 : 0 }}
            className={`fixed ${isKeyboardOpen ? 'bottom-[240px] md:bottom-[320px]' : 'bottom-10'} left-1/2 -translate-x-1/2 flex items-center gap-2 z-50 mix-blend-difference transition-all duration-300`}
          >
            {/* Tools Group */}
            <div className="flex items-center gap-1 bg-white border border-black/10 rounded-full px-2 py-1 shadow-2xl">
              <button 
                onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                className={`p-2.5 rounded-full transition-colors relative group ${isKeyboardOpen ? 'text-black bg-black/5' : 'text-black/40 hover:text-black'}`}
              >
                <KeyboardIcon size={16} strokeWidth={2} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">Virtual Keyboard</span>
              </button>

              <button className="p-2.5 text-black/40 hover:text-black rounded-full transition-colors relative group hidden sm:block">
                <Music size={16} strokeWidth={2} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">Add Music</span>
              </button>

              <button className="p-2.5 text-black/40 hover:text-black rounded-full transition-colors relative group">
                <Mic size={16} strokeWidth={2} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">Voice Note</span>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-full transition-colors relative group text-black/40 hover:text-black`}
              >
                <ImageIcon size={16} strokeWidth={2} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">Add Memory</span>
              </button>

              <div className="w-[1px] h-4 bg-black/10 mx-1" />

              {/* Language Selector */}
              <div className="relative" ref={langMenuRef}>
                <button 
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className={`p-2.5 rounded-full transition-colors relative group ${isLangMenuOpen ? 'text-black bg-black/5' : 'text-black/40 hover:text-black'}`}
                >
                  <Globe size={16} strokeWidth={2} />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">Language</span>
                </button>

                <AnimatePresence>
                  {isLangMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white border border-black/10 rounded-2xl shadow-xl flex flex-col p-1.5 min-w-[120px]"
                    >
                      {LANGUAGES.map((lang) => (
                        <button 
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={`text-left px-3 py-2 text-[12px] rounded-xl font-bold transition-colors ${language === lang.code ? 'bg-black text-white' : 'text-black/60 hover:text-black hover:bg-black/5'}`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-[1px] h-4 bg-black/10 mx-1" />

              {/* Delay Dropdown */}
              <div className="relative" ref={delayMenuRef}>
                <button 
                  onClick={() => setIsDelayMenuOpen(!isDelayMenuOpen)}
                  className="flex items-center gap-1.5 p-2 px-3 text-[12px] font-bold text-black/50 hover:text-black hover:bg-black/5 rounded-full transition-colors"
                >
                  <Clock size={14} strokeWidth={2} />
                  {getDelayText(delay)}
                </button>

                <AnimatePresence>
                  {isDelayMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white border border-black/10 rounded-2xl shadow-xl flex flex-col p-1.5 min-w-[120px]"
                    >
                      {['5m', '1h', '24h', '7d'].map((val) => (
                        <button 
                          key={val}
                          onClick={() => {
                            setDelay(val);
                            setIsDelayMenuOpen(false);
                          }}
                          className={`text-left px-3 py-2 text-[12px] rounded-xl font-bold transition-colors ${delay === val ? 'bg-black text-white' : 'text-black/60 hover:text-black hover:bg-black/5'}`}
                        >
                          {val === '5m' ? '5 minutes' : val === '1h' ? '1 hour' : val === '24h' ? 'Tomorrow' : 'Next week'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Send Button */}
              <AnimatePresence>
                {content.trim().length > 0 && (
                  <motion.button 
                    initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                    animate={{ width: 'auto', opacity: 1, marginLeft: 8 }}
                    exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center justify-center bg-black text-white h-9 px-5 rounded-full hover:scale-105 active:scale-95 transition-all overflow-hidden whitespace-nowrap"
                  >
                    <Send size={14} className={isSubmitting ? 'animate-pulse' : ''} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Virtual Keyboard Overlay */}
      <AnimatePresence>
        {isKeyboardOpen && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-[#e4e4e4] dark:bg-[#1a1a1a] p-2 pt-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 text-black dark:text-white"
            style={{ 
              ['--hg-theme-default-bg' as any]: '#222',
              ['--hg-theme-default-button-bg' as any]: '#333',
              ['--hg-theme-default-button-hover-bg' as any]: '#444'
            }}
          >
            <div className="max-w-4xl mx-auto h-[200px] md:h-[280px]">
              <Keyboard
                keyboardRef={r => (keyboardRef.current = r)}
                onChange={onKeyboardChange}
                physicalKeyboardHighlight={true}
                physicalKeyboardHighlightTextColor="white"
                physicalKeyboardHighlightBgColor="#007bff"
                theme={"hg-theme-default hg-layout-default myTheme"}
                layout={{
                  default: [
                    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                    "{tab} q w e r t y u i o p [ ] \\",
                    "{lock} a s d f g h j k l ; ' {enter}",
                    "{shift} z x c v b n m , . / {shift}",
                    "{space}"
                  ],
                  shift: [
                    "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
                    "{tab} Q W E R T Y U I O P { } |",
                    "{lock} A S D F G H J K L : \" {enter}",
                    "{shift} Z X C V B N M < > ? {shift}",
                    "{space}"
                  ]
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right-Side Folder UI */}
      <AnimatePresence>
        {totalImages > 0 && !hasInTransitLetter && !isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            onClick={() => setIsGalleryOpen(true)}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-40 cursor-pointer group"
          >
            {/* Custom CSS Glass Folder matching the reference image */}
            <div className="relative w-24 h-[72px] transition-transform duration-300 group-hover:scale-105 group-hover:-translate-x-2">
              
              {/* Folder Back (Dark) */}
              <div className="absolute bottom-0 left-0 w-full h-[85%] bg-gradient-to-b from-[#2a2a2a] to-[#111] rounded-xl rounded-tl-none shadow-2xl border border-white/10" />
              {/* Folder Back Tab */}
              <div className="absolute top-0 left-0 w-[40%] h-[25%] bg-[#2a2a2a] rounded-t-lg border-t border-l border-white/10" />

              {/* Document 1 */}
              <div className="absolute top-2 left-4 w-12 h-[50px] bg-[#e5e5e5] rounded shadow-sm transform -rotate-6 origin-bottom-left transition-transform duration-300 group-hover:-translate-y-3 group-hover:-rotate-12 overflow-hidden border border-white/20">
                {secondLastImage ? (
                  <img src={secondLastImage} alt="Preview 1" className="w-full h-full object-cover opacity-90" />
                ) : (
                  <>
                    <div className="mt-2 ml-2 w-8 h-[2px] bg-black/10 rounded-full" />
                    <div className="mt-1.5 ml-2 w-5 h-[2px] bg-black/10 rounded-full" />
                  </>
                )}
              </div>
              
              {/* Document 2 */}
              <div className="absolute top-3 left-8 w-12 h-[48px] bg-white rounded shadow-sm transform rotate-6 origin-bottom-right transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-12 overflow-hidden border border-white/20">
                {lastImage ? (
                  <img src={lastImage} alt="Preview 2" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="mt-2 ml-2 w-6 h-[2px] bg-black/10 rounded-full" />
                    <div className="mt-1.5 ml-2 w-8 h-[2px] bg-black/10 rounded-full" />
                    <div className="mt-1.5 ml-2 w-4 h-[2px] bg-black/10 rounded-full" />
                  </>
                )}
              </div>

              {/* Front Glass layer (Translucent Frosted) */}
              <div className="absolute bottom-0 left-0 w-full h-[70%] bg-white/[0.15] backdrop-blur-md rounded-xl border border-white/30 shadow-[0_-4px_16px_rgba(0,0,0,0.2)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
              </div>
              
              {/* Notification Badge */}
              <div className="absolute -top-3 -right-3 bg-black text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg border border-white/20 z-10">
                {totalImages}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Popup Overlay */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          >
            <motion.div
              ref={galleryRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-xl font-serif">Attached Memories</h3>
                <button onClick={() => setIsGalleryOpen(false)} className="text-white/60 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Uploaded final images */}
                {uploadedImages.map((url, idx) => (
                  <div key={`final-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden bg-black/20 border border-white/10">
                    <img src={url} alt={`Memory ${idx+1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {/* Currently uploading temporary images */}
                {uploadingImages.map((localUrl, idx) => (
                  <div key={`temp-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden bg-black/20 border border-white/10">
                    <img src={localUrl} alt={`Uploading ${idx+1}`} className="w-full h-full object-cover opacity-50 grayscale" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                      <Loader2 size={24} className="text-white animate-spin" />
                    </div>
                  </div>
                ))}

                {/* Add More Button Box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/60 transition-all group"
                >
                  <Plus size={24} className="text-white/40 group-hover:text-white/80 mb-2 transition-colors" />
                  <span className="text-white/40 group-hover:text-white/80 text-[10px] font-bold uppercase tracking-wider transition-colors">Add More</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Selection Toolbar */}
      <AnimatePresence>
        {mousePos && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed z-50 flex items-center gap-1 bg-[#1a1a1a] border border-white/10 rounded-full px-2 py-1.5 shadow-2xl"
            style={{ 
              top: Math.max(20, mousePos.y - 60),
              left: mousePos.x,
              transform: 'translateX(-50%)'
            }}
          >
            <button 
              onClick={(e) => { 
                e.preventDefault(); 
                setMousePos(null);
                embedFileInputRef.current?.click(); 
              }}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all relative group"
            >
              <ImageIcon size={14} strokeWidth={2} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-wider">Embed Image</span>
            </button>
            <button 
              onClick={() => setMousePos(null)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all relative group"
            >
              <Music size={14} strokeWidth={2} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-wider">Embed Music</span>
            </button>
            <button 
              onClick={() => setMousePos(null)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all relative group"
            >
              <Mic size={14} strokeWidth={2} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-wider">Embed Voice</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
        multiple 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={embedFileInputRef} 
        onChange={handleEmbedImageUpload} 
        className="hidden" 
        multiple
        accept="image/*"
      />

      {/* Vault Popup */}
      <AnimatePresence>
        {selectedEmbedId && !isEmbedGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
            onClick={() => setSelectedEmbedId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/20 p-8 rounded-3xl shadow-2xl flex gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Images Folder */}
              <div 
                className="flex flex-col items-center gap-3 cursor-pointer group"
                onClick={() => {
                  setEmbedGalleryType('images');
                  setIsEmbedGalleryOpen(true);
                }}
              >
                <div className="relative">
                  <div className="w-16 h-12 bg-blue-500/20 rounded-lg border border-blue-500/40 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <ImageIcon className="text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white/20">
                    {embeddedMemories[selectedEmbedId]?.images.length || 0}
                  </div>
                </div>
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">Images</span>
              </div>
              
              {/* Music Folder */}
              <div 
                className="flex flex-col items-center gap-3 cursor-pointer group opacity-50 hover:opacity-100 transition-opacity"
              >
                <div className="relative">
                  <div className="w-16 h-12 bg-purple-500/20 rounded-lg border border-purple-500/40 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <Music className="text-purple-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white/20">
                    {embeddedMemories[selectedEmbedId]?.music.length || 0}
                  </div>
                </div>
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">Music</span>
              </div>
              
              {/* Audio Folder */}
              <div 
                className="flex flex-col items-center gap-3 cursor-pointer group opacity-50 hover:opacity-100 transition-opacity"
              >
                <div className="relative">
                  <div className="w-16 h-12 bg-green-500/20 rounded-lg border border-green-500/40 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <Mic className="text-green-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white/20">
                    {embeddedMemories[selectedEmbedId]?.audio.length || 0}
                  </div>
                </div>
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">Voice</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded Gallery Popup */}
      <AnimatePresence>
        {selectedEmbedId && isEmbedGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsEmbedGalleryOpen(false)} className="text-white/60 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    <Feather size={16} className="rotate-180" /> {/* Back icon */}
                  </button>
                  <h3 className="text-white text-xl font-serif capitalize">Memory {embedGalleryType}</h3>
                </div>
                <button onClick={() => { setIsEmbedGalleryOpen(false); setSelectedEmbedId(null); }} className="text-white/60 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {embeddedMemories[selectedEmbedId]?.[embedGalleryType].map((url, idx) => (
                  <div key={`embed-img-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden bg-black/20 border border-white/10">
                    <img src={url} alt={`Memory ${idx+1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => {
                        setEmbeddedMemories(prev => {
                          const next = {...prev};
                          if (next[selectedEmbedId]) {
                            next[selectedEmbedId][embedGalleryType] = next[selectedEmbedId][embedGalleryType].filter((_, i) => i !== idx);
                          }
                          return next;
                        });
                      }}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {/* Add More Button */}
                <div 
                  onClick={() => embedFileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/60 transition-all group"
                >
                  <Plus size={24} className="text-white/40 group-hover:text-white/80 mb-2 transition-colors" />
                  <span className="text-white/40 group-hover:text-white/80 text-[10px] font-bold uppercase tracking-wider transition-colors">Add Image</span>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                 <button 
                    onClick={() => {
                       const regex = /\u200C(\u200B+)(.*?)\u200D/g;
                       let match;
                       let targetMatchString = null;
                       let targetLinkText = null;
                       while ((match = regex.exec(content)) !== null) {
                         if (match[1].length === selectedEmbedId) {
                           targetMatchString = match[0];
                           targetLinkText = match[2];
                           break;
                         }
                       }
                       if (targetMatchString && targetLinkText) {
                         const newContent = content.replace(targetMatchString, targetLinkText);
                         setContent(newContent);
                         if (keyboardRef.current) keyboardRef.current.setInput(newContent);
                         setEmbeddedMemories(prev => {
                           const next = {...prev};
                           delete next[selectedEmbedId];
                           return next;
                         });
                         setIsEmbedGalleryOpen(false);
                         setSelectedEmbedId(null);
                       }
                    }}
                    className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider transition-colors"
                 >
                    Remove Entire Memory
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
