'use client';

const DEFAULT_AVATAR = '/default-avatar.svg';

// Modern gradient palette for initials-based avatars
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',  // Indigo → Violet
  'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',                // Blue → Indigo
  'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',                // Cyan → Blue
  'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',                // Emerald → Cyan
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',                // Amber → Red
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',                // Pink → Violet
  'linear-gradient(135deg, #14b8a6 0%, #22c55e 100%)',                // Teal → Green
  'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',                // Orange → Amber
  'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',                // Red → Pink
  'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',                // Violet → Pink
  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',                // Sky → Indigo
  'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',                // Green → Emerald
];

function getGradientForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  hasStory?: boolean;
  storyViewed?: boolean;
  style?: React.CSSProperties;
}

export function UserAvatar({ name = '?', avatar, size = 'md', hasStory = false, storyViewed = false, style }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isImage = avatar && (avatar.startsWith('/') || avatar.startsWith('http'));
  const hasValidAvatar = isImage && avatar !== '' && avatar !== DEFAULT_AVATAR;

  const getFontSize = () => {
    switch (size) {
      case 'xs': return '0.5rem';
      case 'sm': return '0.65rem';
      case 'md': return '0.75rem';
      case 'lg': return '0.95rem';
      case 'xl': return '1.15rem';
      case 'xxl': return '1.4rem';
      default: return '0.75rem';
    }
  };

  // Use uploaded photo
  const avatarContent = hasValidAvatar ? (
    <div className={`avatar avatar-${size}`} style={!hasStory ? style : {}}>
      <img
        src={avatar}
        alt={name}
        onError={(e) => {
          // On error, hide the img and show initials instead
          (e.target as HTMLImageElement).style.display = 'none';
          const parent = (e.target as HTMLImageElement).parentElement;
          if (parent) {
            parent.style.background = getGradientForName(name);
            parent.setAttribute('data-initials', initials || '?');
          }
        }}
      />
    </div>
  ) : (
    // No photo — show gradient initials
    <div
      className={`avatar avatar-${size} avatar-initials`}
      style={{
        background: getGradientForName(name),
        ...((!hasStory && style) ? style : {}),
      }}
      data-initials={initials || '?'}
    >
      <span
        className="avatar-initials-text"
        style={{ fontSize: getFontSize() }}
      >
        {initials || '?'}
      </span>
    </div>
  );

  if (hasStory) {
    return (
      <div className={`avatar-story-wrapper ${storyViewed ? 'viewed' : ''}`} style={style}>
        <div className="avatar-story-inner">
          {avatarContent}
        </div>
      </div>
    );
  }

  return avatarContent;
}
