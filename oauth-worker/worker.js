/**
 * Decap CMS GitHub OAuth 代理
 * ========================================
 * 部署到 Cloudflare Workers：
 * 1. 注册 Cloudflare 账号（免费）
 * 2. 进入 Workers & Pages → 创建 Worker
 * 3. 复制此文件内容粘贴到在线编辑器
 * 4. 在 Settings → Variables 中添加：
 *    - GITHUB_CLIENT_ID     = 你的 GitHub OAuth App Client ID
 *    - GITHUB_CLIENT_SECRET = 你的 GitHub OAuth App Client Secret
 * 5. 保存并部署
 * 6. 将 Worker 的 URL 填入 Decap CMS 的 config.yml 中 proxy_url
 * ========================================
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const clientId = env.GITHUB_CLIENT_ID;
    const clientSecret = env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return new Response('GitHub OAuth credentials not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Worker settings.', {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        }
      });
    }

    // 如果有 code 参数，说明是 GitHub 回调
    if (url.searchParams.has('code')) {
      const code = url.searchParams.get('code');

      try {
        // 用 code 换取 access_token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
          }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          return new Response(`OAuth Error: ${tokenData.error_description || tokenData.error}`, {
            status: 400,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        }

        // 通过 postMessage 将 token 发送给 Decap CMS
        const accessToken = tokenData.access_token;
        const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Authenticating...</title></head>
<body>
<p>Authentication successful. You can close this window.</p>
<script>
(function() {
  var token = ${JSON.stringify(accessToken)};
  var provider = 'github';
  var message = 'authorization:' + provider + ':success:{"token":"' + token + '","provider":"' + provider + '"}';

  function send() {
    try {
      window.opener.postMessage(message, '*');
    } catch(e) {}
  }

  send();
  setTimeout(send, 500);
  setTimeout(function() {
    send();
    window.close();
  }, 1000);
})();
</script>
</body>
</html>`;

        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });

      } catch (err) {
        return new Response('Internal error: ' + err.message, {
          status: 500,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    }

    // 没有 code 参数，重定向到 GitHub OAuth 授权页面
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: url.origin + url.pathname,
      scope: 'repo,user',
    });

    return Response.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
      302
    );
  }
};
