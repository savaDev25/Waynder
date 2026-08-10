package com.savadev25.waynder.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

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
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}