use axum::{extract::State, http::StatusCode, Json};
use chrono::Utc;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    config::Config,
    mailer::MailerService,
    models::*,
    templates::Templates,
};

pub struct AppState {
    pub mailer: MailerService,
    pub templates: Templates,
    pub config: Config,
}

pub async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "gmiie-mailer",
        version: env!("CARGO_PKG_VERSION"),
    })
}

pub async fn status(State(state): State<Arc<AppState>>) -> Json<StatusResponse> {
    Json(StatusResponse {
        service: "gmiie-mailer",
        version: env!("CARGO_PKG_VERSION"),
        smtp_host: state.config.smtp_host.clone(),
        smtp_configured: !state.config.smtp_host.is_empty(),
        owner_email: state.config.owner_email.clone(),
        platform_url: state.config.platform_url.clone(),
        alert_score_threshold: state.config.alert_score_threshold,
    })
}

/// POST /v1/dispatch — Send an intelligence alert to subscribers.
/// Called automatically by the GMIIE pipeline after AI scoring
/// when an article score exceeds the threshold.
pub async fn dispatch_alert(
    State(state): State<Arc<AppState>>,
    Json(req): Json<DispatchRequest>,
) -> Result<Json<DispatchResult>, (StatusCode, Json<serde_json::Value>)> {
    let dispatch_id = Uuid::new_v4();
    tracing::info!(
        dispatch_id = %dispatch_id,
        title = %req.title,
        score = req.score,
        severity = ?req.severity,
        "dispatching alert"
    );

    // Score gate — low-scoring articles skip email dispatch
    if req.score < state.config.alert_score_threshold {
        return Ok(Json(DispatchResult {
            dispatch_id,
            dispatched_at: Utc::now(),
            recipients_attempted: 0,
            recipients_succeeded: 0,
            owner_copy_sent: false,
            errors: vec![format!(
                "score {:.1} below threshold {:.1} — no dispatch",
                req.score, state.config.alert_score_threshold
            )],
        }));
    }

    // Use caller-supplied subscribers OR fetch from GMIIE
    let subscribers = if let Some(subs) = req.subscribers.clone() {
        subs
    } else {
        fetch_alert_subscribers(&state.config, &req.severity).await.unwrap_or_else(|e| {
            tracing::warn!("subscriber fetch failed, owner-only dispatch: {e}");
            vec![]
        })
    };

    let (succeeded, _, errors) = state
        .mailer
        .send_alert(&req, &subscribers, &state.templates, dispatch_id)
        .await;

    let owner_copy_sent = !errors.iter().any(|e| e.contains("owner copy failed"));

    Ok(Json(DispatchResult {
        dispatch_id,
        dispatched_at: Utc::now(),
        recipients_attempted: subscribers.len(),
        recipients_succeeded: succeeded,
        owner_copy_sent,
        errors,
    }))
}

/// POST /v1/digest — Send a curated digest to matched subscribers.
pub async fn send_digest(
    State(state): State<Arc<AppState>>,
    Json(req): Json<DigestRequest>,
) -> Result<Json<DispatchResult>, (StatusCode, Json<serde_json::Value>)> {
    let dispatch_id = Uuid::new_v4();
    let cadence_label = req.cadence.label();

    let period_label = format!(
        "{} — {}",
        req.from_date
            .map(|d| d.format("%d %b").to_string())
            .unwrap_or_else(|| "period".to_string()),
        req.to_date
            .map(|d| d.format("%d %b %Y").to_string())
            .unwrap_or_else(|| Utc::now().format("%d %b %Y").to_string())
    );

    let subscribers = if let Some(subs) = req.subscribers {
        subs
    } else {
        fetch_digest_subscribers(&state.config, cadence_label)
            .await
            .unwrap_or_default()
    };

    let (succeeded, _, errors) = state
        .mailer
        .send_digest(
            cadence_label,
            &subscribers,
            &req.articles,
            &period_label,
            &state.templates,
            dispatch_id,
        )
        .await;

    Ok(Json(DispatchResult {
        dispatch_id,
        dispatched_at: Utc::now(),
        recipients_attempted: subscribers.len(),
        recipients_succeeded: succeeded,
        owner_copy_sent: true,
        errors,
    }))
}

/// POST /v1/test — Verify SMTP connectivity.
pub async fn test_email(
    State(state): State<Arc<AppState>>,
    Json(req): Json<TestEmailRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    match state.mailer.send_test(&req.to, &state.templates).await {
        Ok(_) => Ok(Json(serde_json::json!({ "ok": true, "sent_to": req.to }))),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": e.to_string() })),
        )),
    }
}

// ── Subscriber fetchers ───────────────────────────────────────

async fn fetch_alert_subscribers(
    config: &Config,
    severity: &AlertSeverity,
) -> anyhow::Result<Vec<Subscriber>> {
    // Low severity articles don't trigger mass email
    if *severity == AlertSeverity::Low {
        return Ok(vec![]);
    }

    let client = reqwest::Client::new();
    let url = format!("{}/api/subscribers", config.gmiie_api_url);
    let mut req = client.get(&url);
    if !config.gmiie_api_key.is_empty() {
        req = req.header("x-api-key", &config.gmiie_api_key);
    }

    let resp: serde_json::Value = req.send().await?.json().await?;
    let subscribers: Vec<Subscriber> = serde_json::from_value(
        resp.get("subscribers").cloned().unwrap_or_default(),
    )?;
    Ok(subscribers)
}

async fn fetch_digest_subscribers(
    config: &Config,
    cadence: &str,
) -> anyhow::Result<Vec<Subscriber>> {
    let client = reqwest::Client::new();
    let url = format!(
        "{}/api/subscribers?cadence={}",
        config.gmiie_api_url,
        cadence.to_lowercase().replace('-', "_")
    );
    let mut req = client.get(&url);
    if !config.gmiie_api_key.is_empty() {
        req = req.header("x-api-key", &config.gmiie_api_key);
    }

    let resp: serde_json::Value = req.send().await?.json().await?;
    let subscribers: Vec<Subscriber> = serde_json::from_value(
        resp.get("subscribers").cloned().unwrap_or_default(),
    )?;
    Ok(subscribers)
}
