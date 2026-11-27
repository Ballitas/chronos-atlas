const BASE_URL = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3055';

function assert(cond, msg) {
  if (!cond) {
    throw new Error(`ASSERTION FAILED: ${msg}`);
  }
}

async function req(path, { method = 'GET', token, body, headers = {} } = {}) {
  const h = { ...headers };
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (body !== undefined) h['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  return { status: res.status, data, contentType: ct };
}

async function run() {
  console.log(`\n=== Chronos Atlas Full Rubric Verification (${BASE_URL}) ===\n`);

  // 0. Health & 20 Topics Catalog
  const health = await req('/api/health');
  assert(health.status === 200 && health.data.status === 'ok', 'Health check failed');
  assert(health.data.topicsCount >= 20, `Expected >=20 topics, got ${health.data.topicsCount}`);
  console.log(`[PASS] RF-01 Health & Database Auto-Seed: ${health.data.topicsCount} topics ready (${health.data.database})`);

  const catalog = await req('/api/topics');
  assert(catalog.status === 200 && catalog.data.topics.length >= 20, 'Catalog must contain 20 topics');
  const uniqueThemes = new Set(catalog.data.topics.map((t) => t.themeKey));
  assert(uniqueThemes.size >= 20, `Expected 20 unique data-theme keys, got ${uniqueThemes.size}`);
  const mali = catalog.data.topics.find((t) => t.slug === 'mali-empire');
  assert(mali && mali.mediaCount >= 2, 'Mali Empire topic & protected media missing');
  console.log(`[PASS] RF-01 Dynamic Theming Catalog: ${uniqueThemes.size} unique themes verified`);

  // 1. A4 Unauthenticated Protections (Discussions, Media, Bookmarks, Sessions)
  const maliDetail = await req('/api/topics/mali-empire');
  assert(maliDetail.status === 200, 'Public topic overview should be accessible');
  const firstMediaId = maliDetail.data.topic.protectedMedia[0].id;

  const unauthDisc = await req('/api/topics/mali-empire/discussions');
  assert(unauthDisc.status === 401, `Guest GET discussions must return 401, got ${unauthDisc.status}`);
  const unauthMedia = await req(`/api/media/${firstMediaId}`);
  assert(unauthMedia.status === 401, `Guest GET protected media must return 401, got ${unauthMedia.status}`);
  const tamperedMedia = await req(`/api/media/${firstMediaId}`, { token: 'eyJhbGciOiJIUzI1NiJ9.tampered.sig' });
  assert(tamperedMedia.status === 401, `Tampered JWT must return 401, got ${tamperedMedia.status}`);
  console.log('[PASS] A4 Protected Routes & Media: Guest & tampered JWT strictly blocked (401)');

  // 2. A1 Registration + JWT + Bookmarks + Discussions
  const suffix = Date.now().toString(36);
  const testEmail = `student_${suffix}@chronos.test`;
  const testUsername = `student_${suffix}`;
  const initialPw = 'StrongPass@2026!';

  const reg = await req('/api/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Test Researcher',
      username: testUsername,
      email: testEmail,
      password: initialPw,
      deviceLabel: 'Device-1',
    },
    headers: { 'x-device-id': `fp1_${suffix}` },
  });
  assert(reg.status === 201 && reg.data.token && reg.data.user.role === 'STANDARD_USER', 'Registration failed');
  const token1 = reg.data.token;
  const session1Id = reg.data.sessionId;
  console.log('[PASS] A1 Registration & JWT Generation: Standard user registered & signed JWT issued');

  // Protected media unlocked with valid Bearer JWT
  const authMedia = await req(`/api/media/${firstMediaId}`, { token: token1 });
  assert(authMedia.status === 200 && authMedia.contentType.includes('image/svg+xml'), 'Authenticated media failed');
  console.log('[PASS] A4 Protected Media Stream: Authenticated Bearer JWT unlocked archival SVG plate');

  // Favorites & Bookmarks persistence
  const favPost = await req('/api/bookmarks', {
    method: 'POST',
    token: token1,
    body: { topicId: mali.id, kind: 'favorite' },
  });
  assert(favPost.status === 201, 'Save favorite failed');
  const bmkPost = await req('/api/bookmarks', {
    method: 'POST',
    token: token1,
    body: { topicId: mali.id, kind: 'bookmark', note: 'Timbuktu citation check' },
  });
  assert(bmkPost.status === 201, 'Save bookmark failed');
  const bmkList = await req('/api/bookmarks', { token: token1 });
  assert(bmkList.status === 200 && bmkList.data.items.length === 2, 'Bookmarks list persistence failed');
  const bmkDel = await req(`/api/bookmarks/${favPost.data.id}`, { method: 'DELETE', token: token1 });
  assert(bmkDel.status === 200, 'Delete favorite failed');
  console.log('[PASS] A1 Favorites & Bookmarks: Save, retrieve, and remove persisted per userId');

  // Discussions & Comments
  const discPost = await req('/api/topics/mali-empire/discussions', {
    method: 'POST',
    token: token1,
    body: { title: 'Test Verification Thread', body: 'Evaluating Timbuktu archival preservation.' },
  });
  assert(discPost.status === 201, 'Create discussion thread failed');
  const cmtPost = await req(`/api/discussions/${discPost.data.discussion.id}/comments`, {
    method: 'POST',
    token: token1,
    body: { body: 'Adding scholarly comment verification.' },
  });
  assert(cmtPost.status === 201, 'Post comment failed');
  console.log('[PASS] A1 Comments & Discussions: Thread creation & replies verified');

  // 3. A2 Concurrent 2-Device Limit + Over-Limit Rejection + Independent Termination
  const login2 = await req('/api/auth/login', {
    method: 'POST',
    body: { identifier: testEmail, password: initialPw, deviceLabel: 'Device-2' },
    headers: { 'x-device-id': `fp2_${suffix}` },
  });
  assert(login2.status === 200 && login2.data.token, '2nd device login should succeed');
  const token2 = login2.data.token;

  const login3 = await req('/api/auth/login', {
    method: 'POST',
    body: { identifier: testEmail, password: initialPw, deviceLabel: 'Device-3' },
    headers: { 'x-device-id': `fp3_${suffix}` },
  });
  assert(login3.status === 409 && login3.data.code === 'MAX_SESSIONS_REACHED', `3rd device login must be blocked (409), got ${login3.status}`);

  // Terminate Device 1 independently from Device 2
  const term1 = await req(`/api/sessions/${session1Id}`, { method: 'DELETE', token: token2 });
  assert(term1.status === 200, 'Independent session termination failed');
  const deadToken1Check = await req('/api/auth/me', { token: token1 });
  assert(deadToken1Check.status === 401, 'Terminated session token must immediately fail with 401');

  // Now Device 3 can sign in cleanly!
  const login3Retry = await req('/api/auth/login', {
    method: 'POST',
    body: { identifier: testEmail, password: initialPw, deviceLabel: 'Device-3' },
    headers: { 'x-device-id': `fp3_${suffix}` },
  });
  assert(login3Retry.status === 200 && login3Retry.data.token, 'Device 3 login after freeing slot failed');
  const token3 = login3Retry.data.token;
  console.log('[PASS] A2 Concurrent 2-Device Limit: 2 allowed, 3rd rejected (409), remote revocation & re-login verified');

  // 4. A3 Authenticated Password Update + Recovery Protocol + Single-Use Token
  const wrongCurPw = await req('/api/auth/change-password', {
    method: 'POST',
    token: token3,
    body: { currentPassword: 'WrongPassword1!', newPassword: 'NewStrong@2026!', confirmPassword: 'NewStrong@2026!' },
  });
  assert(wrongCurPw.status === 400, 'Wrong current password must be rejected');

  const updatedPw = 'UpdatedStrong@2026!';
  const goodPwUpdate = await req('/api/auth/change-password', {
    method: 'POST',
    token: token3,
    body: { currentPassword: initialPw, newPassword: updatedPw, confirmPassword: updatedPw },
  });
  assert(goodPwUpdate.status === 200, 'Authenticated password update failed');

  // Neutral feedback check (anti-enumeration)
  const forgotReal = await req('/api/auth/forgot-password', {
    method: 'POST',
    body: { identifier: testEmail },
  });
  const forgotGhost = await req('/api/auth/forgot-password', {
    method: 'POST',
    body: { identifier: 'nonexistent_ghost_user_999@nowhere.test' },
  });
  assert(
    forgotReal.status === 200 &&
      forgotGhost.status === 200 &&
      forgotReal.data.message === forgotGhost.data.message,
    'Forgot-password must return identical neutral feedback'
  );

  // Grab single-use token from built-in mail sandbox
  const inbox = await req('/api/mail-sandbox');
  const emailRecord = inbox.data.emails.find((e) => e.toEmail === testEmail);
  assert(emailRecord && emailRecord.resetUrl, 'Recovery email not captured in sandbox');
  const resetToken = new URL(emailRecord.resetUrl).searchParams.get('token');
  assert(resetToken && resetToken.length >= 32, 'Reset token must be cryptographically strong');

  const recoveredPw = 'RecoveredFinal@2026!';
  const resetExec = await req('/api/auth/reset-password', {
    method: 'POST',
    body: { token: resetToken, newPassword: recoveredPw, confirmPassword: recoveredPw },
  });
  assert(resetExec.status === 200, 'Password reset execution failed');

  // Reusing same token MUST fail
  const reuseAttempt = await req('/api/auth/reset-password', {
    method: 'POST',
    body: { token: resetToken, newPassword: 'AnotherPass@2026!', confirmPassword: 'AnotherPass@2026!' },
  });
  assert(reuseAttempt.status === 400, 'Single-use token must be invalidated immediately after use');

  // Login with recovered password must work reliably
  const loginRecovered = await req('/api/auth/login', {
    method: 'POST',
    body: { identifier: testEmail, password: recoveredPw, deviceLabel: 'Post-Recovery Device' },
  });
  assert(loginRecovered.status === 200 && loginRecovered.data.token, 'Login with reset password failed');
  const stdToken = loginRecovered.data.token;
  console.log('[PASS] A3 Password Update & Recovery: Current-pw check, neutral feedback, single-use token invalidation & re-login verified');

  // 5. A5 RBAC Enforcement (Server-Side 403 Forbidden!)
  const stdCreateTopic = await req('/api/topics', {
    method: 'POST',
    token: stdToken,
    body: { title: 'Unauthorized Topic', subtitle: 'Should fail', region: 'Test', era: 'Now', summary: 'Long enough summary text here for schema check', fullContent: 'Long enough full content text here for schema validation to pass.' },
  });
  assert(stdCreateTopic.status === 403, `STANDARD_USER POST /api/topics must return 403, got ${stdCreateTopic.status}`);

  const stdAdmin = await req('/api/admin/users', { token: stdToken });
  assert(stdAdmin.status === 403, `STANDARD_USER GET /api/admin/users must return 403, got ${stdAdmin.status}`);

  // Investigator login
  const invLogin = await req('/api/auth/login', {
    method: 'POST',
    body: { identifier: 'investigator@chronosatlas.edu', password: 'Investigator@2026!', deviceLabel: 'Verifier-Inv' },
  });
  assert(invLogin.status === 200, 'Investigator login failed');
  const invToken = invLogin.data.token;

  const invAdmin = await req('/api/admin/users', { token: invToken });
  assert(invAdmin.status === 403, `INVESTIGATOR GET /api/admin/users must return 403, got ${invAdmin.status}`);

  const invEdit = await req('/api/topics/mali-empire', {
    method: 'PUT',
    token: invToken,
    body: { era: 'c. 1235 – 1670 CE' },
  });
  assert(invEdit.status === 200, `INVESTIGATOR PUT /api/topics/mali-empire should succeed, got ${invEdit.status}`);
  await req('/api/auth/logout', { method: 'POST', token: invToken });

  // Admin login
  const admLogin = await req('/api/auth/login', {
    method: 'POST',
    body: { identifier: 'admin@chronosatlas.edu', password: 'Admin@2026!', deviceLabel: 'Verifier-Admin' },
  });
  assert(admLogin.status === 200, 'Admin login failed');
  const admToken = admLogin.data.token;

  const admUsers = await req('/api/admin/users', { token: admToken });
  assert(admUsers.status === 200 && admUsers.data.users.length >= 4, 'Admin GET users failed');

  const sentryTest = await req('/api/sentry-test', { method: 'POST', token: admToken });
  assert(sentryTest.status === 200, 'Admin Sentry diagnostics endpoint failed');

  // Clean up test user sessions & logout admin
  await req('/api/auth/logout', { method: 'POST', token: stdToken });
  await req('/api/auth/logout', { method: 'POST', token: admToken });

  console.log('[PASS] A5 RBAC Enforcement & Sentry: 403 Forbidden enforced server-side for Standard/Investigator; Admin & Sentry verified');
  console.log('\nALL RUBRIC CHECKS (RF-01, A1, A2, A3, A4, A5, SENTRY) PASSED 100%!\n');
}

run().catch((err) => {
  console.error('\nVERIFICATION FAILED:', err.message);
  process.exit(1);
});
