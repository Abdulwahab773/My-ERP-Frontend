import { useNavigate } from 'react-router-dom';
import { MsIcon } from '../components/ui/MsIcon';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-margin-mobile">
      <div className="bg-surface max-w-md w-full rounded-xl border border-outline-variant shadow-[0_8px_32px_rgba(15,23,42,0.08)] p-xl text-center">
        <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-lg">
          <MsIcon name="search" className="text-3xl text-primary" />
        </div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-background mb-xs">This page does not exist</h1>
        <p className="font-body-md text-on-surface-variant mb-xl">The route is missing or has not been built yet.</p>
        <button
          type="button"
          className="w-full h-10 bg-primary text-on-primary font-label-md rounded-lg mb-sm"
          onClick={() => navigate('/app')}
        >
          Go home
        </button>
        <button type="button" className="st-btn-ghost" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
}
