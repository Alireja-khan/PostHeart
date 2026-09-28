// @ts-nocheck 
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Send, Music, Mic, X, Clock, Feather, Globe, Keyboard as KeyboardIcon, Folder, Plus, Play, Pause, SkipBack, SkipForward, Edit2, Trash2, Volume2, VolumeX, Repeat, Repeat1, Book, Eye, RotateCcw } from 'lucide-react';
import BirdLoader from "@/components/BirdLoader";
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { uploadFile } from '@/lib/upload';
import { useDialog } from '@/components/DialogProvider';
import LetterPreviewModal from '@/components/LetterPreviewModal';
import AtmosphereButton from '@/components/AtmosphereButton';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'Bengali' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
];

// Pre-seeded high-frequency romantic / letter vocabulary for 0ms instant transliteration
const COMMON_BN_WORDS: Record<string, string> = {
  ami: 'আমি',
  amio: 'আমিও',
  amra: 'আমরা',
  amader: 'আমাদের',
  amar: 'আমার',
  amake: 'আমাকে',
  tumi: 'তুমি',
  tumio: 'তুমিও',
  tomra: 'তোমরা',
  tomader: 'তোমাদের',
  tomar: 'তোমার',
  tomake: 'তোমাকে',
  tui: 'তুই',
  tor: 'তোর',
  toke: 'তোকে',
  apni: 'আপনি',
  apnar: 'আপনার',
  apnake: 'আপনাকে',
  she: 'সে',
  tar: 'তার',
  take: 'তাকে',
  tara: 'তারা',
  tader: 'তাদের',
  kemon: 'কেমন',
  acho: 'আছো',
  achho: 'আছো',
  achen: 'আছেন',
  achi: 'আছি',
  achhi: 'আছি',
  bhalo: 'ভালো',
  valo: 'ভালো',
  bhalobashi: 'ভালোবাসি',
  valobashi: 'ভালোবাসি',
  bhalobasha: 'ভালোবাসা',
  valobasha: 'ভালোবাসা',
  priyo: 'প্রিয়',
  jaan: 'জান',
  poran: 'পরাণ',
  mon: 'মন',
  mone: 'মনে',
  kotha: 'কথা',
  shob: 'সব',
  shobai: 'সবাই',
  shune: 'শুনে',
  dekhe: 'দেখে',
  dekhi: 'দেখি',
  dekho: 'দেখো',
  jani: 'জানি',
  bolo: 'বলো',
  boli: 'বলি',
  shunbo: 'শুনবো',
  shuno: 'শুনো',
  ki: 'কি',
  keno: 'কেন',
  kothay: 'কোথায়',
  kobe: 'কবে',
  kokhon: 'কখন',
  shomoy: 'সময়',
  din: 'দিন',
  raat: 'রাত',
  shokal: 'সকাল',
  shondha: 'সন্ধ্যা',
  bikel: 'বিকেল',
  aaj: 'আজ',
  aajke: 'আজকে',
  kal: 'কাল',
  kalke: 'কালকে',
  ekhon: 'এখন',
  pore: 'পরে',
  age: 'আগে',
  onek: 'অনেক',
  khub: 'খুব',
  ektu: 'একটু',
  kichu: 'কিছু',
  kisu: 'কিছু',
  shathe: 'সাথে',
  songe: 'সঙ্গে',
  hobe: 'হবে',
  holo: 'হলো',
  hoyeche: 'হয়েছে',
  hoy: 'হয়',
  ache: 'আছে',
  chilo: 'ছিল',
  chilam: 'ছিলাম',
  chobi: 'ছবি',
  gaan: 'গান',
  chithi: 'চিঠি',
  postheart: 'পোস্টহার্ট',
  dhonnobad: 'ধন্যবাদ',
  dhonobad: 'ধন্যবাদ',
  shundor: 'সুন্দর',
  shotti: 'সত্যি',
  beshi: 'বেশি',
  kom: 'কম',
  shanto: 'শান্ত',
  ei: 'এই',
  oi: 'ওই',
  shei: 'সেই',
  eta: 'এটা',
  ota: 'ওটা',
  sheta: 'সেটা',
  hasi: 'হাসি',
  kanna: 'কান্না',
  chokh: 'চোখ',
  mukhe: 'মুখে',
  hridoy: 'হৃদয়',
  pagol: 'পাগল',
  pagli: 'পাগলী',
  babu: 'বাবু',
  bou: 'বউ',
  meye: 'মেয়ে',
  chele: 'ছেলে',
  basha: 'বাসা',
  bari: 'বাড়ি',
  pakhi: 'পাখি',
  akash: 'আকাশ',
  megh: 'মেঘ',
  brishti: 'বৃষ্টি',
  batash: 'বাতাস',
};

