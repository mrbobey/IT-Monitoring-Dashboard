-- Railway Database Complete Backup
-- Exported: 2026-01-13T08:46:47.734Z
-- Database: Railway PostgreSQL

-- ===================
-- TASKS TABLE
-- ===================

INSERT INTO tasks (id, title, description, priority, status, due_date, assigned_to, created_at, updated_at) VALUES (8, NULL, 'Bios Return Default', NULL, 'Pending', NULL, NULL, NULL, NULL);
INSERT INTO tasks (id, title, description, priority, status, due_date, assigned_to, created_at, updated_at) VALUES (9, NULL, 'CCTV not viewing', NULL, 'Pending', NULL, NULL, NULL, NULL);
INSERT INTO tasks (id, title, description, priority, status, due_date, assigned_to, created_at, updated_at) VALUES (10, NULL, 'Installation', NULL, 'Pending', NULL, NULL, NULL, NULL);
INSERT INTO tasks (id, title, description, priority, status, due_date, assigned_to, created_at, updated_at) VALUES (11, NULL, 'Internet Installation', NULL, 'Pending', NULL, NULL, NULL, NULL);
INSERT INTO tasks (id, title, description, priority, status, due_date, assigned_to, created_at, updated_at) VALUES (12, NULL, 'Installation', NULL, 'In Progress', NULL, NULL, NULL, NULL);
INSERT INTO tasks (id, title, description, priority, status, due_date, assigned_to, created_at, updated_at) VALUES (13, NULL, 'Installation', NULL, 'In Progress', NULL, NULL, NULL, NULL);
INSERT INTO tasks (id, title, description, priority, status, due_date, assigned_to, created_at, updated_at) VALUES (14, NULL, 'CCTV  Installation', NULL, 'Completed', NULL, NULL, NULL, NULL);

-- ===================
-- BRANCH PCS TABLE
-- ===================

INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (1, NULL, NULL, '12th gen IntelR i5-12400 2.5ghz', 'DDR 4 16gb', 'SSD-Ramsta SSD S800 512 GB', NULL, NULL, NULL, NULL, NULL);
INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (2, NULL, NULL, '12th gen IntelR i5-12400 2.5ghz', 'DDR 4 16gb', 'SSD-Ramsta SSD S800 512 GB', NULL, NULL, NULL, NULL, NULL);
INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (3, NULL, NULL, 'AMD A8-7680 RADEON R7 3.5ghz', 'DDR 3 8gb', 'HDD-WDC-WD5000AZLX', NULL, NULL, NULL, NULL, NULL);
INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (4, NULL, NULL, '12th gen IntelR i5-12400 2.5ghz', 'DDR 4 8gb', 'SSD-Apacer As350 512 GB', NULL, NULL, NULL, NULL, NULL);
INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (5, NULL, NULL, 'IntelR i3-8100 CPU 3.60ghz', 'DDR 4 4gb', 'HDD-TOSHIBA DT01ACA100', NULL, NULL, NULL, NULL, NULL);
INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (6, NULL, NULL, '12th Gen Intel(R) Core(TM) i5-12400, 2500 Mhz, 6 Core(s),', 'DDR4 8gb', 'Apacer AS350 512GB', NULL, NULL, NULL, NULL, NULL);
INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (7, NULL, NULL, '12th Gen Intel(R) Core(TM) i5-12400 (12 CPUs), ~2.5GHz', 'DDR 4 16gb', 'Patriot P220 512GB', NULL, NULL, NULL, NULL, NULL);
INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (8, NULL, NULL, 'intel core i5 12400', 'DDR 4 16gb', 'SSD-HKCMemory DS600', NULL, NULL, NULL, NULL, NULL);
INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (9, NULL, NULL, 'intel core i5 12400', 'DDR 4 16gb', 'SSD-Ramsta SSD S800 512 GB', NULL, NULL, NULL, NULL, NULL);
INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (10, NULL, NULL, 'AMD Athlon 200GE 3.2ghz', 'DDR4 8gb', 'HDD-HITACHI HCP725050GLA380', NULL, NULL, NULL, NULL, NULL);
INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (11, NULL, NULL, '12th Gen Intel(R) Core(TM) i5-12400 (12 CPUs), ~2, 5GHz', 'DDR4 8GB', 'Apacer AS350 512GB', NULL, NULL, NULL, NULL, NULL);

