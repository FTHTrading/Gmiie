use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ── Inbound requests ─────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct DispatchRequest {
    pub article_id: String,
    pub title: String,
    pub headline: Option<String>,
    pub summary: String,
    pub url: String,
    pub score: f64,
    pub severity: AlertSeverity,
    pub topics: Option<Vec<String>>,
    pub entities: Option<Vec<String>>,
    pub source: Option<String>,
    pub published_at: Option<DateTime<Utc>>,
    /// Optional override — if provided, only send to these subscribers
    pub subscribers: Option<Vec<Subscriber>>,
}

#[derive(Debug, Deserialize)]
pub struct DigestRequest {
    pub cadence: DigestCadence,
    pub articles: Vec<DigestArticle>,
    pub subscribers: Option<Vec<Subscriber>>,
    pub from_date: Option<DateTime<Utc>>,
    pub to_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct TestEmailRequest {
    pub to: String,
}

// ── Shared models ─────────────────────────────────────────────

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum AlertSeverity {
    High,
    Medium,
    Low,
}

impl AlertSeverity {
    pub fn label(&self) -> &'static str {
        match self {
            AlertSeverity::High => "HIGH ALERT",
            AlertSeverity::Medium => "WATCH LIST",
            AlertSeverity::Low => "SIGNAL",
        }
    }

    pub fn color(&self) -> &'static str {
        match self {
            AlertSeverity::High => "#ef4444",
            AlertSeverity::Medium => "#D4AF37",
            AlertSeverity::Low => "#6b7280",
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum DigestCadence {
    Daily,
    TwiceDaily,
    Weekly,
}

impl DigestCadence {
    pub fn label(&self) -> &'static str {
        match self {
            DigestCadence::Daily => "Daily",
            DigestCadence::TwiceDaily => "Twice-Daily",
            DigestCadence::Weekly => "Weekly",
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Subscriber {
    pub id: String,
    pub email: String,
    pub name: Option<String>,
    pub cadence: Option<String>,
    pub language: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct DigestArticle {
    pub title: String,
    pub headline: Option<String>,
    pub summary: String,
    pub url: String,
    pub score: Option<f64>,
    pub source: Option<String>,
    pub published_at: Option<DateTime<Utc>>,
    pub topics: Option<Vec<String>>,
}

// ── Outbound responses ────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct DispatchResult {
    pub dispatch_id: Uuid,
    pub dispatched_at: DateTime<Utc>,
    pub recipients_attempted: usize,
    pub recipients_succeeded: usize,
    pub owner_copy_sent: bool,
    pub errors: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: &'static str,
    pub service: &'static str,
    pub version: &'static str,
}

#[derive(Debug, Serialize)]
pub struct StatusResponse {
    pub service: &'static str,
    pub version: &'static str,
    pub smtp_host: String,
    pub smtp_configured: bool,
    pub owner_email: String,
    pub platform_url: String,
    pub alert_score_threshold: f64,
}
