// src/utils/cropImage.ts

/**
 * 创建 HTMLImageElement 对象
 * @param url 图片地址
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    // 设置跨域，防止 Canvas 污染 (Tainted Canvas) 问题
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * 获取裁剪后的图片 Blob
 * @param imageSrc 图片源地址
 * @param pixelCrop 裁剪区域的像素坐标 { x, y, width, height }
 * @param rotation 旋转角度 (可选，默认为 0)
 * @returns Promise<Blob>
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // 设置 Canvas 大小为裁剪区域的大小
  // 这里我们直接设置为裁剪后的尺寸，这样导出的图片就是裁剪后的结果
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // 在 Canvas 上绘制图片
  // drawImage 参数详解:
  // image: 源图片
  // sx, sy: 源图片的裁剪起始坐标 (pixelCrop.x, pixelCrop.y)
  // sWidth, sHeight: 源图片的裁剪尺寸 (pixelCrop.width, pixelCrop.height)
  // dx, dy: 目标 Canvas 的绘制起始坐标 (0, 0)
  // dWidth, dHeight: 目标 Canvas 的绘制尺寸 (pixelCrop.width, pixelCrop.height)
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // 将 Canvas 内容转换为 Blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg", // 输出格式
      0.9 // 压缩质量 (0-1)
    );
  });
}
