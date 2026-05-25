import { useEffect, useState } from 'react';
import { Button } from '../../primitives/Button';
import './AboutDialog.css';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

const AboutDialog = ({ open, onClose }: AboutDialogProps) => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    if (open) {
      window.api.updater.getVersion().then(setVersion);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog about-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="about-dialog__header">
          <img className="about-dialog__logo" src="./logos/logo-256.png" alt="Relic of the Past" />
          <h2 className="about-dialog__title">Relic of the Past</h2>
        </div>

        <div className="about-dialog__body">
          <div className="about-dialog__row">
            <span className="about-dialog__label">Version</span>
            <span className="about-dialog__value">{version}</span>
          </div>
          <div className="about-dialog__row">
            <span className="about-dialog__label">Electron</span>
            <span className="about-dialog__value">{navigator.userAgent.match(/Electron\/([\d.]+)/)?.[1] ?? '—'}</span>
          </div>
          <div className="about-dialog__row">
            <span className="about-dialog__label">Chromium</span>
            <span className="about-dialog__value">{navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1] ?? '—'}</span>
          </div>
          <div className="about-dialog__row">
            <span className="about-dialog__label">Platform</span>
            <span className="about-dialog__value">{navigator.platform}</span>
          </div>
        </div>

        <p className="about-dialog__description">
          A modern desktop port of The Legend of Zelda: A Link to the Past, built with Electron, React, and WebAssembly.
        </p>

        <div className="dialog__actions">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export { AboutDialog };
