import { getResponsiveImageProps } from '../utils/responsiveImage';

/** One consistent frame; contain preserves the complete source photograph. */
const PortraitFrame = ({ src, name, profile = false }: { src: string; name: string; profile?: boolean }) => (
  <div className={`ui-media portrait-frame${profile ? ' portrait-frame-profile' : ''}`}>
    <img {...getResponsiveImageProps(src, profile ? '(min-width: 768px) 280px, 240px' : '(min-width: 1024px) 280px, 45vw')}
      alt={name} loading={profile ? 'eager' : 'lazy'} decoding="async" />
  </div>
);

export default PortraitFrame;
