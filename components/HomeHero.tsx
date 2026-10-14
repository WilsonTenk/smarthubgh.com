import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { projectsData } from '../data';
import { getAssetPath } from '../utils/assetPath';
import { getResponsiveImageProps } from '../utils/responsiveImage';
import RotatingFocusWord from './RotatingFocusWord';
import CountUp from './CountUp';
import './HomeHero.css';

const photos = [
  { file: 'smartgirl-2.jpg', alt: 'Five smiling girls and young women seated together outdoors.', position: '50% 63%', width: 3600, height: 2400 },
  { file: 'skills-3.jpg', alt: 'Three young women working with notes and a laptop at a table.', position: '50% 52%', width: 1000, height: 667 },
  { file: 'hygiene-1.jpg', alt: 'Three adults outdoors presenting a box of sanitary pads.', position: '50% 57%', width: 2000, height: 1333 }
];

export const HomeHero: React.FC = () => (
  <section id="home-hero" className="home-hero" aria-labelledby="home-heading">
    <div className="home-intro">
      <h1 id="home-heading" className="home-heading" aria-label="Empowering Youth Through Health, Advocacy and Education">
        <span>Empowering Youth</span>{' '}
        <span>Through <span className="home-highlight"><RotatingFocusWord /></span></span>
      </h1>
      <p className="home-lead">We connect young people across Ghana with the knowledge, care and opportunities to shape their own futures.</p>
      <div className="home-actions">
        <Link to="/contact" className="home-button home-button-primary">
          Donate now <span className="home-button-icon"><ArrowUpRight size={19} aria-hidden="true" /></span>
        </Link>
        <Link to="/contact" className="home-button home-button-secondary">
          Get involved <span className="home-button-icon"><ArrowRight size={19} aria-hidden="true" /></span>
        </Link>
      </div>
    </div>

    <div className="home-photo-strip" aria-label="SMART Hub community, skills and health projects">
      {photos.map((photo, index) => (
        <div className="home-photo" key={photo.file}>
          <img {...getResponsiveImageProps(getAssetPath(`/images/${photo.file}`), `(max-width: 540px) ${index === 0 ? '90vw' : '43vw'}, (max-width: 1168px) 30vw, 360px`)} alt={photo.alt}
            style={{ objectPosition: photo.position }} decoding="async" fetchPriority={index === 0 ? 'high' : 'auto'} />
        </div>
      ))}
    </div>

    <div className="home-supporters">
      <p>With support across our projects from</p>
      <ul aria-label="Project supporters">
        <li>Plan International Ghana</li>
        <li>KGL Foundation</li>
        <li>Youth Challenge Fund</li>
      </ul>
    </div>
  </section>
);

export const HomeStory: React.FC = () => (
  <section id="our-story" className="home-story" aria-labelledby="home-story-heading">
    <div className="home-story-card">
      <div className="home-story-intro">
        <div>
          <p className="home-eyebrow">Our story</p>
          <h2 id="home-story-heading">Local roots.<br />Lasting possibilities.</h2>
        </div>
        <div className="home-story-copy">
          <p>From community conversations to classrooms, SMART Hub helps children, adolescents and young people build healthier, more confident futures. Our work brings together education, menstrual health, digital skills and leadership across Ghana.</p>
          <Link to="/about" className="home-button home-button-primary">
            Get to know SMART Hub <span className="home-button-icon"><ArrowUpRight size={19} aria-hidden="true" /></span>
          </Link>
        </div>
      </div>
      <div className="home-story-media">
        <img className="home-story-photo" {...getResponsiveImageProps(getAssetPath('/images/digi-4.jpg'), '(min-width: 1168px) 784px, (min-width: 981px) 65vw, 90vw')}
          alt="SMART Hub team and community participants gathered for a group photo outside a school."
          loading="lazy" decoding="async" />
        <dl className="home-story-stats">
          <div><dt>Lives impacted</dt><dd><CountUp value={5000} suffix="+" /></dd></div>
          <div><dt>Projects & initiatives</dt><dd><CountUp value={projectsData.length} /></dd></div>
          <div><dt>Reached by Reach for Her</dt><dd><CountUp value={395} /></dd></div>
        </dl>
      </div>
    </div>
  </section>
);
