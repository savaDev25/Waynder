package com.savadev25.waynder.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import java.util.UUID;

// Small shared check used by every controller that has a userId in its
// path -- confirms the authenticated JWT's owner actually matches the
// resource being accessed, e.g. blocks user A from creating routes under
// user B's account just because A has a valid token of their own.
public final class AuthorizationUtil {

    private AuthorizationUtil() {}

    public static void requireSelf(Authentication authentication, UUID pathUserId) {
        String authenticatedUserId = authentication.getName();
        if (!authenticatedUserId.equals(pathUserId.toString())) {
            throw new AccessDeniedException("You may only act on your own account");
        }
    }
}