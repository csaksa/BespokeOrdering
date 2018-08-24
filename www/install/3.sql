
-- Change App Version
UPDATE config SET value = '0.6.4' WHERE name = 'app_version'

-- Change Database Version
UPDATE config SET value = 3 WHERE name = 'database_version'