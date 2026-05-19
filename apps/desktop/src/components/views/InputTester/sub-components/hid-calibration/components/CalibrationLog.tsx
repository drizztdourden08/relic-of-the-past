/**
 * Log display for the HID Calibration Wizard.
 */

interface CalibrationLogProps {
  log: string[];
  logRef: React.RefObject<HTMLDivElement | null>;
}

const CalibrationLog = (props: CalibrationLogProps) => {
  const { log, logRef } = props;

  return (
    <div className="hid-cal__step">
      <div className="hid-cal__step-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        Log
        <button className="input-cal__btn" style={{ fontSize: 10, padding: '2px 8px' }}
          onClick={() => navigator.clipboard.writeText(log.join('\n'))}>Copy</button>
      </div>
      <div ref={logRef} className="input-cal__log" style={{ maxHeight: 150 }}>
        {log.length === 0 && <div className="input-cal__log-entry">Waiting...</div>}
        {log.map((entry, i) => (
          <div key={i} className="input-cal__log-entry" style={{ whiteSpace: 'pre-wrap' }}>{entry}</div>
        ))}
      </div>
    </div>
  );
};

export { CalibrationLog };
