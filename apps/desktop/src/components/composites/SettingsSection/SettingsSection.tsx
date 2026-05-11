import type { ReactNode } from 'react';
import './SettingsSection.css';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <h3 className="settings-section__title">{title}</h3>
        {description && <p className="settings-section__desc">{description}</p>}
      </div>
      <div className="settings-section__content">
        {children}
      </div>
    </section>
  );
}
