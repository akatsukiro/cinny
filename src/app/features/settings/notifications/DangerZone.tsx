import { Box, Text, color } from 'folds';
import React from 'react';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../styles.css';
import { DeregisterAllPushersSetting } from './DeregisterPushNotifications';

export function DangerZone() {
  return (
    <Box direction="Column" gap="100">
      <Text size="L400" style={{ color: color.Critical.Main }}>Danger Zone</Text>
      <SequenceCard
        className={SequenceCardStyle}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      >
        <DeregisterAllPushersSetting />
      </SequenceCard>
    </Box>

  );
}
