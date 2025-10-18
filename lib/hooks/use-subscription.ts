import { useEffect, useState } from "react";
import { db } from "@/lib/database";
import type { Subscription } from "@/lib/types";

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getSubscription() {
      try {
        const { data: session } = await db.auth().getSession();

        if (!session?.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await db
          .subscriptions()
          .getByUserId(session.user.id);

        if (error) throw error;
        setSubscription(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    getSubscription();

    // Subscribe to changes
    const { data: session } = await db.auth().getSession();
    if (session?.user) {
      const unsubscribe = db
        .subscriptions()
        .subscribeToChanges(session.user.id, (subscription) => {
          setSubscription(subscription as Subscription);
        });

      return unsubscribe;
    }
  }, []);

  return { subscription, loading, error };
}
