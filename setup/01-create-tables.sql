
    CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL UNIQUE,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT
    );  


    CREATE TABLE IF NOT EXISTS labels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_time DATETIME DEFAULT CURRENT_TIMESTAMP
    
    );


    CREATE TABLE IF NOT EXISTS image_label (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_id INTEGER NOT NULL,
        label_id INTEGER NOT NULL,
        Annotations_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
        FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE,
        UNIQUE(image_id,label_id)
    );