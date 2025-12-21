'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export function AudioPlayer({ audioSrc, autoPlay = false }: { audioSrc?: string, autoPlay?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Use a separate ref to manage the audio source to avoid re-renders
  const audioSrcRef = useRef(audioSrc || "https://storage.googleapis.com/studioprod-assets/placeholder_audio.mp3");

  useEffect(() => {
    if(audioSrc && audioSrcRef.current !== audioSrc) {
        audioSrcRef.current = audioSrc;
        if(audioRef.current) {
            audioRef.current.src = audioSrc;
            audioRef.current.load();
        }
    }
  }, [audioSrc]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement && autoPlay) {
      audioElement.play().then(() => {
        setIsPlaying(true);
      }).catch(error => console.error("Autoplay failed:", error));
    }
  }, [audioRef, autoPlay]);


  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current?.duration || 0);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
       <audio
        ref={audioRef}
        src={audioSrcRef.current}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
      <div className="flex items-center gap-4">
        <Button onClick={togglePlayPause} size="icon" variant="ghost" disabled={!audioSrc}>
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </Button>
        <div className="flex-grow space-y-1">
            <Slider
              value={[currentTime]}
              max={duration || 1}
              step={1}
              onValueChange={handleSeek}
              disabled={!audioSrc || duration === 0}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
