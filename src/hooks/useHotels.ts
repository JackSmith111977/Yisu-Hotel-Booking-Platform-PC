import useSWR, { mutate } from 'swr';
import { getHotels } from '@/actions/hotels';
import { MineHotelInformationType } from '@/types/HotelInformation';
import { useUserStore } from '@/store/useUserStore';

const HOTELS_CACHE_KEY = 'merchant-hotels';

export function useHotels() {
  const userId = useUserStore((state) => state.user?.id);
  // key 含 userId：不同商户的缓存自然隔离；未登录时为 null，SWR 不发请求
  const key = userId ? [HOTELS_CACHE_KEY, userId] : null;

  const { data, error, isLoading, isValidating } = useSWR<MineHotelInformationType[]>(
    key,
    () => getHotels(),
    {
      revalidateOnFocus: false,   // 防止切换窗口时表格闪烁
      shouldRetryOnError: false,  // Server Action 已自行处理错误
      dedupingInterval: 5000,     // 5 秒内多次挂载只发一次请求
    }
  );
  return { hotels: data ?? [], isLoading, isValidating, error };
}

// 非 Hook 函数，可在事件处理器中直接调用，触发全局缓存失效
// 通过 getState() 在 Hook 外读取当前用户 ID，与 useHotels 使用相同的 key 结构
export function mutateHotels() {
  const userId = useUserStore.getState().user?.id;
  if (!userId) return;
  return mutate([HOTELS_CACHE_KEY, userId]);
}
