// AvatarSprite — renders an avatar outfit image; the astronaut outfit adds the
// layered SVG helmet from DrJellyboneAstronaut so it matches the in-game look.
import { HelmetBackShell, HelmetFrontVisor } from './DrJellyboneAstronaut';

export default function AvatarSprite({ src, helmet = false, width, className = '', style = {}, imgStyle = {}, testId }) {
  if (!helmet) {
    return <img src={src} alt="" draggable={false} data-testid={testId} className={className} style={{ width, ...style, ...imgStyle }} />;
  }
  return (
    <div className={`relative inline-block ${className}`} style={{ width, ...style }} data-testid={testId} data-helmet="true">
      <HelmetBackShell />
      <img src={src} alt="" draggable={false} className="block w-full h-auto relative" style={{ zIndex: 1, ...imgStyle }} />
      <HelmetFrontVisor />
    </div>
  );
}
