import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import CategorySlider from '@/components/CategorySlider';
import VideoGrid from '@/components/VideoGrid';
import { videos } from '@/data/videos';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeCategory]);

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'All') return videos;
    return videos.filter((video) => video.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="pt-14 lg:pl-52">
        <CategorySlider
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <VideoGrid videos={filteredVideos} />
      </main>
    </div>
  );
};

export default Index;
