'use client';

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  hasStory?: boolean;
  storyViewed?: boolean;
  style?: React.CSSProperties;
}

export function UserAvatar({ name = '?', avatar, size = 'md', hasStory = false, storyViewed = false, style }: UserAvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const isImage = avatar && (avatar.startsWith('/') || avatar.startsWith('http'));

  const getFontSize = () => {
    switch (size) {
      case 'xs': return '0.55rem';
      case 'sm': return '0.7rem';
      case 'lg': return '1rem';
      case 'xxl': return '1.5rem';
      default: return '0.8rem';
    }
  };

  const avatarContent = isImage ? (
    <div className={`avatar avatar-${size}`} style={!hasStory ? style : {}}>
      <img
        src={avatar}
        alt={name}
      />
    </div>
  ) : (
    <div
      className={`avatar avatar-${size}`}
      style={{
        fontSize: getFontSize(),
        fontWeight: 800,
        letterSpacing: size === 'xxl' ? '1px' : '0.5px',
        ...(!hasStory ? style : {})
      }}
    >
      {avatar && !isImage ? avatar : initials}
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
