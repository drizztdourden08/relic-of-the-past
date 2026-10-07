/* @layer root-config @kind logic */
/** The first line of every issue body. With a GitHub identity linked the login
 *  is mentioned, so GitHub's own notifications carry every later comment to the
 *  reporter. Without one the display name stands alone; no caller reads `anonymous`. */
import type { ReportReporter } from '../../../../shared/sanctuary';
import { identitiesRepo } from '../db/identities-repo';

const reporterLine = async (reporter: ReportReporter | null): Promise<string> => {
  if (!reporter) return 'Reporter: anonymous';
  const identities = await identitiesRepo.forUser(reporter.userId);
  const github = identities.find((identity) => identity.provider === 'github');
  return github ? `Reporter: ${reporter.displayName} (@${github.handle})` : `Reporter: ${reporter.displayName}`;
};

export { reporterLine };
