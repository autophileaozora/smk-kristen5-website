/**
 * StepperBlock - Vertical step-by-step content display.
 * Responsive, fully configurable: colors, icons, status, layout.
 * Items: JSON array of { title, description, icon?, status? }
 * status: "completed" | "active" | "pending" (defaults to "pending")
 */
const StepperBlock = ({
  // Header
  title = '',
  subtitle = '',
  showHeader = false,

  // Steps — JSON string of [{title, description, icon, status}]
  stepsJson = '[{"title":"Langkah Pertama","description":"Deskripsi untuk langkah pertama yang perlu dilakukan.","icon":"1","status":"completed"},{"title":"Langkah Kedua","description":"Deskripsi untuk langkah kedua, saat ini sedang berjalan.","icon":"2","status":"active"},{"title":"Langkah Ketiga","description":"Deskripsi untuk langkah ketiga yang akan datang.","icon":"3","status":"pending"},{"title":"Langkah Keempat","description":"Deskripsi untuk langkah keempat dan terakhir.","icon":"4","status":"pending"}]',

  // Colors
  completedColor = '#22c55e',    // green
  activeColor = '#2563eb',       // blue
  pendingColor = '#d1d5db',      // gray
  lineColor = '#e5e7eb',         // connector line
  completedLineFill = '#22c55e', // filled line for completed steps

  // Title colors
  titleColor = '#111827',
  activeTitleColor = '#2563eb',
  completedTitleColor = '#111827',
  pendingTitleColor = '#6b7280',

  // Description colors
  descriptionColor = '#4b5563',
  pendingDescColor = '#9ca3af',

  // Layout
  iconSize = 'md',     // sm | md | lg
  compact = false,     // reduce spacing
  showConnector = true,
  connectorStyle = 'solid', // solid | dashed | dotted

  // Connector fill based on completion
  fillConnector = true,

  className = '',
}) => {
  // Parse steps
  let steps = [];
  try {
    steps = typeof stepsJson === 'string' ? JSON.parse(stepsJson) : (Array.isArray(stepsJson) ? stepsJson : []);
  } catch {
    steps = [];
  }

  // Icon size maps
  const iconSizes = {
    sm: { outer: 28, inner: 14, text: 'text-xs' },
    md: { outer: 36, inner: 18, text: 'text-sm' },
    lg: { outer: 44, inner: 22, text: 'text-base' },
  };
  const sz = iconSizes[iconSize] || iconSizes.md;

  // Gap between steps
  const gap = compact ? 'mb-4' : 'mb-8';

  // Connector line style
  const lineStyleMap = {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return completedColor;
    if (status === 'active') return activeColor;
    return pendingColor;
  };

  const getTitleColor = (status) => {
    if (status === 'active') return activeTitleColor;
    if (status === 'completed') return completedTitleColor;
    return pendingTitleColor;
  };

  const getDescColor = (status) => {
    if (status === 'pending') return pendingDescColor;
    return descriptionColor;
  };

  const isCompleted = (status) => status === 'completed';

  // Check icon: single char/emoji → show as text; otherwise show as emoji/text
  const renderIcon = (icon, status) => {
    if (!icon) {
      // Default: checkmark for completed, dot for active, empty for pending
      if (isCompleted(status)) {
        return (
          <svg width={sz.inner} height={sz.inner} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        );
      }
      if (status === 'active') {
        return <span style={{ width: sz.inner / 2, height: sz.inner / 2, borderRadius: '50%', backgroundColor: 'white', display: 'block' }} />;
      }
      return null;
    }
    return <span className={`${sz.text} font-bold leading-none`} style={{ color: isCompleted(status) ? 'white' : status === 'active' ? 'white' : '#9ca3af' }}>{icon}</span>;
  };

  if (steps.length === 0) {
    return (
      <div className={`p-6 text-center text-gray-400 text-sm ${className}`}>
        Tambahkan langkah-langkah di pengaturan (stepsJson)
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (title || subtitle) && (
        <div className="mb-8">
          {title && <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>}
          {subtitle && <p className="text-gray-500">{subtitle}</p>}
        </div>
      )}

      {/* Steps */}
      <div className="relative">
        {steps.map((step, index) => {
          const status = step.status || 'pending';
          const dotColor = getStatusColor(status);
          const isLast = index === steps.length - 1;

          // Connector fill: fill if this step is completed
          const connectorColor = fillConnector && isCompleted(status) ? completedLineFill : lineColor;

          return (
            <div key={index} className={`flex gap-4 ${!isLast ? gap : ''}`}>
              {/* Left: icon + connector line */}
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Circle icon */}
                <div
                  className="flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{
                    width: sz.outer,
                    height: sz.outer,
                    borderRadius: '50%',
                    backgroundColor: dotColor,
                    boxShadow: status === 'active' ? `0 0 0 4px ${activeColor}22` : undefined,
                  }}
                >
                  {renderIcon(step.icon, status)}
                </div>

                {/* Connector line */}
                {showConnector && !isLast && (
                  <div
                    className="flex-1 mt-1"
                    style={{
                      width: 2,
                      borderLeft: `2px ${lineStyleMap[connectorStyle] || 'solid'} ${connectorColor}`,
                      minHeight: compact ? 28 : 40,
                    }}
                  />
                )}
              </div>

              {/* Right: content */}
              <div className={`flex-1 ${!isLast ? 'pb-2' : ''}`} style={{ paddingTop: (sz.outer - 24) / 2 }}>
                {step.title && (
                  <h4
                    className={`font-semibold leading-tight mb-1 ${compact ? 'text-sm' : 'text-base'}`}
                    style={{ color: getTitleColor(status) }}
                  >
                    {step.title}
                  </h4>
                )}
                {step.description && (
                  <p
                    className={`leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}
                    style={{ color: getDescColor(status) }}
                  >
                    {step.description}
                  </p>
                )}
                {step.link && (
                  <a
                    href={step.link}
                    target={step.link.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 mt-1.5 font-medium hover:underline ${compact ? 'text-xs' : 'text-sm'}`}
                    style={{ color: activeColor }}
                  >
                    {step.linkText || 'Selengkapnya'}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </a>
                )}
                {step.image && (() => {
                  const sizeMap = {
                    sm:   { maxWidth: 96 },
                    md:   { maxWidth: 200 },
                    lg:   { maxWidth: 360 },
                    full: { maxWidth: '100%' },
                  };
                  const sz = sizeMap[step.imageSize] || sizeMap.md;
                  return (
                    <div className="mt-2" style={{ maxWidth: sz.maxWidth }}>
                      <img
                        src={step.image}
                        alt={step.title || ''}
                        loading="lazy"
                        className="w-full h-auto rounded-lg object-cover shadow-sm"
                      />
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepperBlock;
