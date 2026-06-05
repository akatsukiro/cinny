import {
  as,
  Badge,
  Box,
  color,
  ContainerColor,
  MainColor,
  Text,
  Tooltip,
  TooltipProvider,
  toRem,
} from 'folds';
import React, { ReactNode, useId } from 'react';
import * as css from './styles.css';
import { Presence, usePresenceLabel } from '../../hooks/useUserPresence';
import { Time } from '../message';
import { useSetting } from '../../state/hooks/settings';
import { settingsAtom } from '../../state/settings';

const PresenceToColor: Record<Presence, MainColor> = {
  [Presence.Online]: 'Success',
  [Presence.Unavailable]: 'Warning',
  [Presence.Offline]: 'Secondary',
};

type PresenceBadgeProps = {
  presence: Presence;
  status?: string;
  lastActiveTs?: number;
  size?: '200' | '300' | '400' | '500';
};
export function PresenceBadge({ presence, status, lastActiveTs, size }: PresenceBadgeProps) {
  const label = usePresenceLabel();
  const badgeLabelId = useId();

  const [hour24Clock] = useSetting(settingsAtom, 'hour24Clock');
  const [dateFormatString] = useSetting(settingsAtom, 'dateFormatString');

  const lastSeen = (() => {
    if (!lastActiveTs || Number.isNaN(lastActiveTs)) return null;
    if (presence === Presence.Online) return null;
    return (
      <>
        <Text size="T200">•</Text>
        <Text size="T200">Last seen</Text>
        <Time
          compact={false}
          ts={lastActiveTs}
          hour24Clock={hour24Clock}
          dateFormatString={dateFormatString}
        />
      </>
    );
  })();

  return (
    <TooltipProvider
      position="Right"
      align="Center"
      offset={4}
      delay={200}
      tooltip={
        <Tooltip id={badgeLabelId}>
          <Box style={{ maxWidth: toRem(250) }} alignItems="Baseline" gap="100">
            <Text size="L400">{label[presence]}</Text>
            {status && <Text size="T200">•</Text>}
            {status && <Text size="T200">{status}</Text>}
            {lastSeen}
          </Box>
        </Tooltip>
      }
    >
      {(triggerRef) => (
        <Badge
          aria-labelledby={badgeLabelId}
          ref={triggerRef}
          size={size}
          variant={PresenceToColor[presence]}
          fill={presence === Presence.Offline ? 'Soft' : 'Solid'}
          radii="Pill"
        />
      )}
    </TooltipProvider>
  );
}

type AvatarPresenceProps = {
  badge: ReactNode;
  variant?: ContainerColor;
};
export const AvatarPresence = as<'div', AvatarPresenceProps>(
  ({ as: AsAvatarPresence, badge, variant = 'Surface', children, ...props }, ref) => (
    <Box as={AsAvatarPresence} className={css.AvatarPresence} {...props} ref={ref}>
      {badge && (
        <div
          className={css.AvatarPresenceBadge}
          style={{ backgroundColor: color[variant].Container }}
        >
          {badge}
        </div>
      )}
      {children}
    </Box>
  )
);
