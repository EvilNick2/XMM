// --- START OF FILE src/components/ModEditModal.jsx ---
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import Select from 'react-select';

const reactSelectStyles = {
    control: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderColor: state.isFocused ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
        boxShadow: state.isFocused ? '0 0 0 1px var(--primary)' : 'none',
        color: 'var(--light)',
        minHeight: '43px', // Match input height roughly
        '&:hover': {
            borderColor: 'var(--primary)',
        },
    }),
    valueContainer: (baseStyles) => ({
        ...baseStyles,
        padding: '2px 12px', // Adjust padding
    }),
    singleValue: (baseStyles) => ({
        ...baseStyles,
        color: 'var(--light)',
    }),
    placeholder: (baseStyles) => ({
        ...baseStyles,
        color: 'rgba(255, 255, 255, 0.5)', // Placeholder text color
    }),
    input: (baseStyles) => ({
        ...baseStyles,
        color: 'var(--light)', // Input text color
        margin: '0px',
        padding: '0px',
    }),
    indicatorSeparator: (baseStyles) => ({
        ...baseStyles,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Separator line color
    }),
    dropdownIndicator: (baseStyles, state) => ({
        ...baseStyles,
        color: state.isFocused ? 'var(--primary)' : 'rgba(255, 255, 255, 0.5)', // Arrow color
        padding: '8px',
        '&:hover': {
            color: 'var(--primary)',
        },
    }),
    clearIndicator: (baseStyles) => ({
        ...baseStyles,
        color: 'rgba(255, 255, 255, 0.5)',
        padding: '8px',
        '&:hover': {
            color: 'var(--danger)',
        },
    }),
    menu: (baseStyles) => ({
        ...baseStyles,
        backgroundColor: 'var(--dark)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        zIndex: 1100, // Higher than typical modal overlay zIndex (e.g., 1050)
    }),
    menuList: (baseStyles) => ({
        ...baseStyles,
        padding: '4px 0', // Padding for the list container
        maxHeight: '200px', // Limit dropdown height
    }),
    option: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor: state.isSelected
            ? 'var(--primary)' // Selected option background
            : state.isFocused
                ? 'rgba(255, 255, 255, 0.1)' // Hover/focused option background
                : 'transparent',
        color: state.isSelected ? 'white' : 'var(--light)', // Text color
        padding: '10px 15px', // Option padding
        cursor: 'pointer',
        '&:active': {
            backgroundColor: state.isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)',
        },
    }),
    noOptionsMessage: (baseStyles) => ({
        ...baseStyles,
        color: 'rgba(255, 255, 255, 0.6)',
        padding: '10px 15px',
    }),
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        backdropFilter: 'blur(5px)',
    },
    modal: {
        background: 'var(--dark)', padding: '30px 40px', borderRadius: '12px',
        boxShadow: '0 5px 25px rgba(0, 0, 0, 0.4)', color: 'var(--light)',
        minWidth: '500px', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column'
    },
    title: {
        fontSize: '22px', fontWeight: '600', marginBottom: '25px',
        color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '15px', flexShrink: 0,
    },
    content: { flexGrow: 1, overflowY: 'auto', paddingRight: '10px' /* Space for scrollbar */ }, // Added content wrapper
    formGroup: { marginBottom: '20px' },
    label: {
        display: 'block', marginBottom: '8px', fontSize: '14px',
        fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)',
    },
    input: {
        width: '100%', padding: '10px 15px', backgroundColor: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px',
        color: 'var(--light)', fontSize: '14px', boxSizing: 'border-box',
    },
    textarea: {
        width: '100%', padding: '10px 15px', backgroundColor: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px',
        color: 'var(--light)', fontSize: '14px', minHeight: '80px', resize: 'vertical',
        boxSizing: 'border-box', fontFamily: 'inherit',
    },
    imagePreviewContainer: {
        marginTop: '10px', padding: '10px', border: '1px dashed rgba(255,255,255,0.2)',
        borderRadius: '6px', textAlign: 'center', minHeight: '120px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    },
    imagePreview: {
        maxWidth: '100%', maxHeight: '150px', borderRadius: '4px',
        marginBottom: '10px', objectFit: 'contain',
    },
    imagePlaceholderText: { fontSize: '13px', color: 'rgba(255,255,255,0.5)' },
    buttonGroup: {
        display: 'flex', justifyContent: 'flex-end', gap: '15px',
        marginTop: '30px', paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0,
    },
    errorText: { color: 'var(--danger)', marginTop: '15px', fontSize: '14px', textAlign: 'center' },
};

