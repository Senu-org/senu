# Troubleshooting Guide

This guide helps you resolve common issues when working with the Senu application.

## Common Issues

### WhatsApp Integration Issues

#### Webhook Not Receiving Messages

**Symptoms:**
- WhatsApp messages sent to bot don't trigger responses
- No logs showing webhook calls
- Bot appears unresponsive

**Solutions:**

1. **Check ngrok tunnel (Development)**:
   ```bash
   # Check if ngrok is running
   ngrok status
   
   # If not running, start it
   ngrok http 3000
   ```

2. **Verify webhook URL in Twilio Console**:
   - Go to Twilio Console → Messaging → WhatsApp Sandbox Settings
   - Ensure webhook URL matches your ngrok URL or production domain
   - Format: `https://your-domain.com/api/bot/webhook`

3. **Check server is running**:
   ```bash
   # Make sure development server is running
   npm run dev
   ```

4. **Verify SSL certificate (Production)**:
   - Webhook URL must use HTTPS
   - SSL certificate must be valid
   - Test with: `curl -I https://your-domain.com/api/bot/webhook`

5. **Check server logs**:
   ```bash
   # Look for webhook processing logs
   tail -f logs/app.log
   ```

#### Authentication Errors

**Symptoms:**
- "Authentication failed" errors in logs
- Twilio webhook signature validation failures

**Solutions:**

1. **Verify Twilio credentials**:
   ```bash
   # Check environment variables
   echo $TWILIO_ACCOUNT_SID
   echo $TWILIO_AUTH_TOKEN
   ```

2. **Check for extra spaces in credentials**:
   - Remove any leading/trailing spaces from `.env.local`
   - Regenerate credentials if necessary

3. **Validate webhook signature**:
   ```typescript
   // Check if signature validation is working
   console.log('Twilio signature validation:', isValidSignature);
   ```

#### Message Sending Failures

**Symptoms:**
- Bot receives messages but can't send responses
- "Failed to send message" errors

**Solutions:**

1. **Check recipient number format**:
   - Use international format: `+1234567890`
   - Remove any spaces or special characters

2. **Verify sandbox participation (Development)**:
   - Ensure recipient has joined WhatsApp sandbox
   - Send join code to sandbox number

3. **Check message content compliance**:
   - Avoid spam-like content
   - Keep messages under WhatsApp limits
   - Don't send too many messages rapidly

4. **Review Twilio account status**:
   - Check account balance
   - Verify account is in good standing
   - Review any service restrictions

### Database Issues

#### Connection Failures

**Symptoms:**
- "Database connection failed" errors
- Timeouts when accessing data
- Supabase authentication errors

**Solutions:**

1. **Verify Supabase credentials**:
   ```bash
   # Check environment variables
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Check network connectivity**:
   ```bash
   # Test connection to Supabase
   curl -I $NEXT_PUBLIC_SUPABASE_URL
   ```

3. **Review RLS policies**:
   - Ensure Row Level Security policies allow required operations
   - Check user permissions in Supabase dashboard

4. **Check database status**:
   - Visit Supabase dashboard
   - Review database health metrics
   - Check for any ongoing maintenance

#### Migration Issues

**Symptoms:**
- "Table does not exist" errors
- Schema mismatch errors
- Migration failures

**Solutions:**

1. **Run migrations**:
   ```bash
   # Reset database and run all migrations
   npx supabase db reset
   
   # Or push specific migrations
   npx supabase db push
   ```

2. **Check migration files**:
   ```bash
   # List migration files
   ls -la supabase/migrations/
   ```

3. **Verify schema**:
   ```sql
   -- Check if tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### Blockchain Issues

#### Transaction Failures

**Symptoms:**
- "Blockchain transaction failed" errors
- Transactions stuck in pending state
- Gas estimation failures

**Solutions:**

1. **Check Monad network status**:
   - Verify RPC endpoint is accessible
   - Check network congestion
   - Review gas price settings

2. **Verify Para SDK configuration**:
   ```typescript
   // Check Para instance initialization
   const paraManager = ParaInstanceManager.getInstance();
   console.log('Para server status:', paraManager.getParaServer());
   ```

