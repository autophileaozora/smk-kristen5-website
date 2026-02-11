const VideoBlock = ({
  url = '',
  type = 'youtube',
  aspectRatio = '16/9',
  autoplay = false,
  controls = true,
  caption = '',
}) => {
  const getEmbedUrl = () => {
    if (!url) return '';

    if (type === 'youtube') {
      // Extract video ID from various YouTube URL formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;
      }
    } else if (type === 'vimeo') {
      // Extract Vimeo video ID
      const regExp = /vimeo.com\/(\d+)/;
      const match = url.match(regExp);
      const videoId = match ? match[1] : null;

      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}${autoplay ? '?autoplay=1' : ''}`;
      }
    } else if (type === 'direct') {
      return url;
    }

    return url;
  };

  const embedUrl = getEmbedUrl();

  const aspectRatioClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '21/9': 'aspect-[21/9]',
  };

  if (!embedUrl) {
    return (
      <div className="my-6 p-8 bg-gray-100 rounded-lg text-center text-gray-500">
        <p>Video URL tidak valid atau kosong</p>
        <p className="text-sm mt-2">Masukkan URL YouTube, Vimeo, atau direct video link</p>
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className={`relative w-full ${aspectRatioClasses[aspectRatio] || aspectRatioClasses['16/9']} rounded-lg overflow-hidden bg-gray-900`}>
        {type === 'direct' ? (
          <video
            src={embedUrl}
            controls={controls}
            autoPlay={autoplay}
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <iframe
            src={embedUrl}
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        )}
      </div>
      {caption && (
        <p className="text-sm text-gray-600 text-center mt-2 italic">{caption}</p>
      )}
    </div>
  );
};

export default VideoBlock;