const FALLBACK_MOD_IMAGE_MODAL = '/images/placeholder.jpg';

function ModEditModal({ asset, currentEntitySlug, onClose, onSaveSuccess }) {
    // Form State
    const [formData, setFormData] = useState({ name: '', description: '', author: '', category_tag: '' });
    // Relocation State
    const [categories, setCategories] = useState([]);
    const [entities, setEntities] = useState([]);
    const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);
    const [selectedEntityOption, setSelectedEntityOption] = useState(null);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [entityLoading, setEntityLoading] = useState(false);
    // Preview State
    const [currentImageUrl, setCurrentImageUrl] = useState(FALLBACK_MOD_IMAGE_MODAL);
    const [imageLoading, setImageLoading] = useState(false); // Add loading state for image
    const [imageLoadingError, setImageLoadingError] = useState(false);
    const [selectedImageAbsPath, setSelectedImageAbsPath] = useState(null);
    const [pastedImageFile, setPastedImageFile] = useState(null);
    const previewObjectUrlRef = useRef(null); // Ref for blob URLs needing cleanup
    // Modal State
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Format options for Select
    const categoryOptions = useMemo(() => categories.map(cat => ({ value: cat.slug, label: cat.name })), [categories]);
    const entityOptions = useMemo(() => entities.map(ent => ({ value: ent.slug, label: ent.name })), [entities]);


    // Cleanup function to revoke old object URLs
    const cleanupObjectUrl = useCallback(() => {
        if (previewObjectUrlRef.current) {
            console.log("[ModEditModal Cleanup] Revoking previous Blob URL:", previewObjectUrlRef.current);
            URL.revokeObjectURL(previewObjectUrlRef.current);
            previewObjectUrlRef.current = null;
        }
    }, []);

    // Fetch Categories & Set Initial State
    useEffect(() => {
        let isMounted = true;
        if (!asset) return;

        setFormData({
            name: asset.name || '',
            description: asset.description || '',
            author: asset.author || '',
            category_tag: asset.category_tag || '',
        });
        setSelectedImageAbsPath(null);
        setPastedImageFile(null);
        setError('');
        setImageLoadingError(false);
        setImageLoading(false); // Reset loading state
        // Don't reset currentImageUrl or cleanup blob here; Effect 3 handles it.
        setCategoryLoading(true); setEntityLoading(true); setSelectedCategoryOption(null); setSelectedEntityOption(null);

        // Fetch Categories
        invoke('get_categories')
            .then(fetchedCategories => {
                if (!isMounted) return;
                setCategories(fetchedCategories);

                // Find the current category based on the currentEntitySlug (from props)
                // We need category info to pre-select the dropdowns
                invoke('get_entity_details', { entitySlug: currentEntitySlug })
                    .then(currentEntityDetails => {
                        if (!isMounted) return;
                        const currentCategory = fetchedCategories.find(cat => cat.id === currentEntityDetails.category_id);
                        if (currentCategory) {
                            const currentCatOption = { value: currentCategory.slug, label: currentCategory.name };
                            setSelectedCategoryOption(currentCatOption);
                            // Entity loading will be triggered by the next useEffect
                        } else {
                            setEntityLoading(false); // No category found, stop loading
                        }
                    })
                    .catch(err => {
                        console.error("Failed to get current entity details for initial selection:", err);
                        if (isMounted) setEntityLoading(false);
                    });
            })
            .catch(err => {
                console.error("Failed fetch categories:", err);
                if (isMounted) setCategoryLoading(false);
                if (isMounted) setEntityLoading(false);
            })
            .finally(() => {
                if (isMounted) setCategoryLoading(false);
                // Don't set entity loading false here, wait for category selection effect
            });


        // Load existing image preview (same logic as before)
        if (asset.image_filename && asset.folder_name) {
            invoke('get_asset_image_path', {
                entitySlug: '', // Not needed if folder_name is relative path on disk
                folderNameOnDisk: asset.folder_name,
                imageFilename: asset.image_filename
            })
                .then(filePath => {
                    if (!isMounted) return;
                    console.log(`[ModEditModal Image Effect ${asset.id}] Got absolute path: ${filePath}`);
                    if (!filePath) throw new Error("Backend returned empty path.");
                    // Use convertFileSrc for existing files served via asset protocol
                    const assetUrl = convertFileSrc(filePath);
                    console.log(`[ModEditModal Image Effect ${asset.id}] Setting image URL to asset: ${assetUrl}`);
                    setCurrentImageUrl(assetUrl);
                })
                .catch(err => {
                    if (isMounted) {
                        console.error(`[ModEditModal Image Effect ${asset.id}] Failed load existing image:`, err);
                        setCurrentImageUrl(FALLBACK_MOD_IMAGE_MODAL);
                        setImageLoadingError(true);
                    }
                });
        } else {
            console.log(`[ModEditModal Image Effect ${asset.id}] No existing image filename/folder.`);
            setCurrentImageUrl(FALLBACK_MOD_IMAGE_MODAL);
        }

        return () => { isMounted = false; cleanupObjectUrl(); };
    }, [asset, currentEntitySlug]); // Rerun when the asset prop or current entity slug changes

    // Fetch Entities when Category Changes & Set Initial Entity
    useEffect(() => {
        let isMounted = true;
        const categorySlug = selectedCategoryOption?.value;

        if (categorySlug) {
            setEntityLoading(true);
            // Fetch entities specifically for the selected category
            invoke('get_category_entities', { categorySlug: categorySlug })
                .then(loadedEntities => {
                    if (!isMounted) return;
                    setEntities(loadedEntities);

                    // Pre-select the entity if the category matches the asset's original category
                    if (categorySlug === selectedCategoryOption?.value) { // Check if still the same category
                        const currentEntityOption = loadedEntities
                            .map(ent => ({ value: ent.slug, label: ent.name }))
                            .find(opt => opt.value === currentEntitySlug); // Use currentEntitySlug from props

                        if (currentEntityOption) {
                            setSelectedEntityOption(currentEntityOption);
                        } else {
                            // If current entity not found in the newly loaded list (shouldn't happen often)
                            setSelectedEntityOption(null);
                        }
                    } else {
                        // Category changed, reset entity selection
                        setSelectedEntityOption(null);
                    }
                })
                .catch(err => {
                    console.error(`Failed fetch entities for ${categorySlug}:`, err);
                    if (isMounted) setEntities([]);
                    if (isMounted) setSelectedEntityOption(null);
                })
                .finally(() => { if (isMounted) setEntityLoading(false); });
        } else {
            // No category selected, clear entities
            setEntities([]);
            setSelectedEntityOption(null);
            setEntityLoading(false);
        }
        return () => { isMounted = false; }
    }, [selectedCategoryOption, currentEntitySlug]); // Rerun when selected category changes

    // Fetch Entities when Category Changes & Set Initial Entity
    useEffect(() => {
        let isMounted = true;
        // Guard conditions: Run only if asset exists AND no new image is pending (pasted/selected)
        if (!asset || pastedImageFile || selectedImageAbsPath) {
            console.log('[ModEditModal Image Effect] Skipping initial load (no asset or new image pending).');
            return;
        }

        console.log(`[ModEditModal Image Effect ${asset.id}] Attempting initial load for:`, asset.image_filename, `in folder:`, asset.folder_name);
        setCurrentImageUrl(FALLBACK_MOD_IMAGE_MODAL); // Reset to fallback
        setImageLoadingError(false);
        setImageLoading(true); // Set loading true
        cleanupObjectUrl(); // Clean up any previous blob URL first

        if (asset.image_filename && asset.folder_name) {
            invoke('get_asset_image_path', {
                entitySlug: '', // Send empty or potentially currentEntitySlug if needed by backend logic
                folderNameOnDisk: asset.folder_name,
                imageFilename: asset.image_filename
            })
                .then(filePath => {
                    if (!isMounted) return Promise.reject(new Error("Component unmounted before reading binary"));
                    if (!filePath) throw new Error("Backend returned empty path for existing image.");
                    console.log(`[ModEditModal Image Effect ${asset.id}] Got absolute path: ${filePath}`);
                    return invoke('read_binary_file', { path: filePath }); // Read the binary data
                })
                .then(fileData => {
                    if (!isMounted || !fileData) return Promise.reject(new Error("Component unmounted or no binary data"));
                    console.log(`[ModEditModal Image Effect ${asset.id}] Read binary data (length: ${fileData.length})`);
                    try {
                        // Determine mime type (same as before)
                        const extension = asset.image_filename.split('.').pop().toLowerCase();
                        let mimeType = 'image/png';
                        if (['jpg', 'jpeg'].includes(extension)) mimeType = 'image/jpeg';
                        else if (extension === 'gif') mimeType = 'image/gif';
                        else if (extension === 'webp') mimeType = 'image/webp';

                        const blob = new Blob([new Uint8Array(fileData)], { type: mimeType });
                        const url = URL.createObjectURL(blob);
                        if (isMounted) {
                            previewObjectUrlRef.current = url; // Store for cleanup
                            setCurrentImageUrl(url); // Set the blob URL for preview
                            console.log(`[ModEditModal Image Effect ${asset.id}] Created Blob URL: ${url}`);
                        } else {
                            URL.revokeObjectURL(url); // Revoke immediately if unmounted
                        }
                    } catch (blobError) {
                        console.error(`[ModEditModal Image Effect ${asset.id}] Error creating blob/URL:`, blobError);
                        if (isMounted) { setCurrentImageUrl(FALLBACK_MOD_IMAGE_MODAL); setImageLoadingError(true); }
                    }
                })
                .catch(err => {
                    if (isMounted) {
                        console.error(`[ModEditModal Image Effect ${asset.id}] Failed load existing image:`, err);
                        setCurrentImageUrl(FALLBACK_MOD_IMAGE_MODAL);
                        setImageLoadingError(true);
                    }
                })
                .finally(() => {
                    if (isMounted) {
                        setImageLoading(false); // Set loading false
                    }
                });
        } else {
            console.log(`[ModEditModal Image Effect ${asset.id}] No existing image filename/folder.`);
            setCurrentImageUrl(FALLBACK_MOD_IMAGE_MODAL);
            setImageLoading(false); // Set loading false
        }

        // Cleanup function for this effect
        return () => {
            isMounted = false;
        };
    }, [asset?.id, asset?.image_filename, asset?.folder_name, pastedImageFile, selectedImageAbsPath, cleanupObjectUrl]);

    const handlePaste = useCallback((event) => {
        setError('');
        cleanupObjectUrl(); // Clean before processing paste
        const items = event.clipboardData.items;
        let imageFound = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                if (file) {
                    imageFound = true;
                    console.log("[ModEditModal Paste] Pasted image file:", file.name, file.type);
                    setSelectedImageAbsPath(null); // Clear file path selection
                    setPastedImageFile(file); // Store File object
                    setImageLoading(false); // Ensure loading indicator is off
                    setImageLoadingError(false); // Clear load error

                    try {
                        const url = URL.createObjectURL(file);
                        previewObjectUrlRef.current = url;
                        setCurrentImageUrl(url);
                        console.log("[ModEditModal Paste] Created Blob URL:", url);
                    } catch (e) { /* handle error */ }
                    break;
                }
            }
        }
        if (imageFound) { event.preventDefault(); }
        else { console.log("[ModEditModal Paste] No image found."); }
    }, [cleanupObjectUrl]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // handleSelectImage remains the same as before
    const handleSelectImage = async () => {
        setError('');
        cleanupObjectUrl(); // Clean up previous temporary URL before creating new one

        try {
            const selected = await open({
                multiple: false,
                directory: false,
                filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }]
            });

            let absolutePath = null;
            if (selected && typeof selected === 'string') absolutePath = selected;
            else if (Array.isArray(selected) && selected.length > 0) absolutePath = selected[0];

            if (absolutePath) {
                console.log("[ModEditModal Select] Selected image file:", absolutePath);
                setPastedImageFile(null); // Clear any pasted file state
                setSelectedImageAbsPath(absolutePath); // Store the absolute path
                setImageLoading(true); // Show loading for binary read
                setImageLoadingError(false);
                setCurrentImageUrl(FALLBACK_MOD_IMAGE_MODAL);

                try {
                    // Read the file content using Tauri API
                    const fileData = await invoke('read_binary_file', { path: absolutePath });
                    // Create a Blob from the Uint8Array
                    // Basic mime type detection
                    let mimeType = 'image/png';
                    const blob = new Blob([new Uint8Array(fileData)], { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    previewObjectUrlRef.current = url;
                    setCurrentImageUrl(url);
                    console.log("[ModEditModal Select] Created Blob URL:", url);
                } catch (readError) {
                    console.error("Error reading selected file for preview:", readError);
                    setError('Could not read selected image for preview.');
                    setCurrentImageUrl(FALLBACK_MOD_IMAGE_MODAL); // Fallback on read error
                    setSelectedImageAbsPath(null); // Clear selected path if preview failed
                }
            }
        } catch (err) {
            console.error("Error selecting image:", err);
            setError('Failed to open image file dialog.');
        }
    };

    const handleSave = async () => {
        if (!asset || !selectedEntityOption) { setError("Please select a target entity."); return; }
        setIsSaving(true);
        setError('');
        const newTargetSlug = selectedEntityOption.value;

        let imageDataToSend = null;
        if (pastedImageFile) {
            try {
                const arrayBuffer = await pastedImageFile.arrayBuffer();
                imageDataToSend = Array.from(new Uint8Array(arrayBuffer)); // Convert to Vec<u8> format for Tauri
                console.log("Prepared pasted image data for backend (length):", imageDataToSend.length);
            } catch (readErr) {
                console.error("Error reading pasted file:", readErr);
                setError("Failed to read pasted image data.");
                setIsSaving(false);
                return;
            }
        }

        try {
            console.log("Saving asset info:", {
                assetId: asset.id,
                ...formData,
                selectedImageAbsPath: selectedImageAbsPath,
                newTargetEntitySlug: newTargetSlug // Pass the selected entity slug
            });

            await invoke('update_asset_info', {
                assetId: asset.id,
                name: formData.name,
                description: formData.description || null,
                author: formData.author || null,
                categoryTag: formData.category_tag || null,
                selectedImageAbsolutePath: imageDataToSend ? null : selectedImageAbsPath, // Send path only if no data
                imageData: imageDataToSend,
                newTargetEntitySlug: newTargetSlug
            });

            console.log("Asset info saved successfully.");

            onSaveSuccess(newTargetSlug);

        } catch (err) {
            const errorString = typeof err === 'string' ? err : (err?.message || 'Unknown save error');
            console.error("Failed to save asset info:", errorString);
            setError(`Save Failed: ${errorString}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!asset) return null; // Don't render if no asset provided

    return ReactDOM.createPortal(
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.title}>Edit Mod: {asset.name}</h2>

                {/* Added Scrollable Content Area */}
                <div style={styles.content}>

                    {/* Relocation Section */}
                    <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '15px', marginTop: '5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Relocate Mod</h3>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        {/* Category Select */}
                        <div style={{ ...styles.formGroup, flex: 1 }}>
                            <label style={styles.label} htmlFor="edit-category">Target Category:</label>
                            <Select
                                id="edit-category"
                                styles={reactSelectStyles}
                                options={categoryOptions}
                                value={selectedCategoryOption}
                                onChange={setSelectedCategoryOption}
                                placeholder={categoryLoading ? 'Loading...' : 'Select Category...'}
                                isLoading={categoryLoading}
                                isDisabled={isSaving || categoryLoading}
                                isClearable={false}
                                menuPosition={'fixed'}
                            />
                        </div>
                        {/* Entity Select */}
                        <div style={{ ...styles.formGroup, flex: 1 }}>
                            <label style={styles.label} htmlFor="edit-entity">Target Entity:</label>
                            <Select
                                id="edit-entity"
                                styles={reactSelectStyles}
                                options={entityOptions}
                                value={selectedEntityOption}
                                onChange={setSelectedEntityOption}
                                placeholder={entityLoading ? 'Loading...' : (selectedCategoryOption ? (entities.length > 0 ? 'Select Entity...' : 'No entities found') : 'Select Category First')}
                                isLoading={entityLoading}
                                isDisabled={isSaving || !selectedCategoryOption || entityLoading || entities.length === 0}
                                isClearable={false}
                                menuPosition={'fixed'}
                            />
                        </div>
                    </div>


                    <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Mod Details</h3>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="mod-name">Name:</label>
                        <input id="mod-name" type="text" name="name" value={formData.name} onChange={handleInputChange} style={styles.input} disabled={isSaving} />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="mod-description">Description:</label>
                        <textarea id="mod-description" name="description" value={formData.description} onChange={handleInputChange} style={styles.textarea} disabled={isSaving} />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="mod-author">Author:</label>
                        <input id="mod-author" type="text" name="author" value={formData.author} onChange={handleInputChange} style={styles.input} disabled={isSaving} />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="mod-category-tag">Category Tags (comma-separated):</label>
                        <input id="mod-category-tag" type="text" name="category_tag" value={formData.category_tag} onChange={handleInputChange} style={styles.input} placeholder="e.g., Outfit, Retexture, Effect" disabled={isSaving} />
                    </div>

                    {/* Image Preview Section */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Preview Image:</label>
                        <div style={styles.imagePreviewContainer} onPaste={handlePaste} tabIndex={0} title="Click 'Change Image' or paste image here" >
                            {imageLoading ? ( // Show spinner while loading initial image
                                <i className="fas fa-spinner fa-spin fa-2x" style={{ color: 'rgba(255,255,255,0.6)' }}></i>
                            ) : currentImageUrl !== FALLBACK_MOD_IMAGE_MODAL ? (
                                <img src={currentImageUrl} alt="Mod preview" style={styles.imagePreview} onError={() => { cleanupObjectUrl(); setCurrentImageUrl(FALLBACK_MOD_IMAGE_MODAL); setImageLoadingError(true); }} />
                            ) : imageLoadingError ? (
                                <p style={{ ...styles.imagePlaceholderText, color: 'var(--danger)' }}>Failed to load preview</p>
                            ) : (
                                <p style={styles.imagePlaceholderText}>No preview image set.</p>
                            )}
                        </div>
                        <button className="btn btn-outline" style={{ marginTop: '10px', width: '100%' }} onClick={handleSelectImage} disabled={isSaving} >
                            <i className="fas fa-image fa-fw"></i> Change Image...
                        </button>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '5px' }}>You can also paste an image directly into the box above.</p>
                    </div>

                </div> {/* End Content Wrapper */}

                {error && <p style={styles.errorText}>{error}</p>}

                <div style={styles.buttonGroup}>
                    <button className="btn btn-outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={isSaving || !selectedEntityOption /* Ensure entity selected */}>
                        {isSaving ? <><i className="fas fa-spinner fa-spin fa-fw"></i> Saving...</> : <><i className="fas fa-save fa-fw"></i> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ModEditModal;