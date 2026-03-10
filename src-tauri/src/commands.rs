use crate::db::DbState;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Project {
    pub id: i64,
    pub name: String,
    pub content: serde_json::Value,
}

#[tauri::command]
pub fn get_projects(state: tauri::State<'_, DbState>) -> Result<Vec<Project>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = db
        .prepare("SELECT id, name, content FROM projects")
        .map_err(|e| e.to_string())?;

    let projects = stmt
        .query_map([], |row| {
            let content_str: String = row.get(2)?;
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                content: serde_json::from_str(&content_str).unwrap_or_default(),
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(projects)
}

#[tauri::command]
pub fn create_project(name: String, state: tauri::State<'_, DbState>) -> Result<Project, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let default_content = serde_json::json!({
        "type": "doc",
        "content": [{"type": "paragraph"}]
    });
    let content_str = serde_json::to_string(&default_content).map_err(|e| e.to_string())?;

    db.execute(
        "INSERT INTO projects (name, content) VALUES (?1, ?2)",
        rusqlite::params![name, content_str],
    )
    .map_err(|e| e.to_string())?;

    let id = db.last_insert_rowid();

    Ok(Project {
        id,
        name,
        content: default_content,
    })
}

#[tauri::command]
pub fn update_project(
    id: i64,
    name: String,
    content: serde_json::Value,
    state: tauri::State<'_, DbState>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let content_str = serde_json::to_string(&content).map_err(|e| e.to_string())?;

    db.execute(
        "UPDATE projects SET name = ?1, content = ?2 WHERE id = ?3",
        rusqlite::params![name, content_str, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_project(id: i64, state: tauri::State<'_, DbState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    db.execute("DELETE FROM projects WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
