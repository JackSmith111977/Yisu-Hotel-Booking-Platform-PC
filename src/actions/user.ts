"use server";

import { supabase_admin } from "@/lib/supabase_admin";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface UpdateProfileParams {
  nickname?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
}

export async function updateProfile(params: UpdateProfileParams) {
  try {
    // 鉴权
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "未登录或登录已过期" };
    }

    const verification = await verifyJWT(token);
    if (!verification.valid || !verification.user) {
      return { success: false, message: "未登录或登录已过期" };
    }

    // 获取 ID
    const userId = verification.user.id;

    // 更新数据库
    const updateData: Partial<UpdateProfileParams> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (params.nickname !== undefined) updateData.nickname = params.nickname;
    if (params.avatar_url !== undefined) updateData.avatar_url = params.avatar_url;
    if (params.phone !== undefined) updateData.phone = params.phone;
    if (params.bio !== undefined) updateData.bio = params.bio;

    const { data: user, error: updateError } = await supabase_admin
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Update user error:", updateError);
      throw new Error("更新用户信息失败");
    }

    // 刷新缓存 (刷新整个布局，确保所有引用该用户的地方都更新)
    revalidatePath("/", "layout");

    return { success: true, message: "更新成功", data: user };
  } catch (error) {
    console.error("Update profile exception:", error);
    // 确保返回对象结构一致
    return { success: false, message: "更新失败，请稍后重试" };
  }
}

/**
 * 获取当前用户资料
 */
export async function getUserProfile() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "未登录" };
    }

    const verification = await verifyJWT(token);
    if (!verification.valid || !verification.user) {
      return { success: false, message: "登录已过期" };
    }

    const userId = verification.user.id;

    const { data: user, error } = await supabase_admin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Get user profile error:", error);
      return { success: false, message: "获取用户信息失败" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Get user profile exception:", error);
    return { success: false, message: "获取用户信息失败" };
  }
}

/**
 * 上传用户头像
 * @param formData 包含文件数据的 FormData (key: 'file')
 */
export async function uploadUserAvatar(formData: FormData) {
  try {
    // 1. 鉴权
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "未登录或登录已过期" };
    }

    const verification = await verifyJWT(token);
    if (!verification.valid || !verification.user) {
      return { success: false, message: "未登录或登录已过期" };
    }

    const userId = verification.user.id;

    // 2. 获取文件
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, message: "未检测到文件" };
    }

    // 校验文件类型 (简单校验)
    if (!file.type.startsWith("image/")) {
      return { success: false, message: "请上传图片文件" };
    }

    // 校验文件大小 (例如 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, message: "图片大小不能超过 2MB" };
    }

    // 3. 上传到 Supabase Storage
    const fileName = `${userId}/avatar_${Date.now()}.webp`;

    // 将 File 转为 ArrayBuffer -> Buffer (Node.js 环境)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase_admin.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: file.type || "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload avatar error:", uploadError);
      throw new Error("头像上传失败");
    }

    // 4. 获取公开链接
    const {
      data: { publicUrl },
    } = supabase_admin.storage.from("avatars").getPublicUrl(fileName);

    // 5. 更新用户资料 (数据库)
    const { error: updateError } = await supabase_admin
      .from("users")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Update user avatar url error:", updateError);
      throw new Error("更新头像链接失败");
    }

    // 6. 刷新缓存
    revalidatePath("/", "layout");

    return { success: true, message: "头像上传成功", avatarUrl: publicUrl };
  } catch (error: unknown) {
    console.error("Upload user avatar exception:", error);
    return { message: error instanceof Error ? error.message : "上传失败，请稍后重试" };
  }
}
