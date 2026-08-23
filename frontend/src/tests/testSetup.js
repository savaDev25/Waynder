import { afterEach } from 'vitest';

// Without this, a JWT set by one test (e.g. useAuth's login()) could still
// be sitting in localStorage when an unrelated test runs later in the same
// file/run, silently changing that test's behavior (an Authorization header
// showing up where none was expected).
afterEach(() => {
  localStorage.clear();
});