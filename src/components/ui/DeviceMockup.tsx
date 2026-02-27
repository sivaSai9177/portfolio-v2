interface DeviceMockupProps {
  imageSrc: string;
  imageAlt: string;
  /**
   * laptop-dark: Realistic space-gray MacBook Pro 16" (Figma node 8-150)
   * laptop-clay: Minimal matte-white clay MacBook Pro (Figma node 1-3)
   * laptop-clay-air: Thinner clay MacBook Air variant (Figma node 6-51)
   * phone: Mobile device frame
   */
  variant?: 'laptop-dark' | 'laptop-clay' | 'laptop-clay-air' | 'phone';
  className?: string;
  onClick?: () => void;
}

export default function DeviceMockup({
  imageSrc,
  imageAlt,
  variant = 'laptop-dark',
  className = '',
  onClick,
}: DeviceMockupProps) {
  const isLaptop = variant.startsWith('laptop');
  const isPhone = variant === 'phone';

  return (
    <div
      className={`device-mockup device-mockup--${variant} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Laptop lid/screen assembly */}
      {isLaptop && (
        <>
          <div className="device-mockup-lid">
            {/* Camera notch for realistic variant */}
            {variant === 'laptop-dark' && <div className="device-mockup-camera" />}
            <div className="device-mockup-screen">
              <img src={imageSrc} alt={imageAlt} loading="lazy" draggable={false} />
            </div>
          </div>
          <div className="device-mockup-base">
            <div className="device-mockup-base-indent" />
          </div>
        </>
      )}

      {/* Phone */}
      {isPhone && (
        <>
          <div className="device-mockup-notch" />
          <div className="device-mockup-screen">
            <img src={imageSrc} alt={imageAlt} loading="lazy" draggable={false} />
          </div>
        </>
      )}
    </div>
  );
}
