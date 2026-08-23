import { useState } from 'react';

const STORAGE_KEY = 'waynder_user_id';

/**
 * TEMPORARY stand-in until real login/auth exists -- the backend currently
 * only has register/getById/update/delete, no session/JWT issuing endpoint.
 * Stores a userId in localStorage so plan/route creation has something to
 * attach data to. Swap this out for a real auth context once login exists;
 * every consumer of this hook only needs `userId` to keep working.
 */
export function useCurrentUser() {
  const [userId, setUserIdState] = useState(() => localStorage.getItem(STORAGE_KEY) || '');

  const setUserId = (id) => {
    localStorage.setItem(STORAGE_KEY, id);
    setUserIdState(id);
  };

  return { userId, setUserId };
}