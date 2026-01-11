package com.example.CNWeb.config;

import com.example.CNWeb.security.JwtUtil;
import com.example.CNWeb.service.UserSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;
import java.util.UUID;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;
    private final UserSessionService sessionService;

    public WebSocketConfig(JwtUtil jwtUtil, @Lazy UserSessionService sessionService) {
        this.jwtUtil = jwtUtil;
        this.sessionService = sessionService;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/user", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                // Chỉ kiểm tra khi Client bắt đầu kết nối (CONNECT)
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    try {
                        String authHeader = accessor.getFirstNativeHeader("Authorization");

                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            String token = authHeader.substring(7);

                            // Parse Token
                            String userCode = jwtUtil.getUserCode(token);
                            String role = jwtUtil.getRole(token);
                            UUID sessionId = jwtUtil.getSessionId(token);

                    //        sessionService.validateSession(sessionId);

                            //  Xác thực thành công
                            UsernamePasswordAuthenticationToken auth =
                                    new UsernamePasswordAuthenticationToken(
                                            userCode,
                                            null,
                                            List.of(new SimpleGrantedAuthority("ROLE_" + role))
                                    );
                            accessor.setUser(auth);
                            log.info("WebSocket Authenticated: User={}, Session={}", userCode, sessionId);
                        } else {
                            log.warn("WebSocket Connect: Thiếu Header Authorization");
                        }
                    } catch (Exception e) {
                        // Bắt lỗi để không crash Interceptor
                        log.error("WebSocket Authentication Failed: {}", e.getMessage());
                        // Trả về null để từ chối kết nối một cách an toàn
                        return null;
                    }
                }
                return message;
            }
        });
    }
}