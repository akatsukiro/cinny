import { Box, Button, Spinner, Text, color } from 'folds';
import React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../styles.css';
import { DeregisterAllPushersSetting } from './DeregisterPushNotifications';
import { SettingTile } from '../../../components/setting-tile';
import { AsyncStatus, useAsyncCallback } from '../../../hooks/useAsyncCallback';
import { useSetting } from '../../../state/hooks/settings';
import { settingsAtom } from '../../../state/settings';
import { disablePushNotifications, enablePushNotifications } from './PushNotifications';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useClientConfig } from '../../../hooks/useClientConfig';
import { pushSubscriptionAtom } from '../../../state/pushSubscription';

function RecreatePushSubscription() {
  const mx = useMatrixClient();
  const clientConfig = useClientConfig();
  const pushSubAtom = useAtom(pushSubscriptionAtom);
  const setPushSubscription = useSetAtom(pushSubscriptionAtom);

  const pushNotificationEnabled = useSetting(settingsAtom, 'usePushNotifications');

  const recreatePushSubscription = async () => {
    if (pushNotificationEnabled) {
      await disablePushNotifications(mx, clientConfig, pushSubAtom);
      setPushSubscription(null);
      const registration = await navigator.serviceWorker.ready;
      const currentBrowserSub = await registration.pushManager.getSubscription();
      await currentBrowserSub?.unsubscribe();
      await enablePushNotifications(mx, clientConfig, pushSubAtom);
    } else {
      setPushSubscription(null);
    }
  };
  const [recreatePushSubState, recreatePushSub] = useAsyncCallback(recreatePushSubscription);

  return (
    <SettingTile
      title="Recreate Push Notification Subscription"
      description={
        <div>
          <Text size="T200">
            Recreate a new push notification subscription for this session. May be useful when push
            notification is not working.
          </Text>
          {recreatePushSubState.status === AsyncStatus.Error && (
            <Text as="span" style={{ color: color.Critical.Main }} size="T200">
              <br />
              Failed to recreate a new subscription. Please try again.
            </Text>
          )}
          {recreatePushSubState.status === AsyncStatus.Success && (
            <Text as="span" style={{ color: color.Success.Main }} size="T200">
              <br />
              Successfully recreate a new subscription.
            </Text>
          )}
        </div>
      }
      after={
        recreatePushSubState.status === AsyncStatus.Loading ? (
          <Spinner variant="Secondary" />
        ) : (
          <Button
            size="300"
            radii="300"
            variant="Secondary"
            fill="Soft"
            outlined
            onClick={recreatePushSub}
          >
            <Text as="span" size="B300">
              Recreate
            </Text>
          </Button>
        )
      }
    />
  );
}

export function DangerZone() {
  return (
    <Box direction="Column" gap="100">
      <Text size="L400" style={{ color: color.Critical.Main }}>
        Danger Zone
      </Text>
      <SequenceCard
        className={SequenceCardStyle}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      >
        <RecreatePushSubscription />
      </SequenceCard>
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
