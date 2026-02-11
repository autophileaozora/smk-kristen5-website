// Embed Block - Embed external content (social media, widgets, etc.)
const EmbedBlock = ({
  title = '',
  type = 'custom', // instagram, facebook, twitter, tiktok, spotify, custom
  url = '',
  embedCode = '',
  aspectRatio = '16/9', // 16/9, 4/3, 1/1, 9/16
  maxWidth = '600px',
  align = 'center', // left, center, right
  caption = '',
  backgroundColor = 'transparent',
}) => {

  const bgClasses = {
    transparent: '',
    white: 'bg-white p-4 rounded-lg shadow',
    gray: 'bg-gray-100 p-4 rounded-lg',
    dark: 'bg-gray-900 p-4 rounded-lg text-white',
  };

  const alignClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  };

  const aspectClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '9/16': 'aspect-[9/16]',
  };

  // Generate embed URL based on type
  const getEmbedUrl = () => {
    if (!url) return null;

    switch (type) {
      case 'instagram': {
        // Convert Instagram post URL to embed
        const postId = url.match(/instagram\.com\/p\/([^/?]+)/)?.[1];
        if (postId) {
          return `https://www.instagram.com/p/${postId}/embed`;
        }
        return url;
      }
      case 'facebook': {
        // Facebook video embed
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
      }
      case 'twitter': {
        // For Twitter/X, we need to use their widget script
        return url;
      }
      case 'tiktok': {
        // TikTok embed
        const videoId = url.match(/video\/(\d+)/)?.[1];
        if (videoId) {
          return `https://www.tiktok.com/embed/v2/${videoId}`;
        }
        return url;
      }
      case 'spotify': {
        // Convert Spotify URL to embed
        const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist|episode)\/([^?]+)/);
        if (spotifyMatch) {
          return `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`;
        }
        return url;
      }
      default:
        return url;
    }
  };

  const renderEmbed = () => {
    // If custom embed code is provided, use it
    if (embedCode) {
      return (
        <div
          className="embed-container"
          dangerouslySetInnerHTML={{ __html: embedCode }}
        />
      );
    }

    const embedUrl = getEmbedUrl();
    if (!embedUrl) {
      return (
        <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg text-gray-500">
          <p>No embed URL provided</p>
        </div>
      );
    }

    // Special handling for Twitter
    if (type === 'twitter') {
      return (
        <div className="twitter-embed">
          <blockquote className="twitter-tweet" data-lang="id">
            <a href={url}>Loading tweet...</a>
          </blockquote>
          <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
        </div>
      );
    }

    // Spotify has specific height requirements
    if (type === 'spotify') {
      const isCompact = url.includes('track') || url.includes('episode');
      return (
        <iframe
          src={embedUrl}
          width="100%"
          height={isCompact ? '152' : '380'}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
        />
      );
    }

    // Default iframe embed
    return (
      <div className={`relative w-full ${aspectClasses[aspectRatio] || aspectClasses['16/9']}`}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  };

  return (
    <div className={`py-6 ${bgClasses[backgroundColor]}`}>
      <div className={`${alignClasses[align]}`} style={{ maxWidth }}>
        {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}

        <div className="overflow-hidden rounded-lg">{renderEmbed()}</div>

        {caption && (
          <p className={`text-sm mt-3 ${backgroundColor === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {caption}
          </p>
        )}
      </div>

      {/* Embed responsive styles */}
      <style>{`
        .embed-container iframe,
        .embed-container video {
          max-width: 100%;
        }
        .twitter-tweet {
          margin: 0 auto !important;
        }
      `}</style>
    </div>
  );
};

export default EmbedBlock;
