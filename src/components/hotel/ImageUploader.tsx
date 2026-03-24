'use client';

import { useState, useRef } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import {
  Modal,
  Button,
  Upload,
  Input,
  Tabs,
  Message,
  Spin,
} from '@arco-design/web-react';
import NextImage from 'next/image';
import { IconPlus, IconDelete, IconLink, IconUpload } from '@arco-design/web-react/icon';

export interface UploadedImage {
  /** 裁切后的图片 data-URL，可直接用于 <img> 展示 */
  dataUrl: string;
  /**
   * 上传到 Supabase Storage 后，用公开 URL 替换此字段。
   * 在服务器请求完成之前保持 undefined。
   */
  remoteUrl?: string;
}

const ASPECT_RATIO = 4 / 3; // 锁定 4:3 比例
const THUMB_W = 128;
const THUMB_H = THUMB_W / ASPECT_RATIO; // 高度 96px

/**
 * 尝试通过 canvas 代理加载远程 URL，以便 Cropperjs 使用。
 * 若遭遇 CORS 跨域限制，会出现 tainted-canvas 错误——
 * 此时用户应将图片下载到本地后改用文件上传方式。
 */
function remoteUrlToDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = () =>
      reject(
        new Error(
          '无法加载该链接的图片，可能是跨域限制，请改用本地上传。'
        )
      );
    img.src = url;  // 赋值后加载图片
  });
}

interface ThumbProps {
  src: string; 
  index: number; 
  onDelete: (i: number) => void;
}

