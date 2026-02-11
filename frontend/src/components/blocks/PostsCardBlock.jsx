import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const PostsCardBlock = ({
  title = 'POSTINGAN TERBARU',
  linkText = 'LIHAT LAINNYA',
  linkUrl = '/artikel',
  // Support multiple categories for filtering
  categories = [], // Array of { slug: string, name: string }
  // Legacy single category support
  category = '',
  jurusan = '',
  limit = 3,
  showDate = true,
  showExcerpt = true,
  variant = 'default', // default, compact, card
  backgroundColor = 'white',
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [categories, category, jurusan, limit]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `/api/news?limit=${limit}&status=published`;

      // Support multiple categories
      if (categories && categories.length > 0) {
        const categorySlugs = categories.map(c => c.slug).filter(Boolean).join(',');
        if (categorySlugs) {
          url += `&categories=${categorySlugs}`;
        }
      } else if (category) {
        // Legacy single category support
        url += `&category=${category}`;
      }

      if (jurusan) {
        url += `&jurusan=${jurusan}`;
      }

      const response = await api.get(url);
      if (response.data.success) {
        setPosts(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    transparent: 'bg-transparent',
    primary: 'bg-primary-50',
  };

  const renderCompactVariant = () => (
    <div className={`rounded-lg ${bgClasses[backgroundColor]} p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 tracking-wide">{title}</h3>
        {linkUrl && linkText && (
          <Link
            to={linkUrl}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            {linkText}
          </Link>
        )}
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/artikel/${post.slug}`}
              className="block group"
            >
              {showDate && (
                <p className="text-xs text-gray-500 mb-1">
                  {formatDate(post.publishedAt || post.createdAt)}
                </p>
              )}
              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                {post.title}
              </h4>
              {showExcerpt && post.excerpt && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {truncateText(post.excerpt, 60)}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          Belum ada postingan.
        </p>
      )}
    </div>
  );

  const renderCardVariant = () => (
    <div className={`rounded-lg shadow-md ${bgClasses[backgroundColor]} overflow-hidden`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
          {linkUrl && linkText && (
            <Link
              to={linkUrl}
              className="text-sm font-medium text-white/80 hover:text-white hover:underline"
            >
              {linkText}
            </Link>
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/artikel/${post.slug}`}
                className="block py-3 first:pt-0 last:pb-0 group"
              >
                {showDate && (
                  <p className="text-xs text-gray-500 mb-1">
                    {formatDate(post.publishedAt || post.createdAt)}
                  </p>
                )}
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {post.title}
                </h4>
                {showExcerpt && post.excerpt && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {truncateText(post.excerpt, 60)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            Belum ada postingan.
          </p>
        )}
      </div>
    </div>
  );

  const renderDefaultVariant = () => (
    <div className={`rounded-lg ${bgClasses[backgroundColor]} p-5`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 tracking-wide">{title}</h3>
        {linkUrl && linkText && (
          <Link
            to={linkUrl}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            {linkText}
          </Link>
        )}
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse border-l-4 border-gray-200 pl-4">
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/artikel/${post.slug}`}
              className="block border-l-4 border-primary-500 pl-4 py-1 hover:border-primary-600 hover:bg-primary-50/30 transition-all rounded-r-lg group"
            >
              {showDate && (
                <p className="text-xs text-gray-500 mb-1">
                  {formatDate(post.publishedAt || post.createdAt)}
                </p>
              )}
              <h4 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {post.title}
              </h4>
              {showExcerpt && post.excerpt && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {truncateText(post.excerpt, 100)}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-8">
          Belum ada postingan.
        </p>
      )}
    </div>
  );

  switch (variant) {
    case 'compact':
      return renderCompactVariant();
    case 'card':
      return renderCardVariant();
    default:
      return renderDefaultVariant();
  }
};

export default PostsCardBlock;
