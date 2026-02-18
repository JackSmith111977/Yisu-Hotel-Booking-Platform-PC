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
import { IconPlus, IconDelete, IconLink, IconUpload } from '@arco-design/web-react/icon';

export interface UploadedImage {
  /** data-URL of the cropped image, ready to show in <img> */
  dataUrl: string;
  /**
   * After you upload to Supabase Storage, replace this with the public URL.
   * Keep undefined until the server round-trip completes.
   */
  remoteUrl?: string;
}

interface ImageUploaderProps {
  /** Controlled value – array of uploaded images */
  value?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  /** Maximum number of images allowed (default 9) */
  max?: number;
  /** Label used in button / hint text (default "图片") */
  label?: string;
}

const ASPECT_RATIO = 4 / 3; // locked 4 : 3
const THUMB_W = 128;
const THUMB_H = THUMB_W / ASPECT_RATIO; // 96

/** Read a File as a data-URL string */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Try to proxy-load a remote URL through a canvas so Cropperjs can use it.
 * If CORS is blocked you'll see a tainted-canvas error – in that case the
 * user should download the image and upload it as a file instead.
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
    img.src = url;
  });
}

function Thumb({
  src,
  index,
  onDelete,
}: {
  src: string;
  index: number;
  onDelete: (i: number) => void;
}) {
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
      <img
        src={src}
        alt={`图片 ${index + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {/* Overlay on hover */}
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

export default function ImageUploader({
  value = [],
  onChange,
  max = 9,
  label = '图片',
}: ImageUploaderProps) {
  // ── picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  // ── crop modal state (shown after an image source is resolved)
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  const cropperRef = useRef<ReactCropperElement>(null);

  // ── helpers ──────────────────────────────────────────────────────────────────

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

  // ── event handlers ────────────────────────────────────────────────────────────

  /** Called by Arco Upload – return false so the component won't auto-POST */
  const handleFileBeforeUpload = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      openWithSrc(dataUrl);
    } catch {
      Message.error('读取文件失败');
    }
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
    setImageSrc('');
  };

  const handleDelete = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  // ── render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Thumbnail strip ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
        {value.map((img, idx) => (
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

      {/* ── Picker modal (choose upload vs URL) ─────────────────────────────── */}
      <Modal
        title={`添加${label}`}
        visible={pickerOpen}
        onCancel={() => setPickerOpen(false)}
        footer={null}
        style={{ width: 480 }}
        unmountOnExit
      >
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          {/* ── Tab 1: local file ─────────────────────────────────────────── */}
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

          {/* ── Tab 2: URL ────────────────────────────────────────────────── */}
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

      {/* ── Crop modal ───────────────────────────────────────────────────────── */}
      <Modal
        title="裁切图片（比例固定 4:3）"
        visible={cropOpen}
        style={{ width: 640 }}
        onCancel={() => { setCropOpen(false); setImageSrc(''); }}
        footer={
          <>
            <Button
              onClick={() => {
                // go back to picker
                setCropOpen(false);
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