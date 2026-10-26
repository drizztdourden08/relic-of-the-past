/* @layer website-site @kind component */
import { Button, Flex, Icon, Small } from '@drizztdourden08/tessera/primitives';
import type { DownloadCtaProps } from './DownloadCta.type';

const DownloadCta = (props: DownloadCtaProps) => {
  const { href, busy = false, title, caption } = props;

  return (
    <Flex direction="column" align="center" gap="sm">
      <Button
        look="pixel"
        variant="primary"
        loading={busy}
        disabled={!href}
        icon={<Icon name="download" />}
        onClick={() => {
          if (href) window.location.assign(href);
        }}
      >
        {title}
      </Button>
      {caption && <Small className="landing-download__caption">{caption}</Small>}
    </Flex>
  );
};

export { DownloadCta };
