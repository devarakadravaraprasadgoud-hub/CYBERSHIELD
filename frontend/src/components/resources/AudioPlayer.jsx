import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Headphones,
  CheckCircle2,
  Check,
  FileText,
  Clock,
  Sparkles,
  Bot
} from 'lucide-react';
import { DifficultyBadge } from '../common/Badge';

export const AudioPlayer = ({ resource, onMarkComplete, completing = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(360); // 6 min default
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [useTts, setUseTts] = useState(false);
  const [ttsSpeaking, setTtsSpeaking] = useState(false);

  const audioRef = useRef(null);
  const synthRef = useRef(window?.speechSynthesis || null);
  const utteranceRef = useRef(null);

  const isCompleted = Boolean(resource.progress?.isCompleted);

  // Parse duration string e.g. "6 min" -> 360 seconds
  useEffect(() => {
    if (resource.duration) {
      const match = resource.duration.match(/(\d+)/);
      if (match) {
        setDuration(parseInt(match[1], 10) * 60);
      }
    }
  }, [resource.duration]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Timer simulation for player if no direct external mp3
  useEffect(() => {
    let interval = null;
    if (isPlaying && (!resource.contentUrl || useTts)) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            if (synthRef.current) synthRef.current.cancel();
            return duration;
          }
          return prev + 1 * playbackRate;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, playbackRate, useTts, resource.contentUrl]);

  const handleTogglePlay = () => {
    if (resource.contentUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // TTS / Simulated player fallback
    if (isPlaying) {
      if (synthRef.current) synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current && synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
      } else {
        startTtsNarration();
      }
    }
  };

  const startTtsNarration = () => {
    if (!synthRef.current) {
      setIsPlaying(true);
      return;
    }
    synthRef.current.cancel();
    const textToRead =
      resource.transcript ||
      `${resource.title}. ${resource.description}. ${resource.keyTakeaways?.join('. ') || ''}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setTtsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setTtsSpeaking(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setUseTts(true);
    setTtsSpeaking(true);
    setIsPlaying(true);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    if (isPlaying && synthRef.current) {
      startTtsNarration();
    }
  };

  const handleReset = () => {
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (synthRef.current) synthRef.current.cancel();
    setIsPlaying(false);
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden real audio element if URL exists */}
      {resource.contentUrl && (
        <audio
          ref={audioRef}
          src={resource.contentUrl}
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Modern Purple Player Studio Card */}
      <div className="bg-gradient-to-br from-[#1E1B4B] via-[#2E1065] to-[#4C1D95] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-purple-900/50 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-mono font-bold">
                <Headphones className="w-3.5 h-3.5 text-[#C4B5FD]" />
                <span>{resource.provider || 'CyberShield Audio Brief'}</span>
              </span>
              <DifficultyBadge level={resource.difficulty || 'beginner'} />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">{resource.title}</h2>
            <p className="text-xs text-purple-200/80 mt-1 max-w-xl">{resource.description}</p>
          </div>

          {/* AI Narrator Mode Badge */}
          <button
            type="button"
            onClick={startTtsNarration}
            className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-xs font-semibold text-purple-200 flex items-center gap-2 transition self-start shrink-0"
            title="Read transcript aloud using browser speech synthesis"
          >
            <Bot className="w-4 h-4 text-purple-300" />
            <span>AI Voice Narration</span>
          </button>
        </div>

        {/* Scrub Bar & Time display */}
        <div className="space-y-2 mb-6">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 rounded-lg bg-purple-950/80 accent-[#A78BFA] cursor-pointer"
          />
          <div className="flex justify-between text-xs font-mono text-purple-300">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-purple-800/40">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 text-purple-300 transition"
              title="Restart audio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-12 h-12 rounded-2xl bg-white text-[#1E1B4B] hover:bg-purple-100 font-bold flex items-center justify-center transition shadow-lg active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            {/* Speed Multipliers */}
            <div className="flex items-center bg-purple-950/60 p-1 rounded-xl border border-purple-800/40">
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    playbackRate === rate
                      ? 'bg-[#8B5CF6] text-white shadow-xs'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Mark Complete Action */}
          <button
            type="button"
            onClick={() => onMarkComplete && onMarkComplete(resource._id)}
            disabled={completing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 active:scale-95 shrink-0 ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                : 'bg-white text-[#1E1B4B] hover:bg-purple-100'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Audio Completed</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{completing ? 'Saving...' : 'Mark as Completed'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transcript & Lecture Notes */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 bg-[#FAF8FF] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6D28D9]" />
            <h4 className="text-sm font-bold text-[#1E1B4B]">Audio Transcript & Lecture Notes</h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">Verbatim Study Text</span>
        </div>

        <div className="p-6">
          <div className="bg-[#FAF8FF] rounded-xl p-5 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line font-normal">
            {resource.transcript ||
              'Audio transcript is available above. Use the AI Voice Narration button to listen to the explanation read aloud.'}
          </div>
        </div>
      </div>
    </div>
  );
};
