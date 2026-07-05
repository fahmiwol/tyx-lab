# Security and Compliance Checklist

## Overview
Security hardening and compliance framework for multi-user digital platforms. Covers authentication, data protection, infrastructure, incident response, and regulatory compliance.

## Authentication and Identity

- Require HTTPS/TLS 1.2+ for all endpoints
- Implement password hashing with bcrypt, Argon2, or PBKDF2
- Password policy: minimum 12 characters, entropy check
- Session tokens: short-lived (15-30 min), refresh tokens (7 days)
- JWT: include expiry, issue time, audience, issuer; sign with HS256+
- Rate limit login attempts: 5 failed attempts → 15 min lockout per IP
- Require email verification before account activation
- Support 2FA (TOTP preferred; SMS optional)
- Enforce password reset every 90 days
- Session timeout on inactivity (30-60 min)
- Secure password reset: token-based, 1-hour expiry, single-use
- Log all authentication failures

## Authorization and Access Control

- Implement role-based access control (RBAC) with least-privilege
- Separate authentication from authorization
- Return 403 Forbidden (not 404) for unauthorized access
- Audit all permission changes
- Tenant isolation: users cannot access other tenant data (SaaS)
- Row-level security: users see own records by default
- Field-level masking: hide sensitive fields from unprivileged roles
- Periodic access review: quarterly audit of roles
- Decommission unused roles
- Offboarding: revoke all access on employee exit

## Data Protection

- Encrypt sensitive data at rest (AES-256)
- Encrypt sensitive data in transit (TLS 1.2+)
- Encrypt password fields and API keys in database
- Use envelope encryption for key management
- Rotate encryption keys annually
- Secure key storage: HSM or managed vault
- Do not log sensitive data
- Sanitize all user inputs to prevent XSS and SQL injection
- Use parameterized queries (ORM with safe defaults)
- Validate file uploads: check MIME type, file size, content scan
- Store uploads in separate object storage (not web root)
- Implement access logs for all data access (audit trail)
- Define data retention period, auto-delete after expiry
- Encrypt backups, test for restore

## API Security

- Require authentication for all write endpoints
- Implement rate limiting per user/IP
- Implement CORS correctly: whitelist specific origins
- Implement CSRF protection if using cookies
- Validate content-type on POST/PUT
- Implement request signing for webhooks (HMAC-SHA256)
- API versioning: maintain 2 major versions minimum
- Sunset older versions with 3-6 month notice
- Implement idempotency keys for POST endpoints
- Do not expose internal error details in production
- Implement request timeouts (30 sec default)
- Monitor unusual API patterns

## Infrastructure and Deployment

- Run on HTTPS only; redirect HTTP to HTTPS
- Use strong TLS certificate
- Implement security headers: CSP, X-Frame-Options, X-Content-Type-Options, HSTS
- Disable unnecessary HTTP methods (OPTIONS, TRACE)
- Keep all dependencies up to date
- Use vulnerability scanning
- Secrets management: never commit to version control
- Use environment variables for secrets
- Implement secrets rotation (quarterly)
- Network segmentation: database not public
- Database connections from app server only
- Enable firewall rules: restrict ports
- Keep OS and server software patched
- Disable unnecessary services/ports
- Run application with minimal privileges
- Use container isolation if applicable
- Implement DDoS protection

## Logging and Monitoring

- Log all security-relevant events
- Include timestamp, user_id, action, resource, result, IP
- Centralize logs: ELK, Splunk, CloudWatch
- Set up alerts for suspicious patterns
- Retain logs for 1 year minimum
- Do not log sensitive data
- Monitor uptime and performance
- Monitor database connections
- Monitor file system for unauthorized changes
- Monitor outbound network connections
- Implement intrusion detection system (IDS)

## Incident Response

- Write incident response plan
- Define severity levels
- Establish incident response team (on-call)
- Notification: alert team on critical events
- Investigation: preserve logs and evidence
- Containment: disable compromised accounts, revoke tokens
- Communication: notify affected users
- Remediation: fix root cause, deploy patch
- Post-mortem: document root cause and action items
- Regulatory notification: GDPR/CCPA user notification if PII breached

## Regulatory Compliance

**GDPR (Europe):**
- Obtain explicit consent before data processing
- Privacy policy describes data collection and use
- Implement data portability
- Implement right to be forgotten
- Implement right to correction
- Data processing agreements with vendors
- Conduct data protection impact assessment (DPIA)
- Breach notification: 72 hours

**CCPA (California):**
- Privacy policy discloses data collection
- Opt-out mechanism for data sale
- Respond to user requests within 45 days
- Do not discriminate against users

**SOC 2 Type II:**
- Document security controls
- Implement access controls, logging, encryption
- Annual audit (Type II = 6 months testing)

**PCI DSS (credit cards):**
- Never store full credit card numbers
- Use PCI-compliant processor (Stripe, PayPal)
- Do not log card data

## Third-Party and Vendor Management

- Vet vendors: security questionnaire, privacy policy, SLA
- Sign Data Processing Agreement with vendors
- Audit third-party access
- Require breach notification within 24 hours
- Maintain vendor risk register
- Review vendor security annually

## Testing and Assessment

- Conduct security code review
- Run static analysis tool
- Run dependency vulnerability scanner
- Penetration test: annual or before major release
- Red-team exercise
- Security testing in CI/CD
- Test authentication and authorization
- Test input validation
- Test encryption and key management
- Test backup and disaster recovery

## Documentation and Training

- Maintain security policy document
- Maintain data inventory
- Maintain threat model
- Train developers on secure coding (OWASP Top 10)
- Train team on password hygiene and phishing
- Document security decisions
- Maintain incident response runbook

## Ongoing Maintenance

- Subscribe to security advisories
- Review controls quarterly
- Annual security audit
- Update threat model annually
- Renew security certifications
- Participate in bug bounty program
- Update security contacts

---

*Open source — use it wisely.*
