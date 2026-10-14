import React from 'react';
import { getAssetPath } from '../utils/assetPath';
import { getResponsiveImageProps } from '../utils/responsiveImage';

const BrandLogo: React.FC<{ className?: string; loading?: 'eager' | 'lazy'; sizes?: string }> = ({
  className = 'h-12 w-12 md:h-14 md:w-14',
  loading = 'eager',
  sizes = '(min-width: 768px) 84px, 72px'
}) => (
  <span className={`relative inline-flex shrink-0 overflow-hidden rounded-full bg-white ${className}`}>
    {/* The PNG has a wide white margin. Fit its complete circular mark into the frame. */}
    <img
      {...getResponsiveImageProps(getAssetPath('/SMART-HUB-LOGO-ORIGINAL.png'), sizes)}
      alt="SMART Hub logo"
      loading={loading}
      decoding="async"
      className="absolute top-1/2 left-1/2 h-[150%] w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
    />
  </span>
);

export default BrandLogo;
