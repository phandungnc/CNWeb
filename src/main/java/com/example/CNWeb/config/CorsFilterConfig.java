package com.example.CNWeb.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsFilterConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistrationBean() {
        CorsConfiguration config = new CorsConfiguration();

        //  Cho phép Frontend
        config.setAllowedOrigins(List.of("http://localhost:5173", "https://thitructuyen5294.web.app","https://phanducdung.id.vn/"));

        // Cho phép tất cả method (GET, POST, PUT, DELETE, OPTIONS)
        config.setAllowedMethods(List.of("*"));

        // Cho phép tất cả Header
        config.setAllowedHeaders(List.of("*"));

        // Cho phép gửi Credentials (Cookie, Token)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));

        // Đặt độ ưu tiên cao nhất để chạy trước Spring Security
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}