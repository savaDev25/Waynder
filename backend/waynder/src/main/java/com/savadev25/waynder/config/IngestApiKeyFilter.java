package com.savadev25.waynder.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Guards /api/landmarks/ingest with a shared secret header, since that endpoint
// performs bulk writes and is only ever meant to be called by our own scraper —
// not by end users, so it deliberately sits outside normal user auth/login.
@Component
public class IngestApiKeyFilter extends OncePerRequestFilter {

    private static final String HEADER_NAME = "X-Ingest-Key";
    private static final String PROTECTED_PATH = "/api/landmarks/ingest";

    @Value("${ingest.api-key}")
    private String expectedApiKey;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !PROTECTED_PATH.equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String providedKey = request.getHeader(HEADER_NAME);

        if (providedKey == null || !providedKey.equals(expectedApiKey)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid or missing " + HEADER_NAME);
            return;
        }

        filterChain.doFilter(request, response);
    }
}