import { Link } from 'react-router-dom';
import { Video } from '@/data/videos';

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  return (
    <Link 
      to={`/watch/${video.id}`} 
      className="video-card block"
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
        {/* Play overlay for native feel */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/90 flex items-center justify-center">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-2 sm:p-3">
        <h3 className="text-foreground font-medium text-sm sm:text-base line-clamp-2 mb-1">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
          <span>HSCian</span>
          <span>•</span>
          <span>{video.views} views</span>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
