"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import ProfileLink from "./ProfileLink";

export default function AuthProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      const session = await getSession();
      setUser(session?.user || null);
    }

    fetchSession();
  }, []);

  if (!user) return null; // Hide if no user

  return <ProfileLink user={user} />;
}
