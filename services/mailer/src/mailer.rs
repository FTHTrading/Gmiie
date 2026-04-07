use anyhow::{Context, Result};
use lettre::{
    message::{header::ContentType, Mailbox, MultiPart, SinglePart},
    transport::smtp::authentication::Credentials,
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
};
use minijinja::context;
use tracing::{error, info, warn};
use uuid::Uuid;

use crate::config::Config;
use crate::models::{AlertSeverity, DigestArticle, DispatchRequest, Subscriber};
use crate::templates::Templates;

pub struct MailerService {
    config: Config,
    transport: AsyncSmtpTransport<Tokio1Executor>,
}

impl MailerService {
    pub fn new(config: Config) -> Result<Self> {
        let creds = Credentials::new(config.smtp_user.clone(), config.smtp_password.clone());

        let transport = AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&config.smtp_host)
            .context("Failed to create SMTP transport")?
            .port(config.smtp_port)
            .credentials(creds)
            .build();

        Ok(Self { config, transport })
    }

    /// Send an intelligence alert to subscribers + always send owner copy.
    pub async fn send_alert(
        &self,
        req: &DispatchRequest,
        subscribers: &[Subscriber],
        templates: &Templates,
        dispatch_id: Uuid,
    ) -> (usize, usize, Vec<String>) {
        let mut succeeded = 0usize;
        let mut errors: Vec<String> = Vec::new();

        let score_str = format!("{:.1}", req.score);
        let pub_str = req
            .published_at
            .map(|dt| dt.format("%d %b %Y %H:%M UTC").to_string())
            .unwrap_or_default();

        let base_ctx = context! {
            platform_name => &self.config.platform_name,
            platform_url  => &self.config.platform_url,
            title         => &req.title,
            headline      => req.headline.as_deref().unwrap_or(""),
            summary       => &req.summary,
            article_url   => &req.url,
            severity_label => req.severity.label(),
            severity_color => req.severity.color(),
            score         => &score_str,
            source        => req.source.as_deref().unwrap_or(""),
            published_at  => &pub_str,
            topics        => req.topics.clone().unwrap_or_default(),
            dispatch_id   => dispatch_id.to_string(),
            is_owner_copy => false,
        };

        for sub in subscribers {
            let html = match templates.render_alert(base_ctx.clone()) {
                Ok(h) => h,
                Err(e) => {
                    errors.push(format!("template render failed for {}: {e}", sub.email));
                    continue;
                }
            };

            let subject = format!(
                "[{}] {} — {}",
                req.severity.label(),
                self.config.platform_name,
                truncate(&req.title, 60)
            );

            match self.send_one(&sub.email, sub.name.as_deref(), &subject, &html).await {
                Ok(_) => {
                    succeeded += 1;
                    info!(to = %sub.email, "alert dispatched");
                }
                Err(e) => {
                    let msg = format!("send to {} failed: {e}", sub.email);
                    errors.push(msg.clone());
                    error!("{}", msg);
                }
            }
        }

        // Owner copy — always sent regardless of subscriber count
        let owner_ctx = context! {
            platform_name  => &self.config.platform_name,
            platform_url   => &self.config.platform_url,
            title          => &req.title,
            headline       => req.headline.as_deref().unwrap_or(""),
            summary        => &req.summary,
            article_url    => &req.url,
            severity_label => req.severity.label(),
            severity_color => req.severity.color(),
            score          => &score_str,
            source         => req.source.as_deref().unwrap_or(""),
            published_at   => &pub_str,
            topics         => req.topics.clone().unwrap_or_default(),
            dispatch_id    => dispatch_id.to_string(),
            is_owner_copy  => true,
        };

        if let Ok(owner_html) = templates.render_alert(owner_ctx) {
            let subject = format!(
                "[OWNER REPORT] {} — dispatched to {} recipients — {}",
                req.severity.label(),
                succeeded,
                truncate(&req.title, 50)
            );
            match self
                .send_one(&self.config.owner_email, Some("Kevan"), &subject, &owner_html)
                .await
            {
                Ok(_) => info!(owner = %self.config.owner_email, "owner copy sent"),
                Err(e) => {
                    warn!(owner = %self.config.owner_email, err = %e, "owner copy failed");
                    errors.push(format!("owner copy failed: {e}"));
                }
            }
        }

        (succeeded, errors.len(), errors)
    }

    /// Send a digest email (daily/weekly) to subscribers + owner copy.
    pub async fn send_digest(
        &self,
        cadence_label: &str,
        subscribers: &[Subscriber],
        articles: &[DigestArticle],
        period_label: &str,
        templates: &Templates,
        dispatch_id: Uuid,
    ) -> (usize, usize, Vec<String>) {
        let mut succeeded = 0usize;
        let mut errors: Vec<String> = Vec::new();

        let article_data: Vec<_> = articles
            .iter()
            .map(|a| context! {
                title        => &a.title,
                summary      => &a.summary,
                url          => &a.url,
                score        => a.score.map(|s| format!("{s:.1}")),
                source       => a.source.clone().unwrap_or_default(),
                published_at => a.published_at
                    .map(|dt| dt.format("%d %b %Y").to_string())
                    .unwrap_or_default(),
            })
            .collect();

        let base_ctx = context! {
            platform_name  => &self.config.platform_name,
            platform_url   => &self.config.platform_url,
            cadence        => cadence_label,
            article_count  => articles.len(),
            articles       => &article_data,
            period_label   => period_label,
            dispatch_id    => dispatch_id.to_string(),
            is_owner_copy  => false,
        };

        for sub in subscribers {
            let html = match templates.render_digest(base_ctx.clone()) {
                Ok(h) => h,
                Err(e) => {
                    errors.push(format!("digest render failed: {e}"));
                    continue;
                }
            };
            let subject = format!(
                "{} {} Digest — {} signals",
                self.config.platform_name,
                cadence_label,
                articles.len()
            );
            match self.send_one(&sub.email, sub.name.as_deref(), &subject, &html).await {
                Ok(_) => succeeded += 1,
                Err(e) => errors.push(format!("digest to {} failed: {e}", sub.email)),
            }
        }

        // Owner summary
        let owner_ctx = context! {
            platform_name  => &self.config.platform_name,
            platform_url   => &self.config.platform_url,
            cadence        => cadence_label,
            article_count  => articles.len(),
            articles       => &article_data,
            period_label   => period_label,
            dispatch_id    => dispatch_id.to_string(),
            is_owner_copy  => true,
        };
        if let Ok(owner_html) = templates.render_digest(owner_ctx) {
            let _ = self
                .send_one(
                    &self.config.owner_email,
                    Some("Kevan"),
                    &format!(
                        "[OWNER REPORT] {} digest sent to {} — {}",
                        cadence_label, succeeded, period_label
                    ),
                    &owner_html,
                )
                .await;
        }

        (succeeded, errors.len(), errors)
    }

    /// Send a connection test email.
    pub async fn send_test(&self, to: &str, templates: &Templates) -> Result<()> {
        let html = templates.render_test(context! {
            platform_name  => &self.config.platform_name,
            dispatched_at  => chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC").to_string(),
            is_owner_copy  => false,
        })?;
        let subject = format!("{} Mailer — Connection Test", self.config.platform_name);
        self.send_one(to, None, &subject, &html).await
    }

    async fn send_one(
        &self,
        to_email: &str,
        to_name: Option<&str>,
        subject: &str,
        html: &str,
    ) -> Result<()> {
        let from: Mailbox = format!("{} <{}>", self.config.smtp_from_name, self.config.smtp_from_email)
            .parse()
            .context("Invalid SMTP from address")?;

        let to: Mailbox = match to_name.filter(|n| !n.is_empty()) {
            Some(name) => format!("{} <{}>", name, to_email)
                .parse()
                .context("Invalid to address")?,
            None => to_email.parse().context("Invalid to address")?,
        };

        let email = Message::builder()
            .from(from)
            .to(to)
            .subject(subject)
            .multipart(
                MultiPart::alternative().singlepart(
                    SinglePart::builder()
                        .header(ContentType::TEXT_HTML)
                        .body(html.to_string()),
                ),
            )
            .context("Failed to build email message")?;

        self.transport.send(email).await.context("SMTP send failed")?;
        Ok(())
    }
}

fn truncate(s: &str, max: usize) -> &str {
    match s.char_indices().nth(max) {
        Some((i, _)) => &s[..i],
        None => s,
    }
}
