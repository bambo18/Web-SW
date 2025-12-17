-- MySQL schema for Web-SW scheduler
-- Uses InnoDB. Column names map 1:1 to fields used in memoryStore and code.
-- projects table corresponds to `projects` array entries: { projectId, joinCode }
-- members table corresponds to `members` array entries: { memberId, projectId, nickname }
-- timetable_cells corresponds to each cell in `timetables`: { projectId, day, slot }
-- timetable_cell_members maps members inside a cell to preserve `cell.members` arrays: { cell_id, memberId, nickname }

DROP TABLE IF EXISTS timetable_cell_members;
DROP TABLE IF EXISTS timetable_cells;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
  projectId INT NOT NULL AUTO_INCREMENT,
  joinCode VARCHAR(32),
  PRIMARY KEY (projectId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE members (
  memberId INT NOT NULL AUTO_INCREMENT,
  projectId INT NULL,
  nickname VARCHAR(255) NOT NULL,
  PRIMARY KEY (memberId),
  INDEX idx_members_projectId (projectId),
  CONSTRAINT fk_members_project FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE timetable_cells (
  id INT NOT NULL AUTO_INCREMENT,
  projectId INT NOT NULL,
  day TINYINT NOT NULL,
  slot SMALLINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_project_day_slot (projectId, day, slot),
  INDEX idx_cells_projectId (projectId),
  CONSTRAINT fk_cells_project FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE timetable_cell_members (
  id INT NOT NULL AUTO_INCREMENT,
  cell_id INT NOT NULL,
  memberId INT NOT NULL,
  nickname VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_cell_id (cell_id),
  CONSTRAINT fk_cell_members_cell FOREIGN KEY (cell_id) REFERENCES timetable_cells(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notes:
-- - `projects.projectId` maps to memory `projectId`.
-- - `members.memberId` maps to memory `memberId`.
-- - `timetable_cells` represents the cell object (projectId, day, slot).
-- - `timetable_cell_members` stores each entry in a cell's `members` array.
