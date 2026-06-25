-- Store the separate glasses category in saved Style Rush outfits.

alter table public.saved_outfits
  add column if not exists glasses text;
