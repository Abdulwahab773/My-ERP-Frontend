import { useLocation, useNavigate } from 'react-router-dom';
import { MsIcon } from '../components/ui/MsIcon';

export function ComingSoonPage({ title = 'Coming soon', description }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="st-page flex items-center justify-center min-h-[60vh]">
      <div className="bg-surface max-w-md w-full rounded-xl border border-outline-variant p-xl text-center">
        <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-lg">
          <MsIcon name="hourglass_empty" className="text-3xl text-primary" />
        </div>
        <p className="font-label-md text-primary uppercase mb-xs">Next phase</p>
        <h1 className="st-page-title mb-xs">{title}</h1>
        <p className="st-page-lead mx-auto">
          {description || `The ${location.pathname.replace('/app/', '')} module is architected but not implemented in this phase.`}
        </p>
        <button type="button" className="st-btn-primary mt-lg" onClick={() => navigate('/app')}>
          Return to Home
        </button>
      </div>
    </div>
  );
}
