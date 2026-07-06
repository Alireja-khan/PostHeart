// @ts-nocheck 
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Send, Music, Mic, X, Clock, Feather, Globe, Keyboard as KeyboardIcon, Loader2, Folder, Plus, Play, Pause, SkipBack, SkipForward, Edit2, Trash2, Volume2, VolumeX, Repeat, Repeat1 } from 'lucide-react';
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
const VoiceNoteCard = ({ 
  id, url, onRemove, onAdd, isTop, hasMultiple, onNext, onPrev 
}: { 
  id: string, url: string, onRemove: (id: string) => void, onAdd?: () => void, isTop?: boolean, hasMultiple?: boolean, onNext?: () => void, onPrev?: () => void 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isUploading = url.startsWith('blob:');

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  return (
    <div className="relative w-52 bg-[#1a1a1a] rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2 bg-black/40 rounded-full pr-2 p-1">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
            <Mic size={12} className="text-white/60" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-[10px] font-bold leading-tight">Voice Note</span>
          </div>
        </div>
        
        <div className="flex gap-1">
          {isTop && onAdd && (
            <button 
              onClick={onAdd}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
            >
              <Plus size={10} />
            </button>
          )}
          <button 
            onClick={() => onRemove(id)}
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3 relative z-10">
        <div className="flex justify-between text-[9px] text-white/50 mb-1 font-mono">
          <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
          <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
        </div>
        <div 
          className="w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
             if (!audioRef.current || !duration) return;
             const rect = e.currentTarget.getBoundingClientRect();
             const pos = (e.clientX - rect.left) / rect.width;
             audioRef.current.currentTime = pos * duration;
          }}
        >
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Volume and Extra Controls */}
      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="flex items-center gap-2 w-1/2">
          <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <div 
            className="w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer flex-1"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              setVolume(Math.max(0, Math.min(1, pos)));
              setIsMuted(false);
            }}
          >
            <div className="h-full bg-white transition-all" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
          </div>
        </div>
        <button 
          onClick={() => setIsRepeat(!isRepeat)}
          className={`transition-colors ${isRepeat ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
        >
          {isRepeat ? <Repeat1 size={12} /> : <Repeat size={12} />}
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex justify-center items-center gap-4 relative z-10">
        {isTop && hasMultiple && (
           <button onClick={onPrev} className="text-white/40 hover:text-white transition-colors">
             <SkipBack size={14} fill="currentColor" />
           </button>
        )}
        <button 
          onClick={() => {
            if (isUploading) return;
            if (isPlaying) {
              audioRef.current?.pause();
            } else {
              audioRef.current?.play();
            }
            setIsPlaying(!isPlaying);
          }}
          disabled={isUploading}
          className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-50"
        >
          {isUploading ? <Loader2 size={14} className="animate-spin text-black" /> : isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>
        {isTop && hasMultiple && (
           <button onClick={onNext} className="text-white/40 hover:text-white transition-colors">
             <SkipForward size={14} fill="currentColor" />
           </button>
        )}
      </div>

      <audio 
        ref={audioRef}
        src={url}
        loop={isRepeat}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => !isRepeat && setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

export default function WriteLetterPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [receiver, setReceiver] = useState('');
  const [delay, setDelay] = useState('1m');
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
  const [uploadedMusic, setUploadedMusic] = useState<string | null>(null);
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [embeddedMemories, setEmbeddedMemories] = useState<Record<number, { images: string[], music: string[], audio: string[] }>>({});
  const [nextEmbedId, setNextEmbedId] = useState(1);
  const [selectedEmbedId, setSelectedEmbedId] = useState<number | null>(null);
  const [isEmbedGalleryOpen, setIsEmbedGalleryOpen] = useState(false);
  const [embedGalleryType, setEmbedGalleryType] = useState<'images' | 'music' | 'audio'>('images');
  const [isUploading, setIsUploading] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [musicCover, setMusicCover] = useState<string | null>(null);
  const [showCoverPrompt, setShowCoverPrompt] = useState(false);
  
  // Voice Recording State
  const [isVoicePopupOpen, setIsVoicePopupOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVoices, setRecordedVoices] = useState<{ id: string, url: string }[]>([]);

  const delayMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const keyboardRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const voiceAudioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const embedFileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const musicCoverInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Load draft from sessionStorage on mount
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem('writeLetterDraft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.content) setContent(draft.content);
        if (draft.receiver) setReceiver(draft.receiver);
        if (draft.delay) setDelay(draft.delay);
        if (draft.language) setLanguage(draft.language);
        if (draft.uploadedImages) setUploadedImages(draft.uploadedImages);
        if (draft.uploadedMusic !== undefined) setUploadedMusic(draft.uploadedMusic);
        if (draft.musicCover !== undefined) setMusicCover(draft.musicCover);
        if (draft.recordedVoices) setRecordedVoices(draft.recordedVoices);
        if (draft.embeddedMemories) setEmbeddedMemories(draft.embeddedMemories);
        if (draft.nextEmbedId) setNextEmbedId(draft.nextEmbedId);
        
        // Sync keyboard state if needed, wrapped in timeout to ensure ref is mounted
        setTimeout(() => {
          if (keyboardRef.current && draft.content) {
            keyboardRef.current.setInput(draft.content);
          }
        }, 100);
      }
    } catch (e) {
      console.error('Error loading draft', e);
    }
  }, []);

  // Save draft to sessionStorage on change
  useEffect(() => {
    try {
      // Don't save empty states that would overwrite valid drafts immediately on mount
      if (!content && !receiver && uploadedImages.length === 0 && !uploadedMusic && recordedVoices.length === 0 && Object.keys(embeddedMemories).length === 0) {
        return;
      }
      const draft = {
        content,
        receiver,
        delay,
        language,
        uploadedImages,
        uploadedMusic,
        musicCover,
        recordedVoices,
        embeddedMemories,
        nextEmbedId
      };
      sessionStorage.setItem('writeLetterDraft', JSON.stringify(draft));
    } catch (e) {
      console.error('Error saving draft', e);
    }
  }, [content, receiver, delay, language, uploadedImages, uploadedMusic, musicCover, recordedVoices, embeddedMemories, nextEmbedId]);

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

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploadingMusic(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUploadedMusic(data.url);
        setShowCoverPrompt(true);
      }
    } catch (err) {
      console.error("Music upload error", err);
    } finally {
      setIsUploadingMusic(false);
      if (musicInputRef.current) musicInputRef.current.value = '';
    }
  };

  const handleMusicCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setMusicCover(data.url);
        setShowCoverPrompt(false);
      }
    } catch (err) {
      console.error("Music cover upload error", err);
    } finally {
      if (musicCoverInputRef.current) musicCoverInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const voiceId = Math.random().toString(36).substring(7);
        setRecordedVoices(prev => [{ id: voiceId, url: audioUrl }, ...prev]);
        stream.getTracks().forEach(track => track.stop());
        setIsVoicePopupOpen(false);

        // Upload in background
        const formData = new FormData();
        const file = new File([audioBlob], `voice_${voiceId}.webm`, { type: 'audio/webm' });
        formData.append('file', file);
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.success) {
            setRecordedVoices(prev => prev.map(v => v.id === voiceId ? { ...v, url: data.url } : v));
          }
        } catch (err) {
          console.error("Failed to upload voice note", err);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Could not access microphone.");
      setIsVoicePopupOpen(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
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
    if (delay === '1m') delayMinutes = 1;
    if (delay === '5m') delayMinutes = 5;
    if (delay === '1h') delayMinutes = 60;
    if (delay === '7d') delayMinutes = 7 * 24 * 60;

    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `[To: ${receiver || 'my love'}]\n\n${finalContent}`,
          images: uploadedImages,
          music: uploadedMusic ? (musicCover ? `${uploadedMusic}|${musicCover}` : uploadedMusic) : null,
          voices: recordedVoices.map(v => v.url),
          receiverName: receiver || 'My Love',
          delayMinutes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setContent('');
        setReceiver('');
        setUploadedImages([]);
        setUploadedMusic(null);
        setRecordedVoices([]);
        setEmbeddedMemories({});
        sessionStorage.removeItem('writeLetterDraft');
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
    if (val === '1m') return '1m';
    if (val === '5m') return '5m';
    if (val === '1h') return '1h';
    if (val === '24h') return '24h';
    return '7d';
  };

  const totalAttachments = uploadedImages.length + uploadingImages.length;
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

              <button 
                onClick={() => musicInputRef.current?.click()}
                className={`p-2.5 rounded-full transition-colors relative group hidden sm:block ${uploadedMusic ? 'text-[#ff9f1c]' : 'text-black/40 hover:text-black'}`}
              >
                {isUploadingMusic ? <Loader2 size={16} className="animate-spin" /> : <Music size={16} strokeWidth={2} />}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">
                  {uploadedMusic ? 'Music Added' : 'Add Music'}
                </span>
              </button>

              <button 
                onClick={() => setIsVoicePopupOpen(true)}
                className="p-2.5 text-black/40 hover:text-black rounded-full transition-colors relative group"
              >
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
                      {['1m', '5m', '1h', '24h', '7d'].map((val) => (
                        <button 
                          key={val}
                          onClick={() => {
                            setDelay(val);
                            setIsDelayMenuOpen(false);
                          }}
                          className={`text-left px-3 py-2 text-[12px] rounded-xl font-bold transition-colors ${delay === val ? 'bg-black text-white' : 'text-black/60 hover:text-black hover:bg-black/5'}`}
                        >
                          {val === '1m' ? '1 minute' : val === '5m' ? '5 minutes' : val === '1h' ? '1 hour' : val === '24h' ? 'Tomorrow' : 'Next week'}
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

      {/* Virtual Keyboard Overlay
      <AnimatePresence>
        {isKeyboardOpen ? (
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
        ) : null}
      </AnimatePresence>
      */}

      {/* Background Audio Element */}
      {uploadedMusic && (
        <audio 
          ref={audioRef}
          src={uploadedMusic}
          loop={isRepeat}
          muted={isMuted}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => !isRepeat && setIsPlaying(false)}
        />
      )}

      {/* Sync volume to audio ref when it changes */}
      {useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
      }, [volume])}

      {/* Prompt for cover art */}
      <AnimatePresence>
        {showCoverPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          >
            <div className="bg-[#1a1a1a] border border-white/20 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
              <h3 className="text-white text-xl font-serif mb-2">Music Uploaded</h3>
              <p className="text-white/60 mb-6 text-sm">Would you like to add a cover art image for this music card?</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setShowCoverPrompt(false)}
                  className="px-6 py-2 rounded-full border border-white/20 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Skip
                </button>
                <button 
                  onClick={() => musicCoverInputRef.current?.click()}
                  className="px-6 py-2 rounded-full bg-white text-black hover:scale-105 transition-transform"
                >
                  Add Cover Art
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recording Popup */}
      <AnimatePresence>
        {isVoicePopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
          >
            <div className="bg-[#111] border border-white/10 p-10 rounded-[40px] shadow-2xl max-w-sm w-full flex flex-col items-center relative overflow-hidden">
              {/* Animated Glow when recording */}
              {isRecording && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-white/20 rounded-full blur-3xl -z-10"
                />
              )}
              
              <button onClick={() => { stopRecording(); setIsVoicePopupOpen(false); }} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>

              <div className="mb-8 relative flex items-center justify-center w-32 h-32 mt-4">
                {isRecording ? (
                  <div className="relative flex items-center justify-center">
                     {[1, 2, 3].map((i) => (
                       <motion.div
                         key={i}
                         animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                         transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.5, ease: "easeOut" }}
                         className="absolute inset-0 border border-white/50 rounded-full"
                       />
                     ))}
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] z-10 relative">
                       <Mic size={24} className="text-black" />
                     </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <Mic size={24} className="text-white/60" />
                  </div>
                )}
              </div>

              <div className="text-center mb-10">
                <h3 className="text-white text-xl font-medium mb-2">{isRecording ? "Listening..." : "Record a Voice Note"}</h3>
                <p className="text-white/40 font-mono text-sm">
                  {Math.floor(recordingTime / 60)}:{(Math.floor(recordingTime % 60)).toString().padStart(2, '0')}
                </p>
              </div>

              {isRecording ? (
                <button 
                  onClick={stopRecording}
                  className="w-full py-4 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/10"
                >
                  Stop Recording
                </button>
              ) : (
                <button 
                  onClick={startRecording}
                  className="w-full py-4 rounded-full bg-white text-black font-medium hover:scale-105 transition-transform"
                >
                  Start Recording
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right-Side Attachments Container */}
      <div className="fixed right-6 top-[55%] -translate-y-1/2 z-40 flex flex-col items-end gap-6 pointer-events-none">
      
        {/* Right-Side Voice Notes Stack */}
        <AnimatePresence>
          {recordedVoices.length > 0 && !hasInTransitLetter && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="relative w-52"
              style={{ height: `${160 + (Math.min(recordedVoices.length - 1, 2) * 12)}px` }}
            >
              <AnimatePresence>
                {recordedVoices.slice(0, 3).map((voice, visualIndex) => {
                  const isTop = visualIndex === 0;
                  const zIndex = 50 - visualIndex * 10;
                  const offset = visualIndex * 12; 
                  const scale = 1 - (visualIndex * 0.05);
                  const opacity = 1 - (visualIndex * 0.2);
                  
                  return (
                    <motion.div 
                      key={voice.id}
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity, y: offset, scale }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute top-0 left-0 w-full"
                      style={{ 
                        zIndex,
                        pointerEvents: isTop ? 'auto' : 'none' 
                      }}
                    >
                      <VoiceNoteCard
                        id={voice.id}
                        url={voice.url}
                        onRemove={(id) => setRecordedVoices(prev => prev.filter(v => v.id !== id))}
                        onAdd={() => setIsVoicePopupOpen(true)}
                        isTop={isTop}
                        hasMultiple={recordedVoices.length > 1}
                        onNext={() => {
                          setRecordedVoices(prev => {
                            const arr = [...prev];
                            arr.push(arr.shift()!);
                            return arr;
                          });
                        }}
                        onPrev={() => {
                          setRecordedVoices(prev => {
                            const arr = [...prev];
                            arr.unshift(arr.pop()!);
                            return arr;
                          });
                        }}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right-Side Music Player UI */}
        <AnimatePresence>
          {uploadedMusic && !hasInTransitLetter && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="pointer-events-auto"
            >
            <div className="relative w-52 bg-[#1a1a1a] rounded-3xl p-4 shadow-2xl border border-white/10 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2 bg-black/40 rounded-full pr-2 p-1">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    <Music size={12} className="text-white/60" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-[10px] font-bold leading-tight">Audio Track</span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => musicInputRef.current?.click()}
                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                  >
                    <Edit2 size={10} />
                  </button>
                  <button 
                    onClick={() => {
                      setUploadedMusic(null);
                      setMusicCover(null);
                      setIsPlaying(false);
                    }}
                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>

              {/* Cover Art */}
              <div 
                className="w-full aspect-square rounded-2xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 mb-4 flex items-center justify-center border border-white/5 overflow-hidden relative z-10 cursor-pointer group/cover"
                onClick={() => musicCoverInputRef.current?.click()}
              >
                 {musicCover ? (
                   <img src={musicCover} alt="Cover" className="w-full h-full object-cover" />
                 ) : (
                   <>
                     <div className="absolute inset-0 backdrop-blur-3xl opacity-50" />
                     <Music size={32} className="text-white/20" />
                   </>
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white text-xs font-bold tracking-wider">Change Cover</span>
                 </div>
                 {isPlaying && !musicCover && (
                    <div className="absolute bottom-4 flex gap-1 items-end h-4">
                      {[1,2,3,4].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ height: ['20%', '100%', '20%'] }}
                          transition={{ repeat: Infinity, duration: 0.8 + (i * 0.2), ease: 'easeInOut' }}
                          className="w-1 bg-white/50 rounded-full"
                        />
                      ))}
                    </div>
                 )}
              </div>

              {/* Progress */}
              <div className="mb-3 relative z-10">
                <div className="flex justify-between text-[9px] text-white/50 mb-1 font-mono">
                  <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                  <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
                </div>
                <div 
                  className="w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                     if (!audioRef.current || !duration) return;
                     const rect = e.currentTarget.getBoundingClientRect();
                     const pos = (e.clientX - rect.left) / rect.width;
                     audioRef.current.currentTime = pos * duration;
                  }}
                >
                  <div 
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Volume and Extra Controls */}
              <div className="flex justify-between items-center mb-3 relative z-10">
                <div className="flex items-center gap-2 w-1/2">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                  <div 
                    className="w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer flex-1"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      setVolume(pos);
                      if (pos > 0) setIsMuted(false);
                    }}
                  >
                    <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`transition-colors ${isRepeat ? 'text-[#ff9f1c]' : 'text-white/50 hover:text-white'}`}
                >
                  <Repeat size={12} />
                </button>
              </div>

              {/* Main Controls */}
              <div className="flex justify-center items-center gap-5 relative z-10">
                <button 
                   onClick={() => { if(audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10) }}
                   className="text-white/50 hover:text-white transition-colors"
                >
                  <SkipBack size={14} fill="currentColor" />
                </button>
                <button 
                  onClick={() => {
                    if (isPlaying) {
                      audioRef.current?.pause();
                    } else {
                      audioRef.current?.play();
                    }
                    setIsPlaying(!isPlaying);
                  }}
                  className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                </button>
                <button 
                   onClick={() => { if(audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 10) }}
                   className="text-white/50 hover:text-white transition-colors"
                >
                  <SkipForward size={14} fill="currentColor" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right-Side Folder UI */}
      <AnimatePresence>
        {totalAttachments > 0 && !hasInTransitLetter && !isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            onClick={() => setIsGalleryOpen(true)}
            className="pointer-events-auto cursor-pointer group"
          >
            <div className="relative w-52 bg-[#1a1a1a] rounded-3xl p-4 shadow-2xl border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2 bg-black/40 rounded-full pr-2 p-1">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    <Folder size={12} className="text-white/60" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-[10px] font-bold leading-tight">Gallery</span>
                  </div>
                </div>
                
                <div className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10">
                  {totalAttachments} items
                </div>
              </div>

              {/* Folder Graphic */}
              <div className="flex justify-center mt-2 relative z-10">
                <div className="relative w-24 h-[72px] transition-transform duration-300 group-hover:scale-105">
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
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>

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
      <input 
        type="file" 
        ref={musicInputRef} 
        onChange={handleMusicUpload} 
        className="hidden" 
        accept="audio/*"
      />
      <input 
        type="file" 
        ref={musicCoverInputRef} 
        onChange={handleMusicCoverUpload} 
        className="hidden" 
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