-- ===================
-- MATERIALS TABLE
-- ===================

INSERT INTO materials (id, name, quantity, unit, taskid, part_type, status, serial_number, warranty_date, condition, created_at, updated_at, image_path) VALUES (2, 'Gloway', 1, NULL, NULL, 'RAM', 'Dispatched', 'P/N:TYA4U2666D19081C', '2020-08-25', 'Poor', '2026-01-09T18:52:43.110Z', '2026-01-12T03:49:26.862Z', '/uploads/part_image-1768218566368-223084580.jpg');
INSERT INTO materials (id, name, quantity, unit, taskid, part_type, status, serial_number, warranty_date, condition, created_at, updated_at, image_path) VALUES (3, 'OSCOO', 1, NULL, NULL, 'RAM', 'Needs Attention', 'S/N: ODP17204245200250', '2020-10-18', 'Poor', '2026-01-09T05:28:14.961Z', '2026-01-12T03:51:04.353Z', '/uploads/part_image-1768218663837-696570285.jpg');
INSERT INTO materials (id, name, quantity, unit, taskid, part_type, status, serial_number, warranty_date, condition, created_at, updated_at, image_path) VALUES (4, 'Ramsta', 1, NULL, NULL, 'RAM', 'Needs Attention', 'RRS1300334BA2777', '2021-01-20', 'Poor', '2026-01-09T05:33:29.575Z', '2026-01-12T03:50:05.369Z', '/uploads/part_image-1768218604830-931622667.jpg');
INSERT INTO materials (id, name, quantity, unit, taskid, part_type, status, serial_number, warranty_date, condition, created_at, updated_at, image_path) VALUES (5, 'Western Digital', 1, NULL, NULL, 'Hard Disk', 'Needs Attention', 'S/N:WCC6Y3FEOCNK', '2019-11-02', 'Poor', '2026-01-12T06:13:09.784Z', '2026-01-12T06:13:09.784Z', '/uploads/part_image-1768227189100-386232955.jpg');
INSERT INTO materials (id, name, quantity, unit, taskid, part_type, status, serial_number, warranty_date, condition, created_at, updated_at, image_path) VALUES (6, 'ADATA', 1, NULL, NULL, 'RAM', 'Needs Attention', '2J4300202948-10401386', '2022-03-10', 'Poor', '2026-01-12T06:31:08.610Z', '2026-01-12T06:31:08.610Z', '/uploads/part_image-1768228267807-208585374.jpg');
INSERT INTO materials (id, name, quantity, unit, taskid, part_type, status, serial_number, warranty_date, condition, created_at, updated_at, image_path) VALUES (7, 'Kingston', 1, NULL, NULL, 'RAM', 'Needs Attention', '2003 0000008668366-S008077', '2018-01-03', 'Poor', '2026-01-12T06:34:45.189Z', '2026-01-12T06:34:45.189Z', '/uploads/part_image-1768228483600-766322534.jpg');
INSERT INTO materials (id, name, quantity, unit, taskid, part_type, status, serial_number, warranty_date, condition, created_at, updated_at, image_path) VALUES (8, 'Power Adapter', 1, NULL, NULL, 'Power Supply', 'Available', 'DC1801B002948002E2P803', '2019-11-27', 'Good', '2026-01-12T06:37:41.199Z', '2026-01-12T06:37:41.199Z', '/uploads/part_image-1768228660419-106008758.jpg');