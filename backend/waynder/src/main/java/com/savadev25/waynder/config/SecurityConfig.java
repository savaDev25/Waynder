package com.savadev25.waynder.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    // Comma-separated list, configurable per environment (local dev vs. the
    // real Vercel domain later) instead of hardcoded -- see application.properties.
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    // Used by UserService to hash passwords on registration -- never store
    // or compare plain-text passwords.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CSRF protection guards against browser/session-cookie attacks. This API
    // is stateless and uses explicit headers (X-Ingest-Key for now, real user
    // auth later) rather than cookies, so CSRF doesn't apply here -- disabling
    // it is standard practice for stateless REST APIs.
    //
    // Access control itself is intentionally left to our own filters
    // (IngestApiKeyFilter today) rather than Spring Security's authorization
    // rules -- this permitAll() will be revisited once real user-facing
    // endpoints with login exist.
    //
    // .cors(...) must be wired here, in the same chain -- Spring Security's
    // filter runs before a standalone CORS config would, so registering CORS
    // separately from this chain wouldn't actually take effect.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .toList();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}