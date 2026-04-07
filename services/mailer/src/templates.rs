use anyhow::Result;
use minijinja::{Environment, Value};

pub struct Templates {
    env: Environment<'static>,
}

impl Templates {
    pub fn new() -> Result<Self> {
        let mut env = Environment::new();
        env.add_template_owned("alert", ALERT_HTML.to_string())?;
        env.add_template_owned("digest", DIGEST_HTML.to_string())?;
        env.add_template_owned("test", TEST_HTML.to_string())?;
        Ok(Self { env })
    }

    pub fn render_alert(&self, ctx: Value) -> Result<String> {
        Ok(self.env.get_template("alert")?.render(ctx)?)
    }

    pub fn render_digest(&self, ctx: Value) -> Result<String> {
        Ok(self.env.get_template("digest")?.render(ctx)?)
    }

    pub fn render_test(&self, ctx: Value) -> Result<String> {
        Ok(self.env.get_template("test")?.render(ctx)?)
    }
}

// ── Email HTML templates ──────────────────────────────────────

const ALERT_HTML: &str = r#"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{ severity_label }} — {{ title }}</title>
<style>
  body{margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,'Helvetica Neue',sans-serif;color:#e5e5e5}
  .wrap{max-width:620px;margin:0 auto;padding:32px 20px}
  .logo{font-family:monospace;color:#D4AF37;font-weight:700;font-size:14px;letter-spacing:.05em}
  .divider{color:#333;margin:0 8px}
  .badge{display:inline-block;padding:4px 12px;border-radius:4px;font-family:monospace;font-size:11px;letter-spacing:.08em;font-weight:700;background:{{ severity_color }}20;color:{{ severity_color }};border:1px solid {{ severity_color }}40;margin-bottom:20px}
  h1{font-size:22px;font-weight:700;color:#f5f5f5;line-height:1.35;margin:0 0 10px}
  .hl{font-size:15px;color:#a1a1a1;margin-bottom:24px;line-height:1.6}
  .box{background:#111;border:1px solid #1f1f1f;border-left:3px solid {{ severity_color }};border-radius:6px;padding:16px 18px;font-size:14px;line-height:1.7;color:#d4d4d4;margin-bottom:24px}
  .meta{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px}
  .pill{font-family:monospace;font-size:11px;padding:3px 8px;border-radius:3px;background:#1a1a1a;border:1px solid #2a2a2a;color:#888}
  .score{background:{{ severity_color }}15;border-color:{{ severity_color }}30;color:{{ severity_color }}}
  .topics{margin-bottom:24px}
  .tlabel{font-size:11px;font-family:monospace;color:#555;letter-spacing:.06em;margin-bottom:8px}
  .tag{display:inline-block;padding:2px 8px;margin:2px;border-radius:3px;background:#1a1a1a;border:1px solid #2a2a2a;font-size:12px;color:#a0a0a0}
  .cta{display:block;text-align:center;background:#D4AF37;color:#0a0a0a;font-weight:700;font-size:14px;padding:14px 24px;border-radius:6px;text-decoration:none;margin-bottom:28px}
  .foot{border-top:1px solid #1f1f1f;padding-top:16px;font-size:12px;color:#555;line-height:1.6}
  .owner{color:#D4AF37}
</style>
</head>
<body>
<div class="wrap">
  <div style="margin-bottom:28px">
    <span class="logo">{{ platform_name }}</span>
    <span class="divider">|</span>
    <span style="font-size:12px;color:#555;font-family:monospace">INTELLIGENCE ALERT</span>
  </div>

  <div class="badge">{{ severity_label }}</div>
  <h1>{{ title }}</h1>
  {% if headline %}<p class="hl">{{ headline }}</p>{% endif %}

  <div class="box">{{ summary }}</div>

  <div class="meta">
    <span class="pill score">SCORE {{ score }}</span>
    {% if source %}<span class="pill">{{ source }}</span>{% endif %}
    {% if published_at %}<span class="pill">{{ published_at }}</span>{% endif %}
  </div>

  {% if topics %}
  <div class="topics">
    <div class="tlabel">TOPICS</div>
    {% for t in topics %}<span class="tag">{{ t }}</span>{% endfor %}
  </div>
  {% endif %}

  <a href="{{ article_url }}" class="cta">Read Full Analysis →</a>

  <div class="foot">
    <p>You are receiving this alert because you subscribed to <a href="{{ platform_url }}" style="color:#D4AF37">{{ platform_name }}</a>.</p>
    {% if is_owner_copy %}<p class="owner">⚙ Owner copy — dispatch ID: {{ dispatch_id }}</p>{% endif %}
  </div>
</div>
</body>
</html>"#;

const DIGEST_HTML: &str = r#"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{ platform_name }} {{ cadence }} Digest</title>
<style>
  body{margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,'Helvetica Neue',sans-serif;color:#e5e5e5}
  .wrap{max-width:620px;margin:0 auto;padding:32px 20px}
  .logo{font-family:monospace;color:#D4AF37;font-weight:700;font-size:14px;letter-spacing:.05em}
  .dlabel{font-family:monospace;font-size:11px;color:#555;letter-spacing:.08em}
  .dtitle{font-size:20px;font-weight:700;color:#f5f5f5;margin:12px 0 4px}
  .period{font-size:13px;color:#666;font-family:monospace;margin-bottom:28px}
  .item{background:#111;border:1px solid #1f1f1f;border-radius:6px;padding:16px 18px;margin-bottom:12px}
  .ititle{font-size:15px;font-weight:600;color:#f0f0f0;margin-bottom:6px}
  .ititle a{color:inherit;text-decoration:none}
  .isum{font-size:13px;color:#999;line-height:1.6;margin-bottom:10px}
  .imeta{font-family:monospace;font-size:11px;color:#555}
  .sbadge{display:inline-block;padding:1px 6px;border-radius:2px;background:#D4AF3720;border:1px solid #D4AF3740;color:#D4AF37;margin-right:6px}
  .cta-wrap{text-align:center;margin:28px 0}
  .cta{display:inline-block;background:#D4AF37;color:#0a0a0a;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none}
  .foot{border-top:1px solid #1f1f1f;padding-top:16px;font-size:12px;color:#555;line-height:1.6}
  .owner{color:#D4AF37}
</style>
</head>
<body>
<div class="wrap">
  <div style="margin-bottom:28px">
    <span class="logo">{{ platform_name }}</span>
    <span style="color:#333;margin:0 6px">|</span>
    <span class="dlabel">{{ cadence | upper }} DIGEST</span>
  </div>
  <div class="dtitle">{{ article_count }} Intelligence Signals</div>
  <div class="period">{{ period_label }}</div>

  {% for a in articles %}
  <div class="item">
    <div class="ititle"><a href="{{ a.url }}">{{ a.title }}</a></div>
    <div class="isum">{{ a.summary }}</div>
    <div class="imeta">
      {% if a.score %}<span class="sbadge">{{ a.score }}</span>{% endif %}
      {% if a.source %}{{ a.source }} · {% endif %}
      {% if a.published_at %}{{ a.published_at }}{% endif %}
    </div>
  </div>
  {% endfor %}

  <div class="cta-wrap">
    <a href="{{ platform_url }}" class="cta">View Full Intelligence Platform →</a>
  </div>

  <div class="foot">
    <p>You are receiving this {{ cadence }} digest from <a href="{{ platform_url }}" style="color:#D4AF37">{{ platform_name }}</a>.</p>
    {% if is_owner_copy %}<p class="owner">⚙ Owner digest copy — dispatch ID: {{ dispatch_id }}</p>{% endif %}
  </div>
</div>
</body>
</html>"#;

const TEST_HTML: &str = r#"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{{ platform_name }} Mailer — Test</title>
<style>
  body{background:#0a0a0a;color:#e5e5e5;font-family:-apple-system,sans-serif;padding:40px}
  .box{max-width:500px;margin:0 auto;background:#111;border:1px solid #1f1f1f;border-radius:8px;padding:28px}
  .logo{font-family:monospace;color:#D4AF37;font-weight:700;font-size:16px}
  h2{color:#f5f5f5;margin-top:16px}
  .ok{color:#22c55e;font-family:monospace;font-weight:700}
  .sub{color:#888;font-size:14px}
  .owner{color:#D4AF37;font-family:monospace;font-size:12px}
</style>
</head>
<body>
<div class="box">
  <div class="logo">{{ platform_name }} MAILER</div>
  <h2>Connection Test ✓</h2>
  <p class="ok">SMTP connection verified.</p>
  <p class="sub">Mailer service is running and ready to dispatch. Sent at {{ dispatched_at }}.</p>
  {% if is_owner_copy %}<p class="owner">⚙ Owner copy</p>{% endif %}
</div>
</body>
</html>"#;
