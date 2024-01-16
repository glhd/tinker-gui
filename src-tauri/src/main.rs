// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
	let context = tauri::generate_context!();
	// let run_menu = CustomMenuItem::new("run".to_string(), "Run");
	// let reload_menu = CustomMenuItem::new("reload".to_string(), "Reload");
	// let tinker_submenu = Submenu::new("Tinker", Menu::new().add_item(run_menu).add_item(reload_menu));
	// let menu = tauri::Menu::os_default(&context.package_info().name).add_submenu(tinker_submenu);

    tauri::Builder::default()
        .plugin(tauri_plugin_pty::init())
        // .menu(menu)
        .run(context)
        .expect("error while running tauri application");
}
