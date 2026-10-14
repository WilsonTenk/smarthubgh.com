import React, { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../utils/usePrefersReducedMotion';

const words = ['Health', 'Advocacy', 'Education'];
type Phase = 'holding' | 'deleting' | 'waiting' | 'typing';
const initial = { index: 0, text: words[0], phase: 'holding' as Phase };

const RotatingFocusWord: React.FC = () => {
  const reduceMotion = usePrefersReducedMotion();
  const [state, setState] = useState(initial);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVisibilityChange = () => setVisible(!document.hidden);
    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) setState(initial);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !visible) return;
    const delay = { holding: 1900, deleting: 65, waiting: 180, typing: 105 }[state.phase];
    const timer = window.setTimeout(() => {
      setState(previous => {
        if (previous.phase === 'holding') return { ...previous, phase: 'deleting' };
        if (previous.phase === 'deleting') {
          const text = previous.text.slice(0, -1);
          return { ...previous, text, phase: text ? 'deleting' : 'waiting' };
        }
        if (previous.phase === 'waiting') return { index: (previous.index + 1) % words.length, text: '', phase: 'typing' };
        const word = words[previous.index];
        const text = word.slice(0, previous.text.length + 1);
        return { ...previous, text, phase: text === word ? 'holding' : 'typing' };
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [state, reduceMotion, visible]);

  return (
    <span className="home-rotating-word" aria-hidden="true">
      {words.map(word => <span className="home-word-size" key={word}>{word}<span className="home-word-caret" /></span>)}
      <span className="home-word-text" data-focus-word>{reduceMotion ? words[0] : state.text}<span className="home-word-caret" /></span>
    </span>
  );
};

export default RotatingFocusWord;
