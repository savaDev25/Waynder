package com.savadev25.waynder.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.PrintWriter;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IngestApiKeyFilterTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private IngestApiKeyFilter filter;

    @BeforeEach
    void setUp() {
        filter = new IngestApiKeyFilter();
        ReflectionTestUtils.setField(filter, "expectedApiKey", "test-secret-key");
    }

    @Test
    void shouldNotFilter_returnsTrue_forUnrelatedPaths() {
        when(request.getRequestURI()).thenReturn("/api/other-endpoint");

        Assertions.assertTrue(filter.shouldNotFilter(request));
    }

    @Test
    void shouldNotFilter_returnsFalse_forIngestPath() {
        when(request.getRequestURI()).thenReturn("/api/landmarks/ingest");

        Assertions.assertFalse(filter.shouldNotFilter(request));
    }

    @Test
    void doFilterInternal_blocksRequest_whenKeyMissing() throws Exception {
        when(request.getHeader("X-Ingest-Key")).thenReturn(null);
        when(response.getWriter()).thenReturn(mock(PrintWriter.class));

        filter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void doFilterInternal_blocksRequest_whenKeyIncorrect() throws Exception {
        when(request.getHeader("X-Ingest-Key")).thenReturn("wrong-key");
        when(response.getWriter()).thenReturn(mock(PrintWriter.class));

        filter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void doFilterInternal_allowsRequest_whenKeyCorrect() throws Exception {
        when(request.getHeader("X-Ingest-Key")).thenReturn("test-secret-key");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }
}