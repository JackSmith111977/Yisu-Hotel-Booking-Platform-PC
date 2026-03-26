'use server';
import { supabase_admin } from '@/lib/supabase_admin';
import { createMerchantClient } from '@/lib/supabase_merchant';
import type { MineHotelInformationType, HotelRoomTypes } from '@/types/HotelInformation';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  鉴权
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function getMerchantSession() {
    const supabase = await createMerchantClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('未登录或 token 无效');
    return { supabase, merchantId: user.id };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  查询
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getHotels() {
    const { supabase, merchantId } = await getMerchantSession();

    const { data, error } = await supabase
        .from('hotels')
        .select('*, room_types(*)')
        .eq('merchant_id', merchantId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('获取酒店列表失败:', error);
        return [];
    }
    return data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  创建酒店 + 房型（RPC 事务，原子性保证）
//  调用前：组件负责上传所有图片，传入 image/album/room images 均为远程 URL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function createHotelWithRooms(
    hotelData: Partial<MineHotelInformationType>,
    roomTypes: Partial<HotelRoomTypes>[],
): Promise<{ hotel_id: number }> {
    const { supabase } = await getMerchantSession();

    const { data, error } = await supabase.rpc('create_hotel_with_rooms', {
        p_hotel: hotelData,
        p_rooms: roomTypes,
    });

    if (error) {
        console.error('创建酒店失败:', error);
        throw new Error('创建酒店失败: ' + error.message);
    }

    return data as { hotel_id: number };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  更新酒店 + 替换房型（RPC 事务，归属校验在数据库层完成）
//  调用前：组件负责上传所有图片
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function updateHotelWithRooms(
    hotelId: number,
    hotelData: Partial<MineHotelInformationType>,
    roomTypes: Partial<HotelRoomTypes>[],
): Promise<void> {
    const { supabase } = await getMerchantSession();

    const { error } = await supabase.rpc('update_hotel_with_rooms', {
        p_hotel_id: hotelId,
        p_hotel: hotelData,
        p_rooms: roomTypes,
    });

    if (error) {
        console.error('更新酒店失败:', error);
        throw new Error('更新酒店失败: ' + error.message);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  删除酒店（RPC 事务删除数据，成功后清理 Storage 图片）
//  Storage 清理失败不影响业务一致性，只记录日志
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function deleteHotelWithCleanup(hotelId: number): Promise<void> {
    const { supabase } = await getMerchantSession();

    const { error } = await supabase.rpc('delete_hotel', {
        p_hotel_id: hotelId,
    });

    if (error) {
        console.error('删除酒店失败:', error);
        throw new Error('删除酒店失败: ' + error.message);
    }

    // 数据已删除，清理 Storage（失败不影响业务）
    await deleteStorageFolder(`hotel_${hotelId}`).catch(e =>
        console.error('清理酒店图片失败（不影响业务）:', e)
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  图片存储工具函数（组件直接调用，Storage 不参与数据库事务）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function uploadHotelImages(
    dataUrls: string[],
    folder: string,
): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < dataUrls.length; i++) {
        const dataUrl = dataUrls[i];

        // 已经是远程 URL（编辑模式下未改动的图），直接保留
        if (!dataUrl.startsWith('data:')) {
            results.push(dataUrl);
            continue;
        }

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const ext = blob.type.split('/')[1] ?? 'jpg';
        const uniqueId = crypto.randomUUID().slice(0, 8);
        const path = `${folder}/${Date.now()}_${uniqueId}_${i}.${ext}`;

        const { error } = await supabase_admin.storage
            .from('hotels')
            .upload(path, blob, { contentType: blob.type, upsert: true });

        if (error) {
            console.error('图片上传失败:', error);
            throw error;
        }

        const { data: urlData } = supabase_admin.storage
            .from('hotels')
            .getPublicUrl(path);

        results.push(urlData.publicUrl);
    }

    return results;
}

export async function deleteStorageFolder(folder: string): Promise<void> {
    const { data: files, error: listErr } = await supabase_admin.storage
        .from('hotels')
        .list(folder);

    if (listErr || !files?.length) return;

    const paths = files.map(f => `${folder}/${f.name}`);
    const { error: delErr } = await supabase_admin.storage
        .from('hotels')
        .remove(paths);

    if (delErr) throw new Error('删除图片失败: ' + delErr.message);
}
