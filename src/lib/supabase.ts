// supabase 初始化
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://varicsxgcaruuwucywxe.supabase.co';
const supabaseKey = 'sb_publishable_1YEUM1zTXCkP9vqrJqvygg_bLDUs-5d';
export const supabase = createClient(supabaseUrl, supabaseKey);
