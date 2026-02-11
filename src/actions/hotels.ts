'use server';
import { supabase } from "@/lib/supabase";
import { MineHotelInformationType, HotelRoomTypes } from "@/types/HotelInformation";

// 删除数据
export async function deleteHotel(id: number) {
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
    const { data: hotel, error } = await supabase
        .from('hotels')
        .insert(data)
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
    const { error } = await supabase
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
    const { error: delErr } = await supabase
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
    }));

    const { error: insErr } = await supabase
        .from('room_types')
        .insert(insertData);

    if (insErr) {
        console.error('插入房型失败:', insErr);
        throw insErr;
    }
    return true;
}