3. **Review wallet balance**:
   - Ensure sufficient funds for gas
   - Check wallet address is correct
   - Verify private key access

4. **Check transaction parameters**:
   ```typescript
   // Log transaction details
   console.log('Transaction params:', {
     to: recipient,
     amount: amount,
     gasLimit: gasLimit,
     gasPrice: gasPrice
   });
   ```

#### Wallet Creation Issues

**Symptoms:**
- "Failed to create wallet" errors
- Para SDK initialization failures
- Private key management errors

**Solutions:**

1. **Verify Para SDK credentials**:
   ```bash
   echo $PARA_API_KEY
   echo $PARA_PROJECT_ID
   ```

2. **Check Para service status**:
   - Review Para SDK documentation
   - Test with minimal example
   - Check API rate limits

3. **Review wallet creation logs**:
   ```typescript
   // Add detailed logging
   console.log('Creating wallet for:', phone);
   console.log('Para server instance:', paraServer);
   ```

### PWA Issues

#### Service Worker Problems

**Symptoms:**
- PWA not working offline
- Push notifications not received
- Caching issues

**Solutions:**

1. **Check service worker registration**:
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations().then(registrations => {
     console.log('SW registrations:', registrations);
   });
   ```

2. **Clear service worker cache**:
   ```javascript
   // In browser console
   caches.keys().then(names => {
     names.forEach(name => caches.delete(name));
   });
   ```

3. **Verify manifest.json**:
   ```bash
   # Check manifest is accessible
   curl http://localhost:3000/manifest.json
   ```

4. **Check push notification permissions**:
   ```javascript
   // In browser console
   console.log('Notification permission:', Notification.permission);
   ```

#### Installation Issues

**Symptoms:**
- PWA install prompt not showing
- "Add to Home Screen" not available
- Installation fails

**Solutions:**

1. **Verify PWA requirements**:
   - HTTPS (or localhost for development)
   - Valid manifest.json
   - Service worker registered
   - Proper icons included

2. **Check manifest validation**:
   - Use Chrome DevTools → Application → Manifest
   - Verify all required fields are present
   - Check icon sizes and formats

3. **Test installation criteria**:
   ```javascript
   // Check if app is installable
   window.addEventListener('beforeinstallprompt', (e) => {
     console.log('App is installable');
   });
   ```

### Development Environment Issues

#### ngrok Tunnel Issues

**Symptoms:**
- ngrok tunnel not accessible
- "Tunnel not found" errors
- Webhook URL not working

**Solutions:**

1. **Restart ngrok**:
   ```bash
   # Kill existing ngrok processes
   pkill ngrok
   
   # Start new tunnel
   ngrok http 3000
   ```

2. **Check ngrok account**:
   - Verify account is active
   - Check tunnel limits
   - Review usage quotas

3. **Use alternative tunneling**:
   ```bash
   # Alternative: Use localtunnel
   npm install -g localtunnel
   lt --port 3000
   ```

#### Environment Variable Issues

**Symptoms:**
- "Environment variable not found" errors
- Configuration not loading
- Services not initializing

**Solutions:**

1. **Check .env.local file**:
   ```bash
   # Verify file exists and has correct variables
   cat web/.env.local
   ```

2. **Verify variable names**:
   - Check for typos in variable names
   - Ensure proper prefixes (NEXT_PUBLIC_ for client-side)
   - No spaces around = sign

3. **Restart development server**:
   ```bash
   # Environment changes require restart
   npm run dev
   ```

#### Port Conflicts

**Symptoms:**
- "Port already in use" errors
- Cannot start development server
- Multiple instances running

**Solutions:**

1. **Kill existing processes**:
   ```bash
   # Find process using port 3000
   lsof -ti:3000
   
   # Kill the process
   kill -9 $(lsof -ti:3000)
   ```

2. **Use different port**:
   ```bash
   # Start on different port
   npm run dev -- -p 3001
   ```

3. **Check for background processes**:
   ```bash
   # List all node processes
   ps aux | grep node
   ```

## Error Codes Reference

### API Error Codes

- **INVALID_PHONE**: Phone number format is invalid
- **USER_NOT_FOUND**: User does not exist in database
- **INSUFFICIENT_BALANCE**: Not enough funds for transaction
- **TRANSACTION_NOT_FOUND**: Transaction ID not found
- **UNAUTHORIZED**: Invalid or missing authentication token
- **RATE_LIMIT_EXCEEDED**: Too many requests from user
- **WEBHOOK_VALIDATION_FAILED**: Twilio webhook signature invalid
- **BLOCKCHAIN_ERROR**: Error interacting with blockchain
- **EXTERNAL_SERVICE_ERROR**: Error with external service

### WhatsApp Bot Error Codes

- **CONVERSATION_TIMEOUT**: Session expired (30 minutes)
- **INVALID_COMMAND**: Unrecognized bot command
- **REGISTRATION_INCOMPLETE**: User registration not finished
- **TRANSACTION_IN_PROGRESS**: Another transaction already active

### Blockchain Error Codes

- **INSUFFICIENT_GAS**: Not enough gas for transaction
- **NETWORK_ERROR**: Blockchain network unavailable
- **WALLET_NOT_FOUND**: Wallet address not found
- **PRIVATE_KEY_ERROR**: Private key access failed

## Debugging Tools

### Logging

Enable detailed logging for debugging:

```typescript
// Set log level in environment
DEBUG=senu:* npm run dev

