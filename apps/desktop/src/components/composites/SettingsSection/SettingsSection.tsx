import type { ReactNode } from 'react';
import './SettingsSection.css';
import { type SettingsSectionProps } from './types';


const SettingsSection = (props: SettingsSectionProps) => {
  const { title, description, children } = props;

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
};

export {
  SettingsSection,
};
