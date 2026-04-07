use anyhow::{Context, Result};

#[derive(Clone, Debug)]
pub struct Config {
    pub port: u16,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_user: String,
    pub smtp_password: String,
    pub smtp_from_name: String,
    pub smtp_from_email: String,
    /// Always BCC'd — owner always gets a copy of every dispatch
    pub owner_email: String,
    /// Base URL of the GMIIE Next.js app (for subscriber fetches)
    pub gmiie_api_url: String,
    pub gmiie_api_key: String,
    pub platform_name: String,
    pub platform_url: String,
    /// Minimum score threshold to dispatch alert emails (default: 7.0)
    pub alert_score_threshold: f64,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            port: std::env::var("MAILER_PORT")
                .unwrap_or_else(|_| "9100".to_string())
                .parse()
                .context("MAILER_PORT must be a u16")?,
            smtp_host: std::env::var("SMTP_HOST")
                .context("SMTP_HOST is required")?,
            smtp_port: std::env::var("SMTP_PORT")
                .unwrap_or_else(|_| "587".to_string())
                .parse()
                .context("SMTP_PORT must be a u16")?,
            smtp_user: std::env::var("SMTP_USER")
                .context("SMTP_USER is required")?,
            smtp_password: std::env::var("SMTP_PASSWORD")
                .context("SMTP_PASSWORD is required")?,
            smtp_from_name: std::env::var("SMTP_FROM_NAME")
                .unwrap_or_else(|_| "GMIIE Intelligence".to_string()),
            smtp_from_email: std::env::var("SMTP_FROM_EMAIL")
                .context("SMTP_FROM_EMAIL is required")?,
            owner_email: std::env::var("OWNER_EMAIL")
                .context("OWNER_EMAIL is required — owner always receives a copy")?,
            gmiie_api_url: std::env::var("GMIIE_API_URL")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
            gmiie_api_key: std::env::var("GMIIE_API_KEY")
                .unwrap_or_default(),
            platform_name: std::env::var("PLATFORM_NAME")
                .unwrap_or_else(|_| "GMIIE".to_string()),
            platform_url: std::env::var("PLATFORM_URL")
                .unwrap_or_else(|_| "https://gmiie.xxxiii.io".to_string()),
            alert_score_threshold: std::env::var("ALERT_SCORE_THRESHOLD")
                .unwrap_or_else(|_| "7.0".to_string())
                .parse()
                .unwrap_or(7.0),
        })
    }
}
