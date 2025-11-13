package com.desktrade.security;
 
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
 
import java.security.Key;
import java.util.Date;
 
@Component
public class JwtUtil {
    private final Key key;
    private final long expirationMs = 1000L * 60 * 60; // 1 hour, tune if required
 
    public JwtUtil(/* you can inject secret from properties */) {
        // ideally inject secret via @Value("${jwt.secret}") and decode base64
        String secret = "change-me-to-a-very-long-secret-key-and-store-in-properties";
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }
 
    public String generateToken(AppUserDetails userDetails) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
 
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("name", userDetails.getName())
                .claim("id", userDetails.getId())
                .claim("role", userDetails.getAuthorities().iterator().next().getAuthority()) // ROLE_...
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
 
    public String getUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }
 
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException ex) {
            return false;
        }
    }
}