// 用户相关类型

export type UserRole = 'admin' | 'merchant';

export interface User {
    id: string;
    email: string;
    role: UserRole;
}