export type UserRole = "admin" | "hotel";

/**
 * 用户类型
 * 表示系统中的用户，包含用户的基本信息和角色。
 * @interface User
 * @property {string} id - 用户ID
 * @property {string} email - 用户邮箱
 * @property {UserRole} role - 用户角色
 * @property {string} username - 用户名
 * @property {string} [nickname] - 用户昵称
 * @property {string} [avatar] - 用户头像
 * @property {string} [phone] - 用户手机号
 * @property {string} [bio] - 用户个人简介
 * @property {string} createdAt - 用户创建时间
 * @property {string} [lastLoginAt] - 用户最后登录时间
 */
export interface User {
  /**
   * 用户ID
   * @type {string}
   */
  id: string;
  /**
   * 用户邮箱
   * @type {string}
   */
  email: string;
  /**
   * 用户角色
   * @type {UserRole}
   */
  role: UserRole;
  /**
   * 用户名
   * @type {string}
   */
  username: string;

  /**
   * 用户昵称
   * @type {string}
   */
  nickname?: string;
  /**
   * 用户头像
   * @type {string}
   */
  avatar?: string;
  /**
   * 用户手机号
   * @type {string}
   */
  phone?: string;
  /**
   * 用户个人简介
   * @type {string}
   */
  bio?: string;

  /**
   * 用户创建时间
   * @type {string}
   */
  createdAt: string;
  /**
   * 用户最后登录时间
   * @type {string}
   */
  lastLoginAt?: string;
}
