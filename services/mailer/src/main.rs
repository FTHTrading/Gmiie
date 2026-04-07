mod config;
mod mailer;
mod models;
mod routes;
mod templates;

use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::new(
                std::env::var("RUST_LOG")
                    .unwrap_or_else(|_| "gmiie_mailer=debug,tower_http=info".to_string()),
            ),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cfg = config::Config::from_env()?;
    let mailer = mailer::MailerService::new(cfg.clone())?;
    let templates = templates::Templates::new()?;

    let state = Arc::new(routes::AppState {
        mailer,
        templates,
        config: cfg.clone(),
    });

    let app = Router::new()
        .route("/health", get(routes::health))
        .route("/v1/status", get(routes::status))
        .route("/v1/dispatch", post(routes::dispatch_alert))
        .route("/v1/digest", post(routes::send_digest))
        .route("/v1/test", post(routes::test_email))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let bind = format!("0.0.0.0:{}", cfg.port);
    tracing::info!("gmiie-mailer starting on {}", bind);

    let listener = tokio::net::TcpListener::bind(&bind).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
