-- Database export for Railway (PostgreSQL compatible)
-- Generated: 2026-01-13T07:45:50.524Z
-- Source: SQLite (tasks.db)
-- Target: PostgreSQL on Railway


-- Table: tasks
DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  taskName TEXT,
  branchName TEXT,
  description TEXT,
  status TEXT
);

INSERT INTO tasks (id, taskName, branchName, description, status) VALUES (8, 'NVR Repair', 'Olingan Branch', 'Bios Return Default', 'Pending');
INSERT INTO tasks (id, taskName, branchName, description, status) VALUES (9, 'CCTV', 'Bacungan Branch', 'CCTV not viewing', 'Pending');
INSERT INTO tasks (id, taskName, branchName, description, status) VALUES (10, 'CCTV', 'Piñan', 'Installation', 'Pending');
INSERT INTO tasks (id, taskName, branchName, description, status) VALUES (11, 'Starlink', 'Talic Branch', 'Internet Installation', 'Pending');
INSERT INTO tasks (id, taskName, branchName, description, status) VALUES (12, 'CCTV', 'Talic Branch', 'Installation', 'In Progress');
INSERT INTO tasks (id, taskName, branchName, description, status) VALUES (13, 'CCTV', 'Olingan Branch', 'Installation', 'In Progress');
INSERT INTO tasks (id, taskName, branchName, description, status) VALUES (14, 'CCTV', 'Sindangan', 'CCTV  Installation', 'Completed');


-- Table: materials
DROP TABLE IF EXISTS materials CASCADE;
CREATE TABLE materials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT,
  taskId INTEGER
);


-- Table: branch_pcs
DROP TABLE IF EXISTS branch_pcs CASCADE;
CREATE TABLE branch_pcs (
  id SERIAL PRIMARY KEY,
  branch_name TEXT,
  city TEXT,
  branch_code TEXT,
  desktop_name TEXT,
  pc_number TEXT,
  motherboard TEXT,
  processor TEXT,
  storage TEXT,
  ram TEXT,
  psu TEXT,
  monitor TEXT
);

INSERT INTO branch_pcs (id, branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (1, 'Disud', 'Sindangan', '7112-03', 'DESKTOP-82V845V (FINANCE)', 'PC 1', 'H510M V2 DDR4', '12th gen IntelR i5-12400 2.5ghz', 'SSD-Ramsta SSD S800 512 GB', 'DDR 4 16gb', 'AK400-400W', 'NVISION H22v8');
INSERT INTO branch_pcs (id, branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (2, 'Disud', 'Sindangan', '7112-03', 'DESKTOP-82V845V (MARKETING)', 'PC 2', 'H510M V2 DDR4', '12th gen IntelR i5-12400 2.5ghz', 'SSD-Ramsta SSD S800 512 GB', 'DDR 4 16gb', 'AK400-400W', 'NVISION H22v8');
INSERT INTO branch_pcs (id, branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (3, 'Sta. Cruz', 'Sindangan', '7112-01', 'DESKTOP-LJ6RSGG (FINANCE)', 'PC 1', 'F2A68HM-1', 'AMD A8-7680 RADEON R7 3.5ghz', 'HDD-WDC-WD5000AZLX', 'DDR 3 8gb', 'EK588-700W', 'INPLAY-S190V');
INSERT INTO branch_pcs (id, branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (4, 'Sta. Cruz', 'Sindangan', '7112-01', 'DESKTOP-T6CGEOO (TRS)', 'PC 4', 'H610M V2 DDR4', '12th gen IntelR i5-12400 2.5ghz', 'SSD-Apacer As350 512 GB', 'DDR 4 8gb', 'GP200B 700W', 'NVISION N190NDV3');
INSERT INTO branch_pcs (id, branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (5, 'Sta. Cruz', 'Sindangan', '7112-01', 'DESKTOP-2IDLLHL (MARKETING)', 'PC 2', 'Aspire TC-860', 'IntelR i3-8100 CPU 3.60ghz', 'HDD-TOSHIBA DT01ACA100', 'DDR 4 4gb', 'PS-6301-09AC 300W', 'Acer-EB192Q');
INSERT INTO branch_pcs (id, branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (6, 'Bacungan Branch', 'Bacungan', '712500', 'DESKTOP-JOPJ5B1', 'PC 2', 'H610M H V2 DDR4', '12th Gen Intel(R) Core(TM) i5-12400, 2500 Mhz, 6 Core(s),', 'Apacer AS350 512GB', 'DDR4 8gb', 'EK588-700W', 'NVISION V185H');
INSERT INTO branch_pcs (id, branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (7, 'Bacungan Branch', 'Bacungan', '712500', 'DESKTOP-MO53BHK', 'PC 1', 'H6 10M K DDR4', '12th Gen Intel(R) Core(TM) i5-12400 (12 CPUs), ~2.5GHz', 'Patriot P220 512GB', 'DDR 4 16gb', 'INPLAY GP200B', 'NVISION V185H');
INSERT INTO branch_pcs (id, branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (8, 'Poblacion', 'Siayan', '7113-00', 'DESKTOP-MVV8I4C (FINANCE)', 'PC 1', 'PRIME H610M-R D4', 'intel core i5 12400', 'SSD-HKCMemory DS600', 'DDR 4 16gb', 'INPLAY', 'NVISION H22v8');
INSERT INTO branch_pcs (id, branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (9, 'Poblacion', 'Siayan', '7113-00', 'DESKTOP-82V845V (RTS)', 'PC 2', 'H610M DDR 4', 'intel core i5 12400', 'SSD-Ramsta SSD S800 512 GB', 'DDR 4 16gb', 'AK400-400W', 'NVISION H22v8');
INSERT INTO branch_pcs (id, branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (10, 'Sta. Cruz', 'Sindangan', '7112-01', 'DESKTOP-JIEIMHMC (MARKETING)', 'PC 3', 'A320M-DVS R4.0', 'AMD Athlon 200GE 3.2ghz', 'HDD-HITACHI HCP725050GLA380', 'DDR4 8gb', 'EK588-700W', 'Acer-EB192Q');
INSERT INTO branch_pcs (id, branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (11, 'Bacungan Branch', 'Bacungan', '712500', 'DESKTOP-J0PJ5B1', 'PC 3', 'DESKTOP-J0PJ5B1', '12th Gen Intel(R) Core(TM) i5-12400 (12 CPUs), ~2, 5GHz', 'Apacer AS350 512GB', 'DDR4 8GB', 'EK588-700W', 'NVISION V185H');

