use rusqlite::Connection;
use std::fs;
use std::sync::Mutex;
use tauri::Manager;

pub struct DbState {
    pub db: Mutex<Connection>,
}

pub fn init_db(app_handle: &tauri::AppHandle) -> Result<Connection, Box<dyn std::error::Error>> {
    let app_dir = app_handle.path().app_data_dir()?;
    fs::create_dir_all(&app_dir)?;
    let db_path = app_dir.join("cairn.db");

    let conn = Connection::open(db_path)?;

    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS projects (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            name    TEXT NOT NULL,
            content TEXT NOT NULL DEFAULT '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\"}]}'
        );"
    )?;

    Ok(conn)
}
