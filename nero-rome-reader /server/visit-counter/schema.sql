-- one row per (chapter, visitor hash); the primary key makes repeat visits free
CREATE TABLE IF NOT EXISTS hits (
  ch INTEGER NOT NULL,
  h  TEXT    NOT NULL,
  t  INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (ch, h)
);
