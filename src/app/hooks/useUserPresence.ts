import { useEffect, useMemo, useState } from 'react';
import { User, UserEvent, UserEventHandlerMap } from 'matrix-js-sdk';
import { atom, useAtomValue } from 'jotai';
import { useMatrixClient } from './useMatrixClient';

export enum Presence {
  Online = 'online',
  Unavailable = 'unavailable',
  Offline = 'offline',
}

export type UserPresence = {
  presence: Presence;
  status?: string;
  active: boolean;
  lastActiveTs?: number;
};

const getUserPresence = (user: User): UserPresence => ({
  presence: user.presence as Presence,
  status: user.presenceStatusMsg,
  active: user.currentlyActive,
  lastActiveTs: user.getLastActiveTs(),
});

const isInitUserPresenceMapAtom = atom<Map<string, boolean>>(new Map<string, boolean>);

export const useUserPresence = (userId: string): UserPresence | undefined => {
  const mx = useMatrixClient();
  const user = mx.getUser(userId);

  const [presence, setPresence] = useState(() => (user ? getUserPresence(user) : undefined));

  const isInitUserPresenceMap = useAtomValue(isInitUserPresenceMapAtom);

  useEffect(() => {
    const updatePresence: UserEventHandlerMap[UserEvent.Presence] = (event, u) => {
      if (u.userId === user?.userId) {
        setPresence(getUserPresence(user));
      }
    };
    user?.on(UserEvent.Presence, updatePresence);
    user?.on(UserEvent.CurrentlyActive, updatePresence);
    user?.on(UserEvent.LastPresenceTs, updatePresence);
    return () => {
      user?.removeListener(UserEvent.Presence, updatePresence);
      user?.removeListener(UserEvent.CurrentlyActive, updatePresence);
      user?.removeListener(UserEvent.LastPresenceTs, updatePresence);
    };
  }, [user]);

  useEffect(() => {
    const fetchInitPresence = async () => {
      if (!user || user.lastPresenceTs || isInitUserPresenceMap.get(user.userId)) return;
      const initPresence = await mx.getPresence(user.userId);
      if (initPresence.presence === "offline"
        && initPresence.status_msg === undefined
        && initPresence.last_active_ago === undefined
        && initPresence.currently_active === undefined) {
        setPresence(undefined);
        isInitUserPresenceMap.set(user.userId, true);
        return;
      };
      setPresence({
        presence: initPresence.presence as Presence,
        status: initPresence.status_msg,
        active: initPresence.currently_active as boolean,
        lastActiveTs: initPresence?.last_active_ago
          ? Date.now() - initPresence.last_active_ago
          : undefined,
      });
      if (initPresence.last_active_ago) {
        user.lastActiveAgo = initPresence.last_active_ago;
        user.lastPresenceTs = Date.now();
      }
      isInitUserPresenceMap.set(user.userId, true);
    };

    fetchInitPresence();
  }, [mx, user, isInitUserPresenceMap]);

  return presence;
};

export const usePresenceLabel = (): Record<Presence, string> =>
  useMemo(
    () => ({
      [Presence.Online]: 'Active',
      [Presence.Unavailable]: 'Busy',
      [Presence.Offline]: 'Away',
    }),
    []
  );
