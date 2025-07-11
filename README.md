# XMM – Cross‑Game Mod Manager

![Characters List](https://cdn.evilnick.net/xmm-assets/imgs/characters.png)

**A modern, cross-platform manager for gacha games, built with Tauri and React.**

> **Formerly Genshin Mod Manager (GMM).**  The project was renamed to **XMM** to reflect its multi‑game scope and to distance the codebase from the original upstream repository.  XMM is a clean‑room continuation that strips all un‑audited code while retaining every freedom guaranteed by the GPL‑3.0 license.

[![Latest Release](https://img.shields.io/github/v/release/EvilNick2/xmm?label=Latest%20Release&style=for-the-badge)](https://github.com/EvilNick2/xmm/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/EvilNick2/xmm/total?style=for-the-badge)](https://github.com/EvilNick2/xmm/releases)

XMM aims to simplify the process of installing, organizing, and switching between game mods. It provides a clean user interface and useful tools like presets and keybind viewing.

---

## ✨ Key Features

*   **🎮 Multi-Game Support:** Manage mods for different games (currently supports **Genshin Impact**, **Honkai: Star Rail**, **Zenless Zone Zero**, and **Wuthering Waves**) with separate configurations and databases. Easily switch between supported games.
*   **🗂️ Mod Library & Categorization:** Automatically scans your mods folder and organizes mods by category (Characters, Weapons, UI, etc.) and entity for the selected game.
*   **🖱️ Simple Enable/Disable:** Easily toggle mods on or off with a switch. GMM handles the `DISABLED_` prefix renaming for you.
*   **🖱️ Drag & Drop Import:** Drag archive files (.zip, .7z, .rar) directly onto the application window to initiate the import process.
*   **📦 Enhanced Archive Import (.zip, .7z, .rar):** Import mods directly from archive files. GMM analyzes contents (including INI hints), suggests mod details, allows root folder selection, or extracts all files.
*   **🤖 Advanced Mod Info Deduction:** Attempts to deduce mod name, author, and target entity from folder structure, internal filenames, and INI files during scan/import.
*   **✨ Presets System:** Save your current mod setup as a preset for the active game and quickly switch between different mod combinations. Mark favorites for quick access via the sidebar.
*   **📊 Enhanced Dashboard:** Get a quick glance at your library stats for the active game, including total mods, enabled/disabled counts, and category breakdowns with visual charts.
*   **🚀 Quick Launch Integration:** Configure a path to your game executable or a mod launcher for one-click launching. Supports standard launch and **elevated (Admin) launch** on Windows if required.
*   **⌨️ Keybind Viewer:** Quickly view keybinds defined within a mod's INI files (specifically looks for `key = ...` lines within `[Key.*]` sections *after* a `; Constants` marker).
*   **🖼️ Image Previews & Lightbox:** Automatically detects and displays common preview images (`preview.png`, etc.). Allows changing previews via file selection or pasting. Click previews to view them in a larger lightbox overlay.
*   **🖱️ Context Menu Actions:** Right-click on mods (in list view) for quick actions like opening the mod folder, adding to presets, editing, or deleting.
*   **🔄 Built-in Updater:** Stay up-to-date with the latest features and fixes via the integrated updater (powered by Tauri).
*   **🦀 Tauri Powered:** Built with Rust (backend) and React (frontend) via Tauri for a fast and efficient cross-platform experience.

---

## 📸 Screenshots

![Dashboard](https://cdn.evilnick.net/xmm-assets/imgs/home.png)

![Character page](https://cdn.evilnick.net/xmm-assets/imgs/mods.png)

![Character mods](https://cdn.evilnick.net/xmm-assets/imgs/mods_page.png)

---

## 💾 Installation

1.  **Download:** Go to the [**Latest Release**](https://github.com/EvilNick2/xmm/releases/latest) page.
2.  **Installer:** Download the `.msi` installer file (e.g., `XMM_X.Y.Z_x64_en-US.msi`).
3.  **Run:** Execute the downloaded `.msi` file and follow the installation prompts.
4.  **Updates:** The application has a built-in updater and will notify you when a new version is available.

---

## 🚀 Usage Guide

1.  **Initial Setup:**
    *   On first launch, you'll be prompted to select the game you want to configure first (e.g., Genshin Impact).
    *   You *must* select the main folder where you store your mods for that specific game (e.g., `...\GIMI\Mods`).
    *   Optionally, select the game or launcher executable for Quick Launch for that game.
2.  **Switching Games:** Use the game switcher on the **Dashboard** or in the **Initial Setup** screen. Switching games requires an application restart (XMM will prompt and handle this). Settings and mods are kept separate for each game.
3.  **Scanning:** After setting the mods folder for a game, go to **Settings -> Scan Mods Folder -> Scan Now**. This populates the library for the *currently active* game.
4.  **Importing:**
    *   **Method 1 (Button):** Click the **Import Mod** button in the sidebar. Select a `.zip`, `.7z`, or `.rar` archive.
    *   **Method 2 (Drag & Drop):** Drag and drop a supported archive file directly onto the XMM window.
    *   **Process:** Review the detected archive contents. XMM may suggest a root folder. Select the correct **Mod Root Folder** (containing the INI/mod files) OR check **Extract All Files**. Fill in/correct the Mod Name, Target Entity (for the current game), and other details. Click **Confirm Import**.
5.  **Browsing:** Use the sidebar to navigate the library for the *currently active* game. Click on an entity card (e.g., Raiden Shogun) to view its mods.
6.  **Managing Mods:**
    *   Click the toggle switch on a mod card (Grid view) or list item (List view) to enable or disable it.
    *   Use the pencil icon to edit mod details (name, description, author, tags, preview image, target entity).
    *   Use the trash icon to delete a mod (removes from disk and database).
    *   Use the keyboard icon to view detected keybinds.
    *   Right-click a mod in list view for context menu actions (Open Folder, Add to Preset, Edit, Delete).
    *   Click on mod preview images to view them larger in a lightbox.
7.  **Bulk Actions (List View):**
    *   Check the boxes next to mods in the list view.
    *   Use the "Enable Selected" / "Disable Selected" buttons that appear in the header.
8.  **Presets:**
    *   Presets are specific to the *currently active* game.
    *   Go to the **Presets** page.
    *   Enter a name and click **Create Preset** to save the current mod configuration for this game.
    *   Click the play icon next to a preset to apply it.
    *   Use other icons to overwrite, favorite (appears in sidebar), or delete presets.
9.  **Quick Launch:** Click the **Quick Launch** button in the sidebar. GMM will attempt a standard launch first. If that fails with an elevation error (on Windows), it will prompt for admin permission to launch elevated.

---

## 🛠️ Development

**Prerequisites:**

*   [Node.js](https://nodejs.org/) (LTS recommended) and npm/yarn
*   [Rust Language Toolchain](https://www.rust-lang.org/tools/install)
*   Tauri Prerequisites (See the [Tauri Guide](https://tauri.app/v1/guides/getting-started/prerequisites))

**Setup:**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/EvilNick2/xmm.git
    cd xmm
    ```
2.  **Install frontend dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Run in development mode:**
    ```bash
    npm run tauri dev
    ```
    This will start the Vite frontend dev server and the Tauri backend.

**Build:**

```bash
npm run tauri build
```

This will build the frontend and bundle the final application according to your tauri.conf.json settings.

## 💻 Technology Stack

- **Framework:** Tauri
- **Backend:** Rust
- **Frontend:** React, Vite, Framer Motion
- **Database:** SQLite (via rusqlite)
- **Icons:** Font Awesome, Lucide React

---
## 📝 License

XMM is free software licensed under the **GNU General Public License v3.0 or (at your option) any later version**. See the [LICENSE](./LICENSE) file for full details.

---
## 🤝 Acknowledgements

* Original concept & early code by the [GMM](https://github.com/Eidenz/gmm) authors.
* Built with [Tauri](https://tauri.app/), [React](https://react.dev/), and [Rust](https://www.rust-lang.org/).

---
© 2024 EvilNick2. Released under the GPL‑3.0‑or‑later.