// Global in-memory cache for maximum speed on repeated words
const transliterationCache = new Map<string, string>();
Object.entries(COMMON_BN_WORDS).forEach(([k, v]) => {
  transliterationCache.set(`bn-${k}`, v);
});
const VoiceNoteCard = ({ 
  id, url, title, onRemove, onAdd, isTop, hasMultiple, onNext, onPrev, onTitleChange 
}: { 
  id: string, url: string, title?: string, onRemove: (id: string) => void, onAdd?: () => void, isTop?: boolean, hasMultiple?: boolean, onNext?: () => void, onPrev?: () => void, onTitleChange?: (val: string) => void
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
    <div className="relative w-52 bg-bg-secondary rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-text-primary/10 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2 bg-bg-primary/40 rounded-full pr-2 p-1">
          <div className="w-6 h-6 rounded-full bg-text-primary/10 flex items-center justify-center overflow-hidden">
            <Mic size={12} className="text-text-primary/60" />
          </div>
          <div className="flex flex-col">
            {onTitleChange ? (
              <input 
                type="text" 
                value={title || ''} 
                onChange={(e) => onTitleChange(e.target.value)} 
                placeholder="Voice Note Title"
                className="bg-transparent text-text-primary text-[10px] font-bold leading-tight border-b border-text-primary/20 focus:border-text-primary focus:outline-none w-24 placeholder-white/30"
              />
            ) : (
              <span className="text-text-primary text-[10px] font-bold leading-tight">{title || 'Voice Note'}</span>
            )}
          </div>
        </div>
        
        <div className="flex gap-1">
          {isTop && onAdd && (
            <button 
              onClick={onAdd}
              className="w-6 h-6 rounded-full bg-text-primary/10 flex items-center justify-center hover:bg-text-primary/20 transition-colors text-text-primary"
            >
              <Plus size={10} />
            </button>
          )}
          <button 
            onClick={() => onRemove(id)}
            className="w-6 h-6 rounded-full bg-text-primary/10 flex items-center justify-center hover:bg-text-primary/20 transition-colors text-text-primary"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3 relative z-10">
        <div className="flex justify-between text-[9px] text-text-primary/50 mb-1 font-mono">
          <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
          <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
        </div>
        <div 
          className="w-full h-1 bg-text-primary/10 rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
             if (!audioRef.current || !duration) return;
             const rect = e.currentTarget.getBoundingClientRect();
             const pos = (e.clientX - rect.left) / rect.width;
             audioRef.current.currentTime = pos * duration;
          }}
        >
          <div 
            className="h-full bg-text-primary transition-all duration-100 ease-linear"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Volume and Extra Controls */}
      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="flex items-center gap-2 w-1/2">
          <button onClick={() => setIsMuted(!isMuted)} className="text-text-primary/50 hover:text-text-primary transition-colors">
            {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <div 
            className="w-full h-1 bg-text-primary/10 rounded-full overflow-hidden cursor-pointer flex-1"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              setVolume(Math.max(0, Math.min(1, pos)));
              setIsMuted(false);
            }}
          >
            <div className="h-full bg-text-primary transition-all" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
          </div>
        </div>
        <button 
          onClick={() => setIsRepeat(!isRepeat)}
          className={`transition-colors ${isRepeat ? 'text-text-primary' : 'text-text-primary/30 hover:text-text-primary/60'}`}
        >
          {isRepeat ? <Repeat1 size={12} /> : <Repeat size={12} />}
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex justify-center items-center gap-4 relative z-10">
        {isTop && hasMultiple && (
           <button onClick={onPrev} className="text-text-primary/40 hover:text-text-primary transition-colors">
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
          className="w-8 h-8 bg-text-primary text-bg-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-50"
        >
          {isUploading ? <BirdLoader className="w-4 h-4 text-bg-primary" /> : isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>
        {isTop && hasMultiple && (
           <button onClick={onNext} className="text-text-primary/40 hover:text-text-primary transition-colors">
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
  const { alert } = useDialog();
  const router = useRouter();
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [receiver, setReceiver] = useState('');
  const [coverTitle, setCoverTitle] = useState('');
  const [coverSubtitle, setCoverSubtitle] = useState('');
  const [delay, setDelay] = useState('1m');
  const [language, setLanguage] = useState('en');
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isDelayMenuOpen, setIsDelayMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState<'default' | 'shift'>('default');
  const [isCoverMenuOpen, setIsCoverMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransliterating, setIsTransliterating] = useState(false);
  const [hasInTransitLetter, setHasInTransitLetter] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Autosave and Preview States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittedRef = useRef(false);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [uploadedMusic, setUploadedMusic] = useState<string | null>(null);
  const [musicTitle, setMusicTitle] = useState('');
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [isUploadingMusicCover, setIsUploadingMusicCover] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [mediaStatus, setMediaStatus] = useState<{
    type: 'music' | 'image' | 'voice';
    title?: string;
    message: string;
    progress?: number;
    isDone?: boolean;
  } | null>(null);
  
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
  
  // Pending audio file waiting for cover & title configuration BEFORE showing in frontend
  const [pendingMusicFile, setPendingMusicFile] = useState<File | null>(null);
  const [pendingMusicTitle, setPendingMusicTitle] = useState('');
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [pendingCoverPreview, setPendingCoverPreview] = useState<string | null>(null);
  const [isCoverSetupModalOpen, setIsCoverSetupModalOpen] = useState(false);
  const pendingCoverInputRef = useRef<HTMLInputElement>(null);
  
  // Voice Recording State
  const [isVoicePopupOpen, setIsVoicePopupOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVoices, setRecordedVoices] = useState<{ id: string, url: string, title?: string }[]>([]);

  const delayMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const coverMenuRef = useRef<HTMLDivElement>(null);
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

  // Load draft from sessionStorage or localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem('writeLetterDraft') || localStorage.getItem('postheart_letter_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.content) setContent(draft.content);
        if (draft.receiver) setReceiver(draft.receiver);
        if (draft.delay) setDelay(draft.delay);
        if (draft.language) setLanguage(draft.language);
        if (draft.uploadedImages) setUploadedImages(draft.uploadedImages);
        if (draft.uploadedMusic !== undefined) setUploadedMusic(draft.uploadedMusic);
        if (draft.musicTitle !== undefined) setMusicTitle(draft.musicTitle);
        if (draft.musicCover !== undefined) setMusicCover(draft.musicCover);
        if (draft.coverTitle !== undefined) setCoverTitle(draft.coverTitle);
        if (draft.coverSubtitle !== undefined) setCoverSubtitle(draft.coverSubtitle);
        if (draft.recordedVoices) setRecordedVoices(draft.recordedVoices);
        if (draft.embeddedMemories) setEmbeddedMemories(draft.embeddedMemories);
        if (draft.nextEmbedId) setNextEmbedId(draft.nextEmbedId);
        
        const now = new Date();
        setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setSaveStatus('saved');

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

  // Save draft to sessionStorage & localStorage on change with debounce & autosave indicator
  useEffect(() => {
    if (isSubmittedRef.current) return;
    try {
      // Don't save empty states that would overwrite valid drafts immediately on mount
      if (!content && !receiver && uploadedImages.length === 0 && !uploadedMusic && recordedVoices.length === 0 && Object.keys(embeddedMemories).length === 0) {
        return;
      }

      setSaveStatus('saving');
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

      autosaveTimeoutRef.current = setTimeout(() => {
        if (isSubmittedRef.current) return;
        const draft = {
          content,
          receiver,
          delay,
          language,
          uploadedImages,
          uploadedMusic,
          musicTitle,
          musicCover,
          coverTitle,
          coverSubtitle,
          recordedVoices,
          embeddedMemories,
          nextEmbedId
        };
        sessionStorage.setItem('writeLetterDraft', JSON.stringify(draft));
        try {
          localStorage.setItem('postheart_letter_draft', JSON.stringify(draft));
        } catch(e) {}

        const now = new Date();
        setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setSaveStatus('saved');
      }, 600);
    } catch (e) {
      console.error('Error saving draft', e);
      setSaveStatus('idle');
    }

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [content, receiver, delay, language, uploadedImages, uploadedMusic, musicTitle, musicCover, coverTitle, coverSubtitle, recordedVoices, embeddedMemories, nextEmbedId]);

  const onKeyPress = (button: string) => {
    if (button === "{shift}" || button === "{lock}") {
      setKeyboardLayout(prev => prev === 'default' ? 'shift' : 'default');
    }
  };

  useEffect(() => {
    const checkActiveLetter = async () => {
      try {
        const res = await fetch('/api/letters/in-transit');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.isSender) {
            setHasInTransitLetter(true);
            // If the user already sent a letter and it is currently in transit,
            // clean up any leftover draft of that sent letter from storage!
            sessionStorage.removeItem('writeLetterDraft');
            try {
              localStorage.removeItem('postheart_letter_draft');
              localStorage.removeItem('dear_you_letter_draft');
              localStorage.removeItem('letter_draft_title');
              localStorage.removeItem('letter_draft_content');
            } catch (e) {}
            setContent('');
            setReceiver('');
            setCoverTitle('');
            setCoverSubtitle('');
            setUploadedImages([]);
            setUploadedMusic(null);
            setMusicTitle('');
            setMusicCover(null);
            setRecordedVoices([]);
            setEmbeddedMemories({});
            setNextEmbedId(1);
            setLastSavedTime(null);
            setSaveStatus('idle');
            if (keyboardRef.current) keyboardRef.current.setInput('');
            if (textAreaRef.current) textAreaRef.current.value = '';
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
      if (coverMenuRef.current && !coverMenuRef.current.contains(event.target as Node)) {
        setIsCoverMenuOpen(false);
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

  const applyTransliteration = (
    finalReplacement: string,
    startIndex: number,
    textAfterCursor: string,
    currentFullText: string
  ) => {
    const newContent = currentFullText.substring(0, startIndex) + finalReplacement + ' ' + textAfterCursor;
    setContent(newContent);
    if (keyboardRef.current) keyboardRef.current.setInput(newContent);
    
    if (textAreaRef.current) {
      textAreaRef.current.value = newContent;
      autoResizeTextarea();
      const newCursorPos = startIndex + finalReplacement.length + 1;
      textAreaRef.current.focus();
      textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  const applyFallbackSpace = (
    textBeforeCursor: string,
    textAfterCursor: string,
    cursor: number
  ) => {
    const newContent = textBeforeCursor + ' ' + textAfterCursor;
    setContent(newContent);
    if (keyboardRef.current) keyboardRef.current.setInput(newContent);
    
    if (textAreaRef.current) {
      textAreaRef.current.value = newContent;
      autoResizeTextarea();
      const newCursorPos = cursor + 1;
      textAreaRef.current.focus();
      textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  // Phonetic Transliteration Logic: converts English phonetics into Bengali/target language on pressing Space
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (language !== 'en' && e.key === ' ' && !isTransliterating) {
      const target = e.target as HTMLTextAreaElement;
      const cursor = target.selectionStart;
      const currentVal = target.value;
      const textBeforeCursor = currentVal.substring(0, cursor);
      const textAfterCursor = currentVal.substring(cursor);
      
      const words = textBeforeCursor.split(/[\s\n]+/);
      const lastWordChunk = words[words.length - 1];

      // Extract optional prefix, the actual english word, and optional suffix (punctuation)
      const match = lastWordChunk ? lastWordChunk.match(/^([^a-zA-Z]*)([a-zA-Z]+)([^a-zA-Z]*)$/) : null;

      if (match && match[2].length > 0) {
        e.preventDefault();
        const prefix = match[1];
        const wordToTranslate = match[2];
        const suffix = match[3];
        const cacheKey = `${language}-${wordToTranslate.toLowerCase()}`;
        const startIndex = cursor - lastWordChunk.length;
        
        // 1. Instant Cache Hit (0ms!)
        if (transliterationCache.has(cacheKey)) {
          const finalReplacement = prefix + transliterationCache.get(cacheKey) + suffix;
          applyTransliteration(finalReplacement, startIndex, textAfterCursor, currentVal);
          return;
        }

        // 2. Reliable Next.js API Proxy (Bypasses browser CORS completely)
        setIsTransliterating(true);
        try {
          const res = await fetch('/api/transliterate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: wordToTranslate, lang: language }),
          });
          const data = await res.json();
          
          if (data.success && data.options && data.options.length > 0) {
            const translated = data.options[0];
            transliterationCache.set(cacheKey, translated); // Save to instant cache
            const finalReplacement = prefix + translated + suffix;
            applyTransliteration(finalReplacement, startIndex, textAfterCursor, currentVal);
          } else {
            applyFallbackSpace(textBeforeCursor, textAfterCursor, cursor);
          }
        } catch (error) {
          applyFallbackSpace(textBeforeCursor, textAfterCursor, cursor);
        } finally {
          setIsTransliterating(false);
        }
      }
    }
  };

  const handleClearDraft = () => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
    sessionStorage.removeItem('writeLetterDraft');
    try {
      localStorage.removeItem('postheart_letter_draft');
      localStorage.removeItem('dear_you_letter_draft');
      localStorage.removeItem('letter_draft_title');
      localStorage.removeItem('letter_draft_content');
    } catch(e) {}

    setContent('');
    setReceiver('');
    setCoverTitle('');
    setCoverSubtitle('');
    setUploadedImages([]);
    setUploadedMusic(null);
    setMusicTitle('');
    setMusicCover(null);
    setRecordedVoices([]);
    setEmbeddedMemories({});
    setNextEmbedId(1);
    setLastSavedTime(null);
    setSaveStatus('idle');
    if (keyboardRef.current) keyboardRef.current.setInput('');
    if (textAreaRef.current) {
      textAreaRef.current.value = '';
      autoResizeTextarea();
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
    
    // 1. Instant local preview URLs (0ms user feedback!)
    const localUrls = filesArray.map(f => URL.createObjectURL(f));
    setUploadedImages(prev => [...prev, ...localUrls]);
    setMediaStatus({
      type: 'image',
      message: `Enclosing ${filesArray.length} photo${filesArray.length > 1 ? 's' : ''} into letter...`,
      progress: 25
    });

    try {
      let completedCount = 0;
      // Parallel upload for high speed
      const uploadedPairs = await Promise.all(
        filesArray.map(async (file, idx) => {
          const url = await uploadFile(file);
          completedCount++;
          setMediaStatus({
            type: 'image',
            message: `Enclosing photos: ${completedCount}/${filesArray.length} safely vaulted...`,
            progress: Math.round((completedCount / filesArray.length) * 100)
          });
          return { localUrl: localUrls[idx], permanentUrl: url };
        })
      );

      // Smoothly replace local blob URLs with permanent Cloudinary URLs
      setUploadedImages(prev => {
        return prev.map(item => {
          const pair = uploadedPairs.find(p => p.localUrl === item);
          return pair ? pair.permanentUrl : item;
        });
      });

      setMediaStatus({
        type: 'image',
        message: `${filesArray.length} photo${filesArray.length > 1 ? 's' : ''} sealed in letter!`,
        progress: 100,
        isDone: true
      });
      setTimeout(() => setMediaStatus(null), 3200);
    } catch (err) {
      console.error("Upload error", err);
      setMediaStatus({
        type: 'image',
        message: "Some photos could not be vaulted.",
        isDone: false
      });
      setTimeout(() => setMediaStatus(null), 4000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const cleanedTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    
    // Store pending music file and open cover & title setup modal BEFORE displaying on the frontend
    setPendingMusicFile(file);
    setPendingMusicTitle(cleanedTitle);
    setPendingCoverFile(null);
    setPendingCoverPreview(null);
    setIsCoverSetupModalOpen(true);

    if (musicInputRef.current) musicInputRef.current.value = '';
  };

  const handlePendingCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setPendingCoverFile(file);
    setPendingCoverPreview(URL.createObjectURL(file));
    if (pendingCoverInputRef.current) pendingCoverInputRef.current.value = '';
  };

  const handleConfirmAttachMelody = async () => {
    if (!pendingMusicFile) return;

    const audioFileToUpload = pendingMusicFile;
    const titleToUse = pendingMusicTitle.trim() || audioFileToUpload.name.replace(/\.[^/.]+$/, "");
    const coverFileToUpload = pendingCoverFile;
    const coverLocalPreview = pendingCoverPreview;

    // 1. Set title and cover art IMMEDIATELY so the frontend has them ready on mount
    setMusicTitle(titleToUse);
    if (coverLocalPreview) {
      setMusicCover(coverLocalPreview);
    }

    // 2. Set local audio URL so music player appears WITH the cover art already set!
    const localAudioUrl = URL.createObjectURL(audioFileToUpload);
    setUploadedMusic(localAudioUrl);

    // 3. Close the setup modal
    setIsCoverSetupModalOpen(false);
    setPendingMusicFile(null);
    setPendingCoverFile(null);
    setPendingCoverPreview(null);

    // 4. Background Cloudinary uploads
    setIsUploadingMusic(true);
    try {
      // Parallel upload of audio and cover image (if chosen)
      const uploadPromises: Promise<any>[] = [uploadFile(audioFileToUpload)];
      if (coverFileToUpload) {
        setIsUploadingMusicCover(true);
        uploadPromises.push(uploadFile(coverFileToUpload));
      }

      const results = await Promise.all(uploadPromises);
      const permanentAudioUrl = results[0];
      setUploadedMusic(permanentAudioUrl);

      if (results[1]) {
        const permanentCoverUrl = results[1];
        setMusicCover(permanentCoverUrl);
      }
    } catch (err) {
      console.error("Background music upload error", err);
    } finally {
      setIsUploadingMusic(false);
      setIsUploadingMusicCover(false);
    }
  };

  const handleCancelMusicSetup = () => {
    setIsCoverSetupModalOpen(false);
    setPendingMusicFile(null);
    setPendingCoverFile(null);
    setPendingCoverPreview(null);
    setPendingMusicTitle('');
  };

  const handleMusicCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploadingMusicCover(true);
    const file = e.target.files[0];
    try {
      const url = await uploadFile(file);
      setMusicCover(url);
    } catch (err) {
      console.error("Music cover upload error", err);
    } finally {
      setIsUploadingMusicCover(false);
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
        const file = new File([audioBlob], `voice_${voiceId}.webm`, { type: 'audio/webm' });
        try {
          const url = await uploadFile(file);
          setRecordedVoices(prev => prev.map(v => v.id === voiceId ? { ...v, url } : v));
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
      await alert('Error', "Could not access microphone.");
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
        try {
          const url = await uploadFile(file);
          setEmbeddedMemories(prev => {
            const next = {...prev};
            if (next[selectedEmbedId]) {
               next[selectedEmbedId].images = next[selectedEmbedId].images.map(imgUrl => imgUrl === localUrls[index] ? url : imgUrl);
            }
            return next;
          });
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
      await alert('Selection Required', "Please highlight some text first to embed an image into it.");
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
      try {
        const url = await uploadFile(file);
        setEmbeddedMemories(prev => {
          const next = {...prev};
          if (next[id]) {
             next[id].images = next[id].images.map(imgUrl => imgUrl === localUrls[index] ? url : imgUrl);
          }
          return next;
        });
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
          musicTitle: musicTitle || null,
          voices: recordedVoices.map(v => v.url),
          voiceTitles: recordedVoices.map(v => v.title || 'Voice Note'),
          receiverName: receiver || 'My Love',
          delayMinutes,
          coverTitle: coverTitle || 'Dear You.',
          coverSubtitle: coverSubtitle || 'A Private Space',
        }),
      });

      const data = await response.json();
      if (data.success) {
        isSubmittedRef.current = true;
        if (autosaveTimeoutRef.current) {
          clearTimeout(autosaveTimeoutRef.current);
          autosaveTimeoutRef.current = null;
        }

        sessionStorage.removeItem('writeLetterDraft');
        try {
          localStorage.removeItem('postheart_letter_draft');
          localStorage.removeItem('dear_you_letter_draft');
          localStorage.removeItem('letter_draft_title');
          localStorage.removeItem('letter_draft_content');
        } catch (e) {}

        setContent('');
        setReceiver('');
        setCoverTitle('');
        setCoverSubtitle('');
        setUploadedImages([]);
        setUploadedMusic(null);
        setMusicTitle('');
        setMusicCover(null);
        setRecordedVoices([]);
        setEmbeddedMemories({});
        setNextEmbedId(1);
        setLastSavedTime(null);
        setSaveStatus('idle');
        if (keyboardRef.current) keyboardRef.current.setInput('');
        if (textAreaRef.current) textAreaRef.current.value = '';

        // Add slight delay to show success state before redirect
        window.dispatchEvent(new Event('letter-posted'));
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        await alert('Failed', data.error || 'Failed to post letter');
        setIsSubmitting(false);
      }
    } catch (err) {
      await alert('Error', 'An error occurred.');
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
    if (!text) return <span className="text-text-primary/20 pointer-events-none">{isTransliterating ? "Translating..." : "What are you feeling right now?"}</span>;
    
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
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-text-primary text-bg-primary text-[10px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity delay-100 pointer-events-none shadow-2xl z-50">
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
    <div className="w-full min-h-screen bg-transparent text-text-primary relative flex flex-col items-center pt-24 pb-48 px-6 font-sans overflow-x-hidden">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl flex flex-col z-10 relative"
      >
          {/* Top Sanctuary Bar with Soft Pulsing Autosave Indicator */}
          <div className="flex items-center justify-between pb-3 mb-8 border-b border-text-primary/10">
            <div className="flex items-center gap-2 text-xs font-serif text-text-primary/50 tracking-wider">
              <Feather size={14} className="text-[#c2410c]" />
              <span className="uppercase text-[11px] font-mono tracking-widest text-[#a89b88]">Epistolary Sanctuary • চিঠি লেখার ডেস্ক</span>
            </div>

            {/* Soft Pulsing Autosave Badge & Reset Draft Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#181512]/90 border border-[#382f25]/80 shadow-sm backdrop-blur-md">
                {saveStatus === 'saving' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-[11px] font-mono text-[#dcd3c5]">Saving draft...</span>
                  </>
                ) : lastSavedTime ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500/90 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                    <span className="text-[11px] font-mono text-[#b5a998]">Draft saved at {lastSavedTime}</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8c7d6b]" />
                    <span className="text-[11px] font-mono text-[#8c7d6b]">Sanctuary Ledger Ready</span>
                  </>
                )}
              </div>

              {(content || uploadedImages.length > 0 || uploadedMusic || recordedVoices.length > 0 || coverTitle) && (
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201410] hover:bg-red-950/70 border border-[#48281d] hover:border-red-800/60 text-[#cda490] hover:text-red-200 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                  title="Discard Current Draft & Start Fresh"
                >
                  <RotateCcw size={10} />
                  <span>Start Fresh</span>
                </button>
              )}
            </div>
          </div>

          {/* Enclosed Keepsakes Active Strip */}
          {(uploadedImages.length > 0 || uploadedMusic || recordedVoices.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap mb-6 p-2 px-3.5 rounded-2xl bg-[#16120e]/80 border border-[#33271b] backdrop-blur-sm shadow-sm">
              <span className="text-[10px] font-mono text-[#8c7d6b] uppercase tracking-wider mr-1">Enclosed:</span>
              
              {/* Attached Music Pill */}
              {uploadedMusic && (
                <div className="flex items-center gap-1.5 bg-[#231a13] border border-[#443322] rounded-full py-1 px-3 text-xs text-[#fae1b8] font-serif shadow-xs">
                  <Music size={12} className="text-[#c2410c] shrink-0" />
                  <span className="max-w-[150px] truncate">{musicTitle || 'Background Audio'}</span>
                  <button 
                    type="button" 
                    onClick={() => { setUploadedMusic(null); setMusicTitle(''); }}
                    className="text-[#9c8e7c] hover:text-white ml-0.5 p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                    title="Remove music"
                  >
                    <X size={11} />
                  </button>
                </div>
              )}

              {/* Attached Image Thumbnails */}
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative group w-8 h-8 rounded-lg overflow-hidden border border-[#443322] shrink-0 shadow-xs">
                  <img src={img} alt={`Attached ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Attached Voice Notes */}
              {recordedVoices.map((voice) => (
                <div key={voice.id} className="flex items-center gap-1.5 bg-[#231a13] border border-[#443322] rounded-full py-1 px-2.5 text-xs text-[#fae1b8] font-serif shadow-xs">
                  <Mic size={11} className="text-[#c2410c] shrink-0" />
                  <span className="text-[11px] max-w-[120px] truncate">{voice.title || 'Voice Note'}</span>
                  <button
                    type="button"
                    onClick={() => setRecordedVoices(prev => prev.filter(v => v.id !== voice.id))}
                    className="text-[#9c8e7c] hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                    title="Remove voice note"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 mb-12">
            <div className="flex items-center gap-4">
              <Feather size={20} className="text-text-primary/20" strokeWidth={1} />
              <input 
                type="text" 
                placeholder="To my love..." 
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                disabled={hasInTransitLetter || isSubmitting}
                spellCheck="false"
                className="w-full bg-transparent border-none text-3xl md:text-5xl text-text-primary/90 focus:outline-none placeholder-white/20 font-typewriter"
              />
            </div>
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
            className="absolute inset-0 w-full h-full text-xl md:text-2xl leading-relaxed md:leading-loose whitespace-pre-wrap break-words pointer-events-none z-10 p-0 m-0 font-typewriter"
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
            className="w-full relative z-0 bg-transparent border-none text-xl md:text-2xl leading-relaxed md:leading-loose focus:outline-none resize-none transition-colors duration-500 min-h-[300px] overflow-hidden p-0 m-0 text-transparent caret-white font-typewriter"
            style={{ outline: 'none' }}
          />
          {isTransliterating && (
            <div className="absolute top-4 right-4 animate-spin text-text-primary/20 z-20">
              <BirdLoader className="w-5 h-5" />
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
            <div className="flex items-center gap-1 bg-text-primary border border-bg-primary/10 rounded-full px-2 py-1 shadow-2xl">
              <button 
                onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                className={`p-2.5 rounded-full transition-colors relative group ${isKeyboardOpen ? 'text-bg-primary bg-bg-primary/5' : 'text-bg-primary/40 hover:text-bg-primary'}`}
              >
                <KeyboardIcon size={16} strokeWidth={2} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-bg-primary text-text-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">Virtual Keyboard</span>
              </button>

              <div className="relative" ref={coverMenuRef}>
                <button 
                  onClick={() => setIsCoverMenuOpen(!isCoverMenuOpen)}
                  className={`p-2.5 rounded-full transition-colors relative group ${isCoverMenuOpen ? 'text-bg-primary bg-bg-primary/5' : 'text-bg-primary/40 hover:text-bg-primary'}`}
                >
                  <Book size={16} strokeWidth={2} />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-bg-primary text-text-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">Notebook Cover</span>
                </button>

                <AnimatePresence>
                  {isCoverMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-text-primary border border-bg-primary/10 rounded-2xl shadow-xl flex flex-col p-4 min-w-[280px]"
                    >
                      <h4 className="text-bg-primary font-bold text-sm mb-3">Notebook Cover</h4>
                      <div className="flex flex-col gap-3">
                        <input 
                          type="text" 
                          placeholder="Title (e.g. Dear You.)" 
                          value={coverTitle}
                          onChange={(e) => setCoverTitle(e.target.value)}
                          disabled={hasInTransitLetter || isSubmitting}
                          spellCheck="false"
                          className="w-full bg-bg-primary/5 rounded-xl border-none text-sm text-bg-primary focus:outline-none placeholder-black/40 font-serif px-3 py-2"
                        />
                        <input 
                          type="text" 
                          placeholder="Subtitle (e.g. A Private Space)" 
                          value={coverSubtitle}
                          onChange={(e) => setCoverSubtitle(e.target.value)}
                          disabled={hasInTransitLetter || isSubmitting}
                          spellCheck="false"
                          className="w-full bg-bg-primary/5 rounded-xl border-none text-xs text-bg-primary focus:outline-none placeholder-black/40 font-mono uppercase tracking-widest px-3 py-2"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => musicInputRef.current?.click()}
                className={`p-2.5 rounded-full transition-colors relative group hidden sm:block ${uploadedMusic ? 'text-[#ff9f1c]' : 'text-bg-primary/40 hover:text-bg-primary'}`}
              >
                {isUploadingMusic ? <BirdLoader className="w-5 h-5 text-bg-primary" /> : <Music size={16} strokeWidth={2} />}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-bg-primary text-text-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">
                  {uploadedMusic ? 'Music Added' : 'Add Music'}
                </span>
              </button>

              <button 
                onClick={() => setIsVoicePopupOpen(true)}
                className="p-2.5 text-bg-primary/40 hover:text-bg-primary rounded-full transition-colors relative group"
              >
                <Mic size={16} strokeWidth={2} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-bg-primary text-text-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">Voice Note</span>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-full transition-colors relative group text-bg-primary/40 hover:text-bg-primary`}
              >
                <ImageIcon size={16} strokeWidth={2} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-bg-primary text-text-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">Add Memory</span>
              </button>

              <div className="w-[1px] h-4 bg-bg-primary/10 mx-1" />

              {/* Language Selector */}
              <div className="relative" ref={langMenuRef}>
                <button 
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className={`p-2.5 rounded-full transition-colors relative group ${isLangMenuOpen ? 'text-bg-primary bg-bg-primary/5' : 'text-bg-primary/40 hover:text-bg-primary'}`}
                >
                  <Globe size={16} strokeWidth={2} />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-bg-primary text-text-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">Language</span>
                </button>

                <AnimatePresence>
                  {isLangMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-text-primary border border-bg-primary/10 rounded-2xl shadow-xl flex flex-col p-1.5 min-w-[120px]"
                    >
                      {LANGUAGES.map((lang) => (
                        <button 
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={`text-left px-3 py-2 text-[12px] rounded-xl font-bold transition-colors ${language === lang.code ? 'bg-bg-primary text-text-primary' : 'text-bg-primary/60 hover:text-bg-primary hover:bg-bg-primary/5'}`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-[1px] h-4 bg-bg-primary/10 mx-1" />

              {/* Ambient Atmosphere Engine Button */}
              <AtmosphereButton 
                variant="badge" 
                label="Ambience" 
                className="!bg-bg-primary/10 hover:!bg-bg-primary/20 !text-bg-primary !border-transparent h-8 !px-2.5 sm:!px-3"
              />

              <div className="w-[1px] h-4 bg-bg-primary/10 mx-1" />

              {/* Delay Dropdown */}
              <div className="relative" ref={delayMenuRef}>
                <button 
                  onClick={() => setIsDelayMenuOpen(!isDelayMenuOpen)}
                  className="flex items-center gap-1.5 p-2 px-3 text-[12px] font-bold text-bg-primary/50 hover:text-bg-primary hover:bg-bg-primary/5 rounded-full transition-colors"
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
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-text-primary border border-bg-primary/10 rounded-2xl shadow-xl flex flex-col p-1.5 min-w-[120px]"
                    >
                      {['1m', '5m', '1h', '24h', '7d'].map((val) => (
                        <button 
                          key={val}
                          onClick={() => {
                            setDelay(val);
                            setIsDelayMenuOpen(false);
                          }}
                          className={`text-left px-3 py-2 text-[12px] rounded-xl font-bold transition-colors ${delay === val ? 'bg-bg-primary text-text-primary' : 'text-bg-primary/60 hover:text-bg-primary hover:bg-bg-primary/5'}`}
                        >
                          {val === '1m' ? '1 minute' : val === '5m' ? '5 minutes' : val === '1h' ? '1 hour' : val === '24h' ? 'Tomorrow' : 'Next week'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons: Preview & Send */}
              <AnimatePresence>
                {content.trim().length > 0 && (
                  <div className="flex items-center gap-1.5 ml-2">
                    {/* Letter Preview Button */}
                    <button 
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-bg-primary/10 hover:bg-bg-primary text-bg-primary hover:text-text-primary transition-all text-xs font-serif font-bold cursor-pointer"
                      title="Preview Sealed Envelope & Letter Look"
                    >
                      <Eye size={13} className="text-[#c2410c]" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>

                    {/* Send Button */}
                    <motion.button 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-1.5 bg-[#c2410c] hover:bg-[#ea580c] text-white h-8 px-4 rounded-full hover:scale-105 active:scale-95 transition-all overflow-hidden whitespace-nowrap cursor-pointer shadow-md font-serif font-bold text-xs uppercase tracking-wider"
                    >
                      <Send size={13} className={isSubmitting ? 'animate-pulse' : ''} />
                      <span>Send</span>
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Redesigned Virtual On-Screen Keyboard Dock with Minimize Toggle */}
      <AnimatePresence>
        {isKeyboardOpen && (
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#161310]/95 backdrop-blur-xl border-t border-[#382f25] shadow-[0_-15px_45px_rgba(0,0,0,0.85)] p-2 sm:p-4 text-[#f5f0e6]"
          >
            {/* Clean Minimize / Close Toolbar */}
            <div className="max-w-3xl mx-auto flex items-center justify-between pb-2 mb-2 border-b border-[#2d251d]">
              <div className="flex items-center gap-2">
                <KeyboardIcon size={14} className="text-[#c2410c]" />
                <span className="font-serif text-xs font-bold text-[#e6ded1]">Vintage Typewriter Keyboard</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#241e17] text-[#a89b88] border border-[#3d3224]">
                  {LANGUAGES.find(l => l.code === language)?.name || 'English'}
                </span>
                {language === 'bn' && (
                  <span className="text-[10px] text-[#c5a059] font-serif hidden sm:inline">
                    (Phonetic Typing Active: 'ami' → 'আমি')
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsKeyboardOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#251e18] hover:bg-[#382b20] text-[#c7bcac] hover:text-white transition-all text-xs font-serif cursor-pointer border border-[#423628] shadow-sm"
                  title="Minimize on-screen keyboard"
                >
                  <span>Minimize</span>
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Responsive Keyboard Container */}
            <div className="max-w-3xl mx-auto max-h-[190px] sm:max-h-[230px] overflow-hidden">
              <Keyboard
                keyboardRef={r => (keyboardRef.current = r)}
                layoutName={keyboardLayout}
                onChange={onKeyboardChange}
                onKeyPress={onKeyPress}
                physicalKeyboardHighlight={true}
                theme="hg-theme-default custom-vintage-keyboard"
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
                display={{
                  '{bksp}': '⌫ Delete',
                  '{enter}': '↵ Return',
                  '{shift}': '⇧ Shift',
                  '{tab}': 'Tab',
                  '{lock}': 'Caps',
                  '{space}': 'Space'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter Preview Modal */}
      <LetterPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSend={handleSubmit}
        isSubmitting={isSubmitting}
        content={content}
        receiver={receiver}
        delay={delay}
        coverTitle={coverTitle}
        coverSubtitle={coverSubtitle}
        uploadedImages={uploadedImages}
        uploadedMusic={uploadedMusic}
        musicTitle={musicTitle}
        musicCover={musicCover}
        recordedVoices={recordedVoices}
        embeddedMemories={embeddedMemories}
        senderName={session?.user?.name || 'Scribe'}
      />

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

      {/* Upfront Cover & Title Setup Modal (BEFORE showing song in frontend) */}
      <AnimatePresence>
        {isCoverSetupModalOpen && pendingMusicFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-[#16120e] border border-[#3d3122] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.95)] max-w-md w-full relative"
            >
              <button 
                type="button"
                onClick={handleCancelMusicSetup}
                className="absolute top-5 right-5 text-[#8c7d6b] hover:text-[#f5f0e6] transition-colors p-1"
                title="Cancel"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 mb-2">
                <Music size={18} className="text-[#c2410c]" />
                <h3 className="font-serif text-lg font-bold text-[#f5f0e6]">
                  Enclose Melody • সুর ও কভার আর্ট
                </h3>
              </div>
              <p className="text-xs text-[#9c8e7c] font-serif mb-5">
                Set title and cover photo before placing this melody into your letter.
              </p>

              {/* Selected Audio File Badge */}
              <div className="flex items-center gap-2.5 p-2.5 px-3 rounded-xl bg-[#201811] border border-[#382b1d] mb-4 text-xs font-mono text-[#d8cebe]">
                <Music size={13} className="text-[#c2410c] shrink-0" />
                <span className="truncate flex-1">{pendingMusicFile.name}</span>
                <span className="text-[10px] text-[#8c7d6b] shrink-0">
                  {(pendingMusicFile.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>

              {/* Title Input */}
              <div className="flex flex-col gap-1.5 mb-5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#a89b88]">
                  Song Title
                </label>
                <input 
                  type="text" 
                  placeholder="Song Title (e.g. Qaraar, Midnight Waltz)" 
                  value={pendingMusicTitle}
                  onChange={(e) => setPendingMusicTitle(e.target.value)}
                  className="w-full bg-[#201811] border border-[#3d2f20] focus:border-[#c2410c] rounded-xl px-3.5 py-2.5 text-sm text-[#f5f0e6] focus:outline-none transition-colors font-serif"
                />
              </div>

              {/* Cover Photo Picker */}
              <div className="flex flex-col gap-1.5 mb-6">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#a89b88]">
                  Cover Photo (Optional)
                </label>
                
                {pendingCoverPreview ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-[#201811] border border-[#3d2f20]">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#4a3a29] shrink-0 shadow-md">
                      <img src={pendingCoverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <span className="text-xs font-serif text-[#f5f0e6] truncate">
                        {pendingCoverFile?.name || 'Selected Cover Image'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => pendingCoverInputRef.current?.click()}
                          className="text-[11px] font-serif text-[#c5a059] hover:underline cursor-pointer"
                        >
                          Change Photo
                        </button>
                        <span className="text-[#4a3a29]">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPendingCoverFile(null);
                            setPendingCoverPreview(null);
                          }}
                          className="text-[11px] font-serif text-red-400/80 hover:text-red-400 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => pendingCoverInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#3d2f20] hover:border-[#c2410c]/70 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[#201811]/40 hover:bg-[#201811]/70 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#2a2016] group-hover:bg-[#382b1d] flex items-center justify-center text-[#c2410c] transition-colors">
                      <ImageIcon size={18} />
                    </div>
                    <span className="text-xs font-serif text-[#d8cebe] group-hover:text-white transition-colors">
                      Click to choose cover photo
                    </span>
                    <span className="text-[10px] font-mono text-[#7a6c5b]">
                      JPG, PNG, WebP (Square looks best)
                    </span>
                  </div>
                )}

                <input 
                  type="file" 
                  ref={pendingCoverInputRef}
                  accept="image/*"
                  onChange={handlePendingCoverSelect}
                  className="hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2a2016]">
                <button
                  type="button"
                  onClick={handleCancelMusicSetup}
                  className="px-4 py-2 rounded-full border border-[#3a2d1e] text-xs font-serif text-[#9c8e7c] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAttachMelody}
                  className="px-5 py-2 rounded-full bg-[#c2410c] hover:bg-[#ea580c] text-white text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Attach Melody
                </button>
              </div>
            </motion.div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-md p-6"
          >
            <div className="bg-bg-primary border border-text-primary/10 p-10 rounded-[40px] shadow-2xl max-w-sm w-full flex flex-col items-center relative overflow-hidden">
              {/* Animated Glow when recording */}
              {isRecording && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-text-primary/20 rounded-full blur-3xl -z-10"
                />
              )}
              
              <button onClick={() => { stopRecording(); setIsVoicePopupOpen(false); }} className="absolute top-6 right-6 text-text-primary/40 hover:text-text-primary transition-colors">
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
                         className="absolute inset-0 border border-text-primary/50 rounded-full"
                       />
                     ))}
                     <div className="w-16 h-16 bg-text-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] z-10 relative">
                       <Mic size={24} className="text-bg-primary" />
                     </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-text-primary/10 rounded-full flex items-center justify-center border border-text-primary/20">
                    <Mic size={24} className="text-text-primary/60" />
                  </div>
                )}
              </div>

              <div className="text-center mb-10">
                <h3 className="text-text-primary text-xl font-medium mb-2">{isRecording ? "Listening..." : "Record a Voice Note"}</h3>
                <p className="text-text-primary/40 font-mono text-sm">
                  {Math.floor(recordingTime / 60)}:{(Math.floor(recordingTime % 60)).toString().padStart(2, '0')}
                </p>
              </div>

              {isRecording ? (
                <button 
                  onClick={stopRecording}
                  className="w-full py-4 rounded-full bg-text-primary/10 text-text-primary font-medium hover:bg-text-primary/20 transition-colors border border-text-primary/10"
                >
                  Stop Recording
                </button>
              ) : (
                <button 
                  onClick={startRecording}
                  className="w-full py-4 rounded-full bg-text-primary text-bg-primary font-medium hover:scale-105 transition-transform"
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
                        title={voice.title}
                        onTitleChange={(newTitle) => {
                          setRecordedVoices(prev => prev.map(v => v.id === voice.id ? { ...v, title: newTitle } : v));
                        }}
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
            <div className="relative w-52 bg-bg-secondary rounded-3xl p-4 shadow-2xl border border-text-primary/10 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2 bg-bg-primary/40 rounded-full pr-2 p-1">
                  <div className="w-6 h-6 rounded-full bg-text-primary/10 flex items-center justify-center overflow-hidden">
                    <Music size={12} className="text-text-primary/60" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text-primary text-[10px] font-bold leading-tight">Audio Track</span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => musicInputRef.current?.click()}
                    className="w-6 h-6 rounded-full bg-text-primary/10 flex items-center justify-center hover:bg-text-primary/20 transition-colors text-text-primary"
                  >
                    <Edit2 size={10} />
                  </button>
                  <button 
                    onClick={() => {
                      setUploadedMusic(null);
                      setMusicCover(null);
                      setIsPlaying(false);
                    }}
                    className="w-6 h-6 rounded-full bg-text-primary/10 flex items-center justify-center hover:bg-text-primary/20 transition-colors text-text-primary"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>

              {/* Cover Art */}
              <div 
                className="w-full aspect-square rounded-2xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 mb-4 flex items-center justify-center border border-text-primary/5 overflow-hidden relative z-10 cursor-pointer group/cover"
                onClick={() => musicCoverInputRef.current?.click()}
              >
                 {isUploadingMusicCover ? (
                   <BirdLoader className="w-8 h-8 text-text-primary" />
                 ) : musicCover ? (
                   <img src={musicCover} alt="Cover" className="w-full h-full object-cover" />
                 ) : (
                   <>
                     <div className="absolute inset-0 backdrop-blur-3xl opacity-50" />
                     <Music size={32} className="text-text-primary/20" />
                   </>
                 )}
                 <div className="absolute inset-0 bg-bg-primary/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="text-text-primary text-xs font-bold tracking-wider">Change Cover</span>
                 </div>
                 {isPlaying && !musicCover && (
                    <div className="absolute bottom-4 flex gap-1 items-end h-4">
                      {[1,2,3,4].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ height: ['20%', '100%', '20%'] }}
                          transition={{ repeat: Infinity, duration: 0.8 + (i * 0.2), ease: 'easeInOut' }}
                          className="w-1 bg-text-primary/50 rounded-full"
                        />
                      ))}
                    </div>
                 )}
              </div>

              {/* Progress */}
              <div className="mb-3 relative z-10">
                <div className="flex justify-between text-[9px] text-text-primary/50 mb-1 font-mono">
                  <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                  <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
                </div>
                <div 
                  className="w-full h-1 bg-text-primary/10 rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                     if (!audioRef.current || !duration) return;
                     const rect = e.currentTarget.getBoundingClientRect();
                     const pos = (e.clientX - rect.left) / rect.width;
                     audioRef.current.currentTime = pos * duration;
                  }}
                >
                  <div 
                    className="h-full bg-text-primary transition-all duration-100 ease-linear"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Volume and Extra Controls */}
              <div className="flex justify-between items-center mb-3 relative z-10">
                <div className="flex items-center gap-2 w-1/2">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-text-primary/50 hover:text-text-primary transition-colors">
                    {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                  <div 
                    className="w-full h-1 bg-text-primary/10 rounded-full overflow-hidden cursor-pointer flex-1"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      setVolume(pos);
                      if (pos > 0) setIsMuted(false);
                    }}
                  >
                    <div className="h-full bg-text-primary transition-all duration-100 ease-linear" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`transition-colors ${isRepeat ? 'text-[#ff9f1c]' : 'text-text-primary/50 hover:text-text-primary'}`}
                >
                  <Repeat size={12} />
                </button>
              </div>

              {/* Main Controls */}
              <div className="flex justify-center items-center gap-5 relative z-10">
                <button 
                   onClick={() => { if(audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10) }}
                   className="text-text-primary/50 hover:text-text-primary transition-colors"
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
                  className="w-8 h-8 bg-text-primary text-bg-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                </button>
                <button 
                   onClick={() => { if(audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 10) }}
                   className="text-text-primary/50 hover:text-text-primary transition-colors"
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
            <div className="relative w-52 bg-bg-secondary rounded-3xl p-4 shadow-2xl border border-text-primary/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2 bg-bg-primary/40 rounded-full pr-2 p-1">
                  <div className="w-6 h-6 rounded-full bg-text-primary/10 flex items-center justify-center overflow-hidden">
                    <Folder size={12} className="text-text-primary/60" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text-primary text-[10px] font-bold leading-tight">Gallery</span>
                  </div>
                </div>
                
                <div className="bg-text-primary/10 text-text-primary text-[10px] font-bold px-2 py-1 rounded-full border border-text-primary/10">
                  {totalAttachments} items
                </div>
              </div>

              {/* Folder Graphic */}
              <div className="flex justify-center mt-2 relative z-10">
                <div className="relative w-24 h-[72px] transition-transform duration-300 group-hover:scale-105">
                  {/* Folder Back (Dark) */}
                  <div className="absolute bottom-0 left-0 w-full h-[85%] bg-gradient-to-b from-[#2a2a2a] to-[#111] rounded-xl rounded-tl-none shadow-2xl border border-text-primary/10" />
                  {/* Folder Back Tab */}
                  <div className="absolute top-0 left-0 w-[40%] h-[25%] bg-[#2a2a2a] rounded-t-lg border-t border-l border-text-primary/10" />

                  {/* Document 1 */}
                  <div className="absolute top-2 left-4 w-12 h-[50px] bg-[#e5e5e5] rounded shadow-sm transform -rotate-6 origin-bottom-left transition-transform duration-300 group-hover:-translate-y-3 group-hover:-rotate-12 overflow-hidden border border-text-primary/20">
                    {secondLastImage ? (
                      <img src={secondLastImage} alt="Preview 1" className="w-full h-full object-cover opacity-90" />
                    ) : (
                      <>
                        <div className="mt-2 ml-2 w-8 h-[2px] bg-bg-primary/10 rounded-full" />
                        <div className="mt-1.5 ml-2 w-5 h-[2px] bg-bg-primary/10 rounded-full" />
                      </>
                    )}
                  </div>
                  
                  {/* Document 2 */}
                  <div className="absolute top-3 left-8 w-12 h-[48px] bg-text-primary rounded shadow-sm transform rotate-6 origin-bottom-right transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-12 overflow-hidden border border-text-primary/20">
                    {lastImage ? (
                      <img src={lastImage} alt="Preview 2" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="mt-2 ml-2 w-6 h-[2px] bg-bg-primary/10 rounded-full" />
                        <div className="mt-1.5 ml-2 w-8 h-[2px] bg-bg-primary/10 rounded-full" />
                        <div className="mt-1.5 ml-2 w-4 h-[2px] bg-bg-primary/10 rounded-full" />
                      </>
                    )}
                  </div>

                  {/* Front Glass layer (Translucent Frosted) */}
                  <div className="absolute bottom-0 left-0 w-full h-[70%] bg-text-primary/[0.15] backdrop-blur-md rounded-xl border border-text-primary/30 shadow-[0_-4px_16px_rgba(0,0,0,0.2)] overflow-hidden">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/40 backdrop-blur-sm p-6"
          >
            <motion.div
              ref={galleryRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-text-primary/10 backdrop-blur-xl border border-text-primary/20 p-6 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-text-primary text-xl font-serif">Attached Memories</h3>
                <button onClick={() => setIsGalleryOpen(false)} className="text-text-primary/60 hover:text-text-primary p-2 rounded-full bg-text-primary/5 hover:bg-text-primary/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Uploaded final images */}
                {uploadedImages.map((url, idx) => (
                  <div key={`final-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden bg-bg-primary/20 border border-text-primary/10">
                    <img src={url} alt={`Memory ${idx+1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 bg-bg-primary/50 hover:bg-bg-primary text-text-primary p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                

                {/* Currently uploading temporary images */}
                {uploadingImages.map((localUrl, idx) => (
                  <div key={`temp-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden bg-bg-primary/20 border border-text-primary/10">
                    <img src={localUrl} alt={`Uploading ${idx+1}`} className="w-full h-full object-cover opacity-50 grayscale" />
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/20 backdrop-blur-[2px]">
                      <BirdLoader className="w-8 h-8 text-text-primary" />
                    </div>
                  </div>
                ))}

                {/* Add More Button Box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-text-primary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-text-primary/5 hover:border-text-primary/60 transition-all group"
                >
                  <Plus size={24} className="text-text-primary/40 group-hover:text-text-primary/80 mb-2 transition-colors" />
                  <span className="text-text-primary/40 group-hover:text-text-primary/80 text-[10px] font-bold uppercase tracking-wider transition-colors">Add More</span>
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
            className="fixed z-50 flex items-center gap-1 bg-bg-secondary border border-text-primary/10 rounded-full px-2 py-1.5 shadow-2xl"
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
              className="p-2 text-text-primary/60 hover:text-text-primary hover:bg-text-primary/10 rounded-full transition-all relative group"
            >
              <ImageIcon size={14} strokeWidth={2} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-bg-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-wider">Embed Image</span>
            </button>
            <button 
              onClick={() => setMousePos(null)}
              className="p-2 text-text-primary/60 hover:text-text-primary hover:bg-text-primary/10 rounded-full transition-all relative group"
            >
              <Music size={14} strokeWidth={2} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-bg-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-wider">Embed Music</span>
            </button>
            <button 
              onClick={() => setMousePos(null)}
              className="p-2 text-text-primary/60 hover:text-text-primary hover:bg-text-primary/10 rounded-full transition-all relative group"
            >
              <Mic size={14} strokeWidth={2} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-bg-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-wider">Embed Voice</span>
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
        accept="audio/*, .mp3, .wav, .m4a, .aac, .ogg, .webm, .flac, .mp4"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/40 backdrop-blur-sm p-6"
            onClick={() => setSelectedEmbedId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-secondary border border-text-primary/20 p-8 rounded-3xl shadow-2xl flex gap-6"
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
                  <div className="absolute -top-2 -right-2 bg-bg-primary text-text-primary text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-text-primary/20">
                    {embeddedMemories[selectedEmbedId]?.images.length || 0}
                  </div>
                </div>
                <span className="text-text-primary/60 text-xs font-bold uppercase tracking-wider group-hover:text-text-primary transition-colors">Images</span>
              </div>
              
              {/* Music Folder */}
              <div 
                className="flex flex-col items-center gap-3 cursor-pointer group opacity-50 hover:opacity-100 transition-opacity"
              >
                <div className="relative">
                  <div className="w-16 h-12 bg-purple-500/20 rounded-lg border border-purple-500/40 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <Music className="text-purple-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-bg-primary text-text-primary text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-text-primary/20">
                    {embeddedMemories[selectedEmbedId]?.music.length || 0}
                  </div>
                </div>
                <span className="text-text-primary/60 text-xs font-bold uppercase tracking-wider group-hover:text-text-primary transition-colors">Music</span>
              </div>
              
              {/* Audio Folder */}
              <div 
                className="flex flex-col items-center gap-3 cursor-pointer group opacity-50 hover:opacity-100 transition-opacity"
              >
                <div className="relative">
                  <div className="w-16 h-12 bg-green-500/20 rounded-lg border border-green-500/40 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <Mic className="text-green-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-bg-primary text-text-primary text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-text-primary/20">
                    {embeddedMemories[selectedEmbedId]?.audio.length || 0}
                  </div>
                </div>
                <span className="text-text-primary/60 text-xs font-bold uppercase tracking-wider group-hover:text-text-primary transition-colors">Voice</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/40 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-text-primary/10 backdrop-blur-xl border border-text-primary/20 p-6 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsEmbedGalleryOpen(false)} className="text-text-primary/60 hover:text-text-primary p-2 rounded-full bg-text-primary/5 hover:bg-text-primary/10 transition-colors">
                    <Feather size={16} className="rotate-180" /> {/* Back icon */}
                  </button>
                  <h3 className="text-text-primary text-xl font-serif capitalize">Memory {embedGalleryType}</h3>
                </div>
                <button onClick={() => { setIsEmbedGalleryOpen(false); setSelectedEmbedId(null); }} className="text-text-primary/60 hover:text-text-primary p-2 rounded-full bg-text-primary/5 hover:bg-text-primary/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {embeddedMemories[selectedEmbedId]?.[embedGalleryType].map((url, idx) => (
                  <div key={`embed-img-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden bg-bg-primary/20 border border-text-primary/10">
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
                      className="absolute top-2 right-2 bg-bg-primary/50 hover:bg-bg-primary text-text-primary p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {/* Add More Button */}
                <div 
                  onClick={() => embedFileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-text-primary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-text-primary/5 hover:border-text-primary/60 transition-all group"
                >
                  <Plus size={24} className="text-text-primary/40 group-hover:text-text-primary/80 mb-2 transition-colors" />
                  <span className="text-text-primary/40 group-hover:text-text-primary/80 text-[10px] font-bold uppercase tracking-wider transition-colors">Add Image</span>
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
