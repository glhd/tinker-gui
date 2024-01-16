// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, AboutMetadata, WindowMenuEvent};

fn main() {
	let context = tauri::generate_context!();
	let menu = get_menu(&context.package_info().name);

    tauri::Builder::default()
        .plugin(tauri_plugin_pty::init())
        .menu(menu)
        .on_menu_event(|event| {
            event.window().emit(event.menu_item_id(), {});
        })
        .run(context)
        .expect("error while running tauri application");
}

fn get_menu(#[allow(unused)] app_name: &str) -> Menu {
    let mut menu = Menu::new();
    
    // "Tinker" Menu
    menu = menu.add_submenu(Submenu::new(
        app_name,
        Menu::new()
            .add_native_item(MenuItem::About(
                app_name.to_string(),
                AboutMetadata::default(),
            ))
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Services)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::ShowAll)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit),
    ));

    // File Menu
    let mut file_menu = Menu::new();
    file_menu = file_menu.add_item(CustomMenuItem::new("open".to_string(), "Open…").accelerator("CmdOrCtrl+O"));
    file_menu = file_menu.add_native_item(MenuItem::CloseWindow);
    menu = menu.add_submenu(Submenu::new("File", file_menu));

    // Edit Menu
    let mut edit_menu = Menu::new();
    edit_menu = edit_menu.add_native_item(MenuItem::Undo);
    edit_menu = edit_menu.add_native_item(MenuItem::Redo);
    edit_menu = edit_menu.add_native_item(MenuItem::Separator);
    edit_menu = edit_menu.add_native_item(MenuItem::Cut);
    edit_menu = edit_menu.add_native_item(MenuItem::Copy);
    edit_menu = edit_menu.add_native_item(MenuItem::Paste);
    edit_menu = edit_menu.add_native_item(MenuItem::SelectAll);
    menu = menu.add_submenu(Submenu::new("Edit", edit_menu));

    // View Menu
    // menu = menu.add_submenu(Submenu::new(
    //     "View",
    //     Menu::new().add_native_item(MenuItem::EnterFullScreen),
    // ));
    
    // Run Menu
    let mut run_menu = Menu::new();
    run_menu = run_menu.add_item(CustomMenuItem::new("run".to_string(), "Run Code").accelerator("CmdOrCtrl+R"));
    run_menu = run_menu.add_item(CustomMenuItem::new("reload".to_string(), "Reload Terminal").accelerator("CmdOrCtrl+Shift+R"));
    menu = menu.add_submenu(Submenu::new("Run", run_menu));

    // Window Menu
    let mut window_menu = Menu::new();
    window_menu = window_menu.add_native_item(MenuItem::Minimize);
    window_menu = window_menu.add_native_item(MenuItem::Zoom);
    // window_menu = window_menu.add_native_item(MenuItem::Separator);
    // window_menu = window_menu.add_native_item(MenuItem::CloseWindow);
    menu = menu.add_submenu(Submenu::new("Window", window_menu));

    menu
}
