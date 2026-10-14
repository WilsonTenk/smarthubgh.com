import React, { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Partner } from '../types';
import { usePrefersReducedMotion } from '../utils/usePrefersReducedMotion';
import { getResponsiveImageProps } from '../utils/responsiveImage';
import './PartnerMarquee.css';

const PartnerMarquee: React.FC<{ partners: Partner[]; label?: string }> = ({
  partners,
  label = 'Our partners'
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  if (!partners.length) return null;

  return (
    <div className="partner-marquee" role="region" aria-label={label}>
      <div className="partner-marquee-controls">
        <button
          type="button"
          className="partner-marquee-toggle"
          aria-label={isPaused ? 'Resume partner logo animation' : 'Pause partner logo animation'}
          aria-pressed={isPaused}
          disabled={reduceMotion}
          onClick={() => setIsPaused(paused => !paused)}
        >
          {isPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
          <span>{isPaused ? 'Play' : 'Pause'}</span>
        </button>
      </div>
      <div className="partner-marquee-viewport" tabIndex={0} aria-label={`${label}. Focus this strip to pause the animation.`}>
        <div
          className="partner-marquee-track"
          style={{
            '--partner-duration': `${partners.length * 7}s`,
            ...(isPaused ? { animationPlayState: 'paused' } : {})
          } as React.CSSProperties}
        >
          {/* Four equal groups keep even a short supporter list filled throughout the loop. */}
          {[0, 1, 2, 3].map(copy => (
            <ul className="partner-marquee-group" key={copy} aria-hidden={copy > 0 ? true : undefined}>
              {partners.map(partner => (
                <li className={`partner-card${partner.logo ? '' : ' partner-card-no-logo'}`} key={partner.name}>
                  {partner.logo && (
                    <div className="partner-logo-frame">
                      <img
                        {...getResponsiveImageProps(partner.logo, `(min-width: 640px) ${Math.ceil(174 * (partner.logoScale || 1))}px, ${Math.ceil(150 * (partner.logoScale || 1))}px`)}
                        alt=""
                        className="partner-logo"
                        loading="lazy"
                        decoding="async"
                        style={partner.logoScale ? { transform: `translateY(${partner.logoOffsetY || '0%'}) scale(${partner.logoScale})` } : undefined}
                      />
                    </div>
                  )}
                  <span className="partner-name">{partner.name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerMarquee;
