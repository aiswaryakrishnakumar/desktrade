package com.desktrade.security;
 
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
 
@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final AppUserDetailsService userDetailsService;
 
    public JwtFilter(JwtUtil jwtUtil, AppUserDetailsService uds) {
        this.jwtUtil = jwtUtil; this.userDetailsService = uds;
    }
 
    @Override
    protected void doFilterInternal(@SuppressWarnings("null") HttpServletRequest req, @SuppressWarnings("null") HttpServletResponse res, @SuppressWarnings("null") FilterChain chain)
            throws ServletException, IOException {
        String authHeader = req.getHeader("Authorization");
        String token = null;
        String username = null;
 
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try { username = jwtUtil.getUsername(token); } catch (Exception ignored) {}
        }
 
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails ud = userDetailsService.loadUserByUsername(username);
            if (jwtUtil.validateToken(token)) {
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        ud, null, ud.getAuthorities()
                );
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(req, res);
    }
}
 
 