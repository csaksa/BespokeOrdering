
INSERT INTO config VALUES ('unit_height',					'cm',				NULL)
INSERT INTO config VALUES ('measurements_allowances',		'false',			NULL)

-- Change App Version
--UPDATE config SET value = '0.6.5' WHERE name = 'app_version'

-- Change Database Version
UPDATE config SET value = 4 WHERE name = 'database_version'