import { useEffect, useState } from "react";
import { db } from "@/lib/database";
import type { Subscription } from "@/lib/types";

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initializeSubscription() {
      try {
        const { data: session } = await db.auth().getSession();

        if (!session?.user) {
          setLoading(false);
          return;
        }

        // Get initial subscription
        const { data, error } = await db
          .subscriptions()
          .getByUserId(session.user.id);

        if (error) throw error;
        setSubscription(data);

        // Subscribe to real-time changes (adapter returns a DatabaseResult with unsubscribe)
        const subRes = await db
          .subscriptions()
          .subscribeToChanges(session.user.id, (subscription) => {
            setSubscription(subscription as Subscription);
          });
        if (subRes && subRes.data) {
          unsubscribe = subRes.data;
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    initializeSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { subscription, loading, error };
}
