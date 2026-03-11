mod commands;
mod db;

use db::DbState;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let (conn, images_dir) = db::init_db(app.handle())
                .expect("Erreur lors de l'initialisation de la base de données");
            app.manage(DbState {
                db: Mutex::new(conn),
                images_dir,
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_projects,
            commands::create_project,
            commands::update_project,
            commands::delete_project,
            commands::export_project,
            commands::import_project,
            commands::save_image,
            commands::read_image,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
