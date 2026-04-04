import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface UserRegistrationContextValue {
  isRegistered: boolean;
  ensureRegistered: () => Promise<void>;
}

const UserRegistrationContext = createContext<UserRegistrationContextValue>({
  isRegistered: false,
  ensureRegistered: async () => {},
});

export function UserRegistrationProvider({
  children,
}: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [isRegistered, setIsRegistered] = useState(false);
  const registrationPromise = useRef<Promise<void> | null>(null);
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (!identity) {
      hasRecorded.current = false;
      setIsRegistered(false);
      registrationPromise.current = null;
      return;
    }
    if (actor && !hasRecorded.current) {
      hasRecorded.current = true;
      const promise = (actor as any)
        .recordLogin()
        .then(() => {
          setIsRegistered(true);
        })
        .catch(() => {
          // Even on error, mark as done so save/publish aren't blocked forever
          setIsRegistered(true);
        });
      registrationPromise.current = promise;
    }
  }, [identity, actor]);

  const ensureRegistered = async () => {
    if (isRegistered) return;
    if (registrationPromise.current) {
      await registrationPromise.current;
      return;
    }
    if (actor) {
      try {
        await (actor as any).recordLogin();
      } catch {
        // ignore
      }
      setIsRegistered(true);
    }
  };

  return (
    <UserRegistrationContext.Provider
      value={{ isRegistered, ensureRegistered }}
    >
      {children}
    </UserRegistrationContext.Provider>
  );
}

export function useUserRegistration() {
  return useContext(UserRegistrationContext);
}
