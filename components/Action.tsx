import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

type ActionStyle = {
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
};

const actionClass = (variant: string, className = '') => `ui-button ui-button-${variant} ${className}`.trim();
const ActionContent = ({ children, variant = 'primary', icon }: React.PropsWithChildren<ActionStyle>) => (
  <><span>{children}</span><span className="ui-button-icon" aria-hidden="true">{icon ?? (variant === 'primary' ? <ArrowUpRight size={19} /> : <ArrowRight size={19} />)}</span></>
);

export const ActionLink = ({ children, variant = 'primary', icon, className, ...props }: LinkProps & ActionStyle) => (
  <Link {...props} className={actionClass(variant, className)}><ActionContent variant={variant} icon={icon}>{children}</ActionContent></Link>
);

export const ActionButton = ({ children, variant = 'primary', icon, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & ActionStyle) => (
  <button type="button" {...props} className={actionClass(variant, className)}><ActionContent variant={variant} icon={icon}>{children}</ActionContent></button>
);

export const ActionAnchor = ({ children, variant = 'secondary', icon, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & ActionStyle) => (
  <a {...props} className={actionClass(variant, className)}><ActionContent variant={variant} icon={icon}>{children}</ActionContent></a>
);

export const IconButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className = '', ...props }, ref) => (
  <button type="button" {...props} ref={ref} className={`ui-icon-button ${className}`.trim()} />
));
IconButton.displayName = 'IconButton';
