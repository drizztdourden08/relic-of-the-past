/* @layer renderer-app @kind component */
import { useCallback, useState } from 'react';
import { BrandMark, Logo } from '@drizztdourden08/tessera/brand';
import { SiteFooter, SiteHeader } from '@drizztdourden08/tessera/composites';
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import { useSitePath } from '../../hooks/useSitePath';
import { Home } from '../Home';
import { SignIn } from '../SignIn';
import { profileAction } from '../../account/profile-action';
import { FOOTER_LINKS, SHELL_TEXT, SITE_LINKS, SITE_PATHS } from './SiteShell.constants';
import './SiteShell.css';

const SiteShell = () => {
  const { path, go } = useSitePath();
  const [person, setPerson] = useState<string | null>(null);

  const signIn = useCallback(() => {
    setPerson(SHELL_TEXT.guest);
    go(SITE_PATHS.home);
  }, [go]);

  const signOut = useCallback(() => setPerson(null), []);
  const page = path === SITE_PATHS.signIn ? 'sign-in' : 'home';

  return (
    <Box className="site-shell">
      <SiteHeader
        brand={{ logo: <BrandMark app="rotp" size="md" />, title: SHELL_TEXT.title, label: SHELL_TEXT.homeLabel, href: SITE_PATHS.home }}
        links={SITE_LINKS}
        activeId={page}
        navigate={go}
        profile={person === null ? undefined : profileAction(person, { label: SHELL_TEXT.signOut, onSelect: signOut })}
        actions={person === null && page !== 'sign-in' ? <Button variant="primary" size="sm" onClick={() => go(SITE_PATHS.signIn)}>{SHELL_TEXT.signIn}</Button> : undefined}
      />
      <Box as="main" className="site-shell__page">
        {page === 'sign-in' ? <SignIn onSignIn={signIn} /> : <Home />}
      </Box>
      <SiteFooter logo={<Logo brand="rotp" size="sm" />} note={SHELL_TEXT.footer} links={FOOTER_LINKS} navigate={go} />
    </Box>
  );
};

export { SiteShell };
