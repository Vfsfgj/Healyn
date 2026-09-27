import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  Plus,
  Trash2,
  Mic,
  Save,
  Volume2,
  VolumeX,
  RefreshCw,
  Music,
  Clock,
  Volume1,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Track, LyricLine } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface LyricsTranscriberModalProps {
  track: Track;
  onClose: () => void;
  onSave: (id: string, updatedLyrics: LyricLine[]) => void;
  showToast: (msg: string) => void;
}

// Helper format MM:SS
const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const LyricsTranscriberModal: React.FC<LyricsTranscriberModalProps> = ({
  track,
  onClose,
  onSave,
  showToast
}) => {
  const [lyricsList, setLyricsList] = useState<LyricLine[]>(() => {
    return track.lyrics ? [...track.lyrics].sort((a, b) => a.timeSec - b.timeSec) : [];
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track.durationSec || 150);
  const [volume, setVolume] = useState(0.8);

  // Speech Recognition state & Iframe sandbox constraints
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognitionErrorMsg, setRecognitionErrorMsg] = useState<string>('');

  // Bulk Import Wizard
  const [showBulkImporter, setShowBulkImporter] = useState(true);
  const [bulkText, setBulkText] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any | null>(null);

  // Auto request microphone access explicitly
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Clean up stream immediately
      stream.getTracks().forEach(track => track.stop());
      setMicPermissionGranted(true);
      setRecognitionErrorMsg('');
      showToast("✅ Accès au microphone autorisé !");
      return true;
    } catch (err: any) {
      console.warn("Microphone permission denied or blocked:", err);
      setMicPermissionGranted(false);
      setRecognitionErrorMsg(
        "L'accès au microphone a été bloqué par votre navigateur ou par l'environnement de prévisualisation sécurisé (iframe). Utilisez le mode d'importation par Copier-Coller !"
      );
      return false;
    }
  };

  // Initialize browser SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'fr-FR'; // French speech translation natively

    rec.onstart = () => {
      setIsListening(true);
      setRecognitionErrorMsg('');
      showToast("🎙️ Dictée vocale active ! Parlez ou lisez les paroles à haute voix...");
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (e: any) => {
      console.warn("Speech recognition error details:", e);
      // inside iframe sandbox, errors are triggered without many details, set fallback msg
      setIsListening(false);
      setRecognitionErrorMsg(
        "Le micro n'a pas pu être démarré (sécurité iframe). Nous vous conseillons de coller vos paroles directement ci-dessous pour les synchroniser !"
      );
    };

    rec.onresult = (event: any) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (finalTranscript.trim()) {
        const timestamp = Math.floor(audioRef.current ? audioRef.current.currentTime : currentTime);
        
        // Add final sentence to list
        setLyricsList(prev => {
          const updated = [
            ...prev,
            { timeSec: timestamp, text: finalTranscript.trim() }
          ];
          return updated.sort((a, b) => a.timeSec - b.timeSec);
        });

        setInterimTranscript('');
        showToast(`📝 Ligne transcrite à ${formatTime(timestamp)} : "${finalTranscript.trim()}"`);
      }
    };

    recognitionRef.current = rec;

    // Check pre-existing permission state
    navigator.permissions?.query?.({ name: 'microphone' as any }).then((result) => {
      if (result.state === 'granted') {
        setMicPermissionGranted(true);
      } else if (result.state === 'denied') {
        setMicPermissionGranted(false);
      }
    }).catch(() => {});

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Create and maintain the Audio element for custom uploads
  useEffect(() => {
    if (!track.audioUrl) {
      audioRef.current = null;
      return;
    }

    const audio = new Audio(track.audioUrl);
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    // Force load metadata
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
  }, [track.audioUrl]);

  // Handle play/pause action syncing
  useEffect(() => {
    if (track.audioUrl) {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.volume = volume;
        audio.play().catch(e => {
          console.warn("Audio play failed in preview:", e);
          setIsPlaying(false);
        });
      } else {
        audio.pause();
      }
    } else {
      // Handle synthesizer preset playback
      if (isPlaying) {
        audioEngine.setVolume(volume);
        audioEngine.play(track.preset || 'ambient');
      } else {
        audioEngine.stop();
      }
    }
  }, [isPlaying, track.audioUrl]);

  // Synchronize volume adjustments
  useEffect(() => {
    if (track.audioUrl) {
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    } else {
      audioEngine.setVolume(volume);
    }
  }, [volume, track.audioUrl]);

  // Fake timer for synth presets so that karaoke highlighting and lyrics sync can still scroll
  useEffect(() => {
    if (track.audioUrl) return;

    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            audioEngine.stop();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      // Stop the synth when this unmounts/stops
      if (!track.audioUrl) {
        audioEngine.stop();
      }
    };
  }, [track.audioUrl, isPlaying, duration]);

  // Handle Play Pause trigger button
  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  // Seek
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVal = Number(e.target.value);
    setCurrentTime(targetVal);
    if (audioRef.current) {
      audioRef.current.currentTime = targetVal;
    }
  };

  // Speech Listen Toggle
  const handleToggleListening = async () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const permitted = await requestMicPermission();
      if (!permitted) return;

      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Error starting speech recognition:", e);
      }
    }
  };

  // Bulk Import Parser (One lyric line per line-break)
  const handleBulkImport = () => {
    if (!bulkText.trim()) {
      showToast("Veuillez saisir du texte avant d'importer.");
      return;
    }

    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('[') && !line.startsWith('(')); // skip Genius headings like [Verse 1]

    if (lines.length === 0) {
      showToast("Aucune ligne de texte valide trouvée.");
      return;
    }

    // No automatic 3-second or artificial increments! All lines initialized at 00:00 for strict manual timing by admin.
    const parsedLyrics = lines.map(lineText => ({
      timeSec: 0,
      text: lineText
    }));

    setLyricsList(parsedLyrics);
    showToast(`✅ ${lines.length} phrases importées ! Lancez l'écoute pour caler vous-même le temps de chaque phrase.`);
  };

  // Volume Changes
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  // Add line manually (defaults to current audio playback time or 0)
  const handleAddLine = () => {
    setLyricsList(prev => {
      const newLine: LyricLine = {
        timeSec: isPlaying ? Math.floor(currentTime) : 0,
        text: ''
      };
      return [...prev, newLine];
    });
  };

  // Delete line
  const handleDeleteLine = (index: number) => {
    setLyricsList(prev => prev.filter((_, i) => i !== index));
  };

  // Update line data without immediate destructive re-sorting while typing
  const handleUpdateLineText = (index: number, newText: string) => {
    setLyricsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], text: newText };
      return updated;
    });
  };

  const handleUpdateLineTime = (index: number, newSecs: number) => {
    setLyricsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], timeSec: Math.max(0, newSecs) };
      return updated;
    });
  };

  const handleApplyCurrentTime = (index: number) => {
    const timeVal = Math.floor(currentTime);
    handleUpdateLineTime(index, timeVal);
    showToast(`⏱️ Phrase N°${index + 1} calée à ${formatTime(timeVal)} !`);
  };

  // Sort lyrics chronologically manually
  const handleSortChronologically = () => {
    setLyricsList(prev => [...prev].sort((a, b) => a.timeSec - b.timeSec));
    showToast("Paroles triées par ordre chronologique de passage.");
  };

  // Reset all timestamps to 00:00 for complete fresh manual timing
  const handleResetAllTimestamps = () => {
    setLyricsList(prev => prev.map(line => ({ ...line, timeSec: 0 })));
    showToast("Tous les temps ont été remis à 00:00 pour un calage manuel complet.");
  };

  // Active Line index for current preview karaoke highlight
  const activeLineIndex = useMemo(() => {
    let activeIdx = -1;
    for (let i = 0; i < lyricsList.length; i++) {
      if (currentTime >= lyricsList[i].timeSec) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }, [lyricsList, currentTime]);

  // Find next line to time during live playback
  const nextUnmarkedIndex = useMemo(() => {
    if (lyricsList.length === 0) return -1;
    const firstUnset = lyricsList.findIndex((l, i) => i > 0 && l.timeSec === 0);
    if (firstUnset !== -1) return firstUnset;
    if (activeLineIndex >= 0 && activeLineIndex < lyricsList.length - 1) {
      return activeLineIndex + 1;
    }
    return activeLineIndex >= 0 ? activeLineIndex : 0;
  }, [lyricsList, activeLineIndex]);

  const handleSaveLyrics = () => {
    // filter out empty lines
    const validLyrics = lyricsList.filter(l => l.text.trim() !== '');
    onSave(track.id, validLyrics);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white w-full h-full min-h-screen overflow-hidden flex flex-col animate-in fade-in duration-150">
      
      {/* Top Bar Navigation */}
      <div className="px-4 sm:px-8 py-3.5 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-mono-code text-neutral-600 hover:text-neutral-950 px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <span>← Quitter l'Éditeur</span>
          </button>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1b4332]/10 text-[#1b4332] border border-[#1b4332]/25 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-950 uppercase tracking-tight">
                Éditeur Karaoké &amp; Synchronisation Pro
              </h2>
              <div className="text-[10px] font-mono-code text-neutral-400">
                {track.title} · {track.status} · {track.audioFileName || (track.audioUrl ? "Fichier Audio Importé" : "Synthétiseur de secours")}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-950 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSaveLyrics}
            className="px-5 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-[#52b788]" />
            <span>Enregistrer les paroles</span>
          </button>
        </div>
      </div>

      {/* Main Full-Screen Body Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Section 1: Interactive Audio Player & Karaoke Live Teleprompter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-6 border-b border-neutral-200">
          
          {/* Reference Player & Controls */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-4">
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 shadow-sm shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/src/assets/images/album_vinyl_artwork_1790345759457.jpg';
                }}
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="text-sm font-bold text-neutral-950 truncate">{track.title}</div>
                <div className="text-xs text-neutral-500 font-mono-code truncate">{track.genre} · {track.bpm} BPM · {track.key}</div>
                <div className="text-[11px] font-mono-code text-[#2d6a4f] font-semibold">
                  {isPlaying ? "▶ Lecture en cours" : "⏸ En pause"}
                </div>
              </div>
            </div>

            {/* Slider Seek */}
            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-950"
              />
              <div className="flex items-center justify-between text-xs font-mono-code text-neutral-500">
                <span className="font-bold text-neutral-900">{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Play/Pause & Volume */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="py-2.5 px-5 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 flex-1 shadow-sm cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-[#52b788]" />
                    <span>Mettre en pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-[#52b788] fill-[#52b788]" />
                    <span>Lancer la lecture audio</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 border border-neutral-200 shrink-0">
                <Volume2 className="w-4 h-4 text-neutral-500" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 accent-neutral-950 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Karaoke Teleprompter Screen */}
          <div className="lg:col-span-7 bg-neutral-100 rounded-2xl p-6 min-h-[140px] flex flex-col justify-center text-center relative overflow-hidden">
            <div className="absolute top-3 left-4 text-[10px] font-mono-code uppercase font-bold text-neutral-500 tracking-wider">
              Aperçu direct du karaoké (Ce que voient vos fans) :
            </div>
            
            <div className="pt-3">
              {activeLineIndex >= 0 && lyricsList[activeLineIndex] ? (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="text-[11px] font-mono-code text-[#1b4332] font-bold uppercase tracking-wider">
                    Ligne active à {formatTime(lyricsList[activeLineIndex].timeSec)}
                  </div>
                  <p className="text-base sm:text-lg font-bold text-neutral-950 leading-relaxed">
                    "{lyricsList[activeLineIndex].text}"
                  </p>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 font-mono-code">
                  Lancez la musique pour voir défiler les paroles synchronisées...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Section 2: Tools & Wizards (Bulk Import & Voice Dictation) */}
        <div className="space-y-6 pb-6 border-b border-neutral-200">
          
          {/* ASSISTANT COPIER-COLLER - Expansive, stretchable, high-visibility panel */}
          <div className="bg-neutral-50/70 border border-neutral-200/90 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#800020]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                    Assistant Copier-Coller
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono-code hidden sm:block">
                    Importez tout le texte de la chanson en un seul clic
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[10px] sm:text-xs px-3 py-1 rounded-full font-mono-code bg-[#800020]/10 text-[#800020] font-bold uppercase tracking-wider">
                Recommandé &amp; Rapide
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-4xl">
              Collez les paroles complètes de votre chanson (une ligne par phrase). Ensuite, lancez la musique et cliquez simplement sur l'icône <Clock className="inline w-3.5 h-3.5 text-[#2d6a4f] font-bold" /> en direct pour caler chaque phrase au bon moment !
            </p>

            <div className="space-y-3 pt-1">
              <div className="relative">
                <textarea
                  rows={8}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder="Collez vos paroles ici (une phrase par ligne)...&#10;&#10;Exemple :&#10;Dans la lumière de la lune&#10;Je vois ton ombre s'enfuir&#10;Un dernier refrain nous unit&#10;Avant que le jour ne se lève"
                  className="w-full min-h-[220px] sm:min-h-[280px] p-4 sm:p-5 text-sm sm:text-base border-0 outline-none rounded-2xl focus:outline-none focus:ring-0 bg-neutral-100 focus:bg-neutral-200/70 leading-relaxed resize-y font-sans transition-all placeholder:text-neutral-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono-code">
                  <span className="px-3 py-1.5 rounded-xl bg-neutral-200/70 font-semibold text-neutral-800">
                    {bulkText.trim() ? bulkText.split('\n').filter(l => l.trim()).length : 0} phrase(s) détectée(s)
                  </span>
                  {bulkText && (
                    <button
                      type="button"
                      onClick={() => setBulkText('')}
                      className="text-neutral-500 hover:text-rose-600 underline cursor-pointer"
                    >
                      Effacer le texte
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBulkImport}
                    disabled={!bulkText.trim()}
                    className={`py-3.5 px-7 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm ${
                      bulkText.trim()
                        ? 'bg-neutral-950 hover:bg-neutral-800 text-white shadow-md active:scale-98'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Générer les lignes de karaoké</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DICTÉE MICROPHONE - Secondary companion card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-900 flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#2d6a4f]" />
                <span>Option : Dictée Microphone en direct (Sans IA)</span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl">
              Dictez les paroles à haute voix pendant la lecture du morceau. Votre navigateur capte le texte et l'ajoute automatiquement avec le timestamp en cours.
            </p>

            {recognitionErrorMsg ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Information d'accès micro</span>
                </div>
                <p className="text-neutral-600 text-[11px]">
                  {recognitionErrorMsg}
                </p>
              </div>
            ) : (
              isSupported ? (
                <div className="space-y-2 pt-1 max-w-md">
                  <button
                    type="button"
                    onClick={handleToggleListening}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                      isListening
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                        : 'bg-[#1b4332] hover:bg-[#2d6a4f] text-white'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Écoute active en direct... Cliquez pour arrêter</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Lancer la transcription par dictée vocale</span>
                      </>
                    )}
                  </button>

                  {isListening && (
                    <div className="p-2.5 bg-[#1b4332]/10 rounded-xl border border-[#1b4332]/25 text-xs italic text-[#1b4332] text-center animate-pulse">
                      {interimTranscript || "Micro en écoute... Lisez ou chantez maintenant."}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-neutral-100 text-xs text-neutral-500 font-mono-code">
                  Reconnaissance vocale non prise en charge sur ce navigateur.
                </div>
              )
            )}
          </div>

        </div>

        {/* Section 3: Lyrics Lines Synchronization Studio */}
        <div className="space-y-4">
          
          {/* Live Audio Calage Assistant Bar during playback */}
          {isPlaying && lyricsList.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-neutral-800 animate-in fade-in duration-200">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#52b788]/20 text-[#52b788] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#52b788] animate-spin-slow" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono-code uppercase text-[#52b788] font-bold tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#52b788] animate-ping" />
                    <span>Calage en direct pendant la lecture ({formatTime(currentTime)})</span>
                  </div>
                  <div className="text-sm font-bold text-white truncate max-w-lg mt-0.5">
                    {nextUnmarkedIndex >= 0 ? `Phrase N°${nextUnmarkedIndex + 1} : "${lyricsList[nextUnmarkedIndex]?.text || 'Ligne vide'}"` : "Toutes les phrases sont calées !"}
                  </div>
                </div>
              </div>

              {nextUnmarkedIndex >= 0 && (
                <button
                  type="button"
                  onClick={() => handleApplyCurrentTime(nextUnmarkedIndex)}
                  className="w-full sm:w-auto px-5 py-3 bg-[#52b788] hover:bg-[#40916c] text-neutral-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                >
                  <Clock className="w-4 h-4 fill-neutral-950" />
                  <span>MARQUER LE TEMPS ({formatTime(currentTime)}) SUR PHRASE {nextUnmarkedIndex + 1}</span>
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <h3 className="text-xs font-mono-code uppercase font-bold text-neutral-900">
                LIGNES DE PAROLES SYNCHRONISÉES ({lyricsList.length})
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Ajustez le texte et cliquez sur l'horloge <Clock className="inline w-3.5 h-3.5 text-[#2d6a4f] font-bold" /> pour caler le temps exact pendant l'écoute. Marquage 100% manuel par l'administrateur.
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {lyricsList.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleSortChronologically}
                    title="Trier les phrases dans l'ordre chronologique des secondes"
                    className="py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs rounded-xl font-medium transition-colors cursor-pointer"
                  >
                    Trier (MM:SS)
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAllTimestamps}
                    title="Remettre toutes les phrases à 00:00 pour re-caler la chanson"
                    className="py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-950 text-xs rounded-xl font-medium transition-colors cursor-pointer"
                  >
                    Remettre à 00:00
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleAddLine}
                className="py-2 px-3.5 bg-neutral-950 text-white hover:bg-neutral-800 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une phrase</span>
              </button>
            </div>
          </div>

          {/* List of lyrics lines */}
          <div className="space-y-2.5">
            {lyricsList.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center p-8 text-neutral-400 space-y-3 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                <Clock className="w-10 h-10 opacity-40 text-neutral-500" />
                <p className="text-sm font-semibold text-neutral-700">
                  Aucune parole n'est enregistrée pour ce morceau.
                </p>
                <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                  Cliquez sur <strong>Générer les lignes de karaoké</strong> ci-dessus pour importer votre texte, puis calez vous-même les temps au fil de l'écoute !
                </p>
              </div>
            ) : (
              lyricsList.map((line, idx) => {
                const isActive = idx === activeLineIndex;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white ${
                      isActive
                        ? 'border-[#2d6a4f] bg-[#1b4332]/10 shadow-md ring-2 ring-[#1b4332]/20'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {/* Line Index Badge */}
                    <span className="text-[11px] font-mono-code font-bold text-neutral-400 shrink-0 w-6">
                      #{idx + 1}
                    </span>

                    {/* Timestamp Editor */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono-code text-neutral-500">Temps :</span>
                      
                      <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-neutral-100 border border-neutral-200">
                        <span className="text-xs font-mono-code font-bold text-neutral-900">
                          {formatTime(line.timeSec)}
                        </span>
                        <input
                          type="number"
                          min={0}
                          title="Modifier les secondes manuellement"
                          value={line.timeSec}
                          onChange={e => handleUpdateLineTime(idx, Number(e.target.value))}
                          className="w-14 px-1 py-0.5 text-[11px] rounded border-0 outline-none font-mono-code text-center bg-white text-neutral-600 focus:text-neutral-950 focus:bg-neutral-50"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyCurrentTime(idx)}
                        title="Capturer le temps actuel du lecteur pour caler cette phrase"
                        className="px-2.5 py-1.5 hover:bg-[#1b4332]/10 rounded-xl text-neutral-800 hover:text-[#1b4332] transition-colors flex items-center justify-center gap-1.5 border border-neutral-200 bg-neutral-50 cursor-pointer text-xs font-mono-code font-semibold"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#2d6a4f]" />
                        <span>Caler à {formatTime(currentTime)}</span>
                      </button>
                    </div>

                    {/* Line Text Input */}
                    <input
                      type="text"
                      value={line.text}
                      onChange={e => handleUpdateLineText(idx, e.target.value)}
                      placeholder="Texte de la phrase chantée..."
                      className="flex-1 w-full px-3.5 py-2 text-sm rounded-xl border-0 outline-none font-medium focus:outline-none focus:ring-0 bg-neutral-100 focus:bg-neutral-200/80 transition-all"
                    />

                    {/* Actions */}
                    <button
                      type="button"
                      onClick={() => handleDeleteLine(idx)}
                      className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                      title="Supprimer cette ligne"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};


