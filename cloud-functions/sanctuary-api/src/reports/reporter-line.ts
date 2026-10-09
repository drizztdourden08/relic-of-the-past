/* @layer root-config @kind logic */
import type { ReportReporter } from '@rotp/hub-contracts';
import { identitiesRepo } from '@rotp/hub-server';

const reporterLine = async (reporter: ReportReporter | null): Promise<string> => {
  if (!reporter) return 'Reporter: anonymous';
  const identities = await identitiesRepo.forUser(reporter.userId);
  const github = identities.find((identity) => identity.provider === 'github');
  return github ? `Reporter: ${reporter.displayName} (@${github.handle})` : `Reporter: ${reporter.displayName}`;
};

export { reporterLine };
