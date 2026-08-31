import { clsx } from '../../utils/format';

export function Tabs({ tabs, value, onChange }) {
  const active = tabs.find((tab) => tab.id === value) || tabs[0];

  return (
    <div>
      <div className="tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active.id === tab.id}
            className={clsx('tab', active.id === tab.id && 'is-active')}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-panel" role="tabpanel">
        {active?.content}
      </div>
    </div>
  );
}
