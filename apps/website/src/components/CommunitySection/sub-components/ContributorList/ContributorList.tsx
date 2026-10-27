/* @layer website-site @kind component */
import { Box, Flex, Image, Link } from '../../../../design';
import { formatCount } from '../../../../format';
import { AVATAR_SIZE } from './ContributorList.constants';
import type { ContributorListProps } from './ContributorList.type';
import './ContributorList.css';

const ContributorList = (props: ContributorListProps) => {
  const { contributors } = props;
  if (contributors.length === 0) return null;

  return (
    <Flex as="ul" wrap justify="center" gap="sm" className="landing-contributors">
      {contributors.map((contributor) => (
        <Box as="li" key={contributor.login}>
          <Link
            href={contributor.htmlUrl}
            className="landing-contributors__link"
            title={`${contributor.login} / ${formatCount(contributor.contributions)} contributions`}
          >
            <Image
              className="landing-contributors__avatar"
              src={contributor.avatarUrl}
              alt={contributor.login}
              width={AVATAR_SIZE}
              height={AVATAR_SIZE}
              loading="lazy"
            />
          </Link>
        </Box>
      ))}
    </Flex>
  );
};

export { ContributorList };
