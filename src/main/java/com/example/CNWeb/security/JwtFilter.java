package com.example.CNWeb.security;

import com.example.CNWeb.service.UserSessionService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserSessionService sessionService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                // token ht hạn thì ExpiredJwtException
                // token sai thì SignatureException
                String userCode = jwtUtil.getUserCode(token);
                String role = jwtUtil.getRole(token);
                UUID sessionId = jwtUtil.getSessionId(token);

                //  xác minh Session trong Database
                sessionService.validateSession(sessionId);

                // nếu đã xác minh dc
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userCode, null, List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
                auth.setDetails(sessionId);
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (ExpiredJwtException e) {
                // token hết hạn
                returnErrorResponse(response, "Token đã hết hạn");
                return;

            } catch (SignatureException | MalformedJwtException | IllegalArgumentException e) {
                // sai token
                returnErrorResponse(response, "Token không hợp lệ");
                return;

            } catch (Exception e) {
                // lỗi khác bên db
                returnErrorResponse(response, e.getMessage());
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    // json
    private void returnErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\":false,\"message\":\"" + message + "\",\"data\":null}");
    }
}