// Or in code
console.log('[DEBUG]', 'Detailed information', { data });
console.warn('[WARN]', 'Warning message');
console.error('[ERROR]', 'Error occurred', error);
```

### Browser DevTools

1. **Network Tab**: Check API requests and responses
2. **Console Tab**: View JavaScript errors and logs
3. **Application Tab**: Inspect service worker, storage, manifest
4. **Sources Tab**: Debug JavaScript code with breakpoints

### API Testing

Use curl or Postman to test API endpoints:

```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/api/bot/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Body=test&From=whatsapp:+1234567890"

# Test authenticated endpoint
curl -X GET http://localhost:3000/api/wallets/+1234567890/balance \
  -H "Authorization: Bearer your-jwt-token"
```

### Database Debugging

```sql
-- Check user data
SELECT * FROM users WHERE phone = '+1234567890';

-- Check transaction status
SELECT id, status, created_at FROM transactions 
WHERE sender_phone = '+1234567890' 
ORDER BY created_at DESC;

-- Check wallet balances
SELECT user_phone, balance_usd FROM custodial_wallets;
```

## Performance Issues

### Slow API Responses

**Solutions:**

1. **Add database indexes**:
   ```sql
   CREATE INDEX idx_users_phone ON users(phone);
   CREATE INDEX idx_transactions_sender ON transactions(sender_phone);
   ```

2. **Optimize queries**:
   - Use SELECT with specific columns
   - Add WHERE clauses to limit results
   - Use pagination for large datasets

3. **Enable caching**:
   ```typescript
   // Cache frequently accessed data
   const cachedUser = await redis.get(`user:${phone}`);
   ```

### High Memory Usage

**Solutions:**

1. **Monitor memory usage**:
   ```bash
   # Check Node.js memory usage
   node --inspect app.js
   ```

2. **Optimize conversation storage**:
   - Implement automatic cleanup
   - Use Redis for session storage
   - Limit session data size

3. **Review service worker cache**:
   - Limit cached resources
   - Implement cache expiration
   - Clear old cache versions

## Getting Help

### Internal Resources

1. **Check project documentation** in `/docs/`
2. **Review API reference** in `/docs/api-reference.md`
3. **Consult development guide** in `/docs/development.md`

### External Resources

1. **Twilio Documentation**: [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
2. **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
3. **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
4. **Para SDK Documentation**: [https://docs.getpara.com/](https://docs.getpara.com/)

### Community Support

1. **GitHub Issues**: Report bugs and request features
2. **Discord/Slack**: Real-time team communication
3. **Stack Overflow**: Technical questions with `senu` tag

### Emergency Contacts

For critical production issues:
- **Technical Lead**: [contact information]
- **DevOps Team**: [contact information]
- **On-call Engineer**: [contact information]
