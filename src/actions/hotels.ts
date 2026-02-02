import { supabase } from "@/lib/supabase";
import { MineHotelInformationType, HotelRoomTypes } from "@/types/HotelInformation";

// 插入新数据
export async function createHotels(data: MineHotelInformationType) {
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
export async function createRoomTypes(data: HotelRoomTypes) {
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
        .select('*, room_types(*)');

    if (error) {
        console.error(error);
        return [];  // 出错时返回空数组
    }
    console.log(data);
    return data;
}


