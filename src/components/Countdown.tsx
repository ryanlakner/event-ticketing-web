import { useEffect, useState } from 'react';

import { formatCountdown } from '../lib/format';

/** Live countdown to a reservation hold's expiry. */
export default function Countdown({ until }: { until: string }) {
  const deadline = new Date(until).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = deadline - now;
  if (remaining <= 0) {
    return <span className="countdown expired">Hold expired</span>;
  }

  return (
    <span className="countdown" aria-live="polite">
      Held for <strong>{formatCountdown(remaining)}</strong>
    </span>
  );
}
