use std::fs::OpenOptions;
use std::io::Write;
use std::process::Command;
use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Manager};

#[cfg(windows)]
use std::os::windows::process::CommandExt;

struct ServerChild {
    child: Mutex<Option<std::process::Child>>,
}

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

fn start_server(app: &AppHandle) {
    let exe_path = std::env::current_exe().unwrap();
    let resource_path = app.path().resource_dir().unwrap();

    let server_path = resource_path.join("server").join("main.js");
    let alt_path = exe_path
        .parent()
        .unwrap()
        .join("resources")
        .join("server")
        .join("main.js");

    let final_path = if server_path.exists() {
        server_path
    } else if alt_path.exists() {
        alt_path
    } else {
        write_log("ERROR: No server file found!");
        return;
    };

    write_log(&format!("Starting server from: {:?}", final_path));

    #[cfg(windows)]
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    #[cfg(windows)]
    let result = Command::new("node")
        .arg(&final_path)
        .creation_flags(CREATE_NO_WINDOW)
        .spawn();

    #[cfg(not(windows))]
    let result = Command::new("node").arg(&final_path).spawn();

    match result {
        Ok(child) => {
            write_log("Server started successfully");
            app.manage(ServerChild {
                child: Mutex::new(Some(child)),
            });
        }
        Err(e) => write_log(&format!("Failed to start server: {}", e)),
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

            start_server(app.handle());

            thread::sleep(Duration::from_secs(3));
            write_log("Setup complete");

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                write_log("Window close requested, killing server...");
                if let Some(state) = window.try_state::<ServerChild>() {
                    if let Ok(mut guard) = state.child.lock() {
                        if let Some(mut child) = guard.take() {
                            let _ = child.kill();
                            write_log("Server killed");
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
