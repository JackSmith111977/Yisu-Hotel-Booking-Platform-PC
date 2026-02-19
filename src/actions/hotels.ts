'use server';
import { supabase_admin } from "@/lib/supabase_admin";
import { MineHotelInformationType, HotelRoomTypes } from "@/types/HotelInformation";
import { createMerchantClient } from "@/lib/supabase_merchant";

// 删除数据
export async function deleteHotel(id: number) {
    const supabase = await createMerchantClient();
    const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('删除酒店失败:', error);
        return false;
    }
    return true;
}

// 插入新数据
export async function createHotels(data: Partial<MineHotelInformationType>) {
    const supabase = await createMerchantClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: hotel, error } = await supabase
        .from('hotels')
        .insert({ ...data, merchant_id: user?.id })
        .select()
        .single();  // 返回单条数据
    
    if (error) {
        console.error('创建酒店失败:', error);
        return null;
    }
    
    console.log('创建成功');
    return hotel;  // 返回酒店数据，包含 id
}

export async function createRoomTypes(data: Partial<HotelRoomTypes>[]) {
    const { error } = await supabase_admin
        .from('room_types')
        .insert(data);
    
    if (error) {
        console.error('创建房型失败:', error);
        throw error;
    }
    
    return true;
}

// 表格初始渲染
export async function getHotels() {
    const supabase = await createMerchantClient();
    const { data, error } = await supabase
        .from('hotels')
        .select('*, room_types(*)')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error(error);
        return [];  // 出错时返回空数组
    }

    return data;
}

// 更新酒店
export async function updateHotel(id: number, data: Partial<MineHotelInformationType>) {
    const supabase = await createMerchantClient();
    const { data: hotel, error } = await supabase
        .from('hotels')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('更新酒店失败:', error);
        return null;
    }
    return hotel;
}

// 替换某酒店的房型
export async function replaceRoomTypes(hotelId: number, roomTypes: Partial<HotelRoomTypes>[]) {
    // 删除旧的房型
    const { error: delErr } = await supabase_admin
        .from('room_types')
        .delete()
        .eq('hotel_id', hotelId);

    if (delErr) {
        console.error('删除旧房型失败:', delErr);
        throw delErr;
    }

    if (!roomTypes || roomTypes.length === 0) return true;

    const insertData = roomTypes.map(rt => ({
        hotel_id: hotelId,
        name: rt.name,
        price: rt.price,
        quantity: rt.quantity,
        size: rt.size,
        description: rt.description,
        images: rt.images
    }));

    const { error: insErr } = await supabase_admin
        .from('room_types')
        .insert(insertData);

    if (insErr) {
        console.error('插入房型失败:', insErr);
        throw insErr;
    }
    return true;
}

// 上传酒店图片到 Storage
// 接收 base64 dataUrl 数组，上传到 hotels bucket，返回 public URL 数组
// folder 示例：'hotel_123' 或 'room_456'
export async function uploadHotelImages(
    dataUrls: string[],
    folder: string,
): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < dataUrls.length; i++) {
        const dataUrl = dataUrls[i];

        // 跳过已经是远程 URL 的图片（编辑模式下未改动的图）
        if (!dataUrl.startsWith('data:')) {
            results.push(dataUrl);
            continue;
        }

        // dataUrl → Blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const ext = blob.type.split('/')[1] ?? 'jpg';
        const path = `${folder}/${Date.now()}_${i}.${ext}`;

        const { error } = await supabase_admin.storage
            .from('hotels')           // bucket 名称，需在 Supabase 控制台创建
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

// 删除 Storage 中某个文件夹下的所有图片（替换图片前清理旧文件）────
// 编辑酒店时调用，避免 Storage 积累孤儿文件
export async function deleteStorageFolder(folder: string): Promise<void> {
    const { data: files, error: listErr } = await supabase_admin.storage
        .from('hotels')
        .list(folder);

    if (listErr || !files?.length) return;

    const paths = files.map(f => `${folder}/${f.name}`);
    const { error: delErr } = await supabase_admin.storage
        .from('hotels')
        .remove(paths);

    if (delErr) console.error('删除旧图片失败:', delErr);
}
