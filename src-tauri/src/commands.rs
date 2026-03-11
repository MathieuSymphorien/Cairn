use crate::db::DbState;
use base64::Engine;
use serde::{Deserialize, Serialize};
use std::fs;

const LOCAL_PREFIX: &str = "cairn-local://";

#[derive(Serialize, Deserialize)]
pub struct Project {
    pub id: i64,
    pub name: String,
    pub content: serde_json::Value,
}

// --- Image helpers ---

fn extract_image_filenames(value: &serde_json::Value) -> Vec<String> {
    let mut filenames = Vec::new();
    match value {
        serde_json::Value::Object(map) => {
            if let Some(serde_json::Value::String(src)) = map.get("src") {
                if let Some(filename) = src
                    .strip_prefix(LOCAL_PREFIX)
                    .or_else(|| src.strip_prefix("https://cairn-img.localhost/"))
                {
                    filenames.push(filename.to_string());
                }
            }
            for v in map.values() {
                filenames.extend(extract_image_filenames(v));
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr {
                filenames.extend(extract_image_filenames(v));
            }
        }
        _ => {}
    }
    filenames
}

fn delete_image_files(images_dir: &std::path::Path, filenames: &[String]) {
    for filename in filenames {
        let _ = fs::remove_file(images_dir.join(filename));
    }
}

fn local_to_base64(value: &mut serde_json::Value, images_dir: &std::path::Path) {
    match value {
        serde_json::Value::Object(map) => {
            let filename_opt = if let Some(serde_json::Value::String(src)) = map.get("src") {
                src.strip_prefix(LOCAL_PREFIX)
                    .or_else(|| src.strip_prefix("https://cairn-img.localhost/"))
                    .map(|s| s.to_string())
            } else {
                None
            };

            if let Some(filename) = filename_opt {
                let file_path = images_dir.join(&filename);
                if let Ok(bytes) = fs::read(&file_path) {
                    let ext = filename.rsplit('.').next().unwrap_or("png");
                    let mime = match ext {
                        "jpg" | "jpeg" => "image/jpeg",
                        "gif" => "image/gif",
                        "webp" => "image/webp",
                        _ => "image/png",
                    };
                    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
                    map.insert(
                        "src".to_string(),
                        serde_json::Value::String(format!("data:{};base64,{}", mime, b64)),
                    );
                }
            }

            for v in map.values_mut() {
                local_to_base64(v, images_dir);
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr {
                local_to_base64(v, images_dir);
            }
        }
        _ => {}
    }
}

fn base64_to_local(value: &mut serde_json::Value, images_dir: &std::path::Path) {
    match value {
        serde_json::Value::Object(map) => {
            let is_base64 = matches!(
                map.get("src"),
                Some(serde_json::Value::String(s)) if s.starts_with("data:image/")
            );

            if is_base64 {
                if let Some(serde_json::Value::String(src)) = map.get("src").cloned().as_ref() {
                    if let Some((_meta, data)) = src.split_once(',') {
                        let ext = if src.contains("image/png") {
                            "png"
                        } else if src.contains("image/jpeg") {
                            "jpg"
                        } else if src.contains("image/gif") {
                            "gif"
                        } else if src.contains("image/webp") {
                            "webp"
                        } else {
                            "png"
                        };
                        if let Ok(bytes) =
                            base64::engine::general_purpose::STANDARD.decode(data)
                        {
                            let filename = format!("{}.{}", uuid::Uuid::new_v4(), ext);
                            let _ = fs::create_dir_all(images_dir);
                            if fs::write(images_dir.join(&filename), &bytes).is_ok() {
                                map.insert(
                                    "src".to_string(),
                                    serde_json::Value::String(format!(
                                        "{}{}",
                                        LOCAL_PREFIX, filename
                                    )),
                                );
                            }
                        }
                    }
                }
            }

            for v in map.values_mut() {
                base64_to_local(v, images_dir);
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr {
                base64_to_local(v, images_dir);
            }
        }
        _ => {}
    }
}

// --- Tauri commands ---

#[tauri::command]
pub fn save_image(
    data_uri: String,
    filename: Option<String>,
    state: tauri::State<'_, DbState>,
) -> Result<String, String> {
    let parts: Vec<&str> = data_uri.splitn(2, ',').collect();
    if parts.len() != 2 {
        return Err("Invalid data URI".to_string());
    }

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(parts[1])
        .map_err(|e| e.to_string())?;

    // Reuse existing filename or generate new one
    let filename = filename.unwrap_or_else(|| {
        let mime_part = parts[0];
        let ext = if mime_part.contains("image/png") {
            "png"
        } else if mime_part.contains("image/jpeg") {
            "jpg"
        } else if mime_part.contains("image/gif") {
            "gif"
        } else if mime_part.contains("image/webp") {
            "webp"
        } else {
            "png"
        };
        format!("{}.{}", uuid::Uuid::new_v4(), ext)
    });

    fs::create_dir_all(&state.images_dir).map_err(|e| e.to_string())?;
    fs::write(state.images_dir.join(&filename), bytes).map_err(|e| e.to_string())?;

    Ok(filename)
}

#[tauri::command]
pub fn read_image(filename: String, state: tauri::State<'_, DbState>) -> Result<String, String> {
    let file_path = state.images_dir.join(&filename);
    let bytes = fs::read(&file_path).map_err(|e| e.to_string())?;

    let ext = filename.rsplit('.').next().unwrap_or("png");
    let mime = match ext {
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        _ => "image/png",
    };

    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{};base64,{}", mime, b64))
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
    let content_str: String = db
        .query_row(
            "SELECT content FROM projects WHERE id = ?1",
            rusqlite::params![id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    if let Ok(content) = serde_json::from_str::<serde_json::Value>(&content_str) {
        let filenames = extract_image_filenames(&content);
        delete_image_files(&state.images_dir, &filenames);
    }
    db.execute("DELETE FROM projects WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Serialize, Deserialize)]
struct ExportedProject {
    name: String,
    content: serde_json::Value,
}

#[tauri::command]
pub fn export_project(
    id: i64,
    path: String,
    state: tauri::State<'_, DbState>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let mut project = db
        .query_row(
            "SELECT name, content FROM projects WHERE id = ?1",
            rusqlite::params![id],
            |row| {
                let content_str: String = row.get(1)?;
                Ok(ExportedProject {
                    name: row.get(0)?,
                    content: serde_json::from_str(&content_str).unwrap_or_default(),
                })
            },
        )
        .map_err(|e| e.to_string())?;
    local_to_base64(&mut project.content, &state.images_dir);
    let json = serde_json::to_string_pretty(&project).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn import_project(path: String, state: tauri::State<'_, DbState>) -> Result<Project, String> {
    let json = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let mut imported: ExportedProject = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    base64_to_local(&mut imported.content, &state.images_dir);
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let content_str = serde_json::to_string(&imported.content).map_err(|e| e.to_string())?;
    db.execute(
        "INSERT INTO projects (name, content) VALUES (?1, ?2)",
        rusqlite::params![imported.name, content_str],
    )
    .map_err(|e| e.to_string())?;
    let id = db.last_insert_rowid();
    Ok(Project {
        id,
        name: imported.name,
        content: imported.content,
    })
}
