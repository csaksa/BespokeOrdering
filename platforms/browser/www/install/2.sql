-- UPDATE Ceremony Lapel > Shawl Lapel
UPDATE products_options_values SET en_US = 'Shawl' WHERE id = 3164
UPDATE products_options_values SET en_US = 'Shawl' WHERE id = 5173

-- Add new LAPEL WIDTH
DELETE FROM products_options_values WHERE id = 3178
INSERT INTO products_options_values VALUES (3178, 317, 	'2.25 inch (7.70 cm)', 			'5,70 cm (2,25 inch)', 	'TXT_SPANISH', 		'TXT_THAI',		NULL, 'false', '', 				3, 1)

-- Change photos name iOS bug
UPDATE products_options_values SET image = 'slim-2' WHERE id = 1102
UPDATE products_options_values SET image = 'loose-2' WHERE id = 1104
UPDATE products_options_values SET image = 'piano-2' WHERE id = 3112
UPDATE products_options_values SET image = 'straight-2' WHERE id = 3111

-- Update shirt product page 15 to 16
UPDATE products SET steps = 16 WHERE id = 1

-- Change App Version
UPDATE config SET value = '0.6.3' WHERE name = 'app_version' 

-- Change Database Version
UPDATE config SET value = 2 WHERE name = 'database_version' 