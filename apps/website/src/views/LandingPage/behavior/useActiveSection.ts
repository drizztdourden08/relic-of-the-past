/* @layer website-site @kind hook */
import { useEffect, useState } from 'react';
import { ACTIVE_BAND } from './useActiveSection.constants';

const useActiveSection = (ids: readonly string[]): string | null => {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const hit = entries.find((entry) => entry.isIntersecting);
      if (hit) setActive(hit.target.id);
    }, ACTIVE_BAND);
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
};

export { useActiveSection };
