import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';
import { SeekBackward10, SeekForward10 } from '@/components/SeekIcons';

interface VideoPlayerProps {
  embedUrl: string;
  title: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const VideoPlayer = ({ embedUrl, title }: VideoPlayerProps) => {
  const isMobile = useIsMobile();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState<'play' | 'pause' | 'forward' | 'backward' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [apiLoaded, setApiLoaded] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const centerIconTimeout = useRef<NodeJS.Timeout>();
  const doubleTapTimeout = useRef<NodeJS.Timeout>();
  const lastTap = useRef<number>(0);
  const tapSide = useRef<'left' | 'right' | null>(null);

  // Extract video ID from embed URL
  const getVideoId = (url: string) => {
    const match = url.match(/embed\/([^?]+)/);
    return match ? match[1] : '';
  };

  const videoId = getVideoId(embedUrl);

  // Load YouTube IFrame API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        setApiLoaded(true);
        return;
      }

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        setApiLoaded(true);
      };
    };

    loadYouTubeAPI();
  }, []);

  // Initialize player when API is loaded
  useEffect(() => {
    if (!apiLoaded || !videoId) return;

    const initPlayer = () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          cc_load_policy: 0,
          playsinline: 1,
          origin: window.location.origin,
          enablejsapi: 1,
          // Faster loading
          start: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    };

    // Instant initialization - no delay
    initPlayer();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [apiLoaded, videoId]);

  const onPlayerReady = (event: any) => {
    setIsReady(true);
    setDuration(event.target.getDuration());
    const vol = event.target.getVolume();
    setVolume(vol || 100);
    setIsMuted(event.target.isMuted());
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      if (playerRef.current && typeof playerRef.current.getVideoLoadedFraction === 'function') {
        setBuffered(playerRef.current.getVideoLoadedFraction() * 100);
      }
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube Player Error:', event.data);
  };

  // Update current time and buffered
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isReady) {
        if (typeof playerRef.current.getCurrentTime === 'function') {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
        if (typeof playerRef.current.getVideoLoadedFraction === 'function') {
          setBuffered(playerRef.current.getVideoLoadedFraction() * 100);
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isReady]);

  const showCenterAnimation = useCallback((icon: 'play' | 'pause' | 'forward' | 'backward') => {
    if (centerIconTimeout.current) {
      clearTimeout(centerIconTimeout.current);
    }
    setShowCenterIcon(icon);
    centerIconTimeout.current = setTimeout(() => {
      setShowCenterIcon(null);
    }, 600);
  }, []);

  const togglePlay = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
      showCenterAnimation('pause');
    } else {
      playerRef.current.playVideo();
      showCenterAnimation('play');
    }
  }, [isPlaying, isReady, showCenterAnimation]);

  const seekForward = useCallback((seconds: number = 10) => {
    if (!playerRef.current || !isReady) return;
    const newTime = Math.min(currentTime + seconds, duration);
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
    showCenterAnimation('forward');
  }, [currentTime, duration, isReady, showCenterAnimation]);

  const seekBackward = useCallback((seconds: number = 10) => {
    if (!playerRef.current || !isReady) return;
    const newTime = Math.max(currentTime - seconds, 0);
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
    showCenterAnimation('backward');
  }, [currentTime, isReady, showCenterAnimation]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  }, [isMuted, volume, isReady]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (!playerRef.current || !isReady) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    playerRef.current.setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
      playerRef.current.unMute();
    }
  }, [isMuted, isReady]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!playerRef.current || !progressRef.current || !isReady) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  }, [duration, isReady]);

  const handleSeekStart = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleSeek(e);
  }, [handleSeek]);

  const handleSeekMove = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleSeek(e);
  }, [isDragging, handleSeek]);

  const handleSeekEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    const currentIndex = playbackRates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % playbackRates.length;
    const nextRate = playbackRates[nextIndex];
    playerRef.current.setPlaybackRate(nextRate);
    setPlaybackRate(nextRate);
  }, [isReady, playbackRate]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
        
        if (isMobile && screen.orientation && 'lock' in screen.orientation) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch (err) {}
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        
        if (screen.orientation && 'unlock' in screen.orientation) {
          try {
            (screen.orientation as any).unlock();
          } catch (err) {}
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, [isMobile]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isFs);
      
      if (!isFs && screen.orientation && 'unlock' in screen.orientation) {
        try {
          (screen.orientation as any).unlock();
        } catch (err) {}
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard controls for desktop
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          seekForward(10);
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          seekBackward(10);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange([Math.min(volume + 10, 100)]);
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange([Math.max(volume - 10, 0)]);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'escape':
          if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, togglePlay, seekForward, seekBackward, handleVolumeChange, volume, toggleMute, toggleFullscreen, isFullscreen]);

  // Mobile double tap to seek
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const side = x < rect.width / 2 ? 'left' : 'right';
    tapSide.current = side;
    
    const now = Date.now();
    const timeDiff = now - lastTap.current;
    
    if (timeDiff < 300 && timeDiff > 0) {
      if (doubleTapTimeout.current) {
        clearTimeout(doubleTapTimeout.current);
      }
      
      if (side === 'left') {
        seekBackward(10);
      } else {
        seekForward(10);
      }
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      
      doubleTapTimeout.current = setTimeout(() => {
        if (lastTap.current !== 0) {
          setShowControls(prev => !prev);
          if (!showControls) {
            resetHideTimeout();
          }
        }
      }, 300);
    }
  }, [seekBackward, seekForward, showControls]);

  // Auto-hide controls
  const resetHideTimeout = useCallback(() => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    setShowControls(true);
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying && !isDragging) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying, isDragging]);

  const handleMouseMove = useCallback(() => {
    if (isMobile) return;
    resetHideTimeout();
  }, [isMobile, resetHideTimeout]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    if (isPlaying && !isDragging) {
      setShowControls(false);
    }
  }, [isMobile, isPlaying, isDragging]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Mobile Controls - Ultra Minimalist Single Line
  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full bg-black overflow-hidden select-none ${
          isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video rounded-lg'
        }`}
        onTouchStart={handleTouchStart}
      >
        {/* YouTube Player */}
        <div id="youtube-player" className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Overlay */}
        <div
          className="absolute inset-0 z-10"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Center animation icons */}
        {showCenterIcon && (
          <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
            <div className={`bg-black/70 rounded-full p-4 ${
              showCenterIcon === 'forward' ? 'ml-24' : 
              showCenterIcon === 'backward' ? 'mr-24' : ''
            }`} style={{ animation: 'pulse 0.5s ease-out' }}>
              {showCenterIcon === 'play' && <Play className="w-10 h-10 text-white" fill="white" />}
              {showCenterIcon === 'pause' && <Pause className="w-10 h-10 text-white" fill="white" />}
              {showCenterIcon === 'forward' && (
                <div className="flex flex-col items-center">
                  <SeekForward10 className="w-10 h-10 text-white" />
                </div>
              )}
              {showCenterIcon === 'backward' && (
                <div className="flex flex-col items-center">
                  <SeekBackward10 className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Mobile Controls - Minimalist Single Line */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-200 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          
          {/* Progress bar */}
          <div className="relative px-3 pt-4 pb-1">
            <div
              ref={progressRef}
              className="relative w-full h-[3px] bg-white/30 rounded-full"
              onClick={handleSeek}
              onTouchStart={handleSeekStart}
              onTouchMove={handleSeekMove}
              onTouchEnd={handleSeekEnd}
            >
              <div
                className="absolute h-full bg-white/40 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              <div
                className="absolute h-full bg-primary rounded-full"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 -mr-1.5 bg-primary rounded-full" />
              </div>
            </div>
          </div>

          {/* Single Line Controls */}
          <div className="relative flex items-center justify-between px-2 pb-2">
            {/* Left: Time */}
            <span className="text-white/80 text-[10px] font-medium min-w-[60px]">
              {formatTime(currentTime)}/{formatTime(duration)}
            </span>

            {/* Center: Main controls - Compact */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => seekBackward(10)}
                className="text-white active:scale-90 transition-transform"
              >
                <SeekBackward10 className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlay}
                className="text-white active:scale-90 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" fill="white" />
                ) : (
                  <Play className="w-7 h-7" fill="white" />
                )}
              </button>

              <button
                onClick={() => seekForward(10)}
                className="text-white active:scale-90 transition-transform"
              >
                <SeekForward10 className="w-6 h-6" />
              </button>
            </div>

            {/* Right: Playback Speed & Fullscreen */}
            <div className="flex items-center gap-1">
              {/* Playback Speed Button */}
              <button
                onClick={cyclePlaybackRate}
                className="text-white text-[10px] font-medium px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded active:scale-95 transition-all"
                aria-label="Playback Speed"
              >
                {playbackRate}x
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white active:scale-90 transition-transform p-1"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Controls
  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black overflow-hidden select-none ${
        isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video rounded-lg'
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* YouTube Player */}
      <div id="youtube-player" className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Overlay */}
      <div
        className="absolute inset-0 z-10"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Center animation icons */}
      {showCenterIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
          <div className={`bg-black/60 rounded-full p-4 ${
            showCenterIcon === 'forward' ? 'ml-32' : 
            showCenterIcon === 'backward' ? 'mr-32' : ''
          }`} style={{ animation: 'pulse 0.5s ease-out' }}>
            {showCenterIcon === 'play' && <Play className="w-10 h-10 text-white" fill="white" />}
            {showCenterIcon === 'pause' && <Pause className="w-10 h-10 text-white" fill="white" />}
            {showCenterIcon === 'forward' && (
              <div className="flex flex-col items-center">
                <SeekForward10 className="w-10 h-10 text-white" />
              </div>
            )}
            {showCenterIcon === 'backward' && (
              <div className="flex flex-col items-center">
                <SeekBackward10 className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Play overlay when paused */}
      {!isPlaying && isReady && !showControls && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Desktop Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress bar */}
        <div className="px-3 pb-2 pt-12">
          <div
            ref={progressRef}
            className="relative w-full h-1 bg-white/30 rounded-full cursor-pointer group/progress hover:h-1.5 transition-all"
            onClick={handleSeek}
            onMouseDown={handleSeekStart}
            onMouseMove={handleSeekMove}
            onMouseUp={handleSeekEnd}
            onMouseLeave={handleSeekEnd}
          >
            <div
              className="absolute h-full bg-white/50 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute h-full bg-primary rounded-full"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 -mr-1.5 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            {/* 10s Backward */}
            <button
              onClick={() => seekBackward(10)}
              className="text-white hover:text-primary transition-colors p-1"
              title="10 সেকেন্ড পিছনে (J)"
            >
              <SeekBackward10 className="w-7 h-7" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary transition-colors p-1"
              title={isPlaying ? 'বিরতি (K)' : 'চালান (K)'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7" fill="currentColor" />
              ) : (
                <Play className="w-7 h-7" fill="currentColor" />
              )}
            </button>

            {/* 10s Forward */}
            <button
              onClick={() => seekForward(10)}
              className="text-white hover:text-primary transition-colors p-1"
              title="10 সেকেন্ড সামনে (L)"
            >
              <SeekForward10 className="w-7 h-7" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/volume ml-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary transition-colors p-1"
                title={isMuted ? 'আনমিউট (M)' : 'মিউট (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <div className="w-0 group-hover/volume:w-16 overflow-hidden transition-all duration-300">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-16"
                />
              </div>
            </div>

            {/* Time */}
            <span className="text-white/90 text-sm font-medium ml-2 whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Playback Speed Button */}
            <button
              onClick={cyclePlaybackRate}
              className="text-white hover:text-primary transition-colors text-sm font-medium px-3 py-1 bg-white/10 hover:bg-white/20 rounded"
              title="প্লেব্যাক স্পিড পরিবর্তন করুন"
            >
              {playbackRate === 1 ? 'Normal' : `${playbackRate}x`}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-primary transition-colors p-1"
              title={isFullscreen ? 'ফুলস্ক্রিন বন্ধ (F)' : 'ফুলস্ক্রিন (F)'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