function Thumb({ src, index, onDelete }: ThumbProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        width: THUMB_W,
        height: THUMB_H,
        borderRadius: 6,
        overflow: 'hidden',
        border: '1px solid #e5e6e7',
        flexShrink: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NextImage
        src={src}
        alt={`图片 ${index + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {/* 悬停时显示的遮罩层 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(0,0,0,${hovered ? 0.45 : 0})`,
          transition: 'background 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button
          icon={<IconDelete />}
          shape="circle"
          status="danger"
          size="small"
          style={{
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s',
            background: 'rgba(255,255,255,0.9)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
        />
      </div>
    </div>
  );
}

interface ImageUploaderProps {
  value?: UploadedImage[];  // 受控值，已上传的图片数组
  onChange?: (images: UploadedImage[]) => void;
  max?: number; // 最多允许上传的图片数量
  label?: string; // 按钮及提示文字中使用的标签
}

export default function ImageUploader({ value = [], onChange, max = 9, label = '图片'}: ImageUploaderProps) {
  // ── 选图弹窗状态
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  // ── 裁切弹窗状态（图片来源解析完成后展示）
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  const cropperRef = useRef<ReactCropperElement>(null);

  // ── 辅助函数 ──────────────────────────────────────────────────────────────────

  const openWithSrc = (src: string) => {
    setImageSrc(src);
    setPickerOpen(false);
    setCropOpen(true);
  };

  const resetPicker = () => {
    setUrlInput('');
    setUrlLoading(false);
    setActiveTab('upload');
  };

  // ── 事件处理 ────────────────────────────────────────────────────────────────

  /** 由 Arco Upload 调用——返回 false 阻止组件自动发起 POST 请求 */
  const handleFileBeforeUpload = (file: File) => {
    openWithSrc(URL.createObjectURL(file));
    return false;
  };

  const handleUrlConfirm = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      Message.warning('请输入图片链接');
      return;
    }
    setUrlLoading(true);
    try {
      const dataUrl = await remoteUrlToDataUrl(trimmed);
      openWithSrc(dataUrl);
    } catch (err: unknown) {
      Message.error((err as Error).message ?? '加载图片失败');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleCropConfirm = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const croppedDataUrl = cropper
      .getCroppedCanvas({ width: 800, height: 600 })
      .toDataURL('image/jpeg', 0.92);

    onChange?.([...value, { dataUrl: croppedDataUrl }]);
    setCropOpen(false);
    if (imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
    setImageSrc('');
  };

  const handleDelete = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  // ── 渲染 ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── 缩略图列表 ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
        {value.map((img, idx) => (
          // 单张缩略图的展示组件
          <Thumb
            key={idx}
            src={img.remoteUrl ?? img.dataUrl}
            index={idx}
            onDelete={handleDelete}
          />
        ))}

        {value.length < max && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => { resetPicker(); setPickerOpen(true); }}
            onKeyDown={(e) => e.key === 'Enter' && setPickerOpen(true)}
            style={{
              width: THUMB_W,
              height: THUMB_H,
              border: '1px dashed #c9cdd4',
              borderRadius: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#86909c',
              fontSize: 12,
              transition: 'border-color 0.2s, color 0.2s',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#165dff';
              (e.currentTarget as HTMLDivElement).style.color = '#165dff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#c9cdd4';
              (e.currentTarget as HTMLDivElement).style.color = '#86909c';
            }}
          >
            <IconPlus style={{ fontSize: 18, marginBottom: 4 }} />
            <span>添加{label}</span>
          </div>
        )}
      </div>

      {/* ── 选图弹窗（本地上传 或 图片链接） ─────────────────────────────── */}
      <Modal
        title={`添加${label}`}
        visible={pickerOpen}
        onCancel={() => setPickerOpen(false)}
        footer={null}
        style={{ width: 480 }}
        unmountOnExit
      >
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          {/* ── Tab 1: 本地文件 ─────────────────────────────────────────── */}
          <Tabs.TabPane
            key="upload"
            title={
              <span>
                <IconUpload style={{ marginRight: 4 }} />
                本地上传
              </span>
            }
          >
            <Upload
              drag
              accept="image/jpeg,image/png,image/webp,image/gif"
              beforeUpload={handleFileBeforeUpload}
              showUploadList={false}
              style={{ marginTop: 8 }}
            >
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <IconUpload style={{ fontSize: 32, color: '#c9cdd4' }} />
                <div style={{ marginTop: 12, color: '#4e5969', fontWeight: 500 }}>
                  点击选择 或 拖拽图片至此
                </div>
                <div style={{ marginTop: 6, color: '#c9cdd4', fontSize: 12 }}>
                  支持 JPG · PNG · WebP · GIF，裁切后输出 4:3
                </div>
              </div>
            </Upload>
          </Tabs.TabPane>

          {/* ── Tab 2: 图片链接 ────────────────────────────────────────────────── */}
          <Tabs.TabPane
            key="url"
            title={
              <span>
                <IconLink style={{ marginRight: 4 }} />
                图片链接
              </span>
            }
          >
            <div style={{ padding: '16px 0 8px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={setUrlInput}
                  onPressEnter={handleUrlConfirm}
                  prefix={<IconLink />}
                  allowClear
                />
                <Button
                  type="primary"
                  loading={urlLoading}
                  onClick={handleUrlConfirm}
                  style={{ flexShrink: 0 }}
                >
                  加载
                </Button>
              </div>
              <div style={{ marginTop: 8, color: '#c9cdd4', fontSize: 12 }}>
                注意：部分外链图片因跨域限制无法加载，请改用本地上传。
              </div>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Modal>

      {/* ── 裁切弹窗 ───────────────────────────────────────────────────────── */}
      <Modal
        title="裁切图片（比例固定 4:3）"
        visible={cropOpen}
        style={{ width: 640 }}
        onCancel={() => { setCropOpen(false); if (imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc); setImageSrc(''); }}
        footer={
          <>
            <Button
              onClick={() => {
                // 返回选图弹窗
                setCropOpen(false);
                if (imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
                setImageSrc('');
                setPickerOpen(true);
              }}
            >
              重新选择
            </Button>
            <Button type="primary" onClick={handleCropConfirm}>
              确认裁切
            </Button>
          </>
        }
        unmountOnExit
      >
        <div style={{ marginBottom: 8, color: '#86909c', fontSize: 12 }}>
          拖动选框调整范围，滚轮缩放图片。裁切结果将以 800×600 输出。
        </div>
        {imageSrc ? (
          <Cropper
            ref={cropperRef}
            src={imageSrc}
            style={{ height: 400, width: '100%' }}
            aspectRatio={ASPECT_RATIO}
            viewMode={1}
            dragMode="move"
            guides
            background={false}
            responsive
            autoCropArea={0.9}
            checkOrientation={false}
          />
        ) : (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin />
          </div>
        )}
      </Modal>
    </>
  );
}