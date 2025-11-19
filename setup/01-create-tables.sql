-- Images table: Store image metadata
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Labels table: Store available labels
CREATE TABLE IF NOT EXISTS labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3B82F6',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Annotations table: Link images to labels (many-to-many relationship)
CREATE TABLE IF NOT EXISTS annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id INTEGER NOT NULL,
    label_id INTEGER NOT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE,
    UNIQUE(image_id, label_id)
);

-- Insert sample labels
INSERT OR IGNORE INTO labels (name, color) VALUES 
    ('Person', '#EF4444'),
    ('Animal', '#10B981'),
    ('Vehicle', '#3B82F6'),
    ('Building', '#F59E0B'),
    ('Nature', '#8B5CF6'),
    ('Food', '#EC4899'),
    ('Object', '#6B7280');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_annotations_image_id ON annotations(image_id);
CREATE INDEX IF NOT EXISTS idx_annotations_label_id ON annotations(label_id);
CREATE INDEX IF NOT EXISTS idx_images_upload_date ON images(upload_date);