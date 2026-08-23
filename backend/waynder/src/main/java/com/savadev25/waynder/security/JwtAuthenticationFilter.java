package com.savadev25.waynder.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

// Reads "Authorization: Bearer <token>", and if it's a valid JWT, marks the
// request as authenticated with the token's userId as the principal --
// that's what lets controllers later check "does this path's userId match
// who's actually logged in".
//
// Deliberately NOT a @Component: this needs to be wired explicitly into
// Spring Security's filter chain (see SecurityConfig) so authorizeHttpRequests
// actually recognizes the resulting authentication. A plain @Component filter
// (like IngestApiKeyFilter) runs in the general servlet chain instead and
// wouldn't integrate with Security's authenticated()/permitAll() rules.
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtService.isValid(token)) {
                UUID userId = jwtService.extractUserId(token);

                var authentication = new UsernamePasswordAuthenticationToken(
                        userId.toString(), // principal: the authenticated user's id
                        null,
                        List.of() // no role-based authorities yet
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
            // An invalid/expired token is simply ignored here -- no
            // authentication gets set, so authorizeHttpRequests' own
            // authenticated() rule rejects it with 401 further down the
            // chain. No need to short-circuit with a manual 401 here.
        }

        filterChain.doFilter(request, response);
    }
}