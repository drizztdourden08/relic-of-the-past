/* @layer website-site @kind component */
import { Box, P, Span, Tag, Title } from '../../../../design';
import { PlatformLogo } from '../PlatformLogo';
import { FEATURE_TAG_COLORS, FEATURE_TAG_LABELS } from './FeatureCopy.constants';
import type { FeatureCopyProps } from './FeatureCopy.type';
import './FeatureCopy.css';

const FeatureCopy = ({ feature, figure }: FeatureCopyProps) => {
  const { id, label, title, promise, body, settings, tag } = feature;

  return (
    <Box className="feature-copy">
      <P className="feature-copy__eyebrow">{`${figure} · ${label}`}</P>
      <Title level={3} id={`${id}-title`} tabIndex={-1} className="feature-copy__title">
        {title}
      </Title>
      <P className="feature-copy__promise">
        <Span className="feature-copy__lead">{promise[0]}</Span> <Span className="feature-copy__dim">{promise[1]}</Span>
      </P>
      <P className="feature-copy__body">{body}</P>
      <Box className="feature-copy__chips">
        {tag ? (
          <Tag variant="urgency" color={FEATURE_TAG_COLORS[tag]}>
            {FEATURE_TAG_LABELS[tag]}
          </Tag>
        ) : null}
        {settings.map((setting) =>
          typeof setting === 'string' ? (
            <Tag key={setting} color="neutral">
              {setting}
            </Tag>
          ) : (
            <Tag key={setting.label} color="neutral" icon={<PlatformLogo logo={setting.logo} />}>
              {setting.label}
            </Tag>
          ),
        )}
      </Box>
    </Box>
  );
};

export { FeatureCopy };
