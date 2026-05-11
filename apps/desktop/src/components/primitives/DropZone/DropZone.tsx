import { useState, useRef, useCallback, type DragEvent } from 'react';
import './DropZone.css';

interface DropZoneProps {
  /** Accepted file extensions (e.g. ['.zip', '.7z']) */
  accept?: string[];
  label?: string;
  hint?: string;
  disabled?: boolean;
  onDrop: (files: File[]) => void;
}

export function DropZone({
  accept,
  label = 'Drop files here',
  hint,
  disabled = false,
  onDrop,
}: DropZoneProps) {
  const [active, setActive] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setActive(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const filterFiles = useCallback((files: File[]): File[] => {
    if (!accept || accept.length === 0) return files;
    return files.filter((f) =>
      accept.some((ext) => f.name.toLowerCase().endsWith(ext.toLowerCase())),
    );
  }, [accept]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setActive(false);
    const files = filterFiles(Array.from(e.dataTransfer.files));
    if (files.length > 0) onDrop(files);
  }, [filterFiles, onDrop]);

  const handleClick = () => inputRef.current?.click();

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = filterFiles(Array.from(e.target.files ?? []));
    if (files.length > 0) onDrop(files);
    // Reset so the same file can be re-selected
    e.target.value = '';
  }, [filterFiles, onDrop]);

  const cls = [
    'dropzone',
    active && 'dropzone--active',
    disabled && 'dropzone--disabled',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <span className="dropzone__icon">📦</span>
      <span className="dropzone__label">{label}</span>
      {hint && <span className="dropzone__hint">{hint}</span>}
      <input
        ref={inputRef}
        type="file"
        accept={accept?.join(',')}
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />
    </div>
  );
}
