interface BrowserFrameProps {
  imageSrc: string;
  imageAlt: string;
  windowTitle?: string;
  windowUrl?: string;
  variant?: 'dark' | 'light';
  className?: string;
  onClick?: () => void;
}

export default function BrowserFrame({
  imageSrc,
  imageAlt,
  windowTitle = 'SechPoint — Cybersecurity Platform',
  windowUrl = 'app.sechpoint.io/dashboard',
  variant = 'dark',
  className = '',
  onClick,
}: BrowserFrameProps) {
  return (
    <div
      className={`browser-frame browser-frame--${variant} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="browser-frame-header">
        <div className="browser-frame-buttons">
          <span className="browser-frame-button browser-frame-button--red" />
          <span className="browser-frame-button browser-frame-button--yellow" />
          <span className="browser-frame-button browser-frame-button--green" />
        </div>
        <div className="browser-frame-url-bar">
          <span className="material-icons-round browser-frame-lock">lock</span>
          <span className="browser-frame-url">{windowUrl}</span>
        </div>
        <span className="browser-frame-title">{windowTitle}</span>
      </div>
      <div className="browser-frame-body">
        <img src={imageSrc} alt={imageAlt} loading="lazy" draggable={false} />
      </div>
    </div>
  );
}
