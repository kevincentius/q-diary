use std::fs::OpenOptions;
use std::io::Write;
use std::process::Command;
use std::thread;
use std::time::Duration;
use tauri::Manager;

fn write_log(msg: &str) {
    if let Ok(app_data) = std::env::var("APPDATA") {
        let log_path = format!("{}/q-diary/app.log", app_data);
        if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(&log_path) {
            let _ = writeln!(
                file,
                "[{}] {}",
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
                msg
            );
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    write_log("App starting...");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            write_log("Tauri setup start");

            #[cfg(debug_assertions)]
            {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let exe_path = std::env::current_exe().unwrap();
            let resource_path = app.path().resource_dir().unwrap();

            write_log(&format!("Exe path: {:?}", exe_path));
            write_log(&format!("Resource path: {:?}", resource_path));

            // Try both possible server paths
            let server_path = resource_path.join("server").join("main.js");
            let alt_path = exe_path
                .parent()
                .unwrap()
                .join("resources")
                .join("server")
                .join("main.js");

            write_log(&format!("Server path: {:?}", server_path));
            write_log(&format!("Alt path: {:?}", alt_path));
            write_log(&format!("Server exists: {}", server_path.exists()));
            write_log(&format!("Alt exists: {}", alt_path.exists()));

            let final_path = if server_path.exists() {
                server_path
            } else if alt_path.exists() {
                alt_path
            } else {
                write_log("ERROR: No server file found!");
                return Ok(());
            };

            write_log(&format!("Starting server from: {:?}", final_path));

            let result = Command::new("node").arg(&final_path).spawn();
            match result {
                Ok(_) => write_log("Server started successfully"),
                Err(e) => write_log(&format!("Failed to start server: {}", e)),
            }

            thread::sleep(Duration::from_secs(3));
            write_log("Setup complete");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
