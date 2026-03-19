import useSWR, { mutate } from 'swr';
import { getHotels } from '@/actions/hotels';
import { MineHotelInformationType } from '@/types/HotelInformation';

export const HOTELS_KEY = 'merchant-hotels';

export function useHotels() {
  const { data, error, isLoading, isValidating } = useSWR<MineHotelInformationType[]>(
    HOTELS_KEY,
    getHotels,
    {
      revalidateOnFocus: false,   // 防止切换窗口时表格闪烁
      shouldRetryOnError: false,  // Server Action 已自行处理错误
      dedupingInterval: 5000,     // 5 秒内多次挂载只发一次请求
    }
  );
  return { hotels: data ?? [], isLoading, isValidating, error };
}

// 非 Hook 函数，可在事件处理器中直接调用，触发全局缓存失效
export function mutateHotels() {
  return mutate(HOTELS_KEY);
}
