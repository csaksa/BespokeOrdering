
-- Change App Version
UPDATE config SET value = '0.6.6' WHERE name = 'app_version'

-- Change Database Version
UPDATE config SET value = 5 WHERE name = 'database_version'