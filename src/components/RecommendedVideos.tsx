import { Video } from '@/data/videos';
import { Link } from 'react-router-dom';

interface RecommendedVideosProps {
  videos: Video[];
  currentVideoId: string;
}

const RecommendedVideos = ({ videos, currentVideoId }: RecommendedVideosProps) => {
  const filteredVideos = videos.filter((v) => v.id !== currentVideoId);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-foreground px-4 lg:px-0">Recommended</h3>
      <div className="space-y-3 px-4 lg:px-0">
        {filteredVideos.map((video) => (
          <Link
            key={video.id}
            to={`/watch/${video.id}`}
            className="flex gap-3 group"
          >
            <div className="w-40 shrink-0 aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-muted-foreground transition-colors">
                {video.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">HSCian</p>
              <p className="text-xs text-muted-foreground">{video.views} views</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedVideos;
