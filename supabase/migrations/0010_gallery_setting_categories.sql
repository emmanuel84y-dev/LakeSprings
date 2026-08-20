-- Add dedicated gallery slots for the two homepage “The Setting” images.
-- Existing gallery rows and categories remain unchanged.
alter type gallery_category add value if not exists 'setting_1';
alter type gallery_category add value if not exists 'setting_2';
