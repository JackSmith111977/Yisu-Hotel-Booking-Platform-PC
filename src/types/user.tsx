// 用户相关类型

export type UserRole = 'admin' | 'hotel';

export interface User {
    id: string;
    email: string;
    role: UserRole;
}