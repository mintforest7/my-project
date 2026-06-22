import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Category, ClothingItem, Outfit, PlayerData } from './types';
import { defaultPlayer } from './playerData';

type UserRow = {
  id: string;
  username: string;
  level: number;
  experience: number;
  coins: number;
  gems: number;
  created_at: string;
};

type OwnedItemRow = {
  item_id: string;
};

type SavedOutfitRow = {
  id: string;
  outfit_name: string;
  hair: string | null;
  bangs: string | null;
  makeup: string | null;
  top: string | null;
  bottom: string | null;
  dress: string | null;
  shoes: string | null;
  accessories: string | null;
  created_at: string;
};

export type SavedOutfitDraft = {
  name: string;
  outfit: Outfit;
};

export type SavedOutfit = {
  id: string;
  name: string;
  itemIds: Partial<Record<Category, string>>;
  createdAt: string;
};

export async function loadCloudPlayer(user: User, starterItemIds: readonly string[]): Promise<PlayerData> {
  const profile = await ensurePlayerProfile(user);
  await ensureStarterItems(starterItemIds);

  const { data, error } = await supabase.from('owned_items').select('item_id');
  if (error) throw error;

  const ownedItemIds = (data as OwnedItemRow[] | null)?.map((row) => row.item_id) ?? [];
  return {
    coins: profile.coins,
    gems: profile.gems,
    xp: profile.experience,
    level: profile.level,
    soundOn: defaultPlayer.soundOn,
    skinTone: defaultPlayer.skinTone,
    unlockedItemIds: Array.from(new Set([...starterItemIds, ...ownedItemIds])),
  };
}

export async function saveCloudPlayer(player: PlayerData): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      coins: player.coins,
      gems: player.gems,
      experience: player.xp,
      level: player.level,
    })
    .eq('id', (await getCurrentUserId()));

  if (error) throw error;
}

export async function saveOwnedItem(itemId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('owned_items').upsert(
    {
      user_id: userId,
      item_id: itemId,
    },
    { onConflict: 'user_id,item_id' },
  );

  if (error) throw error;
}

export async function loadSavedOutfits(): Promise<SavedOutfit[]> {
  const { data, error } = await supabase
    .from('saved_outfits')
    .select('id,outfit_name,hair,bangs,makeup,top,bottom,dress,shoes,accessories,created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data as SavedOutfitRow[] | null) ?? []).map(rowToSavedOutfit);
}

export async function saveOutfit(draft: SavedOutfitDraft): Promise<SavedOutfit> {
  const userId = await getCurrentUserId();
  const body = {
    user_id: userId,
    outfit_name: draft.name,
    hair: itemId(draft.outfit.hair),
    bangs: itemId(draft.outfit.bangs),
    makeup: itemId(draft.outfit.makeup),
    top: itemId(draft.outfit.tops),
    bottom: itemId(draft.outfit.bottoms),
    dress: itemId(draft.outfit.dresses),
    shoes: itemId(draft.outfit.shoes),
    accessories: itemId(draft.outfit.accessories),
  };

  const { data, error } = await supabase
    .from('saved_outfits')
    .insert(body)
    .select('id,outfit_name,hair,bangs,makeup,top,bottom,dress,shoes,accessories,created_at')
    .single();

  if (error) throw error;
  return rowToSavedOutfit(data as SavedOutfitRow);
}

export async function syncClothingCatalog(items: readonly ClothingItem[]): Promise<void> {
  const rows = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    theme: item.tags[0] ?? 'style',
    rarity: item.price > 0 ? 'premium' : 'standard',
    price: item.price,
    premium: item.price > 0,
    image_path: item.assetPath,
  }));

  const { error } = await supabase.from('clothing_items').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

async function ensurePlayerProfile(user: User): Promise<UserRow> {
  const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
  if (data) return data as UserRow;

  const username = user.email?.split('@')[0] || 'player';
  const { data: inserted, error } = await supabase
    .from('users')
    .insert({
      id: user.id,
      username,
      level: defaultPlayer.level,
      experience: defaultPlayer.xp,
      coins: defaultPlayer.coins,
      gems: defaultPlayer.gems,
    })
    .select('*')
    .single();

  if (error) throw error;
  return inserted as UserRow;
}

async function ensureStarterItems(starterItemIds: readonly string[]): Promise<void> {
  const userId = await getCurrentUserId();
  const rows = starterItemIds.map((itemIdValue) => ({
    user_id: userId,
    item_id: itemIdValue,
  }));

  if (rows.length === 0) return;

  const { error } = await supabase.from('owned_items').upsert(rows, { onConflict: 'user_id,item_id' });
  if (error) throw error;
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('User is not signed in.');
  return data.user.id;
}

function itemId(item: ClothingItem | undefined): string | null {
  return item?.id ?? null;
}

function rowToSavedOutfit(row: SavedOutfitRow): SavedOutfit {
  return {
    id: row.id,
    name: row.outfit_name,
    itemIds: {
      hair: row.hair ?? undefined,
      bangs: row.bangs ?? undefined,
      makeup: row.makeup ?? undefined,
      tops: row.top ?? undefined,
      bottoms: row.bottom ?? undefined,
      dresses: row.dress ?? undefined,
      shoes: row.shoes ?? undefined,
      accessories: row.accessories ?? undefined,
    },
    createdAt: row.created_at,
  };
}
