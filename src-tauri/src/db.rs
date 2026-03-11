use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

pub struct DbState {
    pub db: Mutex<Connection>,
    pub images_dir: PathBuf,
}

pub fn init_db(app_handle: &tauri::AppHandle) -> Result<(Connection, PathBuf), Box<dyn std::error::Error>> {
    let app_dir = app_handle.path().app_data_dir()?;
    fs::create_dir_all(&app_dir)?;
    let db_path = app_dir.join("cairn.db");
    let images_dir = app_dir.join("images");
    fs::create_dir_all(&images_dir)?;

    let conn = Connection::open(db_path)?;

    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS projects (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            name    TEXT NOT NULL,
            content TEXT NOT NULL DEFAULT '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\"}]}'
        );"
    )?;

    // Insérer le projet "Bienvenue" si la table est vide (premier lancement)
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM projects", [], |row| row.get(0))?;
    if count == 0 {
        let welcome_content = r#"{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Bienvenue sur Cairn !"}]},{"type":"paragraph","content":[{"type":"text","text":"Cairn est ton espace de travail personnel. Voici ce que tu peux faire :"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Écrire"},{"type":"text","text":" du texte riche avec des titres, listes et blocs de code"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Coller des images"},{"type":"text","text":" directement avec Ctrl+V ou en drag-and-drop"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Dessiner"},{"type":"text","text":" à main levée avec le bouton crayon"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Exporter et importer"},{"type":"text","text":" des projets"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Crée un nouveau projet dans le menu à gauche pour commencer !"}]}]}"#;

        conn.execute(
            "INSERT INTO projects (name, content) VALUES (?1, ?2)",
            rusqlite::params!["Bienvenue", welcome_content],
        )?;
    }

    Ok((conn, images_dir))
}
