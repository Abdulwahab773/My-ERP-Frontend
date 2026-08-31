import { useEffect, useState } from 'react';
import { Button } from '../ui';
import { STORAGE_KEYS } from '../../constants';

export function InstallBanner() {
  const [event, setEvent] = useState(null);
  const [hidden, setHidden] = useState(() => localStorage.getItem(STORAGE_KEYS.INSTALL_DISMISSED) === '1');

  useEffect(() => {
    const onPrompt = (next) => {
      next.preventDefault();
      setEvent(next);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (hidden || !event) return null;

  async function install() {
    event.prompt();
    await event.userChoice;
    setEvent(null);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEYS.INSTALL_DISMISSED, '1');
    setHidden(true);
  }

  return (
    <div className="install-banner">
      <div>
        <strong>Install Aether</strong>
        <p className="muted">Add it to your home screen for a native mobile workspace.</p>
      </div>
      <div className="install-actions">
        <Button size="sm" onClick={install}>Install</Button>
        <Button size="sm" variant="ghost" onClick={dismiss}>Not now</Button>
      </div>
    </div>
  );
